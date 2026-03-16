// ─────────────────────────────────────────────────────────────
// tokens/radius.js — Intervals border-radius token set
//
// All values are LOCKED per execution mother doc Part 5.3.
// ─────────────────────────────────────────────────────────────

export const RADIUS = {
  // Cards / Panels
  focusCard:        16,   // px — FocusCard outer shell
  stageShell:       14,   // px — FretboardStageCard outer shell
  innerDeck:        10,   // px — Inner Training Deck
  l1Sheet:          24,   // px — L1 Bottom Sheet top edge
  l2Popover:        12,   // px — L2 Popover / Floating Panel
  l3Modal:          16,   // px — L3 Modal (iPad / PC)

  // Capsules / Pills (always full-round)
  pill:            999,   // px — FindModeCapsules, preset capsules, status pills

  // Buttons / Icon areas
  iconButton:       10,   // px
  toolButton:        8,   // px — smaller utility buttons

  // PositionStrip track
  stripTrack:        3,   // px — 12-fret track strip
  stripViewport:     3,   // px — viewport highlight region

  // FretboardStageCard 0-fret capsule (mobile)
  fretCapsuleMobile: 2,   // px — micro capsule at string-name column

  // SpaceEditorL2 grid cells
  spaceGridCell:     1,   // px — nearly square

  // DrumWheel cards
  drumCard:          8,   // px

  // L3 EditorShell two-col left nav items
  l3NavItem:         4,   // px
};
