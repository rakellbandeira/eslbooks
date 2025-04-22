const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/authentication');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
require('./config/db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authenticate);

// Set up session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Set up flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

// Set static folder
app.use(express.static(path.join(__dirname, '../client/public')));

// Routes
app.use('/', require('./routes/index'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const isVercel = process.env.VERCEL || false;

if (!isVercel) {
  // Only listen to the port when not in Vercel environment
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Export the app for Vercel serverless function
  module.exports = app;
}

if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


// Trying to track previous pages
app.use((req, res, next) => {
  // Excluding routes from being remembered: API routes, static files
  const excludedPaths = ['/api/', '/js/', '/css/', '/images/', '/assets/'];
  const shouldTrack = !excludedPaths.some(path => req.path.startsWith(path));
  
  // Not tracking the book reading page itself
  const isBookReadingPage = req.path.startsWith('/book/read/');
  
  if (shouldTrack && !isBookReadingPage && req.method === 'GET') {
    // Storing the current URL as the referer for the next request
    req.session.previousPage = req.originalUrl || '/dashboard';
  }
  
  next();
});


// Export the Express app
module.exports = app;