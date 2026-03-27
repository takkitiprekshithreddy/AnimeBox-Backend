const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const List = require('../models/List');

// @route   POST /api/lists
// @desc    Create a new custom anime list
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, animeItems } = req.body;

    const newList = new List({
      user: req.user.id,
      title,
      description,
      animeItems
    });

    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/lists
// @desc    Get all public lists (Global Feed)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const lists = await List.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/lists/user/:userId
// @desc    Get lists created by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const lists = await List.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete a list
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Ensure the logged-in user owns this list
    if (list.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this list' });
    }

    await list.deleteOne();
    res.json({ message: 'List removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/lists/:id/like
// @desc    Like or Unlike a list
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const isLiked = list.likes.filter(like => like.user.toString() === req.user.id).length > 0;

    if (isLiked) {
      list.likes = list.likes.filter(like => like.user.toString() !== req.user.id);
    } else {
      list.likes.unshift({ user: req.user.id });
    }

    await list.save();
    res.json(list.likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;