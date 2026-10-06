/* js/video.js - YouTube Player Integration & Fallback Animated Scene */
(function(window) {
  'use strict';

  let player = null;
  let isApiLoaded = false;
  let skipTimer = null;
  let fallbackTimer = null;

  function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const KuralVideo = {
    init() {
      // Listen for YT API ready callback if script loaded
      window.onYouTubeIframeAPIReady = () => {
        isApiLoaded = true;
        if (KuralState.current === 'VIDEO') {
          KuralVideo.createPlayer();
        }
      };

      // Load YouTube script dynamically
      this.loadYouTubeScript();

      // Listen for step transitions
      KuralState.onChange((newStep) => {
        if (newStep === 'VIDEO') {
          KuralVideo.setupScreen();
        } else {
          KuralVideo.cleanupPlayer();
        }
      });
    },

    loadYouTubeScript() {
      if (window.YT && window.YT.Player) {
        isApiLoaded = true;
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        isApiLoaded = false;
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    },

    setupScreen() {
      const skipBtn = document.getElementById('video-skip-btn');
      const nextBtn = document.getElementById('video-next-btn');
      const fallbackContainer = document.getElementById('video-fallback-scene');
      const playerContainer = document.getElementById('youtube-player-container');

      if (skipBtn) skipBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (fallbackContainer) fallbackContainer.style.display = 'none';
      if (playerContainer) playerContainer.style.display = 'block';

      // Start 5 second timer to show Skip button
      clearTimeout(skipTimer);
      skipTimer = setTimeout(() => {
        if (skipBtn) skipBtn.style.display = 'inline-block';
      }, 5000);

      const videoId = getYouTubeId(KURAL.video);
      if (!videoId) {
        this.showFallback();
        return;
      }

      if (isApiLoaded && window.YT && window.YT.Player) {
        this.createPlayer(videoId);
      } else {
        // Retry shortly or show fallback if API fails after timeout
        let retries = 0;
        const checkApi = setInterval(() => {
          retries++;
          if (window.YT && window.YT.Player) {
            clearInterval(checkApi);
            KuralVideo.createPlayer(videoId);
          } else if (retries > 10) {
            clearInterval(checkApi);
            KuralVideo.showFallback();
          }
        }, 300);
      }
    },

    createPlayer(videoId) {
      const vId = videoId || getYouTubeId(KURAL.video);
      if (!vId) {
        this.showFallback();
        return;
      }

      try {
        if (player) {
          player.destroy();
          player = null;
        }

        player = new window.YT.Player('youtube-player-element', {
          host: 'https://www.youtube-nocookie.com',
          videoId: vId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            cc_load_policy: 1,
            autoplay: 0
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                const nextBtn = document.getElementById('video-next-btn');
                if (nextBtn) nextBtn.style.display = 'inline-block';
              }
            },
            onError: () => {
              KuralVideo.showFallback();
            }
          }
        });
      } catch (err) {
        this.showFallback();
      }
    },

    showFallback() {
      const playerContainer = document.getElementById('youtube-player-container');
      const fallbackContainer = document.getElementById('video-fallback-scene');
      const nextBtn = document.getElementById('video-next-btn');
      const skipBtn = document.getElementById('video-skip-btn');

      if (playerContainer) playerContainer.style.display = 'none';
      if (fallbackContainer) fallbackContainer.style.display = 'block';
      if (skipBtn) skipBtn.style.display = 'inline-block';
      if (nextBtn) nextBtn.style.display = 'inline-block';

      // Animated progress bar in fallback
      const progressBar = document.getElementById('fallback-progress-fill');
      if (progressBar) {
        progressBar.style.width = '0%';
        let pct = 0;
        clearInterval(fallbackTimer);
        fallbackTimer = setInterval(() => {
          pct += 3.33; // ~30 sec full fill
          if (pct >= 100) {
            pct = 100;
            clearInterval(fallbackTimer);
          }
          progressBar.style.width = pct + '%';
        }, 1000);
      }
    },

    cleanupPlayer() {
      clearTimeout(skipTimer);
      clearInterval(fallbackTimer);
      if (player && typeof player.stopVideo === 'function') {
        try {
          player.stopVideo();
        } catch (e) {}
      }
    }
  };

  window.KuralVideo = KuralVideo;
})(window);
