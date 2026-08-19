const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get all questions for a quiz
router.get('/quiz/:quizId', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    
    const questions = await prisma.question.findMany({
      where: { quizId: req.params.quizId },
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
    });

    // Remove correct answers for students
    if (role === 'STUDENT') {
      questions.forEach(question => {
        question.options = question.options.map(option => ({
          id: option.id,
          optionText: option.optionText
        }));
      });
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get single question with correct answer (admin only)
router.get('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        options: true,
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create question (admin only)
router.post('/', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { quizId, questionText, marks, explanation, difficulty, options } = req.body;

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        marks: parseInt(marks) || 1,
        explanation,
        difficulty,
        options: {
          create: options.map((opt, index) => ({
            optionText: opt.text,
            isCorrect: opt.isCorrect || false
          }))
        }
      },
      include: {
        options: true
      }
    });

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Update question (admin only)
router.put('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { questionText, marks, explanation, difficulty } = req.body;

    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: {
        questionText,
        marks: parseInt(marks) || 1,
        explanation,
        difficulty
      },
      include: {
        options: true
      }
    });

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete question (admin only)
router.delete('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.question.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Update option (admin only)
router.put('/option/:optionId', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { optionText, isCorrect } = req.body;

    const option = await prisma.option.update({
      where: { id: req.params.optionId },
      data: {
        optionText,
        isCorrect
      }
    });

    res.json({ message: 'Option updated successfully', option });
  } catch (error) {
    console.error('Error updating option:', error);
    res.status(500).json({ message: 'Error updating option' });
  }
});

// Delete option (admin only)
router.delete('/option/:optionId', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.option.delete({
      where: { id: req.params.optionId }
    });

    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({ message: 'Error deleting option' });
  }
});

// Add option to question (admin only)
router.post('/:questionId/options', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { optionText, isCorrect } = req.body;

    const option = await prisma.option.create({
      data: {
        questionId: req.params.questionId,
        optionText,
        isCorrect: isCorrect || false
      }
    });

    res.status(201).json({ message: 'Option added successfully', option });
  } catch (error) {
    console.error('Error adding option:', error);
    res.status(500).json({ message: 'Error adding option' });
  }
});

module.exports = router;