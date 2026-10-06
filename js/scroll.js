/* js/scroll.js - Olai Suvadi (Palm Leaf Manuscript) Open & Close Animations */
(function(window) {
  'use strict';

  const KuralScroll = {
    init() {
      KuralState.onChange((newStep) => {
        if (newStep === 'SCROLL_OPEN') {
          KuralScroll.playOpenAnimation();
        } else if (newStep === 'SCROLL_CLOSE') {
          KuralScroll.playCloseAnimation();
        }
      });
    },

    playOpenAnimation() {
      if (window.KuralAudio) window.KuralAudio.playRustle();

      const scrollEl = document.querySelector('#scroll-open-container .olai-suvadi');
      if (scrollEl) {
        scrollEl.classList.remove('closed');
        scrollEl.classList.add('opening');
      }

      setTimeout(() => {
        if (KuralState.current === 'SCROLL_OPEN') {
          KuralState.next(); // Proceed to KURAL
        }
      }, 1600);
    },

    playCloseAnimation() {
      if (window.KuralAudio) window.KuralAudio.playRustle();

      const scrollEl = document.querySelector('#scroll-close-container .olai-suvadi');
      if (scrollEl) {
        scrollEl.classList.remove('open');
        scrollEl.classList.add('closing');
      }

      setTimeout(() => {
        if (KuralState.current === 'SCROLL_CLOSE') {
          KuralState.next(); // Proceed to MEANING
        }
      }, 1500);
    }
  };

  window.KuralScroll = KuralScroll;
})(window);
