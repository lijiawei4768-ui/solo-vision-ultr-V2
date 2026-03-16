// ─────────────────────────────────────────────────────────────
// motion/springs.js — Intervals spring constant registry
//
// ALL values in this file are INITIAL SUGGESTED VALUES.
// They must be verified through motion perception testing on
// real devices before being promoted to locked constants.
//
// Rule (from execution mother doc Part 8.2):
//   Components must IMPORT a named constant from this file.
//   No component may hardcode stiffness/damping/mass numbers.
//   This ensures a single change here propagates everywhere.
//
// Existing SPRINGS from src/theme.js are intentionally NOT
// duplicated here. Intervals-specific springs live here;
// shared app-wide springs remain in theme.js.
//
// Usage:
//   import { SPRINGS_IV } from '../motion/springs';
//   transition={SPRINGS_IV.sheetOpen}
// ─────────────────────────────────────────────────────────────

// ── Motion classification comments (Build Plan Phase 7.1) ────
// Every spring constant below is tagged with the whitelist rule
// it satisfies. Cursor/AI must add the corresponding comment
// in the component code when the spring is applied:
//   // Motion: allowed / <rule>

export const SPRINGS_IV = {

  // ── Layer transitions ──────────────────────────────────────

  // L1 Bottom Sheet open / close
  // Motion: allowed / sheet present / dismiss
  // initialSuggested
  sheetOpen: { type: 'spring', stiffness: 380, damping: 38, mass: 1 },
  sheetClose: { type: 'spring', stiffness: 380, damping: 38, mass: 1 },

  // L2 shared layout expand from source module
  // Motion: allowed / shared-layout expand
  // initialSuggested
  layerExpand: { type: 'spring', stiffness: 380, damping: 36, mass: 1 },

  // FlowEditorL2 second-phase centered settle
  // Motion: allowed / Flow center expand / Focus-mode preset list
  // initialSuggested
  flowSettle: { type: 'spring', stiffness: 320, damping: 38, mass: 1 },

  // L3 page push — both layers animate simultaneously
  // Motion: allowed / page push transition
  // initialSuggested
  pagePush: { type: 'spring', stiffness: 340, damping: 36, mass: 1 },

  // L3 centered Modal open (iPad Landscape / PC)
  // Motion: allowed / page push transition
  // initialSuggested
  modalOpen: { type: 'spring', stiffness: 360, damping: 34, mass: 1 },

  // L1 iPad/PC side panel slide in
  // Motion: allowed / side panel reveal
  // initialSuggested
  panelReveal: { type: 'spring', stiffness: 380, damping: 38, mass: 1 },

  // ── Content transitions ────────────────────────────────────

  // FocusCard content swap (question change)
  // Motion: allowed / FocusCard content transition
  // initialSuggested
  contentSwap: { type: 'spring', stiffness: 360, damping: 30, mass: 1 },

  // Fretboard note markers appear on new question
  // Motion: allowed / fretboard viewport tracking (marker appear part)
  // initialSuggested
  noteAppear: { type: 'spring', stiffness: 360, damping: 28, mass: 1 },

  // ── Viewport tracking ──────────────────────────────────────

  // FretboardViewport translateX inertia follow
  // Motion: allowed / fretboard viewport tracking
  // initialSuggested — used as useSpring config, not transition prop
  viewportTrack: { stiffness: 280, damping: 28, mass: 0.8 },

  // PositionStrip viewport window slide
  // Motion: allowed / PositionStrip spring tracking
  // initialSuggested — used as useSpring config
  stripTrack: { stiffness: 280, damping: 28, mass: 0.8 },

  // ── Controls ───────────────────────────────────────────────

  // FindModeCapsules sliding pill indicator (layoutId)
  // Motion: allowed / top button micro-interaction
  // initialSuggested
  pillSlide: { type: 'spring', stiffness: 400, damping: 34, mass: 1 },

  // TabBar sliding active indicator
  // Motion: allowed / top button micro-interaction
  // initialSuggested
  tabSlide: { type: 'spring', stiffness: 400, damping: 34, mass: 1 },

  // Button press / icon tap scale feedback
  // Motion: allowed / top button micro-interaction
  // initialSuggested
  buttonPress: { type: 'spring', stiffness: 400, damping: 20, mass: 1 },

  // Drum Wheel snap-to-nearest card
  // Motion: allowed / Scroll Stack
  // initialSuggested
  drumSnap: { type: 'spring', stiffness: 460, damping: 28, mass: 0.8 },

  // SpaceEditorL2 grid cell select feedback
  // Motion: allowed / Space DragSelectGrid
  // initialSuggested — intentionally stiff for tactile feel
  gridCellSelect: { type: 'spring', stiffness: 600, damping: 20, mass: 1 },

  // Preset capsule select bounce
  // Motion: allowed / shared-layout expand (secondary feedback)
  // initialSuggested
  capsuleSelect: { type: 'spring', stiffness: 500, damping: 22, mass: 1 },

  // Zone Rail reveal / collapse (height animation)
  // Motion: allowed / Zone rail reveal / collapse
  // initialSuggested
  zoneReveal: { type: 'spring', stiffness: 380, damping: 36, mass: 1 },
};

// ── Breathing animation config ────────────────────────────────
// These are NOT spring configs — they are Framer Motion
// animate + transition props for the useBreathing hook.
// Motion: allowed / very light ambient alive sense
// All initialSuggested — test in real practice session.

export const BREATHING = {
  // FocusCard — while waiting for answer input
  focusCard: {
    animate: { opacity: [0.95, 1, 0.95] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0 },
    // initialSuggested
  },

  // MIC pill — while microphone is actively listening
  micPill: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0 },
    // initialSuggested
  },

  // L1 Space Widget — while space setting is non-default
  spaceWidget: {
    animate: { scale: [1, 1.008, 1] },
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
    // initialSuggested — delay offset prevents sync with Flow widget
  },

  // L1 Flow Widget — while flow setting is non-default
  flowWidget: {
    animate: { scale: [1, 1.008, 1] },
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.4 },
    // initialSuggested — delay offset prevents sync with Space widget
  },

  // BottomQuickStatusBar handle — always-on idle hint
  bottomHandle: {
    animate: { opacity: [0.4, 0.6, 0.4] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 },
    // initialSuggested
  },
};
