// THis controller will handle registration and login requests

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateRegistration, validateLogin } = require('../utils/validation');

// Register a new user, validates the input, checks for existing users, and creates a new user
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    const validationErrors = validateRegistration(username, email, password);
    if (validationErrors.length > 0) {
      req.flash('error', validationErrors);
      return res.redirect('/signup');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email is already registered');
      return res.redirect('/signup');
    }
    
    // Create a new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/signup');
  }
};

// Login user, authenticates the user and creates a JWT token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validationErrors = validateLogin(email, password);
    if (validationErrors.length > 0) {
      req.flash('error', validationErrors);
      return res.redirect('/login');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Redirect based on user role
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
};

// Logout user function simply clears the token cookie
exports.logout = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'You have been logged out');
  res.redirect('/');
};