import express from 'express';
import { auth } from '../middleware/auth.js';
import Question from '../models/Question.js';
import Tag from '../models/Tag.js';

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const search = req.query.search || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags.length > 0) {
      const tagIds = await Tag.find({ name: { $in: tags } }).select('_id');
      query.tags = { $in: tagIds.map(tag => tag._id) };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { 'votes.upvotes': -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    
    const questions = await Question.find(query)
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get a single question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id)
      .populate('author', 'username reputation avatar bio')
      .populate('tags', 'name color description')
      .populate('acceptedAnswer')
      .lean();

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    await Question.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: {
        question
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Process tags
    let tagIds = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({
            name: tagName.toLowerCase(),
            description: `Tag for ${tagName}`,
            createdBy: req.user.id
          });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
    }

    const question = new Question({
      title,
      content,
      author: req.user.id,
      tags: tagIds
    });

    await question.save();

    // Populate the question with author and tags
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color');

    res.status(201).json({
      success: true,
      data: {
        question: populatedQuestion
      }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    // TODO: Implement question update logic
    res.json({
      success: true,
      data: {
        question: {
          id,
          title,
          content,
          tags,
          updatedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement question deletion logic
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
// @access  Private
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;
    // TODO: Implement question voting logic
    res.json({
      success: true,
      data: {
        question: {
          id,
          votes: vote
        }
      }
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 