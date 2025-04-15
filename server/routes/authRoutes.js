const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// These are the routes that will use the authentication controller in authController
// Remember to update the main routes in index.js to include the auth routes
// GET routes for displaying forms
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    user: req.user
  });
});

router.get('/signup', (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up',
    user: req.user
  });
});

// POST routes for form submissions
router.post('/login', authController.login);
router.post('/signup', authController.register);
router.get('/logout', authController.logout);

module.exports = router;