// This middleware checks if a user has the appropriate role to access restricted routes


const authorize = (...roles) => {
    return (req, res, next) => {
      // Check if user exists and has a role
      if (!req.user || !roles.includes(req.user.role)) {
        req.flash('error', 'You are not authorized to access this resource');
        return res.redirect('/login');
      }
      
      next();
    };
  };
  
  module.exports = authorize;