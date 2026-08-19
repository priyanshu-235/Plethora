const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get all quizzes (admin sees all, students see only published)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    
    let whereClause = {};
    if (role === 'STUDENT') {
      whereClause.status = 'PUBLISHED';
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// Get single quiz details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        questions: {
          include: {
            options: {
              select: {
                id: true,
                optionText: true
                // Don't include isCorrect for students
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Students can only view published quizzes
    if (role === 'STUDENT' && quiz.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Quiz not available' });
    }

    // Remove correct answers for students
    if (role === 'STUDENT') {
      quiz.questions = quiz.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          id: option.id,
          optionText: option.optionText
        }))
      }));
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// Create quiz (admin only)
router.post('/', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      difficulty,
      duration,
      passingScore,
      maxAttempts,
      status
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        difficulty: difficulty || null,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
        maxAttempts: parseInt(maxAttempts) || 1,
        status: status || 'DRAFT'
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
});

// Update quiz (admin only)
router.put('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      difficulty,
      duration,
      passingScore,
      maxAttempts,
      status
    } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        categoryId: categoryId || null,
        difficulty: difficulty || null,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
        maxAttempts: parseInt(maxAttempts) || 1,
        status: status || 'DRAFT'
      },
      include: {
        category: true
      }
    });

    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Error updating quiz' });
  }
});

// Delete quiz (admin only)
router.delete('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.quiz.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz' });
  }
});

// Publish/Unpublish quiz (admin only)
router.patch('/:id/publish', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PUBLISHED', 'UNPUBLISHED', 'DRAFT'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const quiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        category: true
      }
    });

    res.json({ message: `Quiz ${status.toLowerCase()} successfully`, quiz });
  } catch (error) {
    console.error('Error updating quiz status:', error);
    res.status(500).json({ message: 'Error updating quiz status' });
  }
});

module.exports = router;