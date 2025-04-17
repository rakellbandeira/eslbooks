const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const readerController = require('../controllers/readerController');
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');

// Admin routes
router.get('/admin/book', authenticate, authorize('admin'), bookController.getAllBooks);

// Client routes
router.get('/book', authenticate, authorize('client'), bookController.getBooksForClient);
router.get('/book/read/:filename', authenticate, authorize('client'), readerController.getBookReader);

module.exports = router;