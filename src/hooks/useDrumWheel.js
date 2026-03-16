// ─────────────────────────────────────────────────────────────
// hooks/useDrumWheel.js — Drum Wheel drag/snap logic
//
// Encapsulates the vertical drag + velocity-snap behaviour
// shared by ModeStack and IntervalsStack in L1.
//
// Behaviour spec (execution mother doc Part 3.4):
//   • 1:1 drag follow (no rubber-band)
//   • On release: snap to nearest item
//   • velocity > VELOCITY_THRESHOLD → jump one extra item
//   • Supports circular looping: items[Math.abs(idx % items.length)]
//   • Visible window: current card + 1 adjacent each side (3 total)
//
// Uses useUnifiedGesture from existing useGestures.js for
// touch+mouse unification. No new gesture primitives added.
//
// Motion: allowed / Scroll Stack
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useCallback } from 'react';
import { useSpring } from 'framer-motion';
import { SPRINGS_IV } from '../motion/springs';
import { useUnifiedGesture } from './useGestures';

// px/s threshold for "flick to next" — initialSuggested
const VELOCITY_THRESHOLD = 300;

// Card height visible as "current" card in the wheel — initialSuggested
// Adjacent cards are shown at half this height, clipped.
const CARD_HEIGHT = 54; // px
const ADJACENT_HEIGHT = 28; // px — partially visible adjacent card
const TOTAL_SLOT = CARD_HEIGHT + ADJACENT_HEIGHT; // approx slot spacing

/**
 * @param {Array<{id: string, label: string, sublabel?: string}>} items
 * @param {string}   initialId   — id of the initially selected item
 * @param {Function} onSelect    — called with the selected item's id when snap completes
 *
 * @returns {{
 *   selectedId: string,
 *   dragY: import('framer-motion').MotionValue,   // for the wheel container translateY
 *   gestureHandlers: object,                       // spread onto the drag target
 *   getItemState: (id: string) => 'current'|'adjacent'|'hidden',
 *   currentIndex: number,
 * }}
 */
export function useDrumWheel(items, initialId, onSelect) {
  const initialIndex = Math.max(0, items.findIndex(it => it.id === initialId));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // dragY is the raw visual offset during drag — spring-animated
  // We use a plain spring value so the snap animation uses SPRINGS_IV.drumSnap
  const dragY = useSpring(0, SPRINGS_IV.drumSnap);

  // Refs to track gesture state without re-renders
  const startY       = useRef(0);
  const startOffset  = useRef(0); // dragY value at gesture start
  const lastY        = useRef(0);
  const lastTime     = useRef(0);
  const velocityRef  = useRef(0);

  // Normalise index with wrap-around
  const wrapIndex = useCallback((idx) => {
    const n = items.length;
    return ((idx % n) + n) % n;
  }, [items.length]);

  const snapTo = useCallback((targetIndex) => {
    const wrapped = wrapIndex(targetIndex);
    setCurrentIndex(wrapped);
    // Animate dragY back to 0 (the neutral position for the current card)
    dragY.set(0);
    onSelect?.(items[wrapped].id);
  }, [wrapIndex, dragY, items, onSelect]);

  const gestureHandlers = useUnifiedGesture({
    onStart: ({ y }) => {
      startY.current      = y;
      startOffset.current = 0; // always start fresh from neutral
      lastY.current       = y;
      lastTime.current    = performance.now();
      velocityRef.current = 0;
    },

    onMove: ({ y }) => {
      const now       = performance.now();
      const dt        = now - lastTime.current;
      const dy        = y - lastY.current;

      // Compute instantaneous velocity (px/s)
      if (dt > 0) {
        velocityRef.current = (dy / dt) * 1000;
      }

      lastY.current  = y;
      lastTime.current = now;

      // Update visual offset: 1:1, no rubber-band
      const rawDelta = y - startY.current;
      dragY.set(rawDelta);
    },

    onEnd: () => {
      const totalDelta = dragY.get();
      const v          = velocityRef.current;

      // How many slots did the user drag?
      let slotDelta = -Math.round(totalDelta / TOTAL_SLOT);

      // Flick bonus: if velocity exceeds threshold, jump one extra slot
      if (Math.abs(v) > VELOCITY_THRESHOLD) {
        slotDelta += v < 0 ? 1 : -1;
      }

      snapTo(currentIndex + slotDelta);
    },
  });

  /**
   * Returns the display state of each item relative to currentIndex.
   * Components use this to set scale, opacity, and clip.
   */
  const getItemState = useCallback((id) => {
    const idx = items.findIndex(it => it.id === id);
    if (idx === -1) return 'hidden';
    const n    = items.length;
    const diff = ((idx - currentIndex) % n + n) % n;
    // Normalise to range [-floor(n/2), floor(n/2)]
    const adjusted = diff > Math.floor(n / 2) ? diff - n : diff;
    if (adjusted === 0)           return 'current';
    if (Math.abs(adjusted) === 1) return 'adjacent';
    return 'hidden';
  }, [currentIndex, items]);

  return {
    selectedId:     items[currentIndex]?.id ?? null,
    currentIndex,
    dragY,
    gestureHandlers,
    getItemState,
  };
}
