// ─────────────────────────────────────────────────────────────
// surfaceSchemes.js — Surface / Material Axis
// Solo Vision Ultra Theme System v2.0
//
// 6 surface materials — controls card/panel appearance
//
// Fields:
//   blur         — CSS backdrop-filter blur value
//   saturate     — CSS saturate() value in %
//   lightAlpha   — white alpha for light mode glass base (0-1)
//   darkAlpha    — dark tinted alpha for dark mode (0-1)
//   borderAlpha  — border opacity multiplier
//   insetHighlight — CSS inset box-shadow for glass sheen
//   noiseOverlay — whether to add grain noise layer
//   noiseOpacity — opacity of noise layer (0-1)
//   shadowStrength — "none" | "soft" | "medium" | "strong"
// ─────────────────────────────────────────────────────────────

export const SURFACE_SCHEMES = {

  "glass-hi": {
    id:             "glass-hi",
    name:           "High Gloss",
    nameZh:         "高透玻璃",
    // Maximum transparency — background fully visible through cards
    blur:           "blur(28px)",
    saturate:       180,
    lightAlpha:     0.62,
    darkAlpha:      0.55,
    borderAlpha:    1.0,
    insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.96)",
    noiseOverlay:   false,
    noiseOpacity:   0,
    shadowStrength: "soft",
    // shadow values per mode
    shadowDark:     "0 2px 22px rgba(0,0,0,0.30)",
    shadowLight:    "0 2px 22px rgba(60,70,150,0.08)",
  },

  "glass-mid": {
    id:             "glass-mid",
    name:           "Standard Glass",
    nameZh:         "标准玻璃",
    // Default — balanced opacity and blur
    blur:           "blur(20px)",
    saturate:       180,
    lightAlpha:     0.76,
    darkAlpha:      0.65,
    borderAlpha:    1.0,
    insetHighlight: "inset 0 0.5px 0 rgba(255,255,255,0.90)",
    noiseOverlay:   false,
    noiseOpacity:   0,
    shadowStrength: "medium",
    shadowDark:     "0 2px 16px rgba(0,0,0,0.25)",
    shadowLight:    "0 2px 16px rgba(60,70,150,0.08)",
  },

  "glass-lo": {
    id:             "glass-lo",
    name:           "Frosted",
    nameZh:         "磨砂玻璃",
    // Low transparency — near-opaque, content readable in any background
    blur:           "blur(14px)",
    saturate:       160,
    lightAlpha:     0.88,
    darkAlpha:      0.78,
    borderAlpha:    0.8,
    insetHighlight: "inset 0 0.5px 0 rgba(255,255,255,0.80)",
    noiseOverlay:   false,
    noiseOpacity:   0,
    shadowStrength: "none",
    shadowDark:     "0 1px 8px rgba(0,0,0,0.20)",
    shadowLight:    "0 1px 8px rgba(60,70,150,0.06)",
  },

  "frosted-vivid": {
    id:             "frosted-vivid",
    name:           "Vivid Frost",
    nameZh:         "霜感浓色",
    // Higher saturation — colors bleed through more vividly
    blur:           "blur(24px)",
    saturate:       220,
    lightAlpha:     0.68,
    darkAlpha:      0.58,
    borderAlpha:    1.2,
    insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.94)",
    noiseOverlay:   false,
    noiseOpacity:   0,
    shadowStrength: "medium",
    shadowDark:     "0 4px 24px rgba(0,0,0,0.28)",
    shadowLight:    "0 4px 20px rgba(60,70,150,0.10)",
  },

  "solid": {
    id:             "solid",
    name:           "Solid",
    nameZh:         "实体卡片",
    // No backdrop-filter — fully opaque, best performance on low-end devices
    blur:           "none",
    saturate:       100,
    lightAlpha:     0.97,
    darkAlpha:      0.94,
    borderAlpha:    0.8,
    insetHighlight: null,
    noiseOverlay:   false,
    noiseOpacity:   0,
    shadowStrength: "strong",
    shadowDark:     "0 4px 20px rgba(0,0,0,0.40)",
    shadowLight:    "0 2px 12px rgba(0,0,0,0.12)",
  },

  "grain-surface": {
    id:             "grain-surface",
    name:           "Paper Grain",
    nameZh:         "颗粒纸质",
    // Subtle noise texture overlaid on glass — natural, tactile
    blur:           "blur(18px)",
    saturate:       160,
    lightAlpha:     0.78,
    darkAlpha:      0.68,
    borderAlpha:    0.7,
    insetHighlight: null,
    noiseOverlay:   true,
    noiseOpacity:   0.055,
    shadowStrength: "none",
    shadowDark:     "0 1px 8px rgba(0,0,0,0.18)",
    shadowLight:    "0 1px 8px rgba(0,0,0,0.06)",
  },
};

export const SURFACE_SCHEME_KEYS = Object.keys(SURFACE_SCHEMES);
export const DEFAULT_SURFACE = "glass-mid";

// ── Helper: compute the CSS backdrop-filter string ────────────
export function getSurfaceFilter(surface) {
  if (!surface || surface.blur === "none") return "none";
  return `${surface.blur} saturate(${surface.saturate}%)`;
}

// ── Helper: compute glass background rgba ────────────────────
export function getSurfaceBg(surface, glassBase, isDark) {
  if (!surface) return glassBase;
  // For solid, ignore glassBase alpha and push to opaque
  if (surface.id === "solid") {
    // Replace alpha in glassBase with surface alpha
    return glassBase.replace(/[\d.]+\)$/, `${isDark ? surface.darkAlpha : surface.lightAlpha})`);
  }
  // For all glass variants, scale the alpha by surface factor
  const targetAlpha = isDark ? surface.darkAlpha : surface.lightAlpha;
  return glassBase.replace(/[\d.]+\)$/, `${targetAlpha})`);
}
