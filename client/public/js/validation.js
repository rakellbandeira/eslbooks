// Client-side validation on the form, sign up and login

document.addEventListener('DOMContentLoaded', function() {
    // Get forms
    const loginForm = document.querySelector('form[action="/login"]');
    const signupForm = document.querySelector('form[action="/signup"]');
    
    // Add validation to signup form
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        // Get form fields
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate fields
        let isValid = true;
        let errorMessage = '';
        
        // Username validation
        if (username.length < 3) {
          errorMessage += 'Username must be at least 3 characters long\n';
          isValid = false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errorMessage += 'Please enter a valid email address\n';
          isValid = false;
        }
        
        // Password validation
        if (password.length < 6) {
          errorMessage += 'Password must be at least 6 characters long\n';
          isValid = false;
        }
        
        // If validation fails, prevent form submission
        if (!isValid) {
          e.preventDefault();
          alert(errorMessage);
        }
      });
    }
    
    // Add validation to login form
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        // Get form fields
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate fields
        let isValid = true;
        let errorMessage = '';
        
        // Email validation
        if (email === '') {
          errorMessage += 'Email is required\n';
          isValid = false;
        }
        
        // Password validation
        if (password === '') {
          errorMessage += 'Password is required\n';
          isValid = false;
        }
        
        // If validation fails, prevent form submission
        if (!isValid) {
          e.preventDefault();
          alert(errorMessage);
        }
      });
    }
  });