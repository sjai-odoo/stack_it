import express from 'express';
import { auth } from '../middleware/auth.js';
import Tag from '../models/Tag.js';

const router = express.Router();

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find({})
      .sort({ usageCount: -1, name: 1 })
      .select('name description color usageCount')
      .lean();

    res.json({
      success: true,
      data: {
        tags
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tags
// @desc    Create a new tag
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    // TODO: Implement tag creation logic
    res.status(201).json({
      success: true,
      data: {
        tag: {
          id: 'temp-tag-id',
          name,
          description,
          color,
          createdAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 