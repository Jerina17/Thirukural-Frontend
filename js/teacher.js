/* js/teacher.js - Teacher Read-Aloud & Karaoke Synchronization */
(function(window) {
  'use strict';

  let audioElement = null;
  let isAudioAvailable = false;
  let isPlaying = false;
  let hasFinishedOnce = false;
  let animFrameId = null;
  let currentPlaybackRate = 1.0;

  const KuralTeacher = {
    init() {
      // Create audio element for local file fallback test
      audioElement = new Audio(KURAL.audio);

      audioElement.addEventListener('canplaythrough', () => {
        isAudioAvailable = true;
      });

      audioElement.addEventListener('ended', () => {
        KuralTeacher.onPlaybackEnded();
      });

      audioElement.addEventListener('error', () => {
        isAudioAvailable = false;
      });

      // Listen for step transitions
      KuralState.onChange((newStep) => {
        if (newStep === 'TEACHER') {
          KuralTeacher.setupScreen();
        } else {
          KuralTeacher.pause();
        }
      });
    },

    setupScreen() {
      const container = document.getElementById('teacher-words-container');
      if (!container) return;

      // Render words into lines with spans
      let html = '<div class="kural-line">';
      KURAL.words.forEach((word, index) => {
        if (index === 4) {
          html += '</div><div class="kural-line">';
        }
        html += `<span class="karaoke-word" data-index="${index}">${word.text}</span> `;
      });
      html += '</div>';
      container.innerHTML = html;

      // Reset controls
      const playBtn = document.getElementById('teacher-play-btn');
      if (playBtn) playBtn.innerHTML = '▶ Read / படிக்க';

      const nextBtn = document.getElementById('teacher-next-btn');
      if (nextBtn) {
        nextBtn.disabled = !hasFinishedOnce;
      }

      const speedBtn = document.getElementById('teacher-speed-btn');
      if (speedBtn) speedBtn.textContent = '1x';
      currentPlaybackRate = 1.0;
      if (audioElement) audioElement.playbackRate = 1.0;
    },

    togglePlay() {
      if (isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    play() {
      if (isPlaying) return;
      isPlaying = true;

      const playBtn = document.getElementById('teacher-play-btn');
      if (playBtn) playBtn.innerHTML = '⏸ Pause / இடைநிறுத்து';

      const teacherMascot = document.getElementById('teacher-mascot');
      if (teacherMascot) teacherMascot.classList.add('is-talking');

      if (isAudioAvailable && audioElement) {
        audioElement.playbackRate = currentPlaybackRate;
        audioElement.play().catch(() => {
          // If browser blocks audio, fall back to speech synth
          this.playSpeechSynthFallback();
        });
        this.startKaraokeLoop();
      } else {
        // Fallback to speech synth
        this.playSpeechSynthFallback();
      }
    },

    pause() {
      isPlaying = false;
      if (audioElement) audioElement.pause();
      if (window.KuralAudio) window.KuralAudio.stopSpeech();
      if (animFrameId) cancelAnimationFrame(animFrameId);

      const playBtn = document.getElementById('teacher-play-btn');
      if (playBtn) playBtn.innerHTML = '▶ Read / படிக்க';

      const teacherMascot = document.getElementById('teacher-mascot');
      if (teacherMascot) teacherMascot.classList.remove('is-talking');
    },

    replay() {
      this.pause();
      if (audioElement) audioElement.currentTime = 0;
      this.clearHighlights();
      this.play();
    },

    toggleSpeed() {
      if (currentPlaybackRate === 1.0) {
        currentPlaybackRate = 0.75;
      } else {
        currentPlaybackRate = 1.0;
      }

      if (audioElement) audioElement.playbackRate = currentPlaybackRate;
      const speedBtn = document.getElementById('teacher-speed-btn');
      if (speedBtn) speedBtn.textContent = `${currentPlaybackRate}x`;
    },

    playSpeechSynthFallback() {
      const fullText = KURAL.lines.join(' ');
      let currentWordIndex = 0;
      const wordsCount = KURAL.words.length;
      const stepDuration = 800 / currentPlaybackRate;

      this.highlightWord(0);

      const intervalId = setInterval(() => {
        if (!isPlaying) {
          clearInterval(intervalId);
          return;
        }
        currentWordIndex++;
        if (currentWordIndex < wordsCount) {
          this.highlightWord(currentWordIndex);
        } else {
          clearInterval(intervalId);
          this.onPlaybackEnded();
        }
      }, stepDuration);

      if (window.KuralAudio) {
        window.KuralAudio.speakText(fullText, null, () => {
          // end callback
        });
      }
    },

    startKaraokeLoop() {
      const update = () => {
        if (!isPlaying || !audioElement) return;

        const currentTime = audioElement.currentTime;
        let activeIdx = -1;

        KURAL.words.forEach((w, idx) => {
          if (currentTime >= w.start && currentTime <= w.end) {
            activeIdx = idx;
          }
        });

        if (activeIdx !== -1) {
          this.highlightWord(activeIdx);
        }

        animFrameId = requestAnimationFrame(update);
      };
      animFrameId = requestAnimationFrame(update);
    },

    highlightWord(index) {
      const words = document.querySelectorAll('.karaoke-word');
      words.forEach((w, idx) => {
        if (idx === index) {
          w.classList.add('active');
        } else {
          w.classList.remove('active');
        }
      });
    },

    clearHighlights() {
      const words = document.querySelectorAll('.karaoke-word');
      words.forEach(w => w.classList.remove('active'));
    },

    onPlaybackEnded() {
      isPlaying = false;
      hasFinishedOnce = true;
      this.clearHighlights();

      const playBtn = document.getElementById('teacher-play-btn');
      if (playBtn) playBtn.innerHTML = '▶ Read / படிக்க';

      const teacherMascot = document.getElementById('teacher-mascot');
      if (teacherMascot) teacherMascot.classList.remove('is-talking');

      const nextBtn = document.getElementById('teacher-next-btn');
      if (nextBtn) nextBtn.disabled = false;
    }
  };

  window.KuralTeacher = KuralTeacher;
})(window);
