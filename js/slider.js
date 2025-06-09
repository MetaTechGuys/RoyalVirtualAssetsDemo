document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('carouselExampleSlidesOnly');
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    
    let isDown = false;
    let startX = 0;
    let currentX = 0;
    let initialTransform = 0;
    let animationId = null;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    
    // Get Bootstrap carousel instance
    const bsCarousel = new bootstrap.Carousel(carousel, {
        interval: 3000,
        ride: 'carousel'
    });
    
    // Smooth animation function
    function smoothAnimation() {
        const progress = Math.min((Date.now() - lastTime) / 16, 1);
        velocity *= 0.95; // Friction
        
        if (Math.abs(velocity) > 0.1) {
            currentX += velocity * progress;
            updateTransform();
            animationId = requestAnimationFrame(smoothAnimation);
        }
    }
    
    function updateTransform() {
        const maxDrag = carousel.offsetWidth * 0.3; // 30% of carousel width
        const clampedX = Math.max(-maxDrag, Math.min(maxDrag, currentX));
        carouselInner.style.transform = `translateX(${clampedX}px)`;
        
        // Add subtle scale effect based on drag distance
        const scale = 1 - Math.abs(clampedX) / (maxDrag * 10);
        carouselInner.style.transform += ` scale(${Math.max(0.98, scale)})`;
    }
    
    function resetTransform() {
        carouselInner.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        carouselInner.style.transform = 'translateX(0) scale(1)';
        
        setTimeout(() => {
            carouselInner.style.transition = '';
        }, 400);
    }
    
    // Mouse events
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.clientX;
        currentX = 0;
        lastX = e.clientX;
        lastTime = Date.now();
        velocity = 0;
        
        carousel.classList.add('dragging');
        carousel.style.cursor = 'grabbing';
        carouselInner.style.transition = 'none';
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        e.preventDefault();
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        
        e.preventDefault();
        const now = Date.now();
        const deltaTime = now - lastTime;
        
        if (deltaTime > 0) {
            const deltaX = e.clientX - lastX;
            velocity = deltaX / deltaTime * 16; // Normalize to 60fps
            currentX = e.clientX - startX;
            
            updateTransform();
            
            lastX = e.clientX;
            lastTime = now;
        }
    });
    
    carousel.addEventListener('mouseup', handleDragEnd);
    carousel.addEventListener('mouseleave', handleDragEnd);
    
    function handleDragEnd() {
        if (!isDown) return;
        
        isDown = false;
        carousel.classList.remove('dragging');
        carousel.style.cursor = 'grab';
        
        const threshold = carousel.offsetWidth * 0.2; // 15% threshold
        const velocityThreshold = 0.5;
        
        // Determine if we should change slides based on distance or velocity
        if (Math.abs(currentX) > threshold || Math.abs(velocity) > velocityThreshold) {
            if (currentX > 0 || velocity > velocityThreshold) {
                bsCarousel.prev();
            } else if (currentX < 0 || velocity < -velocityThreshold) {
                bsCarousel.next();
            }
        }
        
        // Start momentum animation
        if (Math.abs(velocity) > 0.1) {
            lastTime = Date.now();
            animationId = requestAnimationFrame(smoothAnimation);
        }
        
        resetTransform();
    }
    
    // Touch events with better handling
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let touchCurrentY = 0;
    let touchStartTime = 0;
    let isScrolling = null;
    
    carousel.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        currentX = 0;
        isScrolling = null;
        
        carouselInner.style.transition = 'none';
        carousel.classList.add('dragging');
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        touchCurrentX = touch.clientX;
        touchCurrentY = touch.clientY;
        
        // Determine scroll direction on first move
        if (isScrolling === null) {
            isScrolling = Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX);
        }
        
        // If horizontal scrolling, prevent default and handle drag
        if (!isScrolling) {
            e.preventDefault();
            currentX = touchCurrentX - touchStartX;
            updateTransform();
        }
    }, { passive: false });
    
    carousel.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = currentX;
        const touchVelocity = Math.abs(touchDistance) / touchDuration;
        
        carousel.classList.remove('dragging');
        
        const threshold = carousel.offsetWidth * 0.2; // 20% threshold for touch
        const velocityThreshold = 0.3;
        
        if (Math.abs(touchDistance) > threshold || touchVelocity > velocityThreshold) {
            if (touchDistance > 0) {
                bsCarousel.prev();
            } else {
                bsCarousel.next();
            }
        }
        
        resetTransform();
    }, { passive: true });
    
    // Reset on slide change
    carousel.addEventListener('slide.bs.carousel', () => {
        currentX = 0;
        velocity = 0;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        resetTransform();
    });
    
    // Set initial cursor
    carousel.style.cursor = 'grab';
    
    // Enhanced cursor follower with fluid movement
    const sliderCursor = document.createElement('div');
    sliderCursor.className = 'slider-cursor-follower';
    document.body.appendChild(sliderCursor);
    
    const carouselImages = document.querySelectorAll('.carousel-item img');
    let isHovering = false;
    let cursorX = 0;
    let cursorY = 0;
    let cursorTargetX = 0;
    let cursorTargetY = 0;
    
    function animateCursor() {
        cursorX += (cursorTargetX - cursorX) * 0.1;
        cursorY += (cursorTargetY - cursorY) * 0.1;
        
        sliderCursor.style.left = cursorX + 'px';
        sliderCursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    carouselImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            if (!isDown) {
                isHovering = true;
                sliderCursor.style.opacity = '1';
                sliderCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
        
        img.addEventListener('mouseleave', function() {
            isHovering = false;
            sliderCursor.style.opacity = '0';
            sliderCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isHovering && !isDown) {
            cursorTargetX = e.clientX;
            cursorTargetY = e.clientY;
        }
    });
});
