const Book = require('../models/Book');
const Page = require('../models/Page');
const UserProgress = require('../models/UserProgress');

// Get book reader view
exports.getBookReader = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const pageNum = parseInt(req.query.page) || 1;
    
    // Find book
    const book = await Book.findOne({ _id: bookId, isActive: true });
    
    if (!book) {
      req.flash('error', 'Book not found or not available');
      return res.redirect('/books');
    }
    
    // Count total pages
    const totalPages = await Page.countDocuments({ bookId });
    
    if (totalPages === 0) {
      req.flash('error', 'This book has no pages yet');
      return res.redirect('/books');
    }
    
    // Validate page number
    if (pageNum < 1 || pageNum > totalPages) {
      return res.redirect(`/books/read/${bookId}?page=1`);
    }
    
    // Get current page
    const page = await Page.findOne({ bookId, pageNumber: pageNum });
    
    if (!page) {
      req.flash('error', 'Page not found');
      return res.redirect('/books');
    }
    
    // Update or create user progress
    await UserProgress.findOneAndUpdate(
      { userId: req.user._id, bookId },
      {
        currentPage: pageNum,
        totalPages,
        percentComplete: (pageNum / totalPages) * 100,
        lastRead: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Create a text with spans around each word for selection
    const textWithSpans = page.text.split(' ').map(word => {
      // Keep punctuation attached to words
      return `<span class="selectable-word">${word}</span>`;
    }).join(' ');
    
    res.render('dashboard/reader', {
      title: book.title,
      book,
      page,
      textWithSpans,
      currentPage: pageNum,
      totalPages,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};