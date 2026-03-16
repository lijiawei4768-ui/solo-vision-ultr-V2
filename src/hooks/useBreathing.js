// ─────────────────────────────────────────────────────────────
// hooks/useBreathing.js — Idle breathing animation controller
//
// Provides Framer Motion animate/transition props for the
// 3 approved breathing instances defined in motion/springs.js:
//   1. FocusCard  (idle opacity pulse)
//   2. MIC pill   (active scale pulse)
//   3. L1 widgets (enabled scale pulse — Space and Flow)
//   4. BottomBar handle (always-on opacity hint)
//
// Hard rules (LOCKED — execution mother doc Part 5.5):
//   • Maximum 3 breathing instances active simultaneously.
//   • Minimum cycle period: 1.5s.
//   • All instances must have independent delay (no sync breathing).
//
// Usage:
//   const { animateProps } = useBreathing('focusCard', isIdle);
//   <motion.div animate={animateProps.animate}
//               transition={animateProps.transition} />
// ─────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { BREATHING } from '../motion/springs';

/**
 * @param {'focusCard'|'micPill'|'spaceWidget'|'flowWidget'|'bottomHandle'} type
 *   Which breathing profile to use (must match a key in BREATHING).
 * @param {boolean} enabled
 *   When false, the animation is replaced with a static (rest) state
 *   so Framer Motion stops the loop immediately.
 * @returns {{ animateProps: { animate: object, transition: object } }}
 *   Ready-to-spread props for a <motion.X> element.
 */
export function useBreathing(type, enabled) {
  const profile = BREATHING[type];

  const animateProps = useMemo(() => {
    if (!profile) {
      console.warn(`useBreathing: unknown type "${type}"`);
      return { animate: {}, transition: {} };
    }

    if (!enabled) {
      // Return rest state — Framer Motion will animate to these values
      // and then stop the loop because repeat is no longer set.
      const restAnimate = {};
      Object.keys(profile.animate).forEach((key) => {
        const val = profile.animate[key];
        // For arrays (keyframe sequences), the rest value is the middle
        // keyframe (index 1) which is the "fully awake" state.
        restAnimate[key] = Array.isArray(val) ? val[1] : val;
      });
      return {
        animate: restAnimate,
        transition: { duration: 0.3, ease: 'easeOut' },
      };
    }

    return {
      animate:    profile.animate,
      transition: profile.transition,
    };
  }, [type, enabled, profile]);

  return { animateProps };
}
