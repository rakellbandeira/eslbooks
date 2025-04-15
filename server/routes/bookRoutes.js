const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');
const readerController = require('../controllers/readerController');



// Admin routes
router.get('/admin/books', authenticate, authorize('admin'), bookController.getAllBooks);
router.get('/admin/books/add', authenticate, authorize('admin'), bookController.getAddBookForm);
router.post('/admin/books/add', authenticate, authorize('admin'), upload.single('coverImage'), bookController.addBook);
router.get('/admin/books/edit/:id', authenticate, authorize('admin'), bookController.getEditBookForm);
router.post('/admin/books/edit/:id', authenticate, authorize('admin'), upload.single('coverImage'), bookController.updateBook);
router.get('/admin/books/delete/:id', authenticate, authorize('admin'), bookController.deleteBook);
router.post('/admin/books/page/add', authenticate, authorize('admin'), upload.single('pageImage'), bookController.addPage);
router.get('/admin/books/page/delete/:id/:bookId', authenticate, authorize('admin'), bookController.deletePage);
router.get('/books/read/:id', authenticate, authorize('client'), readerController.getBookReader);


// Client routes
router.get('/books', authenticate, authorize('client'), bookController.getBooksForClient);



module.exports = router;