// This stores words saved by users
// Each entry has a reference to the user and optionally to the book where the word was found
// using a compound index to ensure each user can only save a unique word once
// storing the word in lowercase to make searches case-insensitive
// TRY: The context field can optionally store the sentence or context in which the word appeared

const mongoose = require('mongoose');

const WordBankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  word: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  translation: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    trim: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique words per user
WordBankSchema.index({ userId: 1, word: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt field
WordBankSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WordBank = mongoose.model('WordBank', WordBankSchema);

module.exports = WordBank;