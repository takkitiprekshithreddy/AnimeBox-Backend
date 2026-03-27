const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');

// @route   GET /api/users/me
// @desc    Get current logged-in user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Fetch the user but exclude the password field
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile (avatar, favorite anime)
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { avatar, favoriteAnime } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (avatar) profileFields.avatar = avatar;
    if (favoriteAnime) profileFields.favoriteAnime = favoriteAnime;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:userId/reviews
// @desc    Get all reviews for a specific user (Great for profile pages)
// @access  Public
router.get('/:userId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @route   PUT /api/users/:id/follow
// @desc    Follow or unfollow a user
// @access  Private
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: 'User not found' });
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot follow yourself' });

    const isFollowing = currentUser.following.filter(follow => follow.user.toString() === req.params.id).length > 0;

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(follow => follow.user.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(follower => follower.user.toString() !== req.user.id);
    } else {
      // Follow
      currentUser.following.unshift({ user: req.params.id });
      userToFollow.followers.unshift({ user: req.user.id });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ following: currentUser.following, followers: userToFollow.followers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get a user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'User not found' });
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;