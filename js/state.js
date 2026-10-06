/* js/state.js - Step State Machine */
(function(window) {
  'use strict';

  const STEPS = [
    'OPENING',
    'SCROLL_OPEN',
    'KURAL',
    'TEACHER',
    'SCROLL_CLOSE',
    'MEANING',
    'VIDEO',
    'GAME_INTRO',
    'GAME',
    'RESULT'
  ];

  let currentIndex = 0;
  const listeners = [];

  const KuralState = {
    STEPS,
    get current() {
      return STEPS[currentIndex];
    },
    get index() {
      return currentIndex;
    },
    get total() {
      return STEPS.length;
    },
    onChange(fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },
    goTo(target) {
      let nextIndex = -1;
      if (typeof target === 'number') {
        if (target >= 0 && target < STEPS.length) nextIndex = target;
      } else if (typeof target === 'string') {
        nextIndex = STEPS.indexOf(target);
      }

      if (nextIndex === -1 || nextIndex === currentIndex) return;

      const prevStep = STEPS[currentIndex];
      currentIndex = nextIndex;
      const newStep = STEPS[currentIndex];

      // Update Screen Visibility in DOM
      const screens = document.querySelectorAll('.screen');
      screens.forEach((screen) => {
        const stepAttr = screen.getAttribute('data-step');
        if (stepAttr === newStep) {
          screen.classList.add('active');
          screen.removeAttribute('aria-hidden');
          screen.removeAttribute('inert');
        } else {
          screen.classList.remove('active');
          screen.setAttribute('aria-hidden', 'true');
          screen.setAttribute('inert', '');
        }
      });

      // Update Top Bar Progress Dots
      const dots = document.querySelectorAll('.progress-dot');
      dots.forEach((dot, idx) => {
        if (idx <= currentIndex) {
          dot.classList.add('completed');
        } else {
          dot.classList.remove('completed');
        }
        if (idx === currentIndex) {
          dot.classList.add('current');
          dot.setAttribute('aria-current', 'step');
        } else {
          dot.classList.remove('current');
          dot.removeAttribute('aria-current');
        }
      });

      // Scroll to top of window for mobile cleanliness
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Notify listeners
      listeners.forEach(fn => fn(newStep, prevStep, currentIndex));
    },
    next() {
      if (currentIndex < STEPS.length - 1) {
        this.goTo(currentIndex + 1);
      }
    },
    prev() {
      if (currentIndex > 0) {
        this.goTo(currentIndex - 1);
      }
    },
    reset() {
      this.goTo(0);
    }
  };

  window.KuralState = KuralState;
})(window);
