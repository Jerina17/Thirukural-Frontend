/* js/game.js - Complete the Thirukkural Fill-in-the-Blank Game */
(function(window) {
  'use strict';

  let lives = 3;
  let hintsUsed = 0;
  let selectedChip = null; // For tap-to-select mode
  let placedSlots = {}; // slotIndex -> wordText
  let shuffledBank = [];

  const KuralGame = {
    get lives() { return lives; },
    get hintsUsed() { return hintsUsed; },

    init() {
      KuralState.onChange((newStep) => {
        if (newStep === 'GAME') {
          KuralGame.setupGame();
        }
      });
    },

    setupGame() {
      lives = 3;
      hintsUsed = 0;
      selectedChip = null;
      placedSlots = {};

      this.updateHearts();
      this.renderSlots();
      this.renderBank();

      const nextBtn = document.getElementById('game-next-btn');
      if (nextBtn) {
        nextBtn.style.display = 'none';
        nextBtn.disabled = true;
      }
    },

    updateHearts() {
      const heartsContainer = document.getElementById('game-hearts');
      if (!heartsContainer) return;
      let html = '';
      for (let i = 0; i < 3; i++) {
        if (i < lives) {
          html += '<span class="heart full" aria-label="Life active">❤️</span>';
        } else {
          html += '<span class="heart empty" aria-label="Life lost">🖤</span>';
        }
      }
      heartsContainer.innerHTML = html;
    },

    renderSlots() {
      const container = document.getElementById('game-sentence-container');
      if (!container) return;

      const blankIndexes = KURAL.game.blankIndexes;
      let html = '<div class="kural-line">';

      KURAL.words.forEach((wObj, idx) => {
        if (idx === 4) {
          html += '</div><div class="kural-line">';
        }

        if (blankIndexes.includes(idx)) {
          html += `<div class="game-slot" data-slot-index="${idx}" tabindex="0" role="button" aria-label="Empty slot for missing word">
                    <span class="slot-placeholder">?</span>
                    <span class="slot-hint" id="hint-slot-${idx}"></span>
                   </div> `;
        } else {
          html += `<span class="given-word">${wObj.text}</span> `;
        }
      });

      html += '</div>';
      container.innerHTML = html;

      // Add Drop & Tap handlers to slots
      const slots = container.querySelectorAll('.game-slot');
      slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => this.onSlotDrop(e, slot));
        slot.addEventListener('click', () => this.onSlotClick(slot));
        slot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.onSlotClick(slot);
          }
        });
      });
    },

    renderBank() {
      const bankContainer = document.getElementById('game-word-bank');
      if (!bankContainer) return;

      const correctWords = KURAL.game.blankIndexes.map(idx => KURAL.words[idx].text);
      const allOptions = [...correctWords, ...KURAL.game.distractors];

      // Shuffle options deterministically for playfulness
      shuffledBank = allOptions.sort(() => Math.random() - 0.5);

      bankContainer.innerHTML = '';
      shuffledBank.forEach((word, bIdx) => {
        const chip = document.createElement('div');
        chip.className = 'word-chip';
        chip.setAttribute('draggable', 'true');
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('role', 'button');
        chip.setAttribute('data-word', word);
        chip.setAttribute('data-bank-id', `bank-${bIdx}`);
        chip.textContent = word;

        chip.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', word);
          e.dataTransfer.setData('bank-id', `bank-${bIdx}`);
        });

        chip.addEventListener('click', () => this.onChipClick(chip));
        chip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.onChipClick(chip);
          }
        });

        bankContainer.appendChild(chip);
      });
    },

    onChipClick(chip) {
      if (chip.classList.contains('placed') || chip.classList.contains('disabled')) return;

      // Deselect existing selected chip
      document.querySelectorAll('.word-chip').forEach(c => c.classList.remove('selected'));

      if (selectedChip === chip) {
        selectedChip = null;
      } else {
        selectedChip = chip;
        chip.classList.add('selected');
      }
    },

    onSlotClick(slot) {
      if (selectedChip) {
        const word = selectedChip.getAttribute('data-word');
        this.verifyPlacement(slot, word, selectedChip);
        selectedChip.classList.remove('selected');
        selectedChip = null;
      } else if (slot.classList.contains('correct')) {
        // Already solved
        return;
      }
    },

    onSlotDrop(e, slot) {
      e.preventDefault();
      const word = e.dataTransfer.getData('text/plain');
      const bankId = e.dataTransfer.getData('bank-id');
      const chip = document.querySelector(`[data-bank-id="${bankId}"]`);
      if (chip) {
        this.verifyPlacement(slot, word, chip);
      }
    },

    verifyPlacement(slot, word, chip) {
      const slotIdx = parseInt(slot.getAttribute('data-slot-index'), 10);
      const expectedWord = KURAL.words[slotIdx].text;

      if (word === expectedWord) {
        // Correct!
        if (window.KuralAudio) window.KuralAudio.playDing();

        slot.classList.remove('wrong-shake');
        slot.classList.add('correct');
        slot.innerHTML = `<span class="placed-word">${word}</span>`;

        chip.classList.add('placed');
        chip.setAttribute('aria-disabled', 'true');
        placedSlots[slotIdx] = word;

        this.checkGameCompletion();
      } else {
        // Wrong!
        if (window.KuralAudio) window.KuralAudio.playBuzz();

        slot.classList.add('wrong-shake');
        setTimeout(() => slot.classList.remove('wrong-shake'), 600);

        lives = Math.max(0, lives - 1);
        this.updateHearts();

        if (lives === 0) {
          // Auto reveal correct or allow finish
          setTimeout(() => {
            this.revealAllAndFinish();
          }, 600);
        }
      }
    },

    useHint() {
      const blankIndexes = KURAL.game.blankIndexes;
      const unsolvedSlotIdx = blankIndexes.find(idx => !placedSlots[idx]);

      if (unsolvedSlotIdx !== undefined) {
        hintsUsed++;
        const expectedWord = KURAL.words[unsolvedSlotIdx].text;
        const firstChar = expectedWord.charAt(0);

        const hintSpan = document.getElementById(`hint-slot-${unsolvedSlotIdx}`);
        if (hintSpan) {
          hintSpan.textContent = `(${firstChar}...)`;
        }

        const hintBtn = document.getElementById('game-hint-btn');
        if (hintBtn && hintsUsed >= blankIndexes.length) {
          hintBtn.disabled = true;
        }
      }
    },

    checkGameCompletion() {
      const blankIndexes = KURAL.game.blankIndexes;
      const solvedCount = Object.keys(placedSlots).length;

      if (solvedCount === blankIndexes.length) {
        const nextBtn = document.getElementById('game-next-btn');
        if (nextBtn) {
          nextBtn.style.display = 'inline-block';
          nextBtn.disabled = false;
        }
      }
    },

    revealAllAndFinish() {
      const blankIndexes = KURAL.game.blankIndexes;
      blankIndexes.forEach(idx => {
        const slot = document.querySelector(`.game-slot[data-slot-index="${idx}"]`);
        const expectedWord = KURAL.words[idx].text;
        if (slot) {
          slot.classList.add('correct');
          slot.innerHTML = `<span class="placed-word">${expectedWord}</span>`;
        }
      });

      const nextBtn = document.getElementById('game-next-btn');
      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = false;
      }
    }
  };

  window.KuralGame = KuralGame;
})(window);
