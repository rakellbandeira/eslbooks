// THis controller will handle registration and login requests

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateRegistration, validateLogin } = require('../utils/validation');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


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

// Send password reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account with that email address exists');
      return res.redirect('/forgot-password');
    }
    
    // Generate random token (4-digit numeric)
    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const token = tokenNum.toString();
    
    // Save token to user record with expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1200000; // 20 minutes
    await user.save();
    
    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Email options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'ESL Books Password Reset',
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n
        Please enter the following 4-digit code to complete the process:\n\n
        ${token}\n\n
        This code will expire in 20 minutes.\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.`
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    req.flash('success', 'An email has been sent with further instructions');
    res.redirect('/verify-token');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};

// Display the reset form
exports.getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token,
      user: {}
    });
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};

// Verify token
/* exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Token is invalid or has expired');
      return res.redirect('/verify-token');
    }
    
    // Redirect to reset password page with token
    res.redirect(`/reset-password/${token}`);
  } catch (error) {
    console.error('Verify token error:', error);
    req.flash('error', 'An error occurred during token verification');
    res.redirect('/verify-token');
  }
}; */

// Process reset password
/* exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    // Validate passwords
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect(`/reset-password/${token}`);
    }
    
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect(`/reset-password/${token}`);
    }
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    // Set new password and clear token fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    req.flash('success', 'Your password has been updated! Please log in with your new password');
    res.redirect('/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};  */



// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Token is invalid or has expired');
      return res.redirect('/verify-token');
    }
    
    // Instead of redirecting with the token in the URL,
    // storing it in session and redirecting to a simpler URL
    req.session.resetToken = token;
    req.session.resetEmail = user.email;
    res.redirect('/reset-password');
  } catch (error) {
    console.error('Verify token error:', error);
    req.flash('error', 'An error occurred during token verification');
    res.redirect('/verify-token');
  }
};

// Display the reset form - simplified version
exports.getResetPassword = async (req, res) => {
  try {
    // Check if we have token in session
    if (!req.session.resetToken) {
      req.flash('error', 'No valid token found. Please start the password reset process again.');
      return res.redirect('/forgot-password');
    }
    
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token: req.session.resetToken,
      user: null
    });
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};

// Process reset password - updated to use session token
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.session.resetToken;
    
    if (!token) {
      req.flash('error', 'Invalid or expired token');
      return res.redirect('/forgot-password');
    }
    
    // Validate passwords
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/reset-password');
    }
    
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/reset-password');
    }
    
    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    // Set new password and clear token fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    // Clear session data
    delete req.session.resetToken;
    delete req.session.resetEmail;
    
    req.flash('success', 'Your password has been updated! Please log in with your new password');
    res.redirect('/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};


// Send password reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account with that email address exists');
      return res.redirect('/forgot-password');
    }
    
    
    // Store the user's email in session to identify them during password reset
    req.session.resetEmail = email;
    
    // Redirect to reset password page
    req.flash('success', 'Email verified. Please set your new password.');
    res.redirect('/reset-password');
  } catch (error) {
    console.error('Forgot password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};

// Modify the getResetPassword function
exports.getResetPassword = async (req, res) => {
  try {
    // Check if resetEmail exists in session
    if (!req.session.resetEmail) {
      req.flash('error', 'Please enter your email first');
      return res.redirect('/forgot-password');
    }
    
    res.render('auth/reset-password', {
      title: 'Reset Password',
      user: {}  // Empty user object to prevent header error
    });
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};

// Modify the resetPassword function
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.session.resetEmail;
    
    if (!email) {
      req.flash('error', 'Email verification expired. Please try again.');
      return res.redirect('/forgot-password');
    }
    
    // Validate passwords
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/reset-password');
    }
    
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/reset-password');
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/forgot-password');
    }
    
    // Set new password
    user.password = password;
    await user.save();
    
    // Clear session data
    delete req.session.resetEmail;
    
    req.flash('success', 'Your password has been updated! Please log in with your new password');
    res.redirect('/login');
  } catch (error) {
    console.error('Reset password error:', error);
    req.flash('error', 'An error occurred during password reset process');
    res.redirect('/forgot-password');
  }
};