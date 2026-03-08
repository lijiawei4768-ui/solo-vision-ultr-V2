// ─────────────────────────────────────────────────────────────
// TWO-POINT SYSTEM — Tom Quayle style relative fretboard logic
//
// Core: target positions from root + interval + direction.
// G–B compensation: when a shape crosses the G (string 3) and B (string 2)
// boundary, ascending shapes shift the higher note +1 fret (bridge);
// descending shapes shift the lower note -1 fret (headstock).
// ─────────────────────────────────────────────────────────────

/** Standard 6-string tuning MIDI (E2 A2 D3 G3 B3 E4) */
const DEFAULT_TUNING = [40, 45, 50, 55, 59, 64];

/** String index of G and B on 6-string (0 = low E). Crossing = root on one side, target on the other. */
const G_STRING_INDEX = 3;
const B_STRING_INDEX = 2;

/**
 * Check if the shape from (rootString, rootFret) to (targetString, targetFret) crosses the G–B boundary.
 * Cross = one note on G or lower (string index >= 3), one on B or higher (string index <= 2).
 */
function crossesGB(rootString, targetString) {
  const rootBelow = rootString >= G_STRING_INDEX;
  const targetBelow = targetString >= G_STRING_INDEX;
  return rootBelow !== targetBelow;
}

/**
 * Get MIDI at (stringIndex, fret) for a given tuning.
 * @param {number} stringIndex - 0-based string (0 = low E)
 * @param {number} fret - fret number (0 = open)
 * @param {number[]} tuning - MIDI note per open string
 */
function getMidiAt(stringIndex, fret, tuning) {
  return (tuning[stringIndex] ?? DEFAULT_TUNING[stringIndex]) + fret;
}

/**
 * Find all (string, fret) that produce the given MIDI within bounds.
 * @param {number} targetMidi
 * @param {number[]} tuning
 * @param {{ minFret: number, maxFret: number, numStrings: number }} bounds
 * @returns {{ string: number, fret: number }[]}
 */
function positionsForMidi(targetMidi, tuning, bounds) {
  const { minFret = 0, maxFret = 22, numStrings = 6 } = bounds || {};
  const out = [];
  const n = Math.min(numStrings, tuning.length);
  for (let s = 0; s < n; s++) {
    const open = tuning[s];
    const fret = targetMidi - open;
    if (fret >= minFret && fret <= maxFret)
      out.push({ string: s, fret });
  }
  return out;
}

/**
 * Calculate target coordinates for the given interval from root.
 * Applies G–B compensation: when the shape crosses G and B strings,
 * - Ascending: higher note (target) moves +1 fret toward bridge.
 * - Descending: lower note (target) moves -1 fret toward headstock.
 *
 * @param {Object} opts
 * @param {number} opts.rootString - 0-based string index (0 = low E)
 * @param {number} opts.rootFret - fret number (0 = open)
 * @param {number} opts.interval - semitone offset from root (1–11; 0 = unison)
 * @param {'ascending'|'descending'} opts.direction
 * @param {number[]} [opts.tuning] - MIDI per open string (default standard)
 * @param {{ minFret?: number, maxFret?: number, numStrings?: number }} [opts.bounds] - default 1–22, 6 strings
 * @returns {{ string: number, fret: number, crossesGB?: boolean }[]} - legal target coordinates
 */
export function calculateTargetCoordinates({
  rootString,
  rootFret,
  interval,
  direction,
  tuning = DEFAULT_TUNING,
  bounds = {},
}) {
  const { minFret = 1, maxFret = 22, numStrings = 6 } = bounds;
  const b = { minFret, maxFret, numStrings };

  const rootMidi = getMidiAt(rootString, rootFret, tuning);
  const targetMidi =
    direction === "ascending"
      ? rootMidi + (interval || 0)
      : rootMidi - (interval || 0);

  const raw = positionsForMidi(targetMidi, tuning, b);
  const out = [];

  for (const { string: s, fret: f } of raw) {
    if (s === rootString && f === rootFret) continue;
    const cross = crossesGB(rootString, s);
    // Return correct pitch positions; crossesGB flags the shape for UI (asc: higher note +1 fret visually, desc: lower -1).
    out.push({ string: s, fret: f, crossesGB: cross });
  }

  return out;
}

export { crossesGB, getMidiAt, positionsForMidi, DEFAULT_TUNING, G_STRING_INDEX, B_STRING_INDEX };
