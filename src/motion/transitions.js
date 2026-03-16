// ─────────────────────────────────────────────────────────────
// motion/transitions.js — Layer transition variant definitions
//
// Provides Framer Motion variants for L3 page push and modal
// transitions. These are consumed by L3EditorShell.jsx.
//
// All timing values are INITIAL SUGGESTED.
// Motion whitelist rules are tagged per variant.
// ─────────────────────────────────────────────────────────────
import { SPRINGS_IV } from './springs';

// ── L3 Page Push (Mobile / iPad Portrait) ─────────────────────
// The outgoing layer (L2 or L1 visible behind) recedes while
// the incoming L3 panel slides in from the right.
// Motion: allowed / page push transition

export const pagePushVariants = {
  // Incoming L3 panel
  enter: {
    initial: { x: '100%', opacity: 1 },
    animate: { x: 0,      opacity: 1, transition: SPRINGS_IV.pagePush },
    exit:    { x: '100%', opacity: 1, transition: SPRINGS_IV.pagePush },
  },
  // Outgoing (receding) layer — applied to the layer behind
  recede: {
    initial: { x: 0,     scale: 1,    opacity: 1 },
    animate: { x: -24,   scale: 0.97, opacity: 0.7, transition: SPRINGS_IV.pagePush },
    exit:    { x: 0,     scale: 1,    opacity: 1,   transition: SPRINGS_IV.pagePush },
  },
};

// ── L3 Centered Modal (iPad Landscape / PC) ───────────────────
// Motion: allowed / page push transition (modal variant)

export const modalVariants = {
  // Overlay backdrop
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit:    { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
  },
  // Modal panel itself
  panel: {
    initial: { scale: 0.94, opacity: 0 },
    animate: { scale: 1,    opacity: 1, transition: SPRINGS_IV.modalOpen },
    exit:    { scale: 0.94, opacity: 0, transition: SPRINGS_IV.modalOpen },
  },
};

// ── L1 Side Panel (iPad / PC) ─────────────────────────────────
// Direction-aware: iPad slides from right, PC slides from left.
// Caller passes `direction: 'left' | 'right'` to select the
// correct translateX direction.
// Motion: allowed / side panel reveal

export function sidePanelVariants(direction = 'right') {
  const offscreen = direction === 'right' ? '100%' : '-100%';
  return {
    initial: { x: offscreen, opacity: 1 },
    animate: { x: 0,         opacity: 1, transition: SPRINGS_IV.panelReveal },
    exit:    { x: offscreen, opacity: 1, transition: SPRINGS_IV.panelReveal },
  };
}

// ── L2 Popover (iPad / PC) — scale+opacity ────────────────────
// Motion: allowed / shared-layout expand (popover variant)

export const popoverVariants = {
  initial: { scale: 0.92, opacity: 0 },
  animate: { scale: 1,    opacity: 1, transition: SPRINGS_IV.layerExpand },
  exit:    { scale: 0.92, opacity: 0, transition: SPRINGS_IV.layerExpand },
};

// ── Zone Rail reveal (Collapsible height animate) ──────────────
// Motion: allowed / Zone rail reveal / collapse

export const zoneRailVariants = {
  hidden:  { height: 0,      opacity: 0, overflow: 'hidden' },
  visible: { height: 'auto', opacity: 1, overflow: 'hidden',
             transition: SPRINGS_IV.zoneReveal },
};

// ── Stagger container for IntervalsEditorL2 Custom grid ───────
// Motion: allowed / Space DragSelectGrid (stagger part)

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,  // 40ms per item — initialSuggested
      delayChildren: 0,
    },
  },
};

export const staggerItem = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: SPRINGS_IV.noteAppear },
};
