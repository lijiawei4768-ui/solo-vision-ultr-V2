// ─────────────────────────────────────────────────────────────
// tokens/blur.js — Intervals backdrop-filter blur token set
//
// All values LOCKED per execution mother doc Part 5.1.
// ─────────────────────────────────────────────────────────────

export const BLUR = {
  // Component backdrop blurs (CSS backdrop-filter strings)
  focusCard:     'blur(20px)',   // FocusCard outer shell
  bottomBar:     'blur(24px)',   // BottomQuickStatusBar
  l1Sheet:       'blur(40px)',   // L1 PracticeControlSheet
  l2Panel:       'blur(20px)',   // L2 Popover / Floating Panel

  // Content transition blur (applied to FocusCard content on question change)
  // This is a filter (not backdrop-filter) applied to the inner text layer
  contentExit:   'blur(6px)',    // blur out on exit
  contentEnter:  'blur(6px)',    // start blurred on enter, animate to 0

  // L0 scale+blur when L1 is open (applied to IntervalsStageShell)
  // backdrop-filter is expensive; use filter here for the whole stage
  l0WhenL1Open:  'blur(4px)',    // filter on L0 stage when L1 is visible
};
