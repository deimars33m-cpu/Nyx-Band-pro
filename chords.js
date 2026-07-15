// Diccionario de acordes ampliado y base de datos de escalas exóticas / modernas
const CHORD_DATABASE = {
  // --- DO (C) ---
  "C": {
    notes: ["C", "E", "G"],
    guitar: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    piano: { keys: [0, 4, 7] }
  },
  "Cm": {
    notes: ["C", "Eb", "G"],
    guitar: { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: 3 },
    piano: { keys: [0, 3, 7] }
  },
  "C7": {
    notes: ["C", "E", "G", "Bb"],
    guitar: { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    piano: { keys: [0, 4, 7, 10] }
  },
  "Cmaj7": {
    notes: ["C", "E", "G", "B"],
    guitar: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    piano: { keys: [0, 4, 7, 11] }
  },
  "Cm7": {
    notes: ["C", "Eb", "G", "Bb"],
    guitar: { frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: 3 },
    piano: { keys: [0, 3, 7, 10] }
  },
  "Csus4": {
    notes: ["C", "F", "G"],
    guitar: { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
    piano: { keys: [0, 5, 7] }
  },
  "C9": {
    notes: ["C", "E", "Bb", "D"],
    guitar: { frets: [-1, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3], barre: 3 },
    piano: { keys: [0, 4, 10, 14] }
  },
  "Cm7b5": {
    notes: ["C", "Eb", "Gb", "Bb"],
    guitar: { frets: [-1, 3, 4, 3, 4, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [0, 3, 6, 10] }
  },
  "Cdim7": {
    notes: ["C", "Eb", "Gb", "A"],
    guitar: { frets: [-1, 3, 4, 2, 4, -1], fingers: [0, 2, 3, 1, 4, 0] },
    piano: { keys: [0, 3, 6, 9] }
  },

  // --- DO# / REb (C#) ---
  "C#": {
    notes: ["C#", "F", "G#"],
    guitar: { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 3, 4, 2, 1], barre: 4 },
    piano: { keys: [1, 5, 8] }
  },
  "C#m": {
    notes: ["C#", "E", "G#"],
    guitar: { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: 4 },
    piano: { keys: [1, 4, 8] }
  },
  "C#7": {
    notes: ["C#", "F", "G#", "B"],
    guitar: { frets: [-1, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], barre: 4 },
    piano: { keys: [1, 5, 8, 11] }
  },
  "C#maj7": {
    notes: ["C#", "F", "G#", "C"],
    guitar: { frets: [-1, 4, 6, 5, 6, 4], fingers: [0, 1, 3, 2, 4, 1], barre: 4 },
    piano: { keys: [1, 5, 8, 12] }
  },
  "C#m7": {
    notes: ["C#", "E", "G#", "B"],
    guitar: { frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], barre: 4 },
    piano: { keys: [1, 4, 8, 11] }
  },
  "C#sus4": {
    notes: ["C#", "F#", "G#"],
    guitar: { frets: [-1, 4, 6, 6, 7, 4], fingers: [0, 1, 3, 4, 5, 1], barre: 4 },
    piano: { keys: [1, 6, 8] }
  },
  "C#9": {
    notes: ["C#", "F", "B", "D#"],
    guitar: { frets: [-1, 4, 3, 4, 4, 4], fingers: [0, 2, 1, 3, 3, 3], barre: 4 },
    piano: { keys: [1, 5, 11, 15] }
  },
  "C#m7b5": {
    notes: ["C#", "E", "G", "B"],
    guitar: { frets: [-1, 4, 5, 4, 5, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [1, 4, 7, 11] }
  },
  "C#dim7": {
    notes: ["C#", "E", "G", "Bb"],
    guitar: { frets: [-1, 4, 5, 3, 5, -1], fingers: [0, 2, 3, 1, 4, 0] },
    piano: { keys: [1, 4, 7, 10] }
  },

  // --- RE (D) ---
  "D": {
    notes: ["D", "F#", "A"],
    guitar: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    piano: { keys: [2, 6, 9] }
  },
  "Dm": {
    notes: ["D", "F", "A"],
    guitar: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    piano: { keys: [2, 5, 9] }
  },
  "D7": {
    notes: ["D", "F#", "A", "C"],
    guitar: { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
    piano: { keys: [2, 6, 9, 12] }
  },
  "Dmaj7": {
    notes: ["D", "F#", "A", "C#"],
    guitar: { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], barre: 2 },
    piano: { keys: [2, 6, 9, 13] }
  },
  "Dm7": {
    notes: ["D", "F", "A", "C"],
    guitar: { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barre: 1 },
    piano: { keys: [2, 5, 9, 12] }
  },
  "Dsus4": {
    notes: ["D", "G", "A"],
    guitar: { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 3, 4] },
    piano: { keys: [2, 7, 9] }
  },
  "D9": {
    notes: ["D", "F#", "C", "E"],
    guitar: { frets: [-1, 5, 4, 5, 5, 5], fingers: [0, 2, 1, 3, 3, 3], barre: 5 },
    piano: { keys: [2, 6, 12, 16] }
  },
  "Dm7b5": {
    notes: ["D", "F", "Ab", "C"],
    guitar: { frets: [-1, 5, 6, 5, 6, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [2, 5, 8, 12] }
  },
  "Ddim7": {
    notes: ["D", "F", "Ab", "B"],
    guitar: { frets: [-1, 5, 6, 4, 6, -1], fingers: [0, 2, 3, 1, 4, 0] },
    piano: { keys: [2, 5, 8, 11] }
  },

  // --- RE# / MIb (Eb) ---
  "Eb": {
    notes: ["Eb", "G", "Bb"],
    guitar: { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barre: 6 },
    piano: { keys: [3, 7, 10] }
  },
  "Ebm": {
    notes: ["Eb", "Gb", "Bb"],
    guitar: { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barre: 6 },
    piano: { keys: [3, 6, 10] }
  },
  "Eb7": {
    notes: ["Eb", "G", "Bb", "Db"],
    guitar: { frets: [-1, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], barre: 6 },
    piano: { keys: [3, 7, 10, 13] }
  },
  "Ebmaj7": {
    notes: ["Eb", "G", "Bb", "D"],
    guitar: { frets: [-1, 6, 8, 7, 8, 6], fingers: [0, 1, 3, 2, 4, 1], barre: 6 },
    piano: { keys: [3, 7, 10, 14] }
  },
  "Ebm7": {
    notes: ["Eb", "Gb", "Bb", "Db"],
    guitar: { frets: [-1, 6, 8, 6, 7, 6], fingers: [0, 1, 3, 1, 2, 1], barre: 6 },
    piano: { keys: [3, 6, 10, 13] }
  },
  "Ebsus4": {
    notes: ["Eb", "Ab", "Bb"],
    guitar: { frets: [-1, 6, 8, 8, 9, 6], fingers: [0, 1, 3, 4, 5, 1], barre: 6 },
    piano: { keys: [3, 8, 10] }
  },
  "Eb9": {
    notes: ["Eb", "G", "Db", "F"],
    guitar: { frets: [-1, 6, 5, 6, 6, 6], fingers: [0, 2, 1, 3, 3, 3], barre: 6 },
    piano: { keys: [3, 7, 13, 17] }
  },
  "Ebm7b5": {
    notes: ["Eb", "Gb", "A", "Db"],
    guitar: { frets: [-1, 6, 7, 6, 7, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [3, 6, 9, 13] }
  },
  "Ebdim7": {
    notes: ["Eb", "Gb", "A", "C"],
    guitar: { frets: [-1, 6, 7, 5, 7, -1], fingers: [0, 2, 3, 1, 4, 0] },
    piano: { keys: [3, 6, 9, 12] }
  },

  // --- MI (E) ---
  "E": {
    notes: ["E", "G#", "B"],
    guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    piano: { keys: [4, 8, 11] }
  },
  "Em": {
    notes: ["E", "G", "B"],
    guitar: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    piano: { keys: [4, 7, 11] }
  },
  "E7": {
    notes: ["E", "G#", "B", "D"],
    guitar: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
    piano: { keys: [4, 8, 11, 14] }
  },
  "Emaj7": {
    notes: ["E", "G#", "B", "D#"],
    guitar: { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
    piano: { keys: [4, 8, 11, 15] }
  },
  "Em7": {
    notes: ["E", "G", "B", "D"],
    guitar: { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
    piano: { keys: [4, 7, 11, 14] }
  },
  "Esus4": {
    notes: ["E", "A", "B"],
    guitar: { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0] },
    piano: { keys: [4, 9, 11] }
  },
  "E9": {
    notes: ["E", "G#", "D", "F#"],
    guitar: { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3] },
    piano: { keys: [4, 8, 14, 18] }
  },
  "Em7b5": {
    notes: ["E", "G", "Bb", "D"],
    guitar: { frets: [0, 1, 0, 0, 3, 3], fingers: [0, 1, 0, 0, 3, 4] },
    piano: { keys: [4, 7, 10, 14] }
  },
  "Edim7": {
    notes: ["E", "G", "Bb", "Db"],
    guitar: { frets: [-1, -1, 2, 3, 2, 3], fingers: [0, 0, 1, 3, 2, 4] },
    piano: { keys: [4, 7, 10, 13] }
  },

  // --- FA (F) ---
  "F": {
    notes: ["F", "A", "C"],
    guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
    piano: { keys: [5, 9, 12] }
  },
  "Fm": {
    notes: ["F", "Ab", "C"],
    guitar: { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: 1 },
    piano: { keys: [5, 8, 12] }
  },
  "F7": {
    notes: ["F", "A", "C", "Eb"],
    guitar: { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: 1 },
    piano: { keys: [5, 9, 12, 15] }
  },
  "Fmaj7": {
    notes: ["F", "A", "C", "E"],
    guitar: { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
    piano: { keys: [5, 9, 12, 16] }
  },
  "Fm7": {
    notes: ["F", "Ab", "C", "Eb"],
    guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: 1 },
    piano: { keys: [5, 8, 12, 15] }
  },
  "Fsus4": {
    notes: ["F", "Bb", "C"],
    guitar: { frets: [1, 3, 3, 3, 1, 1], fingers: [1, 3, 4, 5, 1, 1], barre: 1 },
    piano: { keys: [5, 10, 12] }
  },
  "F9": {
    notes: ["F", "A", "Eb", "G"],
    guitar: { frets: [-1, 8, 7, 8, 8, 8], fingers: [0, 2, 1, 3, 3, 3], barre: 8 },
    piano: { keys: [5, 9, 15, 19] }
  },
  "Fm7b5": {
    notes: ["F", "Ab", "Cb", "Eb"],
    guitar: { frets: [-1, 8, 9, 8, 9, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [5, 8, 11, 15] }
  },
  "Fdim7": {
    notes: ["F", "Ab", "Cb", "D"],
    guitar: { frets: [-1, -1, 3, 4, 3, 4], fingers: [0, 0, 1, 3, 2, 4] },
    piano: { keys: [5, 8, 11, 14] }
  },

  // --- FA# / SOLb (F#) ---
  "F#": {
    notes: ["F#", "A#", "C#"],
    guitar: { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: 2 },
    piano: { keys: [6, 10, 13] }
  },
  "F#m": {
    notes: ["F#", "A", "C#"],
    guitar: { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: 2 },
    piano: { keys: [6, 9, 13] }
  },
  "F#7": {
    notes: ["F#", "A#", "C#", "E"],
    guitar: { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barre: 2 },
    piano: { keys: [6, 10, 13, 16] }
  },
  "F#maj7": {
    notes: ["F#", "A#", "C#", "F"],
    guitar: { frets: [2, -1, 3, 3, 2, -1], fingers: [1, 0, 3, 4, 2, 0] },
    piano: { keys: [6, 10, 13, 17] }
  },
  "F#m7": {
    notes: ["F#", "A", "C#", "E"],
    guitar: { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barre: 2 },
    piano: { keys: [6, 9, 13, 16] }
  },
  "F#sus4": {
    notes: ["F#", "B", "C#"],
    guitar: { frets: [2, 4, 4, 4, 2, 2], fingers: [1, 3, 4, 5, 1, 1], barre: 2 },
    piano: { keys: [6, 11, 13] }
  },
  "F#9": {
    notes: ["F#", "A#", "E", "G#"],
    guitar: { frets: [2, 1, 2, 1, 2, -1], fingers: [2, 1, 3, 1, 4, 0] },
    piano: { keys: [6, 10, 16, 20] }
  },
  "F#m7b5": {
    notes: ["F#", "A", "C", "E"],
    guitar: { frets: [2, -1, 2, 2, 1, -1], fingers: [2, 0, 3, 4, 1, 0] },
    piano: { keys: [6, 9, 12, 16] }
  },
  "F#dim7": {
    notes: ["F#", "A", "C", "Eb"],
    guitar: { frets: [2, -1, 1, 2, 1, -1], fingers: [2, 0, 1, 3, 1, 0] },
    piano: { keys: [6, 9, 12, 15] }
  },

  // --- SOL (G) ---
  "G": {
    notes: ["G", "B", "D"],
    guitar: { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4] },
    piano: { keys: [7, 11, 14] }
  },
  "Gm": {
    notes: ["G", "Bb", "D"],
    guitar: { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: 3 },
    piano: { keys: [7, 10, 14] }
  },
  "G7": {
    notes: ["G", "B", "D", "F"],
    guitar: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
    piano: { keys: [7, 11, 14, 17] }
  },
  "Gmaj7": {
    notes: ["G", "B", "D", "F#"],
    guitar: { frets: [3, -1, 4, 4, 3, -1], fingers: [1, 0, 3, 4, 2, 0] },
    piano: { keys: [7, 11, 14, 18] }
  },
  "Gm7": {
    notes: ["G", "Bb", "D", "F"],
    guitar: { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: 3 },
    piano: { keys: [7, 10, 14, 17] }
  },
  "Gsus4": {
    notes: ["G", "C", "D"],
    guitar: { frets: [3, 3, 0, 0, 1, 3], fingers: [3, 4, 0, 0, 1, 5] },
    piano: { keys: [7, 12, 14] }
  },
  "G9": {
    notes: ["G", "B", "F", "A"],
    guitar: { frets: [3, 2, 3, 2, 0, -1], fingers: [2, 1, 3, 1, 0, 0] },
    piano: { keys: [7, 11, 17, 21] }
  },
  "Gm7b5": {
    notes: ["G", "Bb", "Db", "F"],
    guitar: { frets: [3, -1, 3, 3, 2, -1], fingers: [2, 0, 3, 4, 1, 0] },
    piano: { keys: [7, 10, 13, 17] }
  },
  "Gdim7": {
    notes: ["G", "Bb", "Db", "E"],
    guitar: { frets: [3, -1, 2, 3, 2, -1], fingers: [2, 0, 1, 3, 1, 0] },
    piano: { keys: [7, 10, 13, 16] }
  },

  // --- SOL# / LAb (Ab) ---
  "Ab": {
    notes: ["Ab", "C", "Eb"],
    guitar: { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: 4 },
    piano: { keys: [8, 12, 15] }
  },
  "Abm": {
    notes: ["Ab", "Cb", "Eb"],
    guitar: { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: 4 },
    piano: { keys: [8, 11, 15] }
  },
  "Ab7": {
    notes: ["Ab", "C", "Eb", "Gb"],
    guitar: { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barre: 4 },
    piano: { keys: [8, 12, 15, 18] }
  },
  "Abmaj7": {
    notes: ["Ab", "C", "Eb", "G"],
    guitar: { frets: [4, -1, 5, 5, 4, -1], fingers: [1, 0, 3, 4, 2, 0] },
    piano: { keys: [8, 12, 15, 19] }
  },
  "Abm7": {
    notes: ["Ab", "Cb", "Eb", "Gb"],
    guitar: { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barre: 4 },
    piano: { keys: [8, 11, 15, 18] }
  },
  "Absus4": {
    notes: ["Ab", "Db", "Eb"],
    guitar: { frets: [4, 6, 6, 6, 4, 4], fingers: [1, 3, 4, 5, 1, 1], barre: 4 },
    piano: { keys: [8, 13, 15] }
  },
  "Ab9": {
    notes: ["Ab", "C", "Gb", "Bb"],
    guitar: { frets: [4, 3, 4, 3, 4, -1], fingers: [2, 1, 3, 1, 4, 0] },
    piano: { keys: [8, 12, 18, 22] }
  },
  "Abm7b5": {
    notes: ["Ab", "Cb", "D", "Gb"],
    guitar: { frets: [4, -1, 4, 4, 3, -1], fingers: [2, 0, 3, 4, 1, 0] },
    piano: { keys: [8, 11, 14, 18] }
  },
  "Abdim7": {
    notes: ["Ab", "Cb", "D", "F"],
    guitar: { frets: [4, -1, 3, 4, 3, -1], fingers: [2, 0, 1, 3, 1, 0] },
    piano: { keys: [8, 11, 14, 17] }
  },

  // --- LA (A) ---
  "A": {
    notes: ["A", "C#", "E"],
    guitar: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    piano: { keys: [9, 13, 16] }
  },
  "Am": {
    notes: ["A", "C", "E"],
    guitar: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    piano: { keys: [9, 12, 16] }
  },
  "A7": {
    notes: ["A", "C#", "E", "G"],
    guitar: { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
    piano: { keys: [9, 13, 16, 19] }
  },
  "Amaj7": {
    notes: ["A", "C#", "E", "G#"],
    guitar: { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
    piano: { keys: [9, 13, 16, 20] }
  },
  "Am7": {
    notes: ["A", "C", "E", "G"],
    guitar: { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
    piano: { keys: [9, 12, 16, 19] }
  },
  "Asus4": {
    notes: ["A", "D", "E"],
    guitar: { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
    piano: { keys: [9, 14, 16] }
  },
  "A9": {
    notes: ["A", "C#", "G", "B"],
    guitar: { frets: [-1, 12, 11, 12, 12, 12], fingers: [0, 2, 1, 3, 3, 3], barre: 12 },
    piano: { keys: [9, 13, 19, 23] }
  },
  "Am7b5": {
    notes: ["A", "C", "Eb", "G"],
    guitar: { frets: [-1, 0, 1, 0, 1, -1], fingers: [0, 0, 1, 0, 2, 0] },
    piano: { keys: [9, 12, 15, 19] }
  },
  "Adim7": {
    notes: ["A", "C", "Eb", "Gb"],
    guitar: { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0] },
    piano: { keys: [9, 12, 15, 18] }
  },

  // --- LA# / SIb (Bb) ---
  "Bb": {
    notes: ["Bb", "D", "F"],
    guitar: { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: 1 },
    piano: { keys: [10, 14, 17] }
  },
  "Bbm": {
    notes: ["Bb", "Db", "F"],
    guitar: { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: 1 },
    piano: { keys: [10, 13, 17] }
  },
  "Bb7": {
    notes: ["Bb", "D", "F", "Ab"],
    guitar: { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barre: 1 },
    piano: { keys: [10, 14, 17, 20] }
  },
  "Bbmaj7": {
    notes: ["Bb", "D", "F", "A"],
    guitar: { frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barre: 1 },
    piano: { keys: [10, 14, 17, 21] }
  },
  "Bbm7": {
    notes: ["Bb", "Db", "F", "Ab"],
    guitar: { frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barre: 1 },
    piano: { keys: [10, 13, 17, 20] }
  },
  "Bbsus4": {
    notes: ["Bb", "Eb", "F"],
    guitar: { frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 3, 4, 5, 1], barre: 1 },
    piano: { keys: [10, 15, 17] }
  },
  "Bb9": {
    notes: ["Bb", "D", "Ab", "C"],
    guitar: { frets: [-1, 1, 0, 1, 1, 1], fingers: [0, 1, 0, 2, 3, 4] },
    piano: { keys: [10, 14, 20, 24] }
  },
  "Bbm7b5": {
    notes: ["Bb", "Db", "E", "Ab"],
    guitar: { frets: [-1, 1, 2, 1, 2, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [10, 13, 16, 20] }
  },
  "Bbdim7": {
    notes: ["Bb", "Db", "E", "G"],
    guitar: { frets: [-1, 1, 2, 0, 2, -1], fingers: [0, 1, 2, 0, 3, 0] },
    piano: { keys: [10, 13, 16, 19] }
  },

  // --- SI (B) ---
  "B": {
    notes: ["B", "D#", "F#"],
    guitar: { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: 2 },
    piano: { keys: [11, 15, 18] }
  },
  "Bm": {
    notes: ["B", "D", "F#"],
    guitar: { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: 2 },
    piano: { keys: [11, 14, 18] }
  },
  "B7": {
    notes: ["B", "D#", "F#", "A"],
    guitar: { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
    piano: { keys: [11, 15, 18, 21] }
  },
  "Bmaj7": {
    notes: ["B", "D#", "F#", "A#"],
    guitar: { frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barre: 2 },
    piano: { keys: [11, 15, 18, 22] }
  },
  "Bm7": {
    notes: ["B", "D", "F#", "A"],
    guitar: { frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barre: 2 },
    piano: { keys: [11, 14, 18, 21] }
  },
  "Bsus4": {
    notes: ["B", "E", "F#"],
    guitar: { frets: [-1, 2, 4, 4, 5, 2], fingers: [0, 1, 3, 4, 5, 1], barre: 2 },
    piano: { keys: [11, 16, 18] }
  },
  "B9": {
    notes: ["B", "D#", "A", "C#"],
    guitar: { frets: [-1, 2, 1, 2, 2, 2], fingers: [0, 2, 1, 3, 3, 3], barre: 2 },
    piano: { keys: [11, 15, 21, 25] }
  },
  "Bm7b5": {
    notes: ["B", "D", "F", "A"],
    guitar: { frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0] },
    piano: { keys: [11, 14, 17, 21] }
  },
  "Bdim7": {
    notes: ["B", "D", "F", "Ab"],
    guitar: { frets: [-1, 2, 3, 1, 3, -1], fingers: [0, 2, 3, 1, 4, 0] },
    piano: { keys: [11, 14, 17, 20] }
  }
};

// --- BASE DE DATOS DE ESCALAS ---
const SCALE_DATABASE = {
  "pentatonic_major": {
    name: "Pentatónica Mayor",
    intervals: [0, 2, 4, 7, 9],
    desc: "Muy popular en el rock, country y blues. Suprime los semitonos (grados 4 y 7) para evitar tensiones disonantes."
  },
  "pentatonic_minor": {
    name: "Pentatónica Menor",
    intervals: [0, 3, 5, 7, 10],
    desc: "La escala de cabecera de todo guitarrista de rock y blues. Su forma es sumamente simétrica en la guitarra."
  },
  "blues": {
    name: "Blues Menor",
    intervals: [0, 3, 5, 6, 7, 10],
    desc: "Escala pentatónica menor a la que se le añade el trítono (b5 o 'blue note'), otorgándole esa tensión melancólica característica."
  },
  "ionian": {
    name: "Jónica (Mayor Natural)",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    desc: "La base de la armonía tonal occidental. Su estructura es T-T-ST-T-T-T-ST."
  },
  "dorian": {
    name: "Dórica",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    desc: "Segundo modo griego. Una escala menor con el grado 6 mayor, dándole un aire retro-futurista (muy usada en Jazz y Rock psicodélico)."
  },
  "phrygian": {
    name: "Frigia",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    desc: "Tercer modo griego. Escala menor con una segunda menor (b2). Clave en el flamenco, metal progresivo y música de tensión dramática."
  },
  "lydian": {
    name: "Lidia",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    desc: "Cuarto modo griego. Escala mayor con una cuarta aumentada (#4). Aporta una sonoridad mística, espacial y cinemática (muy popular en bandas sonoras)."
  },
  "mixolydian": {
    name: "Mixolidia",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    desc: "Quinto modo griego. Escala mayor con séptima menor (b7). Dominante y festiva, piedra angular del blues clásico, funk y rock n' roll."
  },
  "aeolian": {
    name: "Eólica (Menor Natural)",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    desc: "El modo menor por excelencia. Melancólica y reflexiva, define gran parte del pop triste, rock clásico y baladas."
  },
  "locrian": {
    name: "Locria",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    desc: "Séptimo modo griego. Escala disminuida y tensa, construida sobre el acorde semidisminuido. Inestable y de carácter misterioso."
  },
  "whole_tone": {
    name: "Tonos Enteros (Whole Tone)",
    intervals: [0, 2, 4, 6, 8, 10],
    desc: "Escala simétrica donde todos los intervalos son de un tono completo. Carece de tónica fuerte, sonando suspendida y flotante (efecto de sueño en cine)."
  },
  "diminished": {
    name: "Disminuida (Tono-Semitono)",
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    desc: "Escala octatónica simétrica. Excelente para improvisar sobre acordes disminuidos y dominantes alterados con gran tensión armónica."
  },
  "byzantine": {
    name: "Doble Armónica Mayor (Bizantina)",
    intervals: [0, 1, 4, 5, 7, 8, 11],
    desc: "Escala exótica con dos segundas aumentadas. Típica de la música de Medio Oriente, India y el flamenco (estilo árabe/gitano)."
  },
  "insen": {
    name: "Japonesa (In Sen)",
    intervals: [0, 1, 5, 7, 8],
    desc: "Escala pentatónica tradicional japonesa. Confiere un tono exótico, meditativo y solemne instantáneamente."
  },
  "hungarian": {
    name: "Menor Húngara / Gitana",
    intervals: [0, 2, 3, 6, 7, 8, 11],
    desc: "Escala menor con cuartas aumentadas y séptimas mayores. Produce una tensión dramática y una sonoridad folclórica centroeuropea profunda."
  }
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// --- DIBUJADO DE ACORDE EN GUITARRA (SVG) ---
function renderGuitarChordSVG(chordName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Soportar acordes personalizados en localStorage
  let customChords = {};
  try {
    customChords = JSON.parse(localStorage.getItem('bandCustomChords') || '{}');
  } catch (e) {}
  
  const chordDef = customChords[chordName] || CHORD_DATABASE[chordName];
  
  if (!chordDef) {
    container.innerHTML = `<p style="color:var(--text-muted)">Acorde no disponible para guitarra</p>`;
    return;
  }
  
  let frets, fingers, barre;
  
  // Soporte para el formato de cadena "123456" (Ej: "010230" para C Mayor)
  if (typeof chordDef === "string") {
    frets = chordDef.split('').reverse().map(c => (c.toLowerCase() === 'x' ? -1 : parseInt(c) || 0));
    fingers = [0, 0, 0, 0, 0, 0];
    barre = null;
  } else if (chordDef.guitar && typeof chordDef.guitar === "string") {
    frets = chordDef.guitar.split('').reverse().map(c => (c.toLowerCase() === 'x' ? -1 : parseInt(c) || 0));
    fingers = [0, 0, 0, 0, 0, 0];
    barre = null;
  } else if (chordDef.guitar) {
    frets = chordDef.guitar.frets;
    fingers = chordDef.guitar.fingers || [0, 0, 0, 0, 0, 0];
    barre = chordDef.guitar.barre;
  } else {
    container.innerHTML = `<p style="color:var(--text-muted)">Acorde sin formato de guitarra válido</p>`;
    return;
  }
  
  // Encontrar el traste mínimo que no sea 0 o -1 para ajustar la vista del mástil
  let minFret = 999;
  let maxFret = 0;
  frets.forEach(f => {
    if (f > 0) {
      if (f < minFret) minFret = f;
      if (f > maxFret) maxFret = f;
    }
  });
  
  // Determinar el traste base. Si el acorde está en los primeros 4 trastes, traste base es 1.
  let baseFret = 1;
  if (maxFret > 4 && minFret !== 999) {
    baseFret = minFret;
  }
  
  // Dibujar diapasón SVG
  // 6 cuerdas verticales, 5 trastes horizontales (lo que cubre 4 trastes)
  let svg = `<svg viewBox="0 0 200 240" class="chord-svg-fretboard" style="width:100%; height:100%">`;
  
  // Título del traste base si es mayor a 1
  if (baseFret > 1) {
    svg += `<text x="12" y="62" font-size="11" font-weight="700" fill="var(--neon-cyan)">Fr. ${baseFret}</text>`;
  }
  
  // Dibujar la cejilla superior (nut) si el traste base es 1
  const nutWidth = baseFret === 1 ? 4 : 1;
  svg += `<rect x="40" y="38" width="120" height="${nutWidth}" fill="${baseFret === 1 ? 'var(--text-primary)' : 'var(--text-muted)'}" />`;
  
  // Dibujar 5 trastes horizontales (líneas)
  for (let i = 0; i <= 4; i++) {
    const y = 40 + i * 40;
    svg += `<line x1="40" y1="${y}" x2="160" y2="${y}" stroke-width="1.5" />`;
  }
  
  // Dibujar 6 cuerdas verticales
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 24;
    const thickness = 1 + (5 - i) * 0.4; // Cuerdas graves más gruesas
    svg += `<line x1="${x}" y1="40" x2="${x}" y2="200" stroke-width="${thickness}" />`;
  }
  
  // Dibujar cejilla (barre) si aplica
  if (barre) {
    const y = 40 + (barre - baseFret) * 40 + 20;
    const xStart = 40 + frets.findIndex(f => f >= barre) * 24; // Empezar donde pisa
    const xEnd = 160;
    svg += `<rect x="${xStart - 4}" y="${y - 6}" width="${xEnd - xStart + 8}" height="12" rx="6" fill="var(--neon-cyan)" opacity="0.6" />`;
    svg += `<text x="${(xStart + xEnd)/2}" y="${y + 3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--bg-primary)">I</text>`;
  }
  
  // Dibujar marcas superiores de cuerdas al aire (O) o silenciadas (X)
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 24;
    const fretVal = frets[i];
    
    if (fretVal === -1) {
      svg += `<text x="${x}" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="var(--neon-red)">×</text>`;
    } else if (fretVal === 0) {
      svg += `<circle cx="${x}" cy="24" r="5" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" />`;
    } else {
      // Dibujar punto de dedo si no está pisado ya por el barre a nivel visual inferior
      const finger = fingers[i];
      const y = 40 + (fretVal - baseFret) * 40 + 20;
      
      svg += `<circle cx="${x}" cy="${y}" r="8" class="chord-dot-finger" />`;
      if (finger > 0) {
        svg += `<text x="${x}" y="${y + 3.5}" class="note-text" text-anchor="middle" font-size="9" font-weight="700" fill="var(--bg-primary)">${finger}</text>`;
      }
    }
  }
  
  svg += `</svg>`;
  container.innerHTML = svg;
}

// --- DIBUJADO DE ESCALAS EN GUITARRA (SVG HORIZONTAL) ---
function renderGuitarScaleSVG(rootSemitone, scaleKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const scale = SCALE_DATABASE[scaleKey];
  if (!scale) return;
  
  // Notas en la escala (tonos absolutos mod 12)
  const scaleNotes = scale.intervals.map(int => (rootSemitone + int) % 12);
  
  // Afinación estándar: E4, B3, G3, D3, A2, E2
  const stringOffsets = [4, -1, -5, -10, -15, -20]; 
  const stringNames = ["e", "B", "G", "D", "A", "E"];
  
  let svg = `<svg viewBox="0 0 620 200" class="chord-svg-fretboard" style="width:100%; height:100%">`;
  
  // Fondo de madera del diapasón
  svg += `<rect x="50" y="28" width="540" height="130" fill="rgba(255,255,255,0.01)" rx="4" stroke="rgba(255,255,255,0.03)" />`;
  
  // Dibujar cejuela (nut)
  svg += `<rect x="47" y="28" width="4" height="130" fill="var(--text-primary)" />`;
  
  // Dibujar marcadores de trastes en el cuerpo (frets: 3, 5, 7, 9, 12)
  const markerFrets = [3, 5, 7, 9];
  markerFrets.forEach(f => {
    const x = 50 + f * 45 - 22.5;
    svg += `<circle cx="${x}" cy="93" r="5" fill="rgba(255,255,255,0.12)" />`;
  });
  // Doble marcador en traste 12
  const x12 = 50 + 12 * 45 - 22.5;
  svg += `<circle cx="${x12}" cy="60" r="5" fill="rgba(255,255,255,0.12)" />`;
  svg += `<circle cx="${x12}" cy="126" r="5" fill="rgba(255,255,255,0.12)" />`;
  
  // Dibujar 12 trastes verticales
  for (let i = 0; i <= 12; i++) {
    const x = 50 + i * 45;
    svg += `<line x1="${x}" y1="28" x2="${x}" y2="158" stroke="var(--text-muted)" stroke-width="${i === 0 ? 3 : 1.2}" />`;
    if (i > 0) {
      svg += `<text x="${x - 22.5}" y="176" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">${i}</text>`;
    } else {
      svg += `<text x="25" y="176" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">Aire</text>`;
    }
  }
  
  // Dibujar 6 cuerdas horizontales
  for (let i = 0; i < 6; i++) {
    const y = 38 + i * 22;
    const thickness = 0.8 + (5 - i) * 0.45;
    svg += `<line x1="50" y1="${y}" x2="590" y2="${y}" stroke="rgba(255,255,255,0.3)" stroke-width="${thickness}" />`;
    // Nombre de cuerda al aire al lado izquierdo
    svg += `<text x="32" y="${y + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text-secondary)" font-family="var(--font-mono)">${stringNames[i]}</text>`;
  }
  
  // Buscar y dibujar notas de la escala en cada cuerda/traste
  for (let s = 0; s < 6; s++) {
    const y = 38 + s * 22;
    const offset = stringOffsets[s];
    
    for (let f = 0; f <= 12; f++) {
      const semitone = offset + f;
      const pitchClass = (semitone % 12 + 12) % 12;
      
      if (scaleNotes.includes(pitchClass)) {
        const isRoot = pitchClass === rootSemitone;
        const x = f === 0 ? 25 : 50 + f * 45 - 22.5;
        const color = isRoot ? "var(--neon-orange)" : "var(--neon-cyan)";
        const glow = isRoot ? "var(--glow-orange)" : "var(--glow-cyan)";
        
        svg += `
          <g style="cursor:pointer" onclick="playSingleFretNote(${semitone})">
            <circle cx="${x}" cy="${y}" r="8" fill="${color}" stroke="#ffffff" stroke-width="1" style="filter: drop-shadow(0 0 3px ${isRoot ? 'rgba(255, 107, 0, 0.4)' : 'rgba(0, 240, 255, 0.4)'})" />
            <text x="${x}" y="${y + 3.5}" class="note-text" text-anchor="middle" font-size="8" font-weight="700" fill="var(--bg-primary)" font-family="var(--font-mono)">${NOTE_NAMES[pitchClass]}</text>
          </g>
        `;
      }
    }
  }
  
  svg += `</svg>`;
  container.innerHTML = svg;
}

// --- DIBUJADO DE ACORDE EN PIANO (SVG) ---
function renderPianoChordSVG(chordName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const chord = CHORD_DATABASE[chordName];
  if (!chord || !chord.piano) {
    container.innerHTML = `<p style="color:var(--text-muted)">Acorde no disponible para piano</p>`;
    return;
  }
  
  renderPianoKeyboardSVG(chord.piano.keys, containerId, false, 0); // No es escala, colorear normal
}

// --- DIBUJADO DE ESCALAS EN PIANO (SVG) ---
function renderPianoScaleSVG(rootSemitone, scaleKey, containerId) {
  const scale = SCALE_DATABASE[scaleKey];
  if (!scale) return;
  
  // Notas relativas a la escala sumadas a la raíz (0 a 23 en semitonos)
  const scaleSemitones = [];
  // Mapear la escala sobre 2 octavas completas (0 a 24)
  for (let oct = 0; oct < 2; oct++) {
    scale.intervals.forEach(int => {
      const val = rootSemitone + int + (oct * 12);
      if (val < 24) scaleSemitones.push(val);
    });
  }
  
  renderPianoKeyboardSVG(scaleSemitones, containerId, true, rootSemitone);
}

// Teclado genérico renderizador
function renderPianoKeyboardSVG(activeSemitones, containerId, isScale = false, rootSemitone = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const whiteKeySemitones = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
  const blackKeys = [
    { semitone: 1, leftOffset: 15 },
    { semitone: 3, leftOffset: 41 },
    { semitone: 6, leftOffset: 93 },
    { semitone: 8, leftOffset: 119 },
    { semitone: 10, leftOffset: 145 },
    { semitone: 13, leftOffset: 197 },
    { semitone: 15, leftOffset: 223 },
    { semitone: 18, leftOffset: 275 },
    { semitone: 20, leftOffset: 301 },
    { semitone: 22, leftOffset: 327 },
  ];
  
  let svg = `<svg viewBox="0 0 364 160" style="width:100%; height:100%">`;
  
  // Dibujar blancas
  for (let i = 0; i < 14; i++) {
    const x = i * 26;
    const semitone = whiteKeySemitones[i];
    const isActive = activeSemitones.includes(semitone);
    
    let activeClass = isActive ? "active" : "";
    let styleStr = "cursor:pointer; transition: fill 0.15s, stroke 0.15s, filter 0.15s;";
    
    if (isActive) {
      if (isScale) {
        if (semitone % 12 === rootSemitone) {
          styleStr += "fill: var(--neon-orange); stroke: #ffffff; filter: drop-shadow(0 0 4px rgba(255, 107, 0, 0.65));";
        } else {
          styleStr += "fill: var(--neon-cyan); stroke: #ffffff; filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.65));";
        }
      } else {
        styleStr += "fill: var(--neon-orange); stroke: #ffffff; filter: drop-shadow(0 0 5px rgba(244, 63, 94, 0.75));";
      }
    } else {
      styleStr += "fill: #1e293b; stroke: #020617; stroke-width: 1.2px;";
    }
    
    svg += `<rect x="${x}" y="5" width="25" height="150" rx="3" class="piano-key-white ${activeClass}" style="${styleStr}" onclick="playSinglePianoKey(${semitone})" />`;
  }
  
  // Dibujar negras
  blackKeys.forEach(bk => {
    const isActive = activeSemitones.includes(bk.semitone);
    
    let activeClass = isActive ? "active" : "";
    let styleStr = "cursor:pointer; transition: fill 0.15s, stroke 0.15s, filter 0.15s;";
    
    if (isActive) {
      if (isScale) {
        if (bk.semitone % 12 === rootSemitone) {
          styleStr += "fill: #ffaa66; stroke: #ffffff; filter: drop-shadow(0 0 4px rgba(255, 107, 0, 0.65));";
        } else {
          styleStr += "fill: #66f0ff; stroke: #ffffff; filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.65));";
        }
      } else {
        styleStr += "fill: #fda4af; stroke: #ffffff; filter: drop-shadow(0 0 5px rgba(244, 63, 94, 0.75));";
      }
    } else {
      styleStr += "fill: #020617; stroke: #020617; stroke-width: 1px;";
    }
    
    svg += `<rect x="${bk.leftOffset}" y="5" width="15" height="90" rx="2" class="piano-key-black ${activeClass}" style="${styleStr}" onclick="playSinglePianoKey(${bk.semitone})" />`;
  });
  
  svg += `</svg>`;
  container.innerHTML = svg;
}

// --- ESCUCHAR NOTAS INDIVIDUALES (INTERACTIVO) ---
function playSingleFretNote(semitone) {
  initAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const freq = semitoneToFrequency(semitone);
  playSyntheticTone(freq, 'piano', now, 1.2);
}

function playSinglePianoKey(semitone) {
  initAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const freq = semitoneToFrequency(semitone);
  playSyntheticTone(freq, 'piano', now, 1.2);
}

// --- SINTESIS DE AUDIO CON WEB AUDIO API ---
let audioCtx = null;

// Inicializa context
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Semitono a Freq
function semitoneToFrequency(semitone) {
  const c4Freq = 261.63;
  return c4Freq * Math.pow(2, semitone / 12);
}

// Sintetiza
function playSyntheticTone(freq, type, startTime, duration) {
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filterNode = audioCtx.createBiquadFilter();
  
  osc.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Forzar sonido tipo piano (oscilador triángulo con filtro brillante) para máxima nitidez
  osc.type = 'triangle';
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(1600, startTime);
  filterNode.frequency.exponentialRampToValueAtTime(300, startTime + duration);
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.frequency.setValueAtTime(freq, startTime);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

// Chords
function playChord(chordName, instrument = 'guitar') {
  initAudioContext();
  if (!audioCtx) return;
  
  const chord = CHORD_DATABASE[chordName];
  if (!chord) return;
  
  const now = audioCtx.currentTime;
  const duration = 3.5;
  
  if (instrument === 'guitar') {
    const { frets } = chord.guitar;
    const guitarStringSemitones = [-20, -15, -10, -5, -1, 4];
    
    let delay = 0;
    for (let i = 0; i < 6; i++) {
      const fret = frets[i];
      if (fret !== -1) {
        const semitone = guitarStringSemitones[i] + fret;
        const freq = semitoneToFrequency(semitone);
        playSyntheticTone(freq, 'piano', now + delay, duration - delay);
        delay += 0.05;
      }
    }
  } else {
    const keys = chord.piano.keys;
    keys.forEach(semitone => {
      const freq = semitoneToFrequency(semitone);
      playSyntheticTone(freq, 'piano', now, duration);
    });
  }
}

// Escalas
function playScaleSequence(rootSemitone, scaleKey, instrument = 'guitar') {
  initAudioContext();
  if (!audioCtx) return;
  
  const scale = SCALE_DATABASE[scaleKey];
  if (!scale) return;
  
  const now = audioCtx.currentTime;
  const noteDuration = 0.35;
  const stepDelay = 0.3;
  
  const intervals = [...scale.intervals, 12];
  for (let i = intervals.length - 2; i >= 0; i--) {
    intervals.push(intervals[i]);
  }
  
  intervals.forEach((interval, idx) => {
    const semitone = rootSemitone + interval;
    const freq = semitoneToFrequency(semitone);
    const playTime = now + (idx * stepDelay);
    
    playSyntheticTone(freq, 'piano', playTime, noteDuration);
  });
}

// --- DIBUJADO DE PENTAGRAMA Y TABLATURA EN SVG ---
function drawChordStaffAndTabSVG(chordName, containerId, idx = 0) {
  const container = document.getElementById(containerId);
  if (!container) return "";
  
  const chord = CHORD_DATABASE[chordName];
  if (!chord) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:11px;">Acorde no definido</p>`;
    return "";
  }
  
  const notes = chord.notes || [];
  const frets = (chord.guitar && chord.guitar.frets) ? chord.guitar.frets : [];
  
  // 1. Calcular notas en el pentagrama
  const letterSteps = { "C": 0, "D": 1, "E": 2, "F": 3, "G": 4, "A": 5, "B": 6 };
  let currentOctave = 4;
  let lastStep = -999;
  
  const staffNotes = notes.map(noteName => {
    const match = noteName.match(/^([A-G])(#|b)?/);
    if (!match) return null;
    const letter = match[1];
    const acc = match[2] || "";
    
    let step = letterSteps[letter];
    if (lastStep !== -999 && step <= lastStep % 7) {
      currentOctave++;
    }
    const absoluteStep = step + (currentOctave - 4) * 7;
    lastStep = absoluteStep;
    
    // E4 (step 2) -> Y = 55 (línea inferior del pentagrama).
    // Cada paso en la escala es de 5px.
    const y = 55 - (absoluteStep - 2) * 5;
    return { note: noteName, y: y, accidental: acc, absoluteStep: absoluteStep };
  }).filter(Boolean);
  
  // Crear SVG
  const width = 180;
  const height = 130;
  const noteX = idx === 0 ? 105 : 90;
  
  let svg = `<svg viewBox="0 0 ${width} ${height}" class="timeline-staff-tab-svg" style="width:100%; height:100%;">`;
  
  // 2. DIBUJAR PENTAGRAMA (Treble Staff): 5 líneas
  // Líneas del pentagrama: Y = 15, 25, 35, 45, 55
  for (let i = 0; i < 5; i++) {
    const y = 15 + i * 10;
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />`;
  }
  
  // Clave de Sol (solo en la primera tarjeta, idx === 0)
  if (idx === 0) {
    svg += `<text x="8" y="52" font-family="Arial, Helvetica, sans-serif" font-size="38" fill="var(--neon-cyan)" opacity="0.85" style="user-select:none;">𝄞</text>`;
  }
  
  // Dibujar notas en el pentagrama
  staffNotes.forEach(sn => {
    // Líneas adicionales si la nota está por fuera (C4 está a Y = 65)
    if (sn.y >= 65) {
      svg += `<line x1="${noteX - 10}" y1="${sn.y}" x2="${noteX + 10}" y2="${sn.y}" stroke="rgba(255,255,255,0.7)" stroke-width="1.2" />`;
    }
    if (sn.y <= 5) {
      svg += `<line x1="${noteX - 10}" y1="${sn.y}" x2="${noteX + 10}" y2="${sn.y}" stroke="rgba(255,255,255,0.7)" stroke-width="1.2" />`;
    }
    
    // Si tiene alteración (#)
    if (sn.accidental === "#") {
      svg += `<text x="${noteX - 16}" y="${sn.y + 4}" font-size="12" font-weight="bold" fill="var(--neon-cyan)">#</text>`;
    } else if (sn.accidental === "b") {
      svg += `<text x="${noteX - 16}" y="${sn.y + 4}" font-size="12" font-weight="bold" fill="var(--neon-cyan)">♭</text>`;
    }
    
    // Cabeza de la nota
    svg += `<ellipse cx="${noteX}" cy="${sn.y}" rx="5.5" ry="4" fill="var(--neon-cyan)" style="filter: drop-shadow(0 0 3px var(--neon-cyan));" />`;
  });
  
  // 3. DIBUJAR TABLATURA (6 líneas para guitarra)
  // Líneas de TAB: Y = 75, 83, 91, 99, 107, 115
  for (let i = 0; i < 6; i++) {
    const y = 75 + i * 8;
    svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />`;
  }
  
  // Etiqueta "TAB" vertical (solo en la primera tarjeta, idx === 0)
  if (idx === 0) {
    svg += `
      <text x="8" y="86" font-family="Impact, Arial Black, sans-serif" font-size="9" font-weight="900" fill="var(--neon-lime)" opacity="0.8" letter-spacing="1">T</text>
      <text x="8" y="96" font-family="Impact, Arial Black, sans-serif" font-size="9" font-weight="900" fill="var(--neon-lime)" opacity="0.8" letter-spacing="1">A</text>
      <text x="8" y="106" font-family="Impact, Arial Black, sans-serif" font-size="9" font-weight="900" fill="var(--neon-lime)" opacity="0.8" letter-spacing="1">B</text>
    `;
  }
  
  // Dibujar trastes sobre las líneas de TAB
  if (frets.length === 6) {
    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      const fret = frets[stringIdx];
      if (fret !== -1) {
        const y = 115 - stringIdx * 8;
        svg += `<rect x="${noteX - 5}" y="${y - 5.5}" width="10" height="11" rx="2" fill="#020617" />`;
        svg += `<text x="${noteX}" y="${y + 3.5}" text-anchor="middle" font-family="var(--font-sans)" font-size="8" font-weight="800" fill="var(--neon-lime)" style="filter: drop-shadow(0 0 2px var(--neon-lime));">${fret}</text>`;
      }
    }
  }
  
  // 4. DIBUJAR COMPÁS (Barline vertical al final de la tarjeta)
  svg += `<line x1="${width}" y1="15" x2="${width}" y2="115" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />`;
  
  svg += `</svg>`;
  container.innerHTML = svg;
  return svg;
}
