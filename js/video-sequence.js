document.addEventListener('DOMContentLoaded', function() {
    const waveVideo = document.querySelector('.wave');
    const loopVideo = document.querySelector('.loop');
    const videosContainer = document.querySelector('.videos-container');
    let hasPlayedWave = false;

    // Add CSS transition for fade effect on wave video
    if (waveVideo) {
        waveVideo.style.transition = 'opacity 0.2s ease-out';
    }

    // Add CSS transition for scale effect on loop video
    if (loopVideo) {
        loopVideo.style.transition = 'transform 0.3s ease-out';
        loopVideo.style.transformOrigin = 'center';
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
                    
                    // After fade animation completes, show loop video
                    setTimeout(() => {
                        waveVideo.style.display = 'none';
                        // Show loop video and start playing it
                        showLoopVideo();
                    }, 400); // Match the transition duration
                }
            });
        }
    }

    // Function to show and play loop video
    function showLoopVideo() {
        if (loopVideo && hasPlayedWave) {
            loopVideo.style.display = 'block';
            loopVideo.loop = true;
            loopVideo.currentTime = 0;
            loopVideo.play().catch(e => console.log('Loop video play failed:', e));
        }
    }

    // Function to scale up loop video
    function scaleUpLoopVideo() {
        if (loopVideo && hasPlayedWave) {
            loopVideo.style.transform = 'scale(1.1)';
        }
    }

    // Function to scale down loop video
    function scaleDownLoopVideo() {
        if (loopVideo && hasPlayedWave) {
            loopVideo.style.transform = 'scale(1)';
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
            scaleUpLoopVideo();
        });

        aiChatToggle.addEventListener('mouseleave', function() {
            scaleDownLoopVideo();
        });

        aiChatToggle.addEventListener('click', function() {
            scaleUpLoopVideo();
            // Scale back down after a short delay
            setTimeout(() => {
                scaleDownLoopVideo();
            }, 200);
        });
    }
});
