const express = require('express');
const router = express.Router();
const { translateText } = require('../utils/translate');
const WordBank = require('../models/WordBank');
const authenticate = require('../middleware/authentication');
const UserProgress = require('../models/UserProgress');

// Translate text
router.post('/api/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({
        success: false,
        message: 'Text and target language are required'
      });
    }
    
    const translation = await translateText(text, targetLang);
    
    res.json({
      success: true,
      translation
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Translation failed'
    });
  }
});

// Add word to word bank
router.post('/api/word-bank', authenticate, async (req, res) => {
  try {
    const { word, translation, bookFilename } = req.body;
    
    if (!word || !translation) {
      return res.status(400).json({
        success: false,
        message: 'Word and translation are required'
      });
    }
    
    // Create or update word in word bank
    await WordBank.findOneAndUpdate(
      { userId: req.user._id, word: word.toLowerCase() },
      {
        userId: req.user._id,
        word: word.toLowerCase(),
        translation,
        bookFilename
      },
      { upsert: true, new: true }
    );
    
    res.json({
        success: true,
        message: 'Word added to bank'
      });
    } catch (error) {
      console.error('Add word error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add word'
      });
    }
  });

  router.delete('/api/reading-progress/:bookFilename', authenticate, async (req, res) => {
    try {
      const { bookFilename } = req.params;
      
      // Delete the reading progress
      await UserProgress.findOneAndDelete({
        userId: req.user._id,
        bookFilename
      });
      
      res.json({ success: true, message: 'Reading progress deleted successfully' });
    } catch (error) {
      console.error('Error deleting reading progress:', error);
      res.status(500).json({ success: false, message: 'Error deleting reading progress' });
    }
  });


  
  module.exports = router;