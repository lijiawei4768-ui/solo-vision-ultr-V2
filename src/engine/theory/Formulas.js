// ─────────────────────────────────────────────────────────────
// INDEX OF SCALE & CHORD INTERVALLIC FORMULAS
// Data source for chords and scales; TQ two-point system uses
// scale degrees (1, b3, 5, …). High extensions map to basics: 9→2, 11→4, 13→6.
// ─────────────────────────────────────────────────────────────

/** Chord formulas: scale degrees relative to root (1 = root). Use with semitone map. */
export const CHORDS = {
  Maj7:   [1, 3, 5, 7],
  M7:     [1, 3, 5, 7],
  maj7:   [1, 3, 5, 7],
  m7:     [1, "b3", 5, "b7"],
  min7:   [1, "b3", 5, "b7"],
  "7":    [1, 3, 5, "b7"],
  dom7:   [1, 3, 5, "b7"],
  m7b5:   [1, "b3", "b5", "b7"],
  "ø7":   [1, "b3", "b5", "b7"],
  dim7:   [1, "b3", "b5", "bb7"],
  Maj6:   [1, 3, 5, 6],
  "6":    [1, 3, 5, 6],
  m6:     [1, "b3", 5, 6],
  sus4:   [1, 4, 5],
  "7sus4": [1, 4, 5, "b7"],
  aug:    [1, 3, "#5"],
  dim:    [1, "b3", "b5"],
  m:      [1, "b3", 5],
  "":     [1, 3, 5],
  Maj:    [1, 3, 5],
  "7alt": [1, "b9", "#9", 3, "b5", "#5", "b7"],
  m9:     [1, "b3", 5, "b7", 9],
  "9":    [1, 3, 5, "b7", 9],
  Maj9:   [1, 3, 5, 7, 9],
  m11:    [1, "b3", 5, "b7", 9, 11],
  "11":   [1, 3, 5, "b7", 9, 11],
  m13:    [1, "b3", 5, "b7", 9, 11, 13],
  "13":   [1, 3, 5, "b7", 9, 11, 13],
};

/** Scale formulas: scale degrees (1–7 + alterations). */
export const SCALES = {
  "Major":        [1, 2, 3, 4, 5, 6, 7],
  "Ionian":       [1, 2, 3, 4, 5, 6, 7],
  "Natural Minor": [1, 2, "b3", 4, 5, "b6", "b7"],
  "Aeolian":      [1, 2, "b3", 4, 5, "b6", "b7"],
  "Dorian":       [1, 2, "b3", 4, 5, 6, "b7"],
  "Phrygian":     [1, "b2", "b3", 4, 5, "b6", "b7"],
  "Lydian":       [1, 2, 3, "#4", 5, 6, 7],
  "Mixolydian":   [1, 2, 3, 4, 5, 6, "b7"],
  "Locrian":      [1, "b2", "b3", 4, "b5", "b6", "b7"],
  "Melodic Minor": [1, 2, "b3", 4, 5, 6, 7],
  "Harmonic Minor": [1, 2, "b3", 4, 5, "b6", 7],
  "Harmonic Major": [1, 2, 3, 4, 5, "b6", 7],
  "Lydian Dominant": [1, 2, 3, "#4", 5, 6, "b7"],
  "Altered":      [1, "b2", "#2", 3, "b5", "#5", "b7"],
  "Super Locrian": [1, "b2", "b3", "b4", "b5", "b6", "b7"],
  "Whole Tone":   [1, 2, 3, "#4", "#5", "b7"],
  "Diminished (HW)": [1, 2, "b3", 4, "b5", "b6", 6, 7],
  "Diminished (WH)": [1, 2, "b3", 4, 5, "b6", 6, 7],
  "Pentatonic Major": [1, 2, 3, 5, 6],
  "Pentatonic Minor": [1, "b3", 4, 5, "b7"],
  "Blues":        [1, "b3", 4, "b5", 5, "b7"],
  "Bebop Dominant": [1, 2, 3, 4, 5, 6, "b7", 7],
};

/**
 * In TQ system, high extensions equal basic scale degrees: 9→2, 11→4, 13→6.
 * Use this so the two-point coordinate layer works with 1–7 (and alterations).
 * @param {number|string} interval - scale degree (e.g. 9, 11, 13 or "9", "11", "13")
 * @returns {number} - normalized degree 1–7 (2, 4, 6 for 9, 11, 13; else unchanged 1–7)
 */
export function normalizeInterval(interval) {
  const n = typeof interval === "string" ? parseInt(interval, 10) : Number(interval);
  if (Number.isNaN(n)) return 1;
  if (n === 9) return 2;
  if (n === 11) return 4;
  if (n === 13) return 6;
  if (n === 8 || n === 15) return 1; // octave
  if (n >= 1 && n <= 7) return n;
  return (n % 7) || 7;
}

/**
 * Convert scale degree (1–7 or 9,11,13) to semitone offset from root for engine use.
 * Assumes major scale: 1=0, 2=2, 3=4, 4=5, 5=7, 6=9, 7=11; b = -1, # = +1.
 */
const DEGREE_TO_SEMITONES = {
  1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11,
  b2: 1, b3: 3, b5: 6, b6: 8, b7: 10, b9: 1, "#9": 3, "#4": 6, "#5": 8, bb7: 9,
};

export function degreeToSemitones(degree) {
  if (typeof degree === "number" && degree >= 1 && degree <= 7)
    return DEGREE_TO_SEMITONES[degree] ?? 0;
  const d = typeof degree === "string" ? degree : String(degree);
  return DEGREE_TO_SEMITONES[d] ?? 0;
}
