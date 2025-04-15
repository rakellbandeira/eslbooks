const Book = require('../models/Book');
const UserProgress = require('../models/UserProgress');
const WordBank = require('../models/WordBank');
const Page = require('../models/Page');
const User = require('../models/User');

// Client dashboard
exports.getClientDashboard = async (req, res, next) => {
  try {
    // Get user's reading progress
    const userProgress = await UserProgress.find({ userId: req.user._id })
      .populate('bookId')
      .sort({ lastRead: -1 })
      .limit(1);
    
    // Get user's word bank count
    const wordCount = await WordBank.countDocuments({ userId: req.user._id });
    
    // Get current book if any
    let currentBook = null;
    
    if (userProgress.length > 0) {
      currentBook = {
        ...userProgress[0].bookId._doc,
        currentPage: userProgress[0].currentPage,
        totalPages: userProgress[0].totalPages,
        percentComplete: userProgress[0].percentComplete,
        lastRead: userProgress[0].lastRead
      };
    }
    
    // Get some books for the dashboard
    const books = await Book.find({ isActive: true })
      .limit(3);
    
    // Map books to include page count
    const booksWithPages = await Promise.all(books.map(async (book) => {
      const pageCount = await Page.countDocuments({ bookId: book._id });
      
      // Check if user has progress for this book
      const progress = await UserProgress.findOne({ 
        userId: req.user._id,
        bookId: book._id
      });
      
      return {
        ...book._doc,
        pageCount,
        currentPage: progress ? progress.currentPage : 1,
        percentComplete: progress ? progress.percentComplete : 0
      };
    }));
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      currentBook,
      books: booksWithPages,
      wordCount,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Admin dashboard
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Get total users count (excluding admins)
    const userCount = await User.countDocuments({ role: 'client' });
    
    // Get total books count
    const bookCount = await Book.countDocuments();
    
    // Get active books count
    const activeBookCount = await Book.countDocuments({ isActive: true });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      userCount,
      bookCount,
      activeBookCount,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};