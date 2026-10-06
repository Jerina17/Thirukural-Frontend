/* js/data.js - Thirukkural Data */
const KURAL = {
  id: 391,
  paal: { ta: "பொருட்பால்", en: "Wealth (Porutpaal)" },
  adhikaram: { ta: "கல்வி", en: "Education" },
  lines: [
    "கற்க கசடறக் கற்பவை கற்றபின்",
    "நிற்க அதற்குத் தக."
  ],
  // Word timings (in seconds) rescaled for kural-391.mp3 (total duration: 5.62s)
  words: [
    { text: "கற்க",     start: 0.00, end: 0.65 },
    { text: "கசடறக்",   start: 0.65, end: 1.45 },
    { text: "கற்பவை",   start: 1.45, end: 2.25 },
    { text: "கற்றபின்", start: 2.25, end: 3.10 },
    { text: "நிற்க",    start: 3.55, end: 4.20 },
    { text: "அதற்குத்", start: 4.20, end: 4.95 },
    { text: "தக.",      start: 4.95, end: 5.60 }
  ],
  meaning: {
    ta: "கற்க வேண்டிய நூல்களைக் குற்றம் இல்லாமல் கற்க வேண்டும்; கற்ற பிறகு அந்தக் கல்விக்குத் தகுந்தபடி வாழ வேண்டும்.",
    en: "Learn thoroughly, without flaw, what is worth learning, and then live according to what you have learned."
  },
  meaningAudio: {
    ta: "assets/audio/meaning-ta.mp3",
    en: "assets/audio/meaning-en.mp3"
  },
  audio: "assets/audio/kural-391.mp3",
  video: "https://www.youtube.com/watch?v=slJLDuXK23A",
  game: {
    blankIndexes: [1, 3, 4], // 0-indexed across all words: 1="கசடறக்", 3="கற்றபின்", 4="நிற்க"
    distractors: ["முதல", "எழுத்தெல்லாம்", "உலகு"]
  }
};
