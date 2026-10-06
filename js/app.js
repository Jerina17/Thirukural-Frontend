/* js/app.js - Application Initialization & Event Wiring */
(function(window) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Sub-modules
    if (window.KuralScroll) window.KuralScroll.init();
    if (window.KuralTeacher) window.KuralTeacher.init();
    if (window.KuralVideo) window.KuralVideo.init();
    if (window.KuralGame) window.KuralGame.init();
    if (window.KuralResult) window.KuralResult.init();

    // 2. Setup Top Bar Navigation Controls
    const homeBtn = document.getElementById('top-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (window.KuralAudio) window.KuralAudio.initContext();
        KuralState.goTo('OPENING');
      });
    }

    const restartBtn = document.getElementById('top-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (window.KuralAudio) window.KuralAudio.initContext();
        KuralState.goTo('OPENING');
      });
    }

    // 3. Setup Sound Toggle Button & Persistent Sound State
    const soundBtn = document.getElementById('top-sound-btn');
    const updateSoundIcon = () => {
      if (!soundBtn || !window.KuralAudio) return;
      const isMuted = window.KuralAudio.isMuted;
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
      soundBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    };
    updateSoundIcon();

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.KuralAudio) {
          window.KuralAudio.toggleMute();
          updateSoundIcon();
        }
      });
    }

    // 4. Setup Screen 1: Opening Start Button
    const startBtn = document.getElementById('opening-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (window.KuralAudio) {
          window.KuralAudio.initContext();
          window.KuralAudio.playChime();
        }
        KuralState.next(); // Go to SCROLL_OPEN
      });
    }

    // 5. Setup Screen 3: Thirukkural Appears Next Button
    const kuralNextBtn = document.getElementById('kural-next-btn');
    if (kuralNextBtn) {
      kuralNextBtn.addEventListener('click', () => {
        KuralState.next(); // Go to TEACHER
      });
    }

    // 6. Setup Screen 4: Teacher Read-Aloud Controls
    const teacherPlayBtn = document.getElementById('teacher-play-btn');
    if (teacherPlayBtn) {
      teacherPlayBtn.addEventListener('click', () => {
        if (window.KuralTeacher) window.KuralTeacher.togglePlay();
      });
    }

    const teacherReplayBtn = document.getElementById('teacher-replay-btn');
    if (teacherReplayBtn) {
      teacherReplayBtn.addEventListener('click', () => {
        if (window.KuralTeacher) window.KuralTeacher.replay();
      });
    }

    const teacherSpeedBtn = document.getElementById('teacher-speed-btn');
    if (teacherSpeedBtn) {
      teacherSpeedBtn.addEventListener('click', () => {
        if (window.KuralTeacher) window.KuralTeacher.toggleSpeed();
      });
    }

    const teacherNextBtn = document.getElementById('teacher-next-btn');
    if (teacherNextBtn) {
      teacherNextBtn.addEventListener('click', () => {
        if (window.KuralTeacher) window.KuralTeacher.pause();
        KuralState.next(); // Go to SCROLL_CLOSE
      });
    }

    // 7. Setup Screen 6: Porul / Meaning Controls
    const meaningLangBtn = document.getElementById('meaning-lang-btn');
    const meaningAudioBtn = document.getElementById('meaning-audio-btn');
    const meaningTa = document.getElementById('meaning-text-ta');
    const meaningEn = document.getElementById('meaning-text-en');
    let showingEn = false;

    const resetMeaningAudioBtn = () => {
      if (meaningAudioBtn) {
        meaningAudioBtn.textContent = '🔊 Listen / கேட்க';
      }
    };

    if (window.KuralState) {
      KuralState.onChange(() => {
        if (window.KuralAudio) window.KuralAudio.stopSpeech();
        resetMeaningAudioBtn();
      });
    }

    if (meaningLangBtn && meaningTa && meaningEn) {
      meaningLangBtn.addEventListener('click', () => {
        if (window.KuralAudio) window.KuralAudio.stopSpeech();
        resetMeaningAudioBtn();
        showingEn = !showingEn;
        if (showingEn) {
          meaningTa.style.display = 'none';
          meaningEn.style.display = 'block';
          meaningLangBtn.textContent = 'தமிழ் / Tamil';
        } else {
          meaningTa.style.display = 'block';
          meaningEn.style.display = 'none';
          meaningLangBtn.textContent = 'English / ஆங்கிலம்';
        }
      });
    }

    if (meaningAudioBtn) {
      meaningAudioBtn.addEventListener('click', () => {
        if (!window.KuralAudio) return;

        if (window.KuralAudio.isMeaningPlaying()) {
          window.KuralAudio.stopMeaningAudio();
          window.KuralAudio.stopSpeech();
          resetMeaningAudioBtn();
          return;
        }

        const audioSrc = showingEn ? KURAL.meaningAudio.en : KURAL.meaningAudio.ta;
        const textToSpeak = showingEn ? KURAL.meaning.en : KURAL.meaning.ta;
        const targetLang = showingEn ? 'en-IN' : 'ta-IN';

        meaningAudioBtn.textContent = '⏹ Stop / நிறுத்து';

        window.KuralAudio.playMeaningAudio(
          audioSrc,
          textToSpeak,
          targetLang,
          () => {
            resetMeaningAudioBtn();
          },
          () => {
            resetMeaningAudioBtn();
            if (!showingEn) {
              let msgEl = document.getElementById('ta-voice-warning');
              if (!msgEl) {
                msgEl = document.createElement('div');
                msgEl.id = 'ta-voice-warning';
                msgEl.style.cssText = 'color: #6B1E1E; font-size: 0.9rem; margin-top: 0.5rem; font-weight: bold; width: 100%; text-align: center;';
                meaningAudioBtn.parentNode.appendChild(msgEl);
              }
              msgEl.textContent = 'Tamil voice not available on this device / இந்த சாதனத்தில் தமிழ் குரல் இல்லை';
              setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 4000);
            }
          }
        );
      });
    }

    const meaningNextBtn = document.getElementById('meaning-next-btn');
    if (meaningNextBtn) {
      meaningNextBtn.addEventListener('click', () => {
        if (window.KuralAudio) window.KuralAudio.stopSpeech();
        resetMeaningAudioBtn();
        KuralState.next(); // Go to VIDEO
      });
    }

    // 8. Setup Screen 7: Video Controls
    const videoSkipBtn = document.getElementById('video-skip-btn');
    if (videoSkipBtn) {
      videoSkipBtn.addEventListener('click', () => {
        KuralState.next(); // Go to GAME_INTRO
      });
    }

    const videoNextBtn = document.getElementById('video-next-btn');
    if (videoNextBtn) {
      videoNextBtn.addEventListener('click', () => {
        KuralState.next(); // Go to GAME_INTRO
      });
    }

    // 9. Setup Screen 8: Game Intro Play Button
    const gameIntroPlayBtn = document.getElementById('game-intro-play-btn');
    if (gameIntroPlayBtn) {
      gameIntroPlayBtn.addEventListener('click', () => {
        KuralState.next(); // Go to GAME
      });
    }

    // 10. Setup Screen 9: Game Controls
    const gameHintBtn = document.getElementById('game-hint-btn');
    if (gameHintBtn) {
      gameHintBtn.addEventListener('click', () => {
        if (window.KuralGame) window.KuralGame.useHint();
      });
    }

    const gameNextBtn = document.getElementById('game-next-btn');
    if (gameNextBtn) {
      gameNextBtn.addEventListener('click', () => {
        KuralState.next(); // Go to RESULT
      });
    }

    // 11. Setup Screen 10: Result Controls
    const resultRestartBtn = document.getElementById('result-restart-btn');
    if (resultRestartBtn) {
      resultRestartBtn.addEventListener('click', () => {
        KuralState.goTo('OPENING');
      });
    }

    const resultHomeBtn = document.getElementById('result-home-btn');
    if (resultHomeBtn) {
      resultHomeBtn.addEventListener('click', () => {
        KuralState.goTo('OPENING');
      });
    }

    // Initial render state
    const currentStep = KuralState.current;
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.getAttribute('data-step') === currentStep) {
        screen.classList.add('active');
        screen.removeAttribute('aria-hidden');
        screen.removeAttribute('inert');
      } else {
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
        screen.setAttribute('inert', '');
      }
    });
  });
})(window);
