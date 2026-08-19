const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get comprehensive analytics
router.get('/', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    // Quiz attempts over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attemptsOverTime = await prisma.attempt.groupBy({
      by: ['startedAt'],
      where: {
        startedAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      orderBy: {
        startedAt: 'asc'
      }
    });

    // Student registrations over time
    const registrationsOverTime = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'STUDENT',
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Average quiz scores
    const averageScores = await prisma.attempt.groupBy({
      by: ['quizId'],
      where: {
        status: 'COMPLETED'
      },
      _avg: {
        percentage: true
      },
      orderBy: {
        _avg: {
          percentage: 'desc'
        }
      }
    });

    // Pass/fail ratio
    const passFailData = await prisma.attempt.groupBy({
      by: ['status'],
      where: {
        status: { in: ['COMPLETED', 'TIMED_OUT'] }
      },
      _count: true
    });

    // Most popular quizzes
    const popularQuizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: {
        attempts: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Most popular categories
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true }
        },
        quizzes: {
          include: {
            _count: {
              select: { attempts: true }
            }
          }
        }
      }
    });

    const popularCategories = categoryStats
      .map(cat => ({
        ...cat,
        totalAttempts: cat.quizzes.reduce((sum, quiz) => sum + quiz._count.attempts, 0)
      }))
      .sort((a, b) => b.totalAttempts - a.totalAttempts)
      .slice(0, 10);

    // Quiz performance by difficulty
    const difficultyPerformance = await prisma.quiz.findMany({
      where: {
        difficulty: { not: null }
      },
      include: {
        attempts: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    const difficultyStats = {
      EASY: { total: 0, avgScore: 0, attempts: 0 },
      MEDIUM: { total: 0, avgScore: 0, attempts: 0 },
      HARD: { total: 0, avgScore: 0, attempts: 0 }
    };

    difficultyPerformance.forEach(quiz => {
      const difficulty = quiz.difficulty || 'MEDIUM'; // Default to MEDIUM if null
      const attempts = quiz.attempts || [];
      
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total += attempts.length;
        difficultyStats[difficulty].attempts += attempts.length;
        
        if (attempts.length > 0) {
          const avgScore = attempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / attempts.length;
          difficultyStats[difficulty].avgScore += avgScore;
        }
      }
    });

    // Calculate final averages
    Object.keys(difficultyStats).forEach(diff => {
      if (difficultyStats[diff].total > 0) {
        difficultyStats[diff].avgScore = difficultyStats[diff].avgScore / difficultyStats[diff].total;
      }
    });

    res.json({
      attemptsOverTime: attemptsOverTime || [],
      registrationsOverTime: registrationsOverTime || [],
      averageScores: averageScores || [],
      passFailData: passFailData || [],
      popularQuizzes: popularQuizzes || [],
      popularCategories: popularCategories || [],
      difficultyStats: difficultyStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get student performance analytics
router.get('/students', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        attempts: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    const studentStats = students.map(student => {
      const attempts = student.attempts || [];
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
      
      const totalScore = completedAttempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0);
      const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
      const highestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => Number(a.percentage || 0))) : 0;
      const passedQuizzes = completedAttempts.filter(a => Number(a.percentage || 0) >= 60).length;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalAttempts: attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        passedQuizzes,
        failedQuizzes: completedAttempts.length - passedQuizzes,
        recentActivity: attempts.slice(0, 5).map(a => ({
          quizTitle: a.quiz?.title || 'Unknown Quiz',
          category: a.quiz?.category?.name || 'Uncategorized',
          score: Number(a.percentage || 0),
          date: a.completedAt
        }))
      };
    });

    res.json(studentStats);
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ message: 'Error fetching student analytics', error: error.message });
  }
});

// Get quiz performance analytics
router.get('/quizzes', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        category: true,
        _count: {
          select: { 
            questions: true,
            attempts: true 
          }
        },
        attempts: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    const quizStats = quizzes.map(quiz => {
      const attempts = quiz.attempts || [];
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
      
      const totalScore = completedAttempts.reduce((sum, a) => sum + Number(a.percentage || 0), 0);
      const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
      const passedAttempts = completedAttempts.filter(a => Number(a.percentage || 0) >= (quiz.passingScore || 60)).length;
      const passRate = completedAttempts.length > 0 ? (passedAttempts / completedAttempts.length) * 100 : 0;

      return {
        id: quiz.id,
        title: quiz.title,
        category: quiz.category?.name || 'Uncategorized',
        difficulty: quiz.difficulty || 'MEDIUM',
        totalQuestions: quiz._count.questions || 0,
        totalAttempts: quiz._count.attempts || 0,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        passedAttempts,
        failedAttempts: completedAttempts.length - passedAttempts
      };
    });

    res.json(quizStats);
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({ message: 'Error fetching quiz analytics', error: error.message });
  }
});

module.exports = router;