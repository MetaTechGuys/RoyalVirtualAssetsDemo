
    var swiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      initialSlide: 4,
      coverflowEffect: {
        rotate: 40,
        stretch: 0,
        depth: 80,
        modifier: 1,
        slideShadows: true,
      },
      pagination: {
        el: ".swiper-pagination",
      },
    });



// Clean up event listeners for bfcache compatibility
window.addEventListener('pagehide', function(event) {
  // Clean up any intervals or timeouts
  if (window.cursorAnimationFrame) {
    cancelAnimationFrame(window.cursorAnimationFrame);
  }
  
  // Clean up any active connections or timers
  if (window.cryptoUpdateInterval) {
    clearInterval(window.cryptoUpdateInterval);
  }
});

window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Page was restored from bfcache
    // Reinitialize any necessary components
    console.log('Page restored from bfcache');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Get all images inside nav-links
  const navImages = document.querySelectorAll('.nav-link > img');
  
  // Add click event to each image
  navImages.forEach(img => {
    img.addEventListener('click', function(event) {
      event.stopPropagation(); // Prevent event from bubbling up
      
      // Find the closest form input
      const input = document.querySelector('.form > input');
      
      if (!input.classList.contains('visible')) {
        // Show the input with animation
        input.style.display = 'block';
        // Trigger reflow to ensure animation works
        void input.offsetWidth;
        input.classList.add('visible');
        input.classList.remove('hiding');
      } else {
        // Hide with animation
        input.classList.remove('visible');
        input.classList.add('hiding');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
          if (input.classList.contains('hiding')) {
            input.style.display = 'none';
            input.classList.remove('hiding');
          }
        }, 300); // Match this to the animation duration
      }
    });
  });
  
  // Close the input when clicking elsewhere
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.nav-link > img') && !event.target.closest('.form > input')) {
      const input = document.querySelector('.form > input');
      if (input.classList.contains('visible')) {
        // Hide with animation
        input.classList.remove('visible');
        input.classList.add('hiding');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
          if (input.classList.contains('hiding')) {
            input.style.display = 'none';
            input.classList.remove('hiding');
          }
        }, 300); // Match this to the animation duration
      }
    }
  });
});
