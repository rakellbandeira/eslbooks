const { loadAllBooks, loadBookByFilename } = require('../utils/bookLoader');
const UserProgress = require('../models/UserProgress');

// Get all books for admin
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await loadAllBooks();
    
    res.render('admin/book', {
      title: 'Manage Books',
      books,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Get books for client dashboard
exports.getBooksForClient = async (req, res, next) => {
  try {
    // Get all books
    const books = await loadAllBooks();
    
    // Get user's reading progress
    const userProgress = await UserProgress.find({ userId: req.user._id });
    console.log("All user progress:", JSON.stringify(userProgress, null, 2));


     // Create a map for easy lookup
     const progressMap = {};
     userProgress.forEach(progress => {
       progressMap[progress.bookFilename] = progress;
     });


    // Map progress to books
    const booksWithProgress = books.map(book => {
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
        totalPages: calculateTotalPages(book),
        percentComplete: progress ? progress.percentComplete : 0,
        lastRead: progress ? progress.lastRead : null
      };
    });


    // Debug output to check what the heck's going on
    console.log("Books with progress:", JSON.stringify(booksWithProgress.map(b => ({ 
        filename: b.filename, 
        title: b.title,
        percentComplete: b.percentComplete 
      })), null, 2));

    
    res.render('dashboard/books', {
      title: 'Browse Books',
      books: booksWithProgress,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};



// Helper function to calculate total pages in a book
function calculateTotalPages(book) {
  let totalPages = 0;
  
  // Loop through each episode
  for (const episodeKey in book.episodeContents[0]) {
    const episode = book.episodeContents[0][episodeKey];
    // Add the number of pages in this episode
    totalPages += Object.keys(episode[0]).length;
  }
  
  return totalPages;
}

// Helper function to get a specific page from a book
function getBookPage(book, episodeNumber, pageNumber) {
  try {
    const episodeKey = `episode${episodeNumber}`;
    const pageKey = `page${pageNumber}`;
    
    // Get the episode
    const episode = book.episodeContents[0][episodeKey];
    if (!episode) {
      return null;
    }
    
    // Get the page
    const page = episode[0][pageKey];
    if (!page) {
      return null;
    }
    
    return {
      content: page[0],
      episodeTitle: book.episodeTitles[0][episodeKey],
      pageNumber,
      episodeNumber
    };
  } catch (error) {
    console.error('Error getting book page:', error);
    return null;
  }
}

// Get next page information
function getNextPageInfo(book, currentEpisode, currentPage) {
  const episodeKey = `episode${currentEpisode}`;
  const nextPageKey = `page${currentPage + 1}`;
  
  // Check if there's a next page in the current episode
  if (book.episodeContents[0][episodeKey][0][nextPageKey]) {
    return {
      episodeNumber: currentEpisode,
      pageNumber: currentPage + 1
    };
  }
  
  // Check if there's a next episode
  const nextEpisodeKey = `episode${currentEpisode + 1}`;
  if (book.episodeContents[0][nextEpisodeKey]) {
    return {
      episodeNumber: currentEpisode + 1,
      pageNumber: 1
    };
  }
  
  // No next page or episode
  return null;
}

// Get previous page information
function getPrevPageInfo(book, currentEpisode, currentPage) {
  // If we're on the first page of the first episode, there's no previous page
  if (currentEpisode === 1 && currentPage === 1) {
    return null;
  }
  
  // If we're on the first page of an episode (but not the first episode)
  if (currentPage === 1) {
    const prevEpisodeKey = `episode${currentEpisode - 1}`;
    const prevEpisode = book.episodeContents[0][prevEpisodeKey][0];
    const prevEpisodePages = Object.keys(prevEpisode).length;
    
    return {
      episodeNumber: currentEpisode - 1,
      pageNumber: prevEpisodePages
    };
  }
  
  // Otherwise, just go to the previous page in the current episode
  return {
    episodeNumber: currentEpisode,
    pageNumber: currentPage - 1
  };
}



exports.getAllBooksWithFilters = async (req, res, next) => {
  try {
    // Get all books
    const books = await loadAllBooks();
    
    // Get user's reading progress
    const userProgress = await UserProgress.find({ userId: req.user._id });
    
    // Create a map for easy lookup
    const progressMap = {};
    userProgress.forEach(progress => {
      progressMap[progress.bookFilename] = progress;
    });
    
    // Prepare books with progress
    const booksWithData = books.map(book => {
      const progress = progressMap[book.filename];
      
      // Extract genres from the book
      let genres = book.genre ? book.genre.split(',').map(g => g.trim()) : [];
      
      return {
        title: book.title,
        description: book.description,
        level: book.level || 'Early Beginner', // Default to Beginner if not specified
        genre: book.genre || 'General',  // Default to General if not specified
        filename: book.filename,
        coverImage: `/assets/covers/${book.filename.replace('.json', '.jpg')}`,
        episodeCount: book.episodeQuantity,
        currentEpisode: progress ? progress.currentEpisode : 1,
        currentPage: progress ? progress.currentPage : 1,
        percentComplete: progress ? progress.percentComplete : 0,
        genres: genres
      };
    });
    
    // Get unique genres for the filter dropdown
    const allGenres = new Set();
    booksWithData.forEach(book => {
      if (book.genre) {
        const genres = book.genre.split(',');
        genres.forEach(genre => {
          allGenres.add(genre.trim());
        });
      }
    });
    
    const uniqueGenres = Array.from(allGenres);
    
    res.render('dashboard/all-books', {
      title: 'Browse All Books',
      books: booksWithData,
      genres: uniqueGenres,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};