// ─────────────────────────────────────────────────────────────
// hooks/useFretboardViewport.js — Viewport offset & tracking
//
// Computes the optimal 5-fret viewport window for a question
// and animates the SVG translateX with spring inertia.
//
// Spec (execution mother doc Part 4.6):
//   • Viewport shows 5 frets by default.
//   • When rootFret and targetFret are > 5 frets apart,
//     viewport expands to include both. (initialSuggested)
//   • New question: viewport starts moving 100ms BEFORE
//     FocusCard content updates. Caller is responsible for
//     the 100ms delay on the content side.
//   • Spring: SPRINGS_IV.viewportTrack (stiffness/damping/mass)
//
// Coordinate convention:
//   fret 0 = left edge of the SVG.
//   SVG x-pixel = fret × fretPxWidth.
//   The motion.g layer gets a negative translateX to scroll right.
//
// Usage:
//   const { offsetX, viewportMin, viewportMax, updateQuestion } =
//     useFretboardViewport({ fretPxWidth: 32, totalFrets: 12 });
//
//   // On question change (call this BEFORE updating FocusCard):
//   updateQuestion(rootFret, targetFret);
//
//   // In SVG:
//   <motion.g style={{ x: offsetX }}>…</motion.g>
//   <PositionStripPro viewportMin={viewportMin} viewportMax={viewportMax} />
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { useSpring, useTransform } from 'framer-motion';
import { SPRINGS_IV } from '../motion/springs';

const DEFAULT_VIEWPORT_WIDTH = 5;  // frets — initialSuggested
const TOTAL_FRETS             = 12; // full fretboard length

/**
 * @param {object} opts
 * @param {number} opts.fretPxWidth  — pixel width of one fret slot
 * @param {number} [opts.totalFrets] — total frets on the model (default 12)
 * @param {number} [opts.viewportWidth] — visible frets (default 5)
 */
export function useFretboardViewport({
  fretPxWidth,
  totalFrets    = TOTAL_FRETS,
  viewportWidth = DEFAULT_VIEWPORT_WIDTH,
} = {}) {

  // rawOffset is the raw fret index of the left edge of the viewport.
  // useSpring applies inertia so changes feel physical.
  // Motion: allowed / fretboard viewport tracking
  const rawOffset = useSpring(0, SPRINGS_IV.viewportTrack);

  // viewportMin/Max are the fret indices of the visible window.
  // Stored as plain state so PositionStripPro can read them without
  // subscribing to a MotionValue.
  const [viewportMin, setViewportMin] = useState(0);
  const [viewportMax, setViewportMax] = useState(viewportWidth - 1);

  /**
   * Compute the best viewport left-edge for a given pair of frets.
   * Tries to center both frets in the window; clamps to valid range.
   */
  const computeOptimalOffset = useCallback((rootFret, targetFret) => {
    const lo     = Math.min(rootFret, targetFret);
    const hi     = Math.max(rootFret, targetFret);
    const span   = hi - lo;

    // If span fits inside the default window, center it
    let effectiveWidth = viewportWidth;
    if (span >= viewportWidth) {
      // Expand window just enough to include both frets (initialSuggested)
      effectiveWidth = span + 1;
    }

    // Ideal left edge: center the span in the window
    const idealLeft = Math.round(lo + span / 2 - effectiveWidth / 2);
    const clampedLeft = Math.max(0, Math.min(idealLeft, totalFrets - effectiveWidth));

    return { left: clampedLeft, width: effectiveWidth };
  }, [viewportWidth, totalFrets]);

  /**
   * Called when a new question is generated.
   * The viewport starts moving immediately.
   * FocusCard content should update 100ms later (caller's responsibility).
   *
   * @param {number} rootFret    — 0-based fret index of the root note
   * @param {number} targetFret  — 0-based fret index of the target note
   */
  const updateQuestion = useCallback((rootFret, targetFret) => {
    const { left, width } = computeOptimalOffset(rootFret, targetFret);

    // Update viewport bounds for PositionStripPro
    setViewportMin(left);
    setViewportMax(left + width - 1);

    // Animate the SVG g layer: negative offset scrolls right
    // rawOffset is in FRET units; caller multiplies by fretPxWidth
    rawOffset.set(-left);
  }, [computeOptimalOffset, rawOffset]);

  // Transform fret offset → pixel offset for SVG translateX
  // If fretPxWidth is provided, expose a pixel MotionValue directly.
  // If not provided (responsive), caller multiplies manually.
  const offsetX = fretPxWidth
    ? useTransform(rawOffset, v => v * fretPxWidth)
    : rawOffset; // caller applies fretPxWidth in the SVG style

  return {
    offsetX,       // MotionValue — spread into <motion.g style={{ x: offsetX }}>
    rawOffset,     // MotionValue in fret units — use if fretPxWidth changes dynamically
    viewportMin,   // number — for PositionStripPro
    viewportMax,   // number — for PositionStripPro
    updateQuestion,
  };
}
