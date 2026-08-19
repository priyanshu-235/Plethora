const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    // Get total students
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    // Get total quizzes
    const totalQuizzes = await prisma.quiz.count();

    // Get published quizzes
    const publishedQuizzes = await prisma.quiz.count({
      where: { status: 'PUBLISHED' }
    });

    // Get draft quizzes
    const draftQuizzes = await prisma.quiz.count({
      where: { status: 'DRAFT' }
    });

    // Get total questions
    const totalQuestions = await prisma.question.count();

    // Get total quiz attempts
    const totalAttempts = await prisma.attempt.count();

    // Get average score
    const completedAttempts = await prisma.attempt.findMany({
      where: { status: 'COMPLETED' },
      select: { percentage: true }
    });

    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage || 0), 0) / completedAttempts.length
      : 0;

    // Get passed attempts
    const passedAttempts = await prisma.attempt.count({
      where: {
        status: 'COMPLETED',
        percentage: { gte: 60 }
      }
    });

    // Get failed attempts
    const failedAttempts = await prisma.attempt.count({
      where: {
        status: 'COMPLETED',
        percentage: { lt: 60 }
      }
    });

    res.json({
      totalStudents,
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalQuestions,
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passedAttempts,
      failedAttempts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
});

// Get all users (students)
router.get('/users', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get single user details
router.get('/users/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        attempts: {
          include: {
            quiz: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { startedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate user statistics
    const completedAttempts = user.attempts.filter(a => a.status === 'COMPLETED');
    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / completedAttempts.length
      : 0;
    const highestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.map(a => Number(a.percentage)))
      : 0;

    res.json({
      ...user,
      stats: {
        totalAttempts: user.attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;