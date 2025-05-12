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
            logo.style.width = '142px';



            dropdown.style.visibility = 'hidden';

            hambur.style.display = 'none';
            // #nb width to 28%
            nb.style.width = '264px';
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
            logo.style.marginLeft = '0%';
            logo.style.width = originalLogoWidth;

            nb.style.width = '100%';
            // nb.style.paddingLeft = '0';
            nb.style.opacity = '1';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
});
