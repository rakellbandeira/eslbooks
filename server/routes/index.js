const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');

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



// Export router
module.exports = router;