const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const bookRoutes = require('./bookRoutes');
const wordBankRoutes = require('./wordBankRoutes');
const apiRoutes = require('./apiRoutes');

// Home route
router.get('/', (req, res) => {
  res.render('home', {
    title: 'ESL Books - Language Learning Platform',
    user: req.user
  });
});


// Use auth routes
router.use('/', authRoutes);

// Use dashboard routes
router.use('/', dashboardRoutes);

// Use book routes
router.use('/', bookRoutes);

// Use word bank routes
router.use('/', wordBankRoutes);

// Use API routes
router.use('/', apiRoutes);




// Export router
module.exports = router;