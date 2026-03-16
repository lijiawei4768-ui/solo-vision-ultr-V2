// ─────────────────────────────────────────────────────────────
// tokens/elevation.js — Intervals boxShadow / z-index token set
//
// LOCKED: z-index stack order per execution mother doc.
// LOCKED: FocusCard boxShadow formula (ShiftCard pattern).
// ─────────────────────────────────────────────────────────────

// ── Z-index stack ────────────────────────────────────────────
// Defined as a clear stack so no component fights another.
export const Z = {
  l0:          0,    // IntervalsStageShell (base)
  tabBar:     10,    // TabBar (above L0)
  l1:         40,    // PracticeControlSheet
  l2:         50,    // SpaceEditorL2 / FlowEditorL2 / IntervalsEditorL2
  l2Overlay:  51,    // L2 backdrop overlay
  l3:         60,    // L3 EditorShell
  l3Overlay:  61,    // L3 backdrop overlay
  tooltip:    80,    // shadcn Tooltip, PC fretboard note tooltips
  toast:      90,    // Toast notifications
};

// ── BoxShadow recipes ────────────────────────────────────────
// These are complete CSS box-shadow strings ready for style props.
//
// FocusCard uses a 3-layer shadow (Cult UI ShiftCard pattern).
// LOCKED — do not simplify to a single shadow.
export const SHADOW = {

  // FocusCard — 3-layer depth + inset rim (LOCKED)
  focusCard: [
    '0 4px 16px rgba(0,0,0,0.30)',    // outer depth layer 1
    '0 1px  4px rgba(0,0,0,0.20)',    // outer depth layer 2
    'inset 0 1px 0 rgba(255,255,255,0.12)',  // top inset rim
  ].join(', '),

  // FretboardStageCard — inset vignette only (LOCKED)
  stageShellInset: 'inset 0 6px 24px rgba(0,0,0,0.40)',

  // BottomQuickStatusBar — top inset rim only (LOCKED)
  bottomBarInset: 'inset 0 1px 0 rgba(255,255,255,0.07)',

  // TopUtilityRail icon buttons — inset rim
  iconButtonInset: 'inset 0 1px 0 rgba(255,255,255,0.05)',

  // L2 Popover / Floating Panel — subtle lift
  l2Panel: '0 2px 12px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.06)',

  // L1 Sheet — no outer shadow (frosted glass handles visual weight)
  l1Sheet: 'none',
};
