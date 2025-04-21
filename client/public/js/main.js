document.addEventListener('DOMContentLoaded', function() {
    // Auto-close alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => {
          alert.style.display = 'none';
        }, 300);
      }, 5000);
    });

    const hamburger = document.getElementById('hamburger-menu');
    const mainMenu = document.getElementById('main-menu');
    
    if (hamburger) {
      hamburger.addEventListener('click', function() {
        mainMenu.classList.toggle('show');
      });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.main-nav') && !event.target.closest('.hamburger')) {
        if (mainMenu.classList.contains('show')) {
          mainMenu.classList.remove('show');
        }
      }
    });

  });
