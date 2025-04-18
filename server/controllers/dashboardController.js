const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const WordBank = require('../models/WordBank');
const { loadAllBooks } = require('../utils/bookLoader');

// Client dashboard
exports.getClientDashboard = async (req, res, next) => {
  try {
    // Get user's reading progress
    const userProgress = await UserProgress.find({ 
      userId: req.user._id 
    }).sort({ lastRead: -1 });

    console.log("Dashboard - Latest progress:", JSON.stringify(userProgress, null, 2));
    
    // Get user's word bank count
    const wordCount = await WordBank.countDocuments({ userId: req.user._id });
    
    // Load all books
    const allBooks = await loadAllBooks();
    const bookMap = {};
    allBooks.forEach(book => {
      bookMap[book.filename] = book;
    });
    
    
     // Map progress by filename for easy lookup
     const progressMap = {};
     userProgress.forEach(progress => {
       progressMap[progress.bookFilename] = progress;
     });


    // Get current book if any
    let currentBook = null;
    
    if (userProgress.length > 0 && bookMap[userProgress[0].bookFilename]) {
      const bookData = bookMap[userProgress[0].bookFilename];
      currentBook = {
        title: bookData.title,
        description: bookData.description,
        filename: userProgress[0].bookFilename,
        coverImage: `/assets/covers/${userProgress[0].bookFilename.replace('.json', '.jpg')}`,
        currentEpisode: userProgress[0].currentEpisode,
        currentPage: userProgress[0].currentPage,
        totalPages: userProgress[0].totalPages,
        percentComplete: userProgress[0].percentComplete,
        lastRead: userProgress[0].lastRead
      };
    }
    
     // Get some books for the dashboard (limit to 3)
    /*  const progressMap = {};
     userProgress.forEach(p => {
       progressMap[p.bookFilename] = p;
     }); */
     
     const books = allBooks.slice(0, 3).map(book => {
       const progress = progressMap[book.filename];
    

      return {
        title: book.title,
        description: book.description,
        level: book.level,
        filename: book.filename,
        coverImage: `/assets/covers/${book.filename.replace('.json', '.jpg')}`,
        episodeCount: book.episodeQuantity,
        currentEpisode: progress ? progress.currentEpisode : 1,
        currentPage: progress ? progress.currentPage : 1,
        percentComplete: progress ? progress.percentComplete : 0
      };
    });


    console.log("Dashboard - Books display:", JSON.stringify(books.map(b => ({ 
        title: b.title, 
        percentComplete: b.percentComplete 
      })), null, 2));

    
    res.render('dashboard/index', {
      title: 'Dashboard',
      currentBook,
      books,
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
    const books = await loadAllBooks();
    const bookCount = books.length;

    const activeBookCount = bookCount;

    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      userCount,
      bookCount,
      activeBookCount ,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};