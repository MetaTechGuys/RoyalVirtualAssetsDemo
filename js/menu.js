document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.querySelector(".btn-secondary.hambur");

  if (dropdownToggle) {
    dropdownToggle.addEventListener("click", function (event) {
      const dropdownMenu = this.nextElementSibling;

      if (!dropdownMenu.classList.contains("show")) {
        void dropdownMenu.offsetWidth;
      }
    });
  }
});
