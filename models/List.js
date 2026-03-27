// models/List.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  animeItems: [{
    animeId: { type: Number, required: true },
    animeTitle: { type: String, required: true }
  }],
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);