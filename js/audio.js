/* js/audio.js - Web Audio API Sound Effects + Speech Synthesis + Mute Management */
(function(window) {
  'use strict';

  let audioCtx = null;
  let meaningAudioElement = null;
  let isMuted = localStorage.getItem('kural_kalvi_sound_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const KuralAudio = {
    get isMuted() {
      return isMuted;
    },
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('kural_kalvi_sound_muted', isMuted);
      return isMuted;
    },
    initContext() {
      getAudioContext();
    },

    // 1. Chime Sound (Opening / Start)
    playChime() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.01, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.3, now + index * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.85);
      });
    },

    // 2. Scroll Rustle (Olai Suvadi open/close)
    playRustle() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.6; // 0.6 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    },

    // 3. Ding (Correct answer)
    playDing() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3); // A6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    },

    // 4. Buzz (Wrong answer / mistake)
    playBuzz() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    },

    // 5. Win Jingle (Result Screen)
    playWinJingle() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.4 }  // C6
      ];

      let currentTime = now;
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, currentTime);

        gain.gain.setValueAtTime(0.3, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + note.d + 0.05);

        currentTime += note.d * 0.9;
      });
    },

    // Speech Synthesis Helper
    speakText(text, lang, onBoundaryCallback, onEndCallback, onErrorCallback) {
      if (!('speechSynthesis' in window)) {
        if (onEndCallback) onEndCallback();
        return;
      }
      if (isMuted) {
        if (onEndCallback) onEndCallback();
        return;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const targetLang = lang || 'ta-IN';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 0.85;

      const getVoicesList = () => {
        return window.speechSynthesis.getVoices() || [];
      };

      const setVoiceAndSpeak = () => {
        const voices = getVoicesList();
        if (targetLang.startsWith('ta')) {
          const taVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('ta'));
          if (taVoice) utterance.voice = taVoice;
        } else if (targetLang.startsWith('en')) {
          const enVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().startsWith('en')));
          if (enVoice) utterance.voice = enVoice;
        }

        if (onBoundaryCallback) utterance.onboundary = onBoundaryCallback;

        utterance.onstart = () => {
          window._activeSpeechUtterance = utterance;
        };

        utterance.onend = (e) => {
          window._activeSpeechUtterance = null;
          if (onEndCallback) onEndCallback(e);
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis error:', e);
          window._activeSpeechUtterance = null;
          if (onErrorCallback) onErrorCallback(e);
          else if (onEndCallback) onEndCallback(e);
        };

        window._activeSpeechUtterance = utterance; // Prevent garbage collection
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          setVoiceAndSpeak();
        };
        setVoiceAndSpeak();
      } else {
        setVoiceAndSpeak();
      }
    },

    playMeaningAudio(audioSrc, text, lang, onEndCallback, onErrorCallback) {
      if (isMuted) {
        if (onEndCallback) onEndCallback();
        return;
      }

      this.stopMeaningAudio();
      this.stopSpeech();

      let fallbackTriggered = false;

      const triggerFallback = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        this.speakText(text, lang, null, onEndCallback, onErrorCallback);
      };

      try {
        if (!meaningAudioElement) {
          meaningAudioElement = new Audio();
        }
        meaningAudioElement.src = audioSrc;

        const handleEnded = () => {
          meaningAudioElement.removeEventListener('ended', handleEnded);
          meaningAudioElement.removeEventListener('error', handleError);
          if (onEndCallback) onEndCallback();
        };

        const handleError = () => {
          meaningAudioElement.removeEventListener('ended', handleEnded);
          meaningAudioElement.removeEventListener('error', handleError);
          triggerFallback();
        };

        meaningAudioElement.addEventListener('ended', handleEnded);
        meaningAudioElement.addEventListener('error', handleError);

        const playPromise = meaningAudioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            handleError();
          });
        }
      } catch (e) {
        triggerFallback();
      }
    },

    stopMeaningAudio() {
      if (meaningAudioElement) {
        meaningAudioElement.pause();
        meaningAudioElement.currentTime = 0;
      }
    },

    isMeaningPlaying() {
      return (meaningAudioElement && !meaningAudioElement.paused && !meaningAudioElement.ended) || this.isSpeaking();
    },

    stopSpeech() {
      this.stopMeaningAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window._activeSpeechUtterance = null;
      }
    },

    isSpeaking() {
      return 'speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
    }
  };

  window.KuralAudio = KuralAudio;
})(window);
