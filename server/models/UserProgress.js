const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
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

// Compound index to ensure unique progress tracking per user and book
UserProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = UserProgress;