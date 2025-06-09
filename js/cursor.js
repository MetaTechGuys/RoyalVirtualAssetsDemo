
    const cursor = document.querySelector("#cursor");
    const cursorBorder = document.querySelector("#cursor-border");
    const cursorPos = { x: 0, y: 0 };
    const cursorBorderPos = { x: 0, y: 0 };
    
    document.addEventListener("mousemove", (e) => {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    
    function cursorLoop() {
      const easting = 8;
      cursorBorderPos.x += (cursorPos.x - cursorBorderPos.x) / easting;
      cursorBorderPos.y += (cursorPos.y - cursorBorderPos.y) / easting;
      
      cursorBorder.style.transform = `translate(${cursorBorderPos.x}px, ${cursorBorderPos.y}px)`;
      window.cursorAnimationFrame = requestAnimationFrame(cursorLoop);
    }
    
    // Start the animation
    window.cursorAnimationFrame = requestAnimationFrame(cursorLoop);
    
    document.querySelectorAll("[data-cursor]").forEach((item) => {
      item.addEventListener("mouseover", (e) => {
        if (item.dataset.cursor === "pointer") {
          cursorBorder.style.backgroundColor = "rgba(0, 0, 0, .6)";
          cursorBorder.style.setProperty("--size", "40px");
        }
        if (item.dataset.cursor === "pointer2") {
          cursorBorder.style.backgroundColor = "white";
          cursorBorder.style.mixBlendMode = "difference";
          cursorBorder.style.setProperty("--size", "40px");
        }
      });
      item.addEventListener("mouseout", (e) => {
        cursorBorder.style.backgroundColor = "unset";
        cursorBorder.style.mixBlendMode = "unset";
        cursorBorder.style.setProperty("--size", "14px");
      });
    });
    document.addEventListener('DOMContentLoaded', function() {
    const vidimg = document.querySelector('.vidimg');
    const video = document.querySelector('.vidimg > video');
    
    // Create cursor follower element
    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);
    
    let isHovering = false;
    
    // Show cursor follower on video hover
    video.addEventListener('mouseenter', function() {
        isHovering = true;
        cursorFollower.style.opacity = '1';
    });
    
    // Hide cursor follower when leaving video
    video.addEventListener('mouseleave', function() {
        isHovering = false;
        cursorFollower.style.opacity = '0';
    });
    
    // Update cursor follower position
    document.addEventListener('mousemove', function(e) {
        if (isHovering) {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }
    });
});
// Add this to your HTML file in a <script> tag or separate JS file
document.addEventListener('DOMContentLoaded', function() {
    // Create the cursor follower element
    const sliderCursor = document.createElement('div');
    sliderCursor.className = 'slider-cursor-follower';
    document.body.appendChild(sliderCursor);
    
    // Get all carousel images
    const carouselImages = document.querySelectorAll('.carousel-item');
    
    let isHovering = false;
    
    // Add hover events to each image
    carouselImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            isHovering = true;
            sliderCursor.style.opacity = '1';
        });
        
        img.addEventListener('mouseleave', function() {
            isHovering = false;
            sliderCursor.style.opacity = '0';
        });
    });
    
    // Update cursor position on mouse move
    document.addEventListener('mousemove', function(e) {
        if (isHovering) {
            sliderCursor.style.left = e.clientX + 'px';
            sliderCursor.style.top = e.clientY + 'px';
        }
    });
});

// Add this to your HTML file in a <script> tag or separate JS file
document.addEventListener('DOMContentLoaded', function() {
    // Create the swiper cursor follower element
    const swiperCursor = document.createElement('div');
    swiperCursor.className = 'swiper-cursor-follower';
    document.body.appendChild(swiperCursor);
    
    // Get all swiper slide images
    const swiperImages = document.querySelectorAll('.swiper-slide img');
    
    let isHoveringSwiperImage = false;
    
    // Add hover events to each swiper image
    swiperImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            isHoveringSwiperImage = true;
            swiperCursor.style.opacity = '1';
        });
        
        img.addEventListener('mouseleave', function() {
            isHoveringSwiperImage = false;
            swiperCursor.style.opacity = '0';
        });
    });
    
    // Update cursor position on mouse move
    document.addEventListener('mousemove', function(e) {
        if (isHoveringSwiperImage) {
            swiperCursor.style.left = e.clientX + 'px';
            swiperCursor.style.top = e.clientY + 'px';
        }
    });
});

