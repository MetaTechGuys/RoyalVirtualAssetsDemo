document.addEventListener('DOMContentLoaded', function() {
    const walkVideo = document.querySelector('.walk');
    const typeVideo = document.querySelector('.type');
    const roboSection = document.querySelector('.robo');
    
    let hasPlayed = false;
    
    // Initially pause both videos
    walkVideo.pause();
    typeVideo.pause();
    
    // Create intersection observer to detect when section comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                hasPlayed = true;
                playVideoSequence();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the section is visible
    });
    
    // Start observing the robo section
    observer.observe(roboSection);
    
    function playVideoSequence() {
        // Show and start playing the walk video
        walkVideo.classList.add('active');
        walkVideo.currentTime = 0;
        walkVideo.play();
        
        // When walk video ends, hide it and show type video
        walkVideo.addEventListener('ended', function() {
            // Hide walk video
            walkVideo.classList.remove('active');
            
            // Show and play type video
            typeVideo.classList.add('active');
            typeVideo.currentTime = 0;
            typeVideo.play();
            
            // Type video stays visible after playing (no removal of 'active' class)
            
        }, { once: true });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    
    const aiChatToggle = document.getElementById('ai-chat-toggle');
    
    if (!aiChatToggle) {
        return;
    }
    
    const videos = aiChatToggle.querySelectorAll('video');
    
    if (videos.length === 0) {
        return;
    }
    
    let currentVideoIndex = 0;
    const delayBetweenVideos = 4000;

    // Initially hide all videos except the first one
    videos.forEach((video, index) => {
        
        if (index === 0) {
            video.style.display = 'block';
        } else {
            video.style.display = 'none';
        }
        
        // Ensure videos are muted and set to play inline
        video.muted = true;
        video.playsInline = true;
        video.loop = false;
        
        // Add load event listener
        video.addEventListener('loadeddata', () => {
        });
        
        video.addEventListener('error', (e) => {
        });
    });

    function playNextVideo() {
        
        const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
        
        setTimeout(() => {
            // Hide current video
            videos[currentVideoIndex].style.display = 'none';
            
            // Update current index
            currentVideoIndex = nextVideoIndex;
            
            // Show and play next video
            videos[currentVideoIndex].style.display = 'block';
            videos[currentVideoIndex].currentTime = 0;
            
            
            videos[currentVideoIndex].play()
                .then(() => {
                })
                .catch(error => {
                });
                
        }, delayBetweenVideos);
    }

    // Set up event listeners for when each video ends
    videos.forEach((video, index) => {
        video.addEventListener('ended', () => {
            playNextVideo();
        });
        
        video.addEventListener('play', () => {
        });
        
        video.addEventListener('pause', () => {
        });
    });

    // Start playing the first video with user interaction fallback
    function startFirstVideo() {
        
        videos[0].play()
            .then(() => {
            })
            .catch(error => {
                
                // Add click listener to start videos on user interaction
                document.addEventListener('click', function startOnClick() {
                    videos[0].play()
                        .then(() => {
                        })
                        .catch(err => {
                        });
                    
                    // Remove this listener after first use
                    document.removeEventListener('click', startOnClick);
                }, { once: true });
            });
    }

    // Try to start immediately, or wait a bit for DOM to be fully ready
    setTimeout(startFirstVideo, 100);
});

