document.addEventListener('DOMContentLoaded', () => {
    const options = {
      threshold: 0.1
    };
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('ctext')) {
            entry.target.classList.add('animate-left');
          } else if (entry.target.classList.contains('ctext1')) {
            entry.target.classList.add('animate-right');
          }
          observer.unobserve(entry.target);
        }
      });
    }, options);
  
    document.querySelectorAll('.ctext, .ctext1').forEach(el => {
      observer.observe(el);
    });
  });
  