/**
 * Validate registration data
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {string[]} - Array of error messages
 */
const validateRegistration = (username, email, password) => {
    const errors = [];
    
    // Validate username
    if (!username || username.trim() === '') {
      errors.push('Username is required');
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    // Validate email
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return errors;
  };
  
  /**
   * Validate login data
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {string[]} - Array of error messages
   */
  const validateLogin = (email, password) => {
    const errors = [];
    
    // Validate email
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.push('Password is required');
    }
    
    return errors;
  };
  
  module.exports = {
    validateRegistration,
    validateLogin
  };