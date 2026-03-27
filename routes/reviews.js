const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

// @route   POST /api/reviews
// @desc    Log a new anime or write a review
// @access  Private (Requires JWT)
router.post('/', auth, async (req, res) => {
  try {
    const { animeId, animeTitle, rating, reviewText, watchStatus, episodesWatched } = req.body;

    // Create a new review linked to the user who sent the token
    const newReview = new Review({
      user: req.user.id, // This comes directly from our auth middleware!
      animeId,
      animeTitle,
      rating,
      reviewText,
      watchStatus,
      episodesWatched
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reviews
// @desc    Get all recent reviews (Global Feed)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Fetch all reviews, sort by newest, and populate the username of the reviewer
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar'); // Only fetch the username and avatar from the User model
      
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Ensure the logged-in user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this review' });
    }

    // Update the review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Ensure the logged-in user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @route   PUT /api/reviews/:id/like
// @desc    Like or Unlike a review
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Check if the review has already been liked by this user
    const isLiked = review.likes.filter(like => like.user.toString() === req.user.id).length > 0;

    if (isLiked) {
      // Unlike it (remove user from array)
      review.likes = review.likes.filter(like => like.user.toString() !== req.user.id);
    } else {
      // Like it (add user to array)
      review.likes.unshift({ user: req.user.id });
    }

    await review.save();
    res.json(review.likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;