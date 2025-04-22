const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const readerController = require('../controllers/readerController');
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');
const path = require('path');
const fs = require('fs');

// Admin routes
router.get('/admin/book', authenticate, authorize('admin'), bookController.getAllBooks);

// Client routes
router.get('/book', authenticate, authorize('client'), bookController.getBooksForClient);
// server/routes/bookRoutes.js
router.get('/book/read/:filename', authenticate, authorize('client'), async (req, res, next) => {
    try {
      await readerController.getBookReader(req, res, next);
    } catch (error) {
      console.error('Book reading error:', error);
      
      if (error.code === 11000) {
        // This is a duplicate key error
        req.flash('error', 'There was an issue with your reading progress. Please try again.');
        return res.redirect('/book');
      }
      
      next(error);
    }
  });

router.get('/all-books', authenticate, authorize('client', 'admin'), bookController.getAllBooksWithFilters);

router.get('/assets/lists/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), 'client', 'public', 'assets', 'lists', filename);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading vocabulary list:', err);
      return res.status(404).json({ error: 'Vocabulary list not found' });
    }
    
    res.header('Content-Type', 'application/json');
    res.send(data);
  });
});

  
module.exports = router;