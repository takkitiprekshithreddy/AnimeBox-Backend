const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animeId: {
    type: Number, // The ID from the Jikan/AniList API
    required: true
  },
  animeTitle: {
    type: String, // Storing the title so we don't have to constantly fetch it
    required: true
  },
  rating: {
    type: Number,
    min: 0.5,
    max: 5.0, // Letterboxd uses a 5-star system with half stars
    required: false
  },
  reviewText: {
    type: String,
    required: false
  },
  watchStatus: {
    type: String,
    enum: ['Watching', 'Completed', 'Plan to Watch', 'Dropped'],
    default: 'Completed'
  },
  episodesWatched: {
    type: Number,
    default: 0
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);