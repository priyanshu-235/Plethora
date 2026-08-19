const { body, validationResult } = require('express-validator');

// Validation rules
const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').trim().notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters'),
  body('role').optional().isIn(['ADMIN', 'STUDENT']).withMessage('Invalid role'),
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

const validateQuiz = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('duration').isInt({ min: 1, max: 180 }).withMessage('Duration must be between 1 and 180 minutes'),
  body('passingScore').isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }).withMessage('Max attempts must be between 1 and 10'),
  body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).withMessage('Invalid status'),
];

const validateQuestion = [
  body('questionText').trim().notEmpty().withMessage('Question text is required')
    .isLength({ min: 5, max: 1000 }).withMessage('Question text must be between 5 and 1000 characters'),
  body('marks').optional().isInt({ min: 1, max: 10 }).withMessage('Marks must be between 1 and 10'),
  body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Invalid difficulty'),
];

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateQuiz,
  validateQuestion,
  handleValidationErrors
};