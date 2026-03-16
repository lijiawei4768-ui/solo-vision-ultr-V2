// ─────────────────────────────────────────────────────────────
// tokens/typography.js — Intervals typography token set
//
// Font families re-export the existing theme.js constants to
// avoid duplication — FONT_DISPLAY / FONT_TEXT / FONT_MONO
// already live in src/theme.js. This file adds the size/weight
// scale that was missing from theme.js.
//
// LOCKED: scale names and their roles.
// INITIAL SUGGESTED: exact px values (may shift ±2px after
//   real-device visual testing).
// ─────────────────────────────────────────────────────────────

// Re-export font stacks from theme.js to keep a single source
// of truth. Components should import font families from here,
// not directly from theme.js.
export {
  FONT_DISPLAY,
  FONT_TEXT,
  FONT_MONO,
} from '../theme';

// ── Type scale ───────────────────────────────────────────────
// fontSize values in px. All initialSuggested — verify on device.
export const TYPE = {
  // Display / Hero — FocusCard target tone name
  displayLg:  { size: 40, weight: 700, font: 'FONT_DISPLAY' },  // initialSuggested
  displayMd:  { size: 32, weight: 700, font: 'FONT_DISPLAY' },  // initialSuggested

  // Title — L2/L3 panel titles
  titleLg:    { size: 24, weight: 500, font: 'FONT_TEXT' },
  titleMd:    { size: 20, weight: 500, font: 'FONT_TEXT' },

  // Section — component block headers
  sectionMd:  { size: 18, weight: 500, font: 'FONT_TEXT' },

  // Body — list items, descriptions
  bodyMd:     { size: 16, weight: 400, font: 'FONT_TEXT' },
  bodySm:     { size: 14, weight: 400, font: 'FONT_TEXT' },

  // Label / Caption — muted helper text
  labelMd:    { size: 13, weight: 400, font: 'FONT_TEXT' },
  labelSm:    { size: 12, weight: 400, font: 'FONT_TEXT' },

  // Micro — PositionStrip viewport range, fret markers
  micro:      { size: 10, weight: 400, font: 'FONT_MONO' },

  // Mode card labels
  modeEN:     { size: 13, weight: 500, font: 'FONT_TEXT' },   // EN primary label
  modeCN:     { size: 11, weight: 400, font: 'FONT_TEXT' },   // CN secondary (system font)

  // FocusCard task hint (above the main tone name)
  focusHint:  { size: 12, weight: 400, font: 'FONT_TEXT' },   // muted, uppercase

  // FocusCard interval mark (below the tone name)
  focusMark:  { size: 14, weight: 400, font: 'FONT_TEXT' },
};

// ── Color aliases (semantic, not theme-specific) ──────────────
// These map to rgba values that apply on the dark background.
// Actual themed colors come from getTokensForTheme() in theme.js.
// These aliases define the opacity ladder that forms the type
// hierarchy on dark surfaces.
export const TYPE_COLOR = {
  primary:   'rgba(255,255,255,0.95)',
  secondary: 'rgba(255,255,255,0.75)',
  tertiary:  'rgba(255,255,255,0.45)',
  hint:      'rgba(255,255,255,0.35)',
};

// ── Numeric formatting ────────────────────────────────────────
// All numbers shown in the UI must use tabular-nums to prevent
// layout jitter when digits change.
export const TABULAR_NUMS = {
  fontVariantNumeric: 'tabular-nums',
};
