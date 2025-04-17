const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  /* imageUrl: {
    type: String,
    required: true
  }, */
  text: {
    type: String,
    required: true
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

// Compound index to ensure unique page numbers per book
PageSchema.index({ bookId: 1, pageNumber: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt field
PageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Page = mongoose.model('Page', PageSchema);

module.exports = Page;