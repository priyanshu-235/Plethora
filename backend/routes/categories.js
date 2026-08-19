const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            quizzes: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get single category
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        quizzes: {
          include: {
            _count: {
              select: {
                questions: true,
                attempts: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Create category (admin only)
router.post('/', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category (admin only)
router.put('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name,
        description
      }
    });

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router;