document.addEventListener("DOMContentLoaded", () => {
  const collapse = document.querySelector(".collapse");
  // const logo = document.querySelector(".logo");
  const navhelp = document.querySelector(".navhelp");
  const hambur = document.querySelector(".hambur");
  const dropdown = document.querySelector(".dropdown-menu");
  const nb = document.getElementById("nb");

  const computedNbStyle = window.getComputedStyle(nb);
  const computedCollapseStyle = window.getComputedStyle(collapse);
  const computedNavhelpStyle = window.getComputedStyle(navhelp);
  const computedHamburStyle = window.getComputedStyle(hambur);
  const computedDropdownStyle = window.getComputedStyle(dropdown);

  const computedNavhelpJustify = computedNavhelpStyle.justifyContent;
  const originalCollapseOpacity = computedCollapseStyle.opacity;
  const originalCollapseVisibility = computedCollapseStyle.visibility;
  const originalCollapseDisplay = computedCollapseStyle.display;
  const originalHamburDisplay = computedHamburStyle.display;
  const originalDropdownVisibility = computedDropdownStyle.visibility;

  collapse.style.transition = "opacity 0.4s, visibility 0.8s, display 0.8s";
  nb.style.transition = "width 0.8s, opacity 0.2s";
  navhelp.style.transition = "justify-content 0.4s";
  hambur.style.transition = "display 0.4s";
  dropdown.style.transition = "visibility 0.01s";

  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 50) {
      collapse.style.opacity = "0";
      collapse.style.visibility = "hidden";
      collapse.style.display = "none !important";

      navhelp.style.justifyContent = "inherit";

      dropdown.style.visibility = "hidden";


      nb.style.width = "200px";

      nb.style.opacity = "0";
    } else if (scrollTop < lastScrollTop) {
      collapse.style.opacity = originalCollapseOpacity;
      collapse.style.visibility = originalCollapseVisibility;
      collapse.style.display = originalCollapseDisplay;

      navhelp.style.justifyContent = computedNavhelpJustify;

      hambur.style.display = originalHamburDisplay;
      dropdown.style.visibility = originalDropdownVisibility;

      nb.style.width = "100%";

      nb.style.opacity = "1";
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".navbar-expand-lg");
  const hero = document.querySelector(".hero");
  const hambur = document.querySelector(".hambur");

  if (!navbar) {
    return;
  }

  if (!hero) {
    if (window.innerWidth > 993) {
      navbar.setAttribute("style", "background-color: black !important");
    }
    return;
  }

  function updateNavbar() {
    if (window.innerWidth > 993) {
      const scrollPosition = window.scrollY;

      const heroHeight = hero.offsetHeight;

      if (scrollPosition > heroHeight - navbar.offsetHeight) {
        navbar.setAttribute("style", "background-image:linear-gradient(348deg,#1e88e588,#2a2b4188) !important;");
      } else {
        navbar.setAttribute(
          "style",
          "background-color: transparent !important;"
        );
      }
    } else {
      const scrollPosition = window.scrollY;

      const heroHeight = hero.offsetHeight;

      if (scrollPosition > heroHeight - navbar.offsetHeight) {
        hambur.setAttribute("style", "filter: invert(0) !important;");
      } else {
        hambur.setAttribute("style", "filter: invert(1) !important;");
      }
    }
  }

  updateNavbar();

  window.addEventListener("scroll", updateNavbar);

  window.addEventListener("resize", updateNavbar);
});
