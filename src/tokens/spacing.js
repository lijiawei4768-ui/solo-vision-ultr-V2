// ─────────────────────────────────────────────────────────────
// tokens/spacing.js — Intervals spacing token set
//
// Locked values: component-internal padding and gap sizes
//   that come directly from the execution mother doc.
// Initial suggested values: clamp heights for L0 layout zones.
//   These MUST be verified on real devices before being treated
//   as final. Do not hardcode these inside components — always
//   import from this file so a single change propagates.
//
// Usage:
//   import { SPACING } from '../tokens/spacing';
//   style={{ height: SPACING.focusCardMobile }}
// ─────────────────────────────────────────────────────────────

// ── Component-internal padding (LOCKED) ─────────────────────
export const SPACING = {

  // Inner Training Deck padding (FretboardStageCard)
  // Locked — execution mother doc Part 2.5
  fretDeckPadTop:    12,   // px
  fretDeckPadBottom: 16,   // px — extra room for fret numbers
  fretDeckPadLeft:   8,    // px — room for 0-fret string labels
  fretDeckPadRight:  8,    // px

  // FocusCard horizontal padding per platform
  focusCardPadMobile: 16,  // px — LOCKED
  focusCardPadTablet: 20,  // px — LOCKED
  focusCardPadPc:     20,  // px — LOCKED

  // BottomQuickStatusBar handle dimensions (LOCKED)
  handleWidth:  40,   // px
  handleHeight:  4,   // px
  handleRadius:  2,   // px

  // L1 PracticeControlSheet internal gaps (LOCKED)
  l1CardGap:         8,   // px — gap between grid cells
  l1RowGap:          8,   // px — gap between top/bottom rows
  l1SectionPadding:  4,   // px

  // L2 SpaceEditorL2 grid (LOCKED)
  spaceGridCellMobile: 26,  // px — cell size on mobile
  spaceGridCellTablet: 22,  // px — cell size on iPad / PC
  spaceGridGap:         4,  // px — gap between grid cells

  // L3 EditorShell chrome heights (LOCKED)
  l3HeaderHeight: 52,  // px
  l3FooterHeight: 56,  // px

  // TopUtilityRail (LOCKED)
  topRailHeightMobile: 50,  // px
  topRailHeightTablet: 56,  // px
  // PC: TopUtilityRail is embedded inside TopToolbar (52px)

  // TabBar (LOCKED)
  tabBarHeightMobile: 60,  // px
  tabBarHeightTablet: 68,  // px

  // PC Toolbar (LOCKED)
  pcToolbarHeight: 52,  // px

  // FindModeCapsules (LOCKED)
  modeCapsuleHeightMobile: 36,  // px
  modeCapsuleHeightTablet: 40,  // px
  modeCapsuleHeightPc:     38,  // px

  // PositionStripPro heights (LOCKED)
  positionStripHeightMobile: 18,  // px
  positionStripHeightTablet: 20,  // px

  // BottomQuickStatusBar heights (LOCKED)
  bottomStatusHeightMobile: 56,  // px
  bottomStatusHeightTablet: 60,  // px
  bottomStatusHeightPc:     52,  // px

  // PC Stage max-width (LOCKED — must never be exceeded)
  pcStageMaxWidth: 680,  // px

  // iPad L1 panel width (LOCKED)
  ipadPanelWidthPortrait:  220,  // px
  ipadPanelWidthLandscape: 240,  // px

  // PC L1 panel width (LOCKED)
  pcPanelWidth: 200,  // px

  // iPad / PC L2 Popover / Floating Panel width (LOCKED)
  l2PanelWidth: 300,  // px

  // L2 FlowEditor settle delay (INITIAL SUGGESTED — needs motion testing)
  // eslint-disable-next-line no-unused-vars
  flowL2SettleDelayMs: 100,  // ms — initialSuggested

  // ── L0 breathing spacers — min/max bounds (LOCKED structural rule,
  //    actual rendered size is flex between min and max)
  spacerAMin: 8,   spacerAMax: 24,  // px — above fretboard (mobile)
  spacerBMin: 6,   spacerBMax: 18,  // px — below fretboard (mobile)

  spacerAMinTablet: 12,  spacerAMaxTablet: 36,
  spacerBMinTablet: 10,  spacerBMaxTablet: 28,

  spacerAMinPcL: 4,  spacerAMaxPcL: 16,   // iPad Landscape
  spacerBMinPcL: 4,  spacerBMaxPcL: 12,

  spacerAMinPc: 16,  spacerAMaxPc: 40,    // PC
  // no Spacer B on PC (BottomBar follows directly)
};

// ── L0 zone heights — INITIAL SUGGESTED VALUES ───────────────
// All clamp() strings. Verified on device before promoting to LOCKED.
// Use CSS clamp() directly; these strings are ready for style props.
export const HEIGHT = {
  // Mobile 390×844
  focusCardMobile:   'clamp(185px, 29dvh, 245px)',  // initialSuggested
  fretboardMobile:   'clamp(130px, 20dvh, 170px)',  // initialSuggested

  // iPad Portrait 768×1024
  focusCardTabletP:  'clamp(210px, 26dvh, 280px)',  // initialSuggested
  fretboardTabletP:  'clamp(150px, 18dvh, 200px)',  // initialSuggested

  // iPad Landscape 1024×768
  focusCardTabletL:  'clamp(160px, 24dvh, 210px)',  // initialSuggested
  fretboardTabletL:  'clamp(120px, 17dvh, 155px)',  // initialSuggested

  // PC ≥1200
  focusCardPc:       'clamp(200px, 28vh,  260px)',  // initialSuggested
  fretboardPc:       'clamp(140px, 18vh,  180px)',  // initialSuggested
};
