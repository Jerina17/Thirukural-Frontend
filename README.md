# குறள் கல்வி | Kural Kalvi

**Kural Kalvi (குறள் கல்வி)** is a child-friendly, interactive Thirukkural learning web application designed for school students using **Plain HTML, CSS, and Vanilla JavaScript**.

---

## 🌟 Key Features

1. **10-Step Interactive Learning Flow**:
   - `OPENING`: Traditional Tamil maroon & gold theme with kolam borders, title, floating lotus/diya CSS particles, and audio unlock chime.
   - `SCROLL_OPEN`: SVG Palm-leaf manuscript (Olai Suvadi) opening animation with Web Audio rustle sound.
   - `KURAL`: Staggered Tamil word-by-word reveal of Kural 391.
   - `TEACHER`: Interactive teacher mascot with animated mouth/head bob, audio playback, fallback Tamil Speech Synthesis (`ta-IN`), and live karaoke word highlighting.
   - `SCROLL_CLOSE`: Olai Suvadi closing animation.
   - `MEANING`: Dual Tamil/English meaning card with gold-highlighted key terms and speech synthesis read-aloud.
   - `VIDEO`: Embedded YouTube video explanation with custom player controls, auto-enable Next button, 5-second Skip button, and an offline animated fallback scene.
   - `GAME_INTRO`: Animated mascot introduction for the fill-in-the-blank game.
   - `GAME`: Interactive drag-and-drop & touch-friendly chip placement game with 3 heart lives, hint system, ding/buzz sound effects, and error shake animation.
   - `RESULT`: Stars reward system, gold/silver/bronze trophy pop-in, custom HTML5 canvas confetti, encouraging Tamil microcopy, and score persistence (`localStorage`).

2. **Strict Technology Adherence**:
   - Zero framework dependencies (No React, Vue, Tailwind, TypeScript, or build step).
   - Clean, modular vanilla JavaScript scripts included without ES modules for maximum local compatibility.
   - Web Audio API synthesizers for chime, rustle, ding, buzz, and win jingles.
   - 60fps hardware-accelerated CSS animations (`transform` and `opacity` only).
   - Accessibility features (`aria-hidden`, `inert`, `prefers-reduced-motion`, visible focus states, AA contrast).

---

## 🚀 How to Run

### Method 1: VS Code Live Server (Recommended)
1. Open the project folder in VS Code.
2. Install the **Live Server** extension if not already installed.
3. Right-click `index.html` and choose **"Open with Live Server"** (or open `http://127.0.0.1:5500`).
> **Note**: A local HTTP server is required for the YouTube IFrame API to embed and function correctly without browser security/CORS restrictions.

### Method 2: Python Simple HTTP Server
Open PowerShell / Terminal in the project root directory and run:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🎙️ Generating Real Audio Files with Edge-TTS

The app includes real high-quality neural voice audio files generated using `edge-tts`:

- `assets/audio/kural-391.mp3` (Teacher Kural recital using `ta-IN-ValluvarNeural`, ~5.62s)
- `assets/audio/meaning-ta.mp3` (Tamil meaning recital using `ta-IN-PallaviNeural`, ~7.32s)
- `assets/audio/meaning-en.mp3` (English meaning recital using `en-IN-NeerjaNeural`, ~7.10s)

### Regenerating Audio Files:
To regenerate or update these audio files, install `edge-tts` and run:

```bash
pip install edge-tts

# 1. Tamil Meaning Audio
python -m edge_tts --voice ta-IN-PallaviNeural --text "கற்க வேண்டிய நூல்களைக் குற்றம் இல்லாமல் கற்க வேண்டும்; கற்ற பிறகு அந்தக் கல்விக்குத் தகுந்தபடி வாழ வேண்டும்." --write-media assets/audio/meaning-ta.mp3

# 2. English Meaning Audio
python -m edge_tts --voice en-IN-NeerjaNeural --text "Learn thoroughly, without flaw, what is worth learning, and then live according to what you have learned." --write-media assets/audio/meaning-en.mp3

# 3. Teacher Kural Audio
python -m edge_tts --voice ta-IN-ValluvarNeural --rate=-15% --text "கற்க கசடறக் கற்பவை கற்றபின். நிற்க அதற்குத் தக." --write-media assets/audio/kural-391.mp3
```

---

## 🎵 Customizing Audio & Adjusting Word Timings

### 1. Word Karaoke Timings
In `js/data.js`, the word start and end timestamps are matched to `assets/audio/kural-391.mp3`:

```javascript
const KURAL = {
  // ...
  words: [
    { text: "கற்க",     start: 0.00, end: 0.65 },
    { text: "கசடறக்",   start: 0.65, end: 1.45 },
    { text: "கற்பவை",   start: 1.45, end: 2.25 },
    { text: "கற்றபின்", start: 2.25, end: 3.10 },
    { text: "நிற்க",    start: 3.55, end: 4.20 },
    { text: "அதற்குத்", start: 4.20, end: 4.95 },
    { text: "தக.",      start: 4.95, end: 5.60 }
  ],
  // ...
};
```

---

## 📺 Changing the Kural & YouTube Video

To change the lesson content or YouTube video link, update `js/data.js`:
- `KURAL.video`: Set to any valid YouTube URL (e.g., `https://www.youtube.com/watch?v=YOUR_VIDEO_ID`).
- `KURAL.game.blankIndexes`: Specify zero-indexed positions of words that should become missing slots in the game.
- `KURAL.game.distractors`: Add Tamil distractor words to make the game fun and challenging.

---

## 📂 File Structure

```
kural-kalvi/
├── index.html          # Main HTML5 entry point containing all 10 screen sections
├── css/
│   ├── base.css        # CSS variables, typography, reset, top bar, progress dots
│   ├── screens.css     # Per-screen detailed styles, Olai Suvadi, cards, slots
│   └── animations.css  # 60fps keyframe animations, shake, pop-in, particle float
├── js/
│   ├── data.js         # Kural 391 text, timings, meanings, video link, game data
│   ├── state.js        # 10-step linear state machine & screen transitions
│   ├── audio.js        # Web Audio API sound FX + Web Speech API fallback + mute toggle
│   ├── scroll.js       # Olai Suvadi opening & closing animation controller
│   ├── teacher.js      # Teacher read-aloud, playback rate, karaoke sync
│   ├── video.js        # YouTube IFrame API integration & animated fallback scene
│   ├── game.js         # Fill-in-the-blank game, drag-and-drop, touch chips, hint/lives
│   ├── result.js       # Star calculation, trophy rendering, canvas confetti
│   └── app.js          # Initialization and event listener wiring
├── assets/
│   ├── audio/          # Optional kural-391.mp3 teacher recording
│   └── images/         # Optional asset images
└── README.md           # Documentation
```
