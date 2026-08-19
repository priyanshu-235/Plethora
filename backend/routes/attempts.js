const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Start quiz attempt
router.post('/quizzes/:quizId/start', authMiddleware, authorize('STUDENT'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.user;

    // Check if quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Quiz is not available' });
    }

    if (quiz._count.questions === 0) {
      return res.status(400).json({ message: 'Quiz has no questions' });
    }

    // Check max attempts
    const previousAttempts = await prisma.attempt.count({
      where: {
        quizId,
        userId,
        status: { in: ['COMPLETED', 'TIMED_OUT'] }
      }
    });

    if (previousAttempts >= quiz.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        quizId,
        userId,
        status: 'IN_PROGRESS'
      }
    });

    if (existingAttempt) {
      return res.json({
        message: 'Resuming existing attempt',
        attemptId: existingAttempt.id,
        startedAt: existingAttempt.startedAt
      });
    }

    // Create new attempt
    const attempt = await prisma.attempt.create({
      data: {
        quizId,
        userId,
        status: 'IN_PROGRESS'
      }
    });

    res.status(201).json({
      message: 'Quiz started successfully',
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      duration: quiz.duration
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: 'Error starting quiz' });
  }
});

// Submit quiz attempt
router.post('/quizzes/:quizId/submit', authMiddleware, authorize('STUDENT'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.user;
    const { answers } = req.body; // Array of { questionId, selectedOptionId }

    // Get the attempt
    const attempt = await prisma.attempt.findFirst({
      where: {
        quizId,
        userId,
        status: 'IN_PROGRESS'
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: 'No active attempt found' });
    }

    // Calculate score
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    // Process each answer
    for (const answer of answers) {
      const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
      
      if (selectedOption) {
        const isCorrect = selectedOption.isCorrect;
        if (isCorrect) {
          correctAnswers++;
          obtainedMarks += question.marks;
        } else {
          incorrectAnswers++;
        }

        // Save answer
        await prisma.answer.create({
          data: {
            attemptId: attempt.id,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            isCorrect
          }
        });
      } else {
        unanswered++;
      }

      totalMarks += question.marks;
    }

    // Handle unanswered questions
    const answeredQuestions = answers.length;
    unanswered = attempt.quiz.questions.length - answeredQuestions;

    // Calculate percentage
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    // Calculate time taken
    const timeTaken = Math.floor((new Date() - new Date(attempt.startedAt)) / 1000);

    // Determine pass/fail
    const status = percentage >= attempt.quiz.passingScore ? 'COMPLETED' : 'COMPLETED';

    // Update attempt
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: obtainedMarks,
        percentage,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        status,
        completedAt: new Date()
      }
    });

    res.json({
      message: 'Quiz submitted successfully',
      result: {
        score: obtainedMarks,
        totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        passed: percentage >= attempt.quiz.passingScore
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
});

// Get user's attempts
router.get('/', authMiddleware, authorize('STUDENT'), async (req, res) => {
  try {
    const { userId } = req.user;

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Error fetching attempts' });
  }
});

// Get single attempt with answers
router.get('/:id', authMiddleware, authorize('STUDENT'), async (req, res) => {
  try {
    const { userId } = req.user;

    const attempt = await prisma.attempt.findFirst({
      where: {
        id: req.params.id,
        userId
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        },
        answers: {
          include: {
            question: true,
            selectedOption: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({ message: 'Error fetching attempt' });
  }
});

module.exports = router;