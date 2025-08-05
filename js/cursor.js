document.addEventListener('DOMContentLoaded', function() {
  // Create custom cursor element
  const customCursor = document.createElement('div');
  customCursor.id = 'custom-cursor';
  document.body.appendChild(customCursor);

  // Function to update cursor position
  function updateCursorPosition(e) {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  }

  // Function to show/hide custom cursor
  function toggleCustomCursor(show) {
    customCursor.style.opacity = show ? '1' : '0';
  }

  // Add event listeners
  document.addEventListener('mousemove', updateCursorPosition);

  const vidimgElements = document.querySelectorAll('.vidimg');
  vidimgElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(false));
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Create custom cursors
  const videoCursor = document.createElement('div');
  videoCursor.id = 'custom-cursor';
  document.body.appendChild(videoCursor);

  const sliderCursor = document.createElement('div');
  sliderCursor.id = 'slider-cursor';
  document.body.appendChild(sliderCursor);

  // Function to update cursor position
  function updateCursorPosition(e, cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }

  // Function to show/hide custom cursor
  function toggleCustomCursor(cursor, show) {
    cursor.style.opacity = show ? '1' : '0';
  }

  // Add event listeners for video cursor
  document.addEventListener('mousemove', (e) => updateCursorPosition(e, videoCursor));

  const vidimgElements = document.querySelectorAll('.vidimg');
  vidimgElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(videoCursor, true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(videoCursor, false));
  });

  // Add event listeners for slider cursor
  document.addEventListener('mousemove', (e) => updateCursorPosition(e, sliderCursor));

  const sliderElements = document.querySelectorAll('.slider, .carousel');
  sliderElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(sliderCursor, true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(sliderCursor, false));
  });

  // Handle active state for carousel
  const carouselElements = document.querySelectorAll('.carousel');
  carouselElements.forEach(element => {
    element.addEventListener('mousedown', () => {
      sliderCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    element.addEventListener('mouseup', () => {
      sliderCursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  // Create custom cursors
  const videoCursor = document.createElement('div');
  videoCursor.id = 'custom-cursor';
  document.body.appendChild(videoCursor);

  const sliderCursor = document.createElement('div');
  sliderCursor.id = 'slider-cursor';
  document.body.appendChild(sliderCursor);

  const heroCursor = document.createElement('div');
  heroCursor.id = 'hero-cursor';
  document.body.appendChild(heroCursor);

  // Function to update cursor position
  function updateCursorPosition(e, cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }

  // Function to show/hide custom cursor
  function toggleCustomCursor(cursor, show) {
    cursor.style.opacity = show ? '1' : '0';
  }

  // Add event listeners for video cursor
  document.addEventListener('mousemove', (e) => updateCursorPosition(e, videoCursor));

  const vidimgElements = document.querySelectorAll('.vidimg');
  vidimgElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(videoCursor, true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(videoCursor, false));
  });

  // Add event listeners for slider cursor
  document.addEventListener('mousemove', (e) => updateCursorPosition(e, sliderCursor));

  const sliderElements = document.querySelectorAll('.slider, .carousel');
  sliderElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(sliderCursor, true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(sliderCursor, false));
  });

  // Handle active state for carousel
  const carouselElements = document.querySelectorAll('.carousel');
  carouselElements.forEach(element => {
    element.addEventListener('mousedown', () => {
      sliderCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    element.addEventListener('mouseup', () => {
      sliderCursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });

  // Add event listeners for hero cursor
  document.addEventListener('mousemove', (e) => updateCursorPosition(e, heroCursor));

  const heroElements = document.querySelectorAll('.hero');
  heroElements.forEach(element => {
    element.addEventListener('mouseenter', () => toggleCustomCursor(heroCursor, true));
    element.addEventListener('mouseleave', () => toggleCustomCursor(heroCursor, false));
  });
});