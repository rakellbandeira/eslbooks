const jwt = require('jsonwebtoken');
const User = require('../models/User');


// This middleware will check if a user is authenticated
// Set the user information in the Req object.

const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      // No token, user is not authenticated
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      // User not found, clear the invalid token
      res.clearCookie('token');
      return next();
    }
    
    // Set user in request object
    req.user = user;
    res.locals.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    // Invalid token, clear it
    res.clearCookie('token');
    next();
  }
};

module.exports = authenticate;