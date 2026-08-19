const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected route - requires authentication
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Access granted to protected resource',
    user: req.user
  });
});

// Admin only route
router.get('/admin-only', authMiddleware, authorize('ADMIN'), (req, res) => {
  res.json({
    message: 'Admin access granted',
    user: req.user
  });
});

// Student only route
router.get('/student-only', authMiddleware, authorize('STUDENT'), (req, res) => {
  res.json({
    message: 'Student access granted',
    user: req.user
  });
});

module.exports = router;