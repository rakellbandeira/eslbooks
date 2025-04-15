const WordBank = require('../models/WordBank');
const Book = require('../models/Book');
const { groupWordsAlphabetically } = require('../utils/index');

// Get user's word bank
exports.getWordBank = async (req, res, next) => {
  try {
    // Get search query if any
    const search = req.query.search || '';
    
    // Build query
    let query = { userId: req.user._id };
    
    if (search) {
      query.word = { $regex: new RegExp(search, 'i') };
    }
    
    // Get words
    const words = await WordBank.find(query)
      .sort({ word: 1 })
      .populate('bookId', 'title');
    
    // Group words alphabetically
    const groupedWords = groupWordsAlphabetically(words);
    
    res.render('dashboard/word-bank', {
      title: 'My Word Bank',
      words,
      groupedWords,
      search,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Add word to word bank (via API, already implemented in apiRoutes.js)

// Edit word in word bank
exports.editWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { word, translation } = req.body;
    
    // Validate input
    if (!word || !translation) {
      req.flash('error', 'Word and translation are required');
      return res.redirect('/word-bank');
    }
    
    // Find word and ensure it belongs to the user
    const wordBank = await WordBank.findOne({ _id: id, userId: req.user._id });
    
    if (!wordBank) {
      req.flash('error', 'Word not found');
      return res.redirect('/word-bank');
    }
    
    // Update word
    wordBank.word = word.toLowerCase();
    wordBank.translation = translation;
    wordBank.updatedAt = Date.now();
    
    await wordBank.save();
    
    req.flash('success', 'Word updated successfully');
    res.redirect('/word-bank');
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      req.flash('error', 'This word already exists in your word bank');
      return res.redirect('/word-bank');
    }
    
    next(error);
  }
};

// Delete word from word bank
exports.deleteWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find word and ensure it belongs to the user
    const wordBank = await WordBank.findOne({ _id: id, userId: req.user._id });
    
    if (!wordBank) {
      req.flash('error', 'Word not found');
      return res.redirect('/word-bank');
    }
    
    // Delete word
    await WordBank.findByIdAndDelete(id);
    
    req.flash('success', 'Word deleted successfully');
    res.redirect('/word-bank');
  } catch (error) {
    next(error);
  }
};

// Get edit word form
exports.getEditWordForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find word and ensure it belongs to the user
    const wordBank = await WordBank.findOne({ _id: id, userId: req.user._id });
    
    if (!wordBank) {
      req.flash('error', 'Word not found');
      return res.redirect('/word-bank');
    }
    
    res.render('dashboard/edit-word', {
      title: 'Edit Word',
      wordBank,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};