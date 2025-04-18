const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookFilename: {
    type: String,
    required: true
  },
  // Explicitly set bookId to undefined so it doesn't get created
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: false,
    default: undefined
  },
  currentEpisode: {
    type: Number,
    default: 1
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true
  },
  percentComplete: {
    type: Number,
    default: 0
  },
  lastRead: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure unique progress tracking per user and book
UserProgressSchema.index({ userId: 1, bookFilename: 1 }, { unique: true });


const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = UserProgress;