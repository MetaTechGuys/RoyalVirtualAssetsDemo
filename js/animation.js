document.addEventListener('DOMContentLoaded', () => {
    const collapse = document.querySelector('.collapse');
    const logo = document.querySelector('.logo');
    const navhelp = document.querySelector('.navhelp');
    const hambur = document.querySelector('.hambur');
    const dropdown = document.querySelector('.dropdown-menu');
    const nb = document.getElementById('nb');


    // Get computed styles to store original values
    const computedLogoStyle = window.getComputedStyle(logo);
    const computedNbStyle = window.getComputedStyle(nb);
    const computedCollapseStyle = window.getComputedStyle(collapse);
    const computedNavhelpStyle = window.getComputedStyle(navhelp);
    const computedHamburStyle = window.getComputedStyle(hambur);
    const computedDropdownStyle = window.getComputedStyle(dropdown);



    const computedNavhelpJustify = computedNavhelpStyle.justifyContent;
    const originalLogoMarginRight = computedLogoStyle.marginRight;
    const originalLogoWidth = computedLogoStyle.width;
    const originalNbWidth = computedNbStyle.width;
    const originalCollapseOpacity = computedCollapseStyle.opacity;
    const originalCollapseVisibility = computedCollapseStyle.visibility;
    const originalCollapseDisplay = computedCollapseStyle.display;
    const originalHamburDisplay = computedHamburStyle.display;
    const originalDropdownVisibility = computedDropdownStyle.visibility;

    // Set transitions for smooth animation
    collapse.style.transition = 'opacity 0.4s, visibility 0.8s, display 0.8s';
    logo.style.transition = 'margin-right 0.8s, width 0.8s, margin-left 0.8s';
    nb.style.transition = 'width 0.8s, opacity 0.2s';
    navhelp.style.transition = 'justify-content 0.4s';
    hambur.style.transition = 'display 0.4s';
    dropdown.style.transition = 'visibility 0.01s';

    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scroll down: hide .collapse
            collapse.style.opacity = '0';
            collapse.style.visibility = 'hidden';
            collapse.style.display = 'none !important';


            navhelp.style.justifyContent = 'inherit';
            // Keep logo size, decrease margin-right
            logo.style.marginRight = '0px';
            logo.style.marginLeft = '0%';
            logo.style.width = '140px';



            dropdown.style.visibility = 'hidden';

            hambur.style.display = 'none';
            // #nb width to 28%
            nb.style.width = '260px'
            // nb.style.paddingLeft = '4%';
            nb.style.opacity = '0.8';
        } else if (scrollTop < lastScrollTop) {
            // Scroll up: revert to original styles
            collapse.style.opacity = originalCollapseOpacity;
            collapse.style.visibility = originalCollapseVisibility;
            collapse.style.display = originalCollapseDisplay;

            navhelp.style.justifyContent = computedNavhelpJustify;

            hambur.style.display = originalHamburDisplay;
            dropdown.style.visibility = originalDropdownVisibility;

            logo.style.marginRight = originalLogoMarginRight;
            logo.style.marginLeft = '40%';
            logo.style.width = originalLogoWidth;

            nb.style.width = '100%';
            // nb.style.paddingLeft = '0';
            nb.style.opacity = '1';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('Script loaded');
  
  // Get the navbar and hero elements
  const navbar = document.querySelector('.navbar-expand-lg');
  const hero = document.querySelector('.hero');
  const hambur = document.querySelector('.hambur');

  
  if (!navbar) {
    console.error('Navbar element not found');
    return;
  }
  
  if (!hero) {
    console.error('Hero element not found');
    // If no hero, just set navbar to black
    if (window.innerWidth > 993) {
      navbar.setAttribute('style', 'background-color: black !important');
    }
    return;
  }
  
  console.log('Elements found, setting up scroll listener');
  
  function updateNavbar() {
    // Only apply this functionality for screens wider than 993px
    if (window.innerWidth > 993) {
      // Get the current scroll position
      const scrollPosition = window.scrollY;
      
      // Get the height of the hero section
      const heroHeight = hero.offsetHeight;
      
      console.log(`Scroll: ${scrollPosition}, Hero height: ${heroHeight}`);
      
      // Check if we've scrolled past the hero
      if (scrollPosition > heroHeight - navbar.offsetHeight) {
        // Past hero - set black background
        navbar.setAttribute('style', 'background-color: #2a2b41 !important;');
      } else {
        // On hero - set transparent background
        navbar.setAttribute('style', 'background-color: transparent !important;');
      }
    }
    else {
      const scrollPosition = window.scrollY;
      
      // Get the height of the hero section
      const heroHeight = hero.offsetHeight;
      
      console.log(`Scroll: ${scrollPosition}, Hero height: ${heroHeight}`);
      
      // Check if we've scrolled past the hero
      if (scrollPosition > heroHeight - navbar.offsetHeight) {
        // Past hero - set black background
        hambur.setAttribute('style', 'filter: invert(0) !important;');
      } else {
        // On hero - set transparent background
        hambur.setAttribute('style', 'filter: invert(1) !important;');
      }
    }
  }
  
  // Initial check
  updateNavbar();
  
  // Add scroll event listener
  window.addEventListener('scroll', updateNavbar);
  
  // Also update when window is resized
  window.addEventListener('resize', updateNavbar);
});

