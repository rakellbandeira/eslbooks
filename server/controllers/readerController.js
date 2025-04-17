const { loadBookByFilename } = require('../utils/bookLoader');
const UserProgress = require('../models/UserProgress');

// Get book reader view
exports.getBookReader = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const episodeNum = parseInt(req.query.episode) || 1;
    const pageNum = parseInt(req.query.page) || 1;
    
    // Load book data from JSON file
    const book = await loadBookByFilename(filename);
    
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/books');
    }
    
    // Get episode and page data
    const episodeKey = `episode${episodeNum}`;
    const pageKey = `page${pageNum}`;
    
    // Validate episode exists
    if (!book.episodeContents[0][episodeKey]) {
      req.flash('error', 'Episode not found');
      return res.redirect('/books');
    }
    
    // Validate page exists
    if (!book.episodeContents[0][episodeKey][0][pageKey]) {
      req.flash('error', 'Page not found');
      return res.redirect('/books');
    }
    
    // Get page content (paragraphs)
    const pageContent = book.episodeContents[0][episodeKey][0][pageKey][0];
    
    // Calculate total pages in the book
    let totalPagesInBook = 0;
    for (let i = 1; i <= book.episodeQuantity; i++) {
      const epKey = `episode${i}`;
      const pagesInEpisode = Object.keys(book.episodeContents[0][epKey][0]).length;
      totalPagesInBook += pagesInEpisode;
    }
    
    // Calculate total pages in current episode
    const totalPagesInEpisode = Object.keys(book.episodeContents[0][episodeKey][0]).length;
    
    // Calculate current overall page number
    let currentOverallPage = 0;
    for (let i = 1; i < episodeNum; i++) {
      const epKey = `episode${i}`;
      currentOverallPage += Object.keys(book.episodeContents[0][epKey][0]).length;
    }
    currentOverallPage += pageNum;
    
    // Calculate completion percentage
    const percentComplete = (currentOverallPage / totalPagesInBook) * 100;
    
    // Get next and previous page info
    const nextPage = getNextPageInfo(book, episodeNum, pageNum);
    const prevPage = getPrevPageInfo(book, episodeNum, pageNum);
    
    // Update user progress
    await UserProgress.findOneAndUpdate(
      { 
        userId: req.user._id, 
        bookFilename: filename 
      },
      {
        currentEpisode: episodeNum,
        currentPage: pageNum,
        totalPages: totalPagesInBook,
        percentComplete,
        lastRead: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Create text with spans for each paragraph
    const textWithSpans = Object.entries(pageContent)
      .sort(([keyA], [keyB]) => {
        // Sort by paragraph number
        const numA = parseInt(keyA.replace('paragraph', ''));
        const numB = parseInt(keyB.replace('paragraph', ''));
        return numA - numB;
      })
      .map(([key, paragraph]) => {
        // Create spans around each word
        return `<p>${paragraph.split(' ').map(word => 
          `<span class="selectable-word">${word}</span>`
        ).join(' ')}</p>`;
      }).join('');
    
    // Set path to the common background image
    const backgroundImagePath = '/images/book-background.jpg';
    
    res.render('dashboard/reader', {
      title: `${book.title} - ${book.episodeTitles[0][episodeKey]}`,
      book: {
        title: book.title,
        episodeTitle: book.episodeTitles[0][episodeKey],
        level: book.level,
        filename
      },
      currentEpisode: episodeNum,
      currentPage: pageNum,
      totalPagesInEpisode,
      totalPagesInBook,
      percentComplete,
      nextPage,
      prevPage,
      textWithSpans,
      backgroundImagePath,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get next page information
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

// Helper function to get previous page information
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