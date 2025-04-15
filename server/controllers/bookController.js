const Book = require('../models/Book');
const Page = require('../models/Page');
const UserProgress = require('../models/UserProgress');
const { uploadToB2, deleteFromB2 } = require('../config/b2');

// Get all books (admin view)
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    
    res.render('admin/books', {
      title: 'Manage Books',
      books,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Get add book form
exports.getAddBookForm = (req, res) => {
  res.render('admin/add-book', {
    title: 'Add New Book',
    user: req.user
  });
};

// Add new book
exports.addBook = async (req, res, next) => {
  try {
    const { title, description, level } = req.body;
    
    // Validate input
    if (!title || !description || !level) {
      req.flash('error', 'Please fill in all fields');
      return res.redirect('/admin/books/add');
    }
    
    // Check if cover image exists
    if (!req.file) {
      req.flash('error', 'Cover image is required');
      return res.redirect('/admin/books/add');
    }
    
    // Upload cover image to B2
    const coverImageUrl = await uploadToB2(req.file, 'covers');
    
    // Create new book
    const book = new Book({
      title,
      description,
      coverImage: coverImageUrl,
      level
    });
    
    await book.save();
    
    req.flash('success', 'Book added successfully');
    res.redirect('/admin/books');
  } catch (error) {
    next(error);
  }
};

// Get edit book form
exports.getEditBookForm = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/admin/books');
    }
    
    // Get pages for this book
    const pages = await Page.find({ bookId: book._id }).sort({ pageNumber: 1 });
    
    res.render('admin/edit-book', {
      title: `Edit ${book.title}`,
      book,
      pages,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Update book
exports.updateBook = async (req, res, next) => {
  try {
    const { title, description, level, isActive } = req.body;
    
    // Find book
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/admin/books');
    }
    
    // Update book details
    book.title = title;
    book.description = description;
    book.level = level;
    book.isActive = isActive === 'on' || isActive === true;
    
    // Upload new cover image if provided
    if (req.file) {
      // Delete old cover image if it exists
      if (book.coverImage) {
        try {
          await deleteFromB2(book.coverImage);
        } catch (err) {
          console.error('Error deleting old cover image:', err);
        }
      }
      
      // Upload new cover image
      book.coverImage = await uploadToB2(req.file, 'covers');
    }
    
    await book.save();
    
    req.flash('success', 'Book updated successfully');
    res.redirect('/admin/books');
  } catch (error) {
    next(error);
  }
};

// Delete book
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/admin/books');
    }
    
    // Delete associated pages
    const pages = await Page.find({ bookId: book._id });
    
    // Delete page images from B2
    for (const page of pages) {
      try {
        await deleteFromB2(page.imageUrl);
      } catch (err) {
        console.error(`Error deleting page image for page ${page.pageNumber}:`, err);
      }
    }
    
    // Delete the pages from the database
    await Page.deleteMany({ bookId: book._id });
    
    // Delete the book cover from B2
    try {
      await deleteFromB2(book.coverImage);
    } catch (err) {
      console.error('Error deleting book cover:', err);
    }
    
    // Delete user progress related to this book
    await UserProgress.deleteMany({ bookId: book._id });
    
    // Delete the book
    await Book.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'Book deleted successfully');
    res.redirect('/admin/books');
  } catch (error) {
    next(error);
  }
};

// Add page to book
exports.addPage = async (req, res, next) => {
  try {
    const { bookId, text } = req.body;
    
    // Validate input
    if (!bookId || !text) {
      req.flash('error', 'Please fill in all fields');
      return res.redirect(`/admin/books/edit/${bookId}`);
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/admin/books');
    }
    
    // Check if page image exists
    if (!req.file) {
      req.flash('error', 'Page image is required');
      return res.redirect(`/admin/books/edit/${bookId}`);
    }
    
    // Get current highest page number
    const highestPage = await Page.findOne({ bookId })
      .sort({ pageNumber: -1 })
      .limit(1);
    
    const pageNumber = highestPage ? highestPage.pageNumber + 1 : 1;
    
    // Upload page image to B2
    const imageUrl = await uploadToB2(req.file, `pages/${bookId}`);
    
    // Create new page
    const page = new Page({
      bookId,
      pageNumber,
      imageUrl,
      text
    });
    
    await page.save();
    
    // Update user progress for all users reading this book
    const userProgress = await UserProgress.find({ bookId });
    
    if (userProgress.length > 0) {
      for (const progress of userProgress) {
        progress.totalPages = pageNumber;
        progress.percentComplete = (progress.currentPage / pageNumber) * 100;
        await progress.save();
      }
    }
    
    req.flash('success', 'Page added successfully');
    res.redirect(`/admin/books/edit/${bookId}`);
  } catch (error) {
    next(error);
  }
};

// Delete page
exports.deletePage = async (req, res, next) => {
  try {
    const { id, bookId } = req.params;
    
    // Find the page
    const page = await Page.findOne({ _id: id, bookId });
    
    if (!page) {
      req.flash('error', 'Page not found');
      return res.redirect(`/admin/books/edit/${bookId}`);
    }
    
    // Delete page image from B2
    try {
      await deleteFromB2(page.imageUrl);
    } catch (err) {
      console.error('Error deleting page image:', err);
    }
    
    // Delete the page
    await Page.findByIdAndDelete(id);
    
    // Reorder page numbers
    const pages = await Page.find({ bookId }).sort({ pageNumber: 1 });
    
    for (let i = 0; i < pages.length; i++) {
      pages[i].pageNumber = i + 1;
      await pages[i].save();
    }
    
    // Update user progress for all users reading this book
    const userProgress = await UserProgress.find({ bookId });
    
    if (userProgress.length > 0) {
      for (const progress of userProgress) {
        if (progress.currentPage > pages.length) {
          progress.currentPage = pages.length;
        }
        
        progress.totalPages = pages.length;
        progress.percentComplete = pages.length > 0 
          ? (progress.currentPage / pages.length) * 100
          : 0;
        
        await progress.save();
      }
    }
    
    req.flash('success', 'Page deleted successfully');
    res.redirect(`/admin/books/edit/${bookId}`);
  } catch (error) {
    next(error);
  }
};

// Get books for client dashboard
exports.getBooksForClient = async (req, res, next) => {
  try {
    // Get active books
    const books = await Book.find({ isActive: true });
    
    // Get user progress for these books
    const userProgress = await UserProgress.find({ 
      userId: req.user._id 
    });
    
    // Map progress to books
    const booksWithProgress = await Promise.all(books.map(async (book) => {
      const progress = userProgress.find(p => 
        p.bookId.toString() === book._id.toString()
      );
      
      // Count pages for this book
      const pageCount = await Page.countDocuments({ bookId: book._id });
      
      return {
        _id: book._id,
        title: book.title,
        description: book.description,
        coverImage: book.coverImage,
        level: book.level,
        pageCount,
        currentPage: progress ? progress.currentPage : 1,
        percentComplete: progress ? progress.percentComplete : 0,
        lastRead: progress ? progress.lastRead : null
      };
    }));
    
    res.render('dashboard/books', {
      title: 'Browse Books',
      books: booksWithProgress,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};