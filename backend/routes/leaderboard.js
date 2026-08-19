const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get overall leaderboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE' },
      include: {
        attempts: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            quiz: {
              select: {
                id: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    const leaderboard = students.map(student => {
      const attempts = student.attempts;
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
      
      const totalScore = completedAttempts.reduce((sum, a) => sum + Number(a.percentage), 0);
      const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
      const highestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => Number(a.percentage))) : 0;
      const passedQuizzes = completedAttempts.filter(a => Number(a.percentage) >= 60).length;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalAttempts: attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        passedQuizzes,
        rank: 0 // Will be calculated after sorting
      };
    }).sort((a, b) => {
      // Sort by average score, then by highest score, then by completed attempts
      if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
      if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
      return b.completedAttempts - a.completedAttempts;
    }).map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Get category-wise leaderboard
router.get('/category/:categoryName', authMiddleware, async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
      include: {
        quizzes: {
          include: {
            attempts: {
              where: {
                status: 'COMPLETED'
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Group attempts by user
    const userScores = {};
    
    category.quizzes.forEach(quiz => {
      quiz.attempts.forEach(attempt => {
        const userId = attempt.user.id;
        if (!userScores[userId]) {
          userScores[userId] = {
            user: attempt.user,
            totalScore: 0,
            attempts: 0,
            highestScore: 0
          };
        }
        userScores[userId].totalScore += Number(attempt.percentage);
        userScores[userId].attempts += 1;
        userScores[userId].highestScore = Math.max(
          userScores[userId].highestScore,
          Number(attempt.percentage)
        );
      });
    });

    const categoryLeaderboard = Object.values(userScores)
      .map(userScore => ({
        ...userScore.user,
        averageScore: userScore.totalScore / userScore.attempts,
        highestScore: userScore.highestScore,
        attempts: userScore.attempts,
        rank: 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((user, index) => ({
        ...user,
        averageScore: Math.round(user.averageScore * 100) / 100,
        highestScore: Math.round(user.highestScore * 100) / 100,
        rank: index + 1
      }));

    res.json(categoryLeaderboard);
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({ message: 'Error fetching category leaderboard' });
  }
});

// Get monthly leaderboard
router.get('/monthly', authMiddleware, async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE' },
      include: {
        attempts: {
          where: {
            status: 'COMPLETED',
            completedAt: { gte: oneMonthAgo }
          }
        }
      }
    });

    const leaderboard = students.map(student => {
      const attempts = student.attempts;
      const totalScore = attempts.reduce((sum, a) => sum + Number(a.percentage), 0);
      const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        attempts: attempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        rank: 0
      };
    }).sort((a, b) => b.averageScore - a.averageScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }))
      .filter(student => student.attempts > 0); // Only include students with attempts this month

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching monthly leaderboard:', error);
    res.status(500).json({ message: 'Error fetching monthly leaderboard' });
  }
});

module.exports = router;