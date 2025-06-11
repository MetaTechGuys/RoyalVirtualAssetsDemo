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
    const waveVideo = document.querySelector('.wave');
    const loopVideo = document.querySelector('.loop');
    const videosContainer = document.querySelector('.videos-container');
    let hasPlayedWave = false;

    // Add CSS transition for fade effect
    if (waveVideo) {
        waveVideo.style.transition = 'opacity 0.2s ease-out';
    }

    // Make videos container visible initially for the wave video
    if (videosContainer) {
        videosContainer.classList.add('show-videos');
    }

    // Function to play wave video
    function playWaveVideo() {
        if (waveVideo && !hasPlayedWave) {
            waveVideo.style.display = 'block';
            waveVideo.style.opacity = '1';
            loopVideo.style.display = 'none';
            
            waveVideo.currentTime = 0;
            waveVideo.play().catch(e => console.log('Wave video play failed:', e));
            
            // Hide container before video ends
            waveVideo.addEventListener('timeupdate', function() {
                // Hide when there's 0.5 seconds left (adjust this value as needed)
                if (waveVideo.duration - waveVideo.currentTime <= 0.4 && !hasPlayedWave) {
                    hasPlayedWave = true;
                    
                    // Remove the show-videos class to return to original CSS behavior
                    videosContainer.classList.remove('show-videos');
                    
                    // Fade out wave video
                    waveVideo.style.opacity = '0';
                    
                    // After fade animation completes, hide the video completely
                    setTimeout(() => {
                        waveVideo.style.display = 'none';
                    }, 400); // Match the transition duration
                    
                    loopVideo.loop = true;
                }
            });
        }
    }

    // Function to play loop video (for hover/click interactions)
    function playLoopVideo() {
        if (loopVideo && hasPlayedWave) {
            waveVideo.style.display = 'none';
            loopVideo.style.display = 'block';
            
            loopVideo.currentTime = 0;
            loopVideo.play().catch(e => console.log('Loop video play failed:', e));
        }
    }

    // Play wave video automatically when page loads
    setTimeout(() => {
        playWaveVideo();
    }, 400);

    // Handle AI chat toggle button interactions
    const aiChatToggle = document.getElementById('ai-chat-toggle');
    if (aiChatToggle) {
        aiChatToggle.addEventListener('mouseenter', function() {
            if (hasPlayedWave) {
                playLoopVideo();
            }
        });

        aiChatToggle.addEventListener('click', function() {
            if (hasPlayedWave) {
                playLoopVideo();
            }
        });
    }
});
