document.addEventListener('DOMContentLoaded', function() {
  // Get the dropdown toggle button
  const dropdownToggle = document.querySelector('.btn-secondary.hambur');
  
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', function(event) {
      // Get the dropdown menu
      const dropdownMenu = this.nextElementSibling;
      
      // If the menu is about to be shown
      if (!dropdownMenu.classList.contains('show')) {
        // Force a reflow before adding the show class
        // This ensures the initial state is properly applied
        void dropdownMenu.offsetWidth;
      }
    });
  }
});