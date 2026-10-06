/* js/result.js - Score Calculation, Trophy Render, HTML5 Canvas Confetti & Score Persistence */
(function(window) {
  'use strict';

  let confettiCanvas = null;
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimId = null;

  const KuralResult = {
    init() {
      KuralState.onChange((newStep) => {
        if (newStep === 'RESULT') {
          KuralResult.setupResultScreen();
        } else {
          KuralResult.stopConfetti();
        }
      });
    },

    calculateStars() {
      const lives = window.KuralGame ? window.KuralGame.lives : 3;
      const hints = window.KuralGame ? window.KuralGame.hintsUsed : 0;

      if (lives === 3 && hints === 0) {
        return 3;
      } else if (lives >= 2) {
        return 2;
      } else {
        return 1;
      }
    },

    setupResultScreen() {
      const starsCount = this.calculateStars();

      // Save Best Score in LocalStorage
      const prevBest = parseInt(localStorage.getItem('kural_kalvi_best_stars') || '0', 10);
      if (starsCount > prevBest) {
        localStorage.setItem('kural_kalvi_best_stars', starsCount.toString());
      }

      // Play Win Jingle sound
      if (window.KuralAudio) {
        window.KuralAudio.playWinJingle();
      }

      // Render Stars
      const starsContainer = document.getElementById('result-stars-container');
      if (starsContainer) {
        let starsHtml = '';
        for (let i = 1; i <= 3; i++) {
          if (i <= starsCount) {
            starsHtml += `<span class="star-icon filled" style="animation-delay: ${i * 0.2}s">⭐</span>`;
          } else {
            starsHtml += `<span class="star-icon empty">☆</span>`;
          }
        }
        starsContainer.innerHTML = starsHtml;
      }

      // Render Trophy
      const trophyContainer = document.getElementById('result-trophy-container');
      if (trophyContainer) {
        trophyContainer.innerHTML = this.getTrophySvg(starsCount);
      }

      // Render Encouraging Message
      const msgTitle = document.getElementById('result-message-title');
      const msgSub = document.getElementById('result-message-sub');

      if (starsCount === 3) {
        if (msgTitle) msgTitle.textContent = "மிகச் சிறப்பு! / Outstanding!";
        if (msgSub) msgSub.textContent = "நீங்கள் திருக்குறளை மிகத் துல்லியமாகக் கற்றுக்கொண்டீர்கள்!";
      } else if (starsCount === 2) {
        if (msgTitle) msgTitle.textContent = "அற்புதமான முயற்சி! / Great Job!";
        if (msgSub) msgSub.textContent = "சிறப்பாகச் செய்தீர்கள்! இன்னும் பயிற்சி செய்யுங்கள்!";
      } else {
        if (msgTitle) msgTitle.textContent = "நல்ல முயற்சி! / Good Try!";
        if (msgSub) msgSub.textContent = "தொடர்ந்து முயலுங்கள், வெற்றி பெறலாம்!";
      }

      // Launch Confetti for 2 or 3 stars
      if (starsCount >= 2) {
        this.startConfetti();
      }
    },

    getTrophySvg(stars) {
      let color = "#D4A017"; // Gold
      let label = "Gold";
      if (stars === 2) {
        color = "#C0C0C0"; // Silver
        label = "Silver";
      } else if (stars === 1) {
        color = "#CD7F32"; // Bronze
        label = "Bronze";
      }

      return `
        <svg class="trophy-svg pop-in" viewBox="0 0 100 100" width="120" height="120" role="img" aria-label="${label} Trophy">
          <path d="M30,20 L70,20 L65,55 C65,65 55,75 50,75 C45,75 35,65 35,55 Z" fill="${color}" stroke="#6B1E1E" stroke-width="3"/>
          <path d="M20,25 C15,25 15,45 30,45" fill="none" stroke="${color}" stroke-width="4"/>
          <path d="M80,25 C85,25 85,45 70,45" fill="none" stroke="${color}" stroke-width="4"/>
          <rect x="44" y="75" width="12" height="12" fill="${color}"/>
          <rect x="30" y="87" width="40" height="10" rx="3" fill="#6B1E1E"/>
          <polygon points="50,28 53,36 62,36 55,41 57,49 50,44 43,49 45,41 38,36 47,36" fill="#FFF"/>
        </svg>
      `;
    },

    startConfetti() {
      confettiCanvas = document.getElementById('confetti-canvas');
      if (!confettiCanvas) return;

      confettiCtx = confettiCanvas.getContext('2d');
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;

      confettiParticles = [];
      const colors = ['#D4A017', '#6B1E1E', '#E5A93C', '#FFF4D6', '#4CAF50', '#2196F3', '#E91E63'];

      for (let i = 0; i < 80; i++) {
        confettiParticles.push({
          x: Math.random() * confettiCanvas.width,
          y: Math.random() * confettiCanvas.height - confettiCanvas.height,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: Math.random() * 3 + 2,
          speedX: Math.random() * 2 - 1,
          rot: Math.random() * 360,
          rotSpeed: Math.random() * 6 - 3
        });
      }

      const loop = () => {
        if (!confettiCtx) return;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiParticles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rot += p.rotSpeed;

          if (p.y > confettiCanvas.height) {
            p.y = -10;
            p.x = Math.random() * confettiCanvas.width;
          }

          confettiCtx.save();
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rot * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          confettiCtx.restore();
        });

        confettiAnimId = requestAnimationFrame(loop);
      };

      loop();
    },

    stopConfetti() {
      if (confettiAnimId) {
        cancelAnimationFrame(confettiAnimId);
        confettiAnimId = null;
      }
      if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
  };

  window.KuralResult = KuralResult;
})(window);
