const fs = require('fs').promises;
const path = require('path');

/**
 * Load all book JSON files from the assets directory
 * @returns {Promise<Array>} - Array of book objects
 */
const loadAllBooks = async () => {
  try {
    const booksDirectory = path.join(process.cwd(), 'client', 'public', 'assets', 'books');
    
    // Read all files in the directory
    const files = await fs.readdir(booksDirectory);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    
    // Read and parse each JSON file
    const books = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(booksDirectory, file);
        const content = await fs.readFile(filePath, 'utf8');
        const bookData = JSON.parse(content);
        
        // Add the filename as an identifier
        bookData.filename = file;
        
        return bookData;
      })
    );
    
    return books;
  } catch (error) {
    console.error('Error loading books:', error);
    throw error;
  }
};

/**
 * Load a single book by filename
 * @param {string} filename - The filename of the book
 * @returns {Promise<Object>} - Book object
 */
const loadBookByFilename = async (filename) => {
  try {
    const filePath = path.join(process.cwd(), 'client', 'public', 'assets', 'books', filename);
    const content = await fs.readFile(filePath, 'utf8');
    const bookData = JSON.parse(content);
    
    // Add the filename as an identifier
    bookData.filename = filename;
    
    return bookData;
  } catch (error) {
    console.error(`Error loading book ${filename}:`, error);
    throw error;
  }
};

module.exports = {
  loadAllBooks,
  loadBookByFilename
};