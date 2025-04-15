const express = require('express');
const router = express.Router();
const wordBankController = require('../controllers/wordBankController');
const authenticate = require('../middleware/authentication');
const authorize = require('../middleware/authorization');

// Get word bank
router.get('/word-bank', authenticate, authorize('client'), wordBankController.getWordBank);

// Edit word form
router.get('/word-bank/edit/:id', authenticate, authorize('client'), wordBankController.getEditWordForm);

// Update word
router.post('/word-bank/edit/:id', authenticate, authorize('client'), wordBankController.editWord);

// Delete word
router.get('/word-bank/delete/:id', authenticate, authorize('client'), wordBankController.deleteWord);



module.exports = router;