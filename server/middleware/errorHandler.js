const errorHandler = (err, req, res, next) => {
    // Log error
    console.error(err.stack);
    
    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    
    // Respond based on request type
    if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
      // API request - return JSON
      return res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Server Error' : message
      });
    } else {
      // Browser request - render error page
      return res.status(statusCode).render('error', {
        title: 'Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
        error: process.env.NODE_ENV === 'production' ? {} : err
      });
    }
  };
  
  module.exports = errorHandler;