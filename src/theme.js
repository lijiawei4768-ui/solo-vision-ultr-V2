// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS v6.0 — Solo Vision Ultra
//
// v6.0 — Three-Axis Theme System
//   NEW: getTokensV2({ bgScheme, accentId, surfaceId })
//        Compose tokens from three independent axes.
//
//   COMPAT: getTokensForTheme(themeId) still works via
//           LEGACY_TO_PRESET mapping in theme/presets.js
//
//   Trimmed to 11 curated themes (was 23):
//     Dark  (5): indigo-night, slate-ocean, jade-whisper, mauve-void, warm-noir
//     Light (6): ios-light, sky-mist, petal-breeze, sage-cloud, linen-dusk,
//                frost-iris, svu-light
//
//   buildTheme() fixed: all themes get correct semantic colors
//   (positive/warning/negative no longer special-cased to svu-light only)
//
// All existing named exports are preserved:
//   DT, LT, THEMES, THEME_GROUPS, PALETTE_KEYS, PALETTE_DEFS,
//   SPRINGS, FONT_DISPLAY, FONT_TEXT, FONT_MONO,
//   getTokensForTheme, getTheme
// ─────────────────────────────────────────────────────────────

import {
  BG_SCHEMES,
  DARK_BG_SCHEMES,
  LIGHT_BG_SCHEMES,
  RECOMMENDED_DARK_BG_SCHEMES,
  RECOMMENDED_LIGHT_BG_SCHEMES,
  DEFAULT_BG_DARK,
  DEFAULT_BG_LIGHT,
} from './theme/bgSchemes.js';
import { ACCENT_SCHEMES, ACCENT_SCHEME_KEYS, DEFAULT_ACCENT_DARK, DEFAULT_ACCENT_LIGHT } from './theme/accentSchemes.js';
import { SURFACE_SCHEMES, SURFACE_SCHEME_KEYS, DEFAULT_SURFACE, getSurfaceFilter, getSurfaceBg } from './theme/surfaceSchemes.js';
import { CURATED_DARK_THEME_IDS, CURATED_LIGHT_THEME_IDS, LEGACY_TO_PRESET, DEFAULT_PRESET, PRESETS, PRESET_KEYS } from './theme/presets.js';
import { PALETTE_REFERENCES } from './theme/paletteReferences.js';

// ── Fonts ─────────────────────────────────────────────────────
export const FONT_DISPLAY = "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif";
export const FONT_TEXT    = "'SF Pro Text',    -apple-system, 'Helvetica Neue', sans-serif";
export const FONT_MONO    = "'SF Mono', 'Fira Code', 'Courier New', monospace";

// ── Utility ───────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(167,139,250,${alpha})`;
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
    const m = hex.match(/[\d.]+/g);
    if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${alpha})`;
    return hex;
  }
  if (hex.startsWith("linear-gradient")) return hex;
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseBlurPx(blur) {
  if (!blur || blur === "none") return 0;
  const match = String(blur).match(/blur\(([\d.]+)px\)/);
  return match ? parseFloat(match[1]) : 0;
}

function scaleRgbaAlpha(input, scale) {
  if (!input || typeof input !== "string") return input;
  return input.replace(/rgba\(([^)]+),\s*([\d.]+)\)/g, (_, rgb, alpha) => {
    const nextAlpha = clamp(parseFloat(alpha) * scale, 0, 1);
    return `rgba(${rgb},${nextAlpha.toFixed(3)})`;
  });
}

// ── Springs ───────────────────────────────────────────────────
export const SPRINGS = {
  tabSwitch:      { type:"spring", stiffness:320, damping:30, mass:1.0 },
  pageTransition: { type:"spring", stiffness:260, damping:26, mass:1.1 },
  sheetPresent:   { type:"spring", stiffness:280, damping:28, mass:1.2 },
  sheetDismiss:   { type:"spring", stiffness:350, damping:34, mass:0.9 },
  iconTap:        { type:"spring", stiffness:600, damping:35 },
  tap:            { type:"spring", stiffness:600, damping:32, mass:0.5 },
  iconActivate:   { type:"spring", stiffness:500, damping:20 },
  iconIdle:       { duration:2, repeat:Infinity, ease:"easeInOut" },
  correct:        { type:"spring", stiffness:480, damping:20, mass:0.7 },
  noteCorrect:    { type:"spring", stiffness:520, damping:18, mass:0.6 },
  wrong:          { type:"spring", stiffness:400, damping:22, mass:0.8 },
  cardExpand:     { type:"spring", stiffness:340, damping:28 },
  cardAppear:     { type:"spring", stiffness:340, damping:28, mass:1.0 },
  jelly:          { type:"spring", stiffness:460, damping:22, mass:0.8 },
  counter:        { type:"spring", stiffness:450, damping:22 },
  noteAppear:     { type:"spring", stiffness:500, damping:22, mass:0.6 },
  settle:         { type:"spring", stiffness:200, damping:26, mass:1.3 },
  pulse:          { type:"spring", stiffness:150, damping:12, mass:1.5 },
  feather:        { type:"spring", stiffness:420, damping:26, mass:0.6 },
  typewriter:     { duration:0.04 },
  spring:         { type:"spring", stiffness:320, damping:26 },
  springSnap:     { type:"spring", stiffness:460, damping:30 },
};

// ─────────────────────────────────────────────────────────────
// THEME_DEFS (11 curated themes)
// ─────────────────────────────────────────────────────────────
const THEME_DEFS = {

  // ── Dark themes (5) ────────────────────────────────────────

  "indigo-night": {
    dark:true, name:"Indigo Night",
    base:"#080a1a",
    accent:"#a78bfa", accentAlt:"#34d399", noteRoot:"#fbbf24",
    blobA:"rgba(109,40,217,0.32)", blobB:"rgba(59,130,246,0.26)", blobC:"rgba(139,92,246,0.18)",
    glassBase:"rgba(10,12,32,0.65)", glassBorder:"rgba(167,139,250,0.20)",
    fretBase:"rgba(8,10,26,1)", fretWire:"rgba(167,139,250,0.30)",
  },

  "slate-ocean": {
    dark:true, name:"Slate Ocean",
    base:"#060e1a",
    accent:"#38bdf8", accentAlt:"#34d399", noteRoot:"#fbbf24",
    blobA:"rgba(14,165,233,0.30)", blobB:"rgba(6,182,212,0.24)", blobC:"rgba(56,189,248,0.16)",
    glassBase:"rgba(6,14,30,0.65)", glassBorder:"rgba(56,189,248,0.20)",
    fretBase:"rgba(6,14,26,1)", fretWire:"rgba(56,189,248,0.30)",
  },

  "jade-whisper": {
    dark:true, name:"Jade Whisper",
    base:"#060d0b",
    accent:"#6ee7b7", accentAlt:"#60a5fa", noteRoot:"#fbbf24",
    blobA:"rgba(16,185,129,0.28)", blobB:"rgba(52,211,153,0.22)", blobC:"rgba(110,231,183,0.14)",
    glassBase:"rgba(6,14,10,0.65)", glassBorder:"rgba(110,231,183,0.20)",
    fretBase:"rgba(6,13,9,1)", fretWire:"rgba(110,231,183,0.28)",
  },

  "mauve-void": {
    dark:true, name:"Mauve Void",
    base:"#0c0812",
    accent:"#e879f9", accentAlt:"#34d399", noteRoot:"#fde68a",
    blobA:"rgba(168,85,247,0.30)", blobB:"rgba(232,121,249,0.24)", blobC:"rgba(196,181,253,0.16)",
    glassBase:"rgba(14,8,20,0.65)", glassBorder:"rgba(232,121,249,0.20)",
    fretBase:"rgba(12,8,18,1)", fretWire:"rgba(232,121,249,0.28)",
  },

  "warm-noir": {
    dark:true, name:"Warm Noir",
    base:"#0d0a06",
    accent:"#fbbf24", accentAlt:"#34d399", noteRoot:"#fb923c",
    blobA:"rgba(217,119,6,0.28)", blobB:"rgba(251,191,36,0.22)", blobC:"rgba(252,211,77,0.14)",
    glassBase:"rgba(18,14,4,0.65)", glassBorder:"rgba(251,191,36,0.18)",
    fretBase:"rgba(13,10,4,1)", fretWire:"rgba(251,191,36,0.28)",
  },

  // ── Light themes (6) ───────────────────────────────────────

  "ios-light": {
    dark:false, name:"iOS Light",
    base:"#eef2ff",
    accent:"#6366f1", accentAlt:"#059669", noteRoot:"#d97706",
    blobA:"rgba(165,180,252,0.45)", blobB:"rgba(196,181,253,0.35)", blobC:"rgba(129,140,248,0.22)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(99,102,241,0.18)",
    fretBase:"rgba(238,242,255,0.96)", fretWire:"rgba(99,102,241,0.28)",
  },

  "sky-mist": {
    dark:false, name:"Sky Mist",
    base:"#eef2ff",
    accent:"#818cf8", accentAlt:"#059669", noteRoot:"#d97706",
    blobA:"rgba(165,180,252,0.58)", blobB:"rgba(196,181,253,0.48)", blobC:"rgba(129,140,248,0.32)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(129,140,248,0.22)",
    fretBase:"rgba(238,242,255,0.96)", fretWire:"rgba(129,140,248,0.30)",
  },

  "petal-breeze": {
    dark:false, name:"Petal Breeze",
    base:"#fff0f8",
    accent:"#f472b6", accentAlt:"#059669", noteRoot:"#d97706",
    blobA:"rgba(251,207,232,0.65)", blobB:"rgba(253,186,116,0.45)", blobC:"rgba(244,114,182,0.30)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(244,114,182,0.20)",
    fretBase:"rgba(255,240,248,0.96)", fretWire:"rgba(244,114,182,0.28)",
  },

  "sage-cloud": {
    dark:false, name:"Sage Cloud",
    base:"#f0faf5",
    accent:"#34d399", accentAlt:"#2563eb", noteRoot:"#d97706",
    blobA:"rgba(110,231,183,0.55)", blobB:"rgba(167,243,208,0.45)", blobC:"rgba(52,211,153,0.30)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(52,211,153,0.20)",
    fretBase:"rgba(240,250,245,0.96)", fretWire:"rgba(52,211,153,0.28)",
  },

  "linen-dusk": {
    dark:false, name:"Linen Dusk",
    base:"#fdf8f0",
    accent:"#f59e0b", accentAlt:"#059669", noteRoot:"#b45309",
    blobA:"rgba(253,230,138,0.58)", blobB:"rgba(252,211,77,0.45)", blobC:"rgba(245,158,11,0.28)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(245,158,11,0.20)",
    fretBase:"rgba(253,248,240,0.96)", fretWire:"rgba(245,158,11,0.28)",
  },

  "frost-iris": {
    dark:false, name:"Frost Iris",
    base:"#f5f0ff",
    accent:"#a78bfa", accentAlt:"#059669", noteRoot:"#d97706",
    blobA:"rgba(196,181,253,0.58)", blobB:"rgba(167,139,250,0.45)", blobC:"rgba(139,92,246,0.30)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(167,139,250,0.22)",
    fretBase:"rgba(245,240,255,0.96)", fretWire:"rgba(167,139,250,0.30)",
  },

  // svu-light: SVU HTML prototype color language
  "svu-light": {
    dark:false, name:"SVU Light",
    base:"#eef0ff",
    accent:"#5a5ad6", accentAlt:"#22a672", noteRoot:"#d97706",
    blobA:"rgba(90,90,214,0.32)", blobB:"rgba(147,147,255,0.28)", blobC:"rgba(70,70,200,0.18)",
    glassBase:"rgba(255,255,255,0.72)", glassBorder:"rgba(90,90,214,0.16)",
    fretBase:"rgba(238,240,255,0.96)", fretWire:"rgba(90,90,214,0.26)",
  },
};

// ─────────────────────────────────────────────────────────────
// buildTheme — from a THEME_DEF, produce a full token object
// Fixed: all themes now use correct semantic colors by mode
// ─────────────────────────────────────────────────────────────
function buildTheme(id, def) {
  const dark = def.dark;

  // Text — svu-light keeps its exact HTML prototype values
  const textPrimary   = id === "svu-light"
    ? "rgba(19,19,42,0.92)"
    : dark ? "rgba(255,255,255,0.95)" : "rgba(14,14,28,0.92)";
  const textSecondary = id === "svu-light"
    ? "rgba(82,82,122,0.88)"
    : dark ? "rgba(255,255,255,0.62)" : "rgba(60,60,100,0.70)";
  const textTertiary  = id === "svu-light"
    ? "rgba(152,152,184,0.80)"
    : dark ? "rgba(255,255,255,0.38)" : "rgba(60,60,100,0.42)";

  // Surfaces
  const surface0 = def.base;
  const surface1 = def.glassBase;
  const surface2 = dark
    ? def.glassBase.replace(/[\d.]+\)$/, s => String(Math.min(0.85, parseFloat(s)+0.12)) + ")")
    : "rgba(255,255,255,0.82)";
  const surface3 = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";

  // Borders
  const border   = dark ? def.glassBorder : def.glassBorder.replace(/[\d.]+\)$/, "0.14)");
  const borderHi = dark
    ? def.glassBorder.replace(/[\d.]+\)$/, s => String(Math.min(0.40, parseFloat(s)*1.8)) + ")")
    : def.glassBorder.replace(/[\d.]+\)$/, "0.28)");

  // Accent derivatives
  const accentSub    = hexToRgba(def.accent, dark ? 0.16 : 0.10);
  const accentBorder = hexToRgba(def.accent, dark ? 0.36 : 0.28);

  // Note dot colors
  const noteRoot       = def.noteRoot;
  const noteRootGlow   = hexToRgba(noteRoot, dark ? 0.22 : 0.24);
  const noteTarget     = def.accent;
  const noteTargetGlow = hexToRgba(noteTarget, dark ? 0.18 : 0.20);
  const noteScale      = def.accentAlt;
  const noteScaleGlow  = hexToRgba(noteScale, dark ? 0.14 : 0.16);

  // Semantic colors — now correctly split by dark/light for all themes
  // svu-light retains its HTML prototype exact values
  const positive = id === "svu-light" ? "#22a672" : dark ? "#30D158" : "#059669";
  const negative = id === "svu-light" ? "#c24050" : dark ? "#FF453A" : "#dc2626";
  const warning  = id === "svu-light" ? "#c07830" : dark ? "#FFD60A" : "#d97706";

  return {
    themeId:   id,
    themeName: def.name,
    themeDark: dark,

    surface0, surface1, surface2, surface3,
    textPrimary, textSecondary, textTertiary,
    border, borderHi,
    accent:      def.accent,
    accentSub,
    accentBorder,
    positive, negative, warning,

    noteRoot, noteRootText: dark ? "#1a0e00" : "#ffffff", noteRootGlow,
    noteTarget, noteTargetText: dark ? "#001a16" : "#ffffff", noteTargetGlow,
    noteScale, noteScaleText: dark ? "#001a06" : "#ffffff", noteScaleGlow,

    blur1: "blur(16px)", blur2: "blur(32px)", blur3: "blur(56px)",

    spring:     SPRINGS.spring,
    springSnap: SPRINGS.springSnap,

    bg: {
      type:   dark ? "mesh" : "mesh-light",
      animType: "mesh",
      base:   def.base,
      blobA:  def.blobA,
      blobB:  def.blobB,
      blobC:  def.blobC,
    },
    glass: {
      blur:      `blur(${dark ? 22 : 20}px) saturate(180%)`,
      surface1:  def.glassBase,
      border:    def.glassBorder,
      borderTop: def.glassBorder.replace(/[\d.]+\)$/, s => String(Math.min(0.40, parseFloat(s)*1.9)) + ")"),
    },
    arcPair: {
      color: def.accent,
      glow:  hexToRgba(def.accent, dark ? 0.32 : 0.22),
    },
    fretboard: {
      woodColor:   def.fretBase,
      fretColor:   def.fretWire,
      markerColor: def.fretWire.replace(/[\d.]+\)$/, s => String(parseFloat(s)*0.44) + ")"),
    },
  };
}

// Build all 11 curated themes
export const THEMES = Object.fromEntries(
  Object.entries(THEME_DEFS).map(([id, def]) => [id, { id, ...buildTheme(id, def) }])
);

// ─────────────────────────────────────────────────────────────
// getTokensV2 — NEW three-axis token composer
// ─────────────────────────────────────────────────────────────
export function getTokensV2({ bgScheme: bgId, accentId, surfaceId, materialTuning = null, accentOverride = null }) {
  const bg      = BG_SCHEMES[bgId]      ?? BG_SCHEMES["frost-light"];
  const accentBase = ACCENT_SCHEMES[accentId] ?? ACCENT_SCHEMES["indigo"];
  const accent  = accentOverride ? { ...accentBase, ...accentOverride } : accentBase;
  const surface = SURFACE_SCHEMES[surfaceId] ?? SURFACE_SCHEMES["glass-mid"];
  const tuning = {
    blurOffset: materialTuning?.blurOffset ?? 0,
    saturateBoost: materialTuning?.saturateBoost ?? 0,
    alphaShift: materialTuning?.alphaShift ?? 0,
    borderBoost: materialTuning?.borderBoost ?? 1,
    shadowBoost: materialTuning?.shadowBoost ?? 1,
  };

  const dark = bg.dark;

  // ── Text colors ────────────────────────────────────────────
  const textPrimary   = dark
    ? "rgba(255,255,255,0.95)"
    : (bgId === "frost-light" || bgId === "silk-light")
      ? "rgba(14,14,40,0.92)"       // blue-tinted white bg
      : bgId === "grain-light"
        ? "rgba(20,16,12,0.90)"     // warm-tinted
        : bgId === "petal-light"
          ? "rgba(30,10,20,0.90)"   // pink-tinted
          : "rgba(14,14,28,0.92)";  // default light

  const textSecondary = dark
    ? "rgba(255,255,255,0.62)"
    : "rgba(60,60,100,0.70)";

  const textTertiary = dark
    ? "rgba(255,255,255,0.38)"
    : "rgba(60,60,100,0.42)";

  // ── Glass surface ──────────────────────────────────────────
  const glassBase   = bg.glassBase;
  const glassBorder = bg.glassBorder;

  // Scale alpha by surface scheme
  const targetAlpha = clamp((dark ? surface.darkAlpha : surface.lightAlpha) + tuning.alphaShift, 0.12, 0.97);
  const surface1    = glassBase.replace(/[\d.]+\)$/, `${targetAlpha})`);
  const surface2    = dark
    ? glassBase.replace(/[\d.]+\)$/, s => String(Math.min(0.90, parseFloat(s) + 0.14 + tuning.alphaShift * 0.5)) + ")")
    : `rgba(255,255,255,${Math.min(0.95, targetAlpha + 0.14)})`;
  const surface3    = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";

  // Borders — scaled by surface borderAlpha multiplier
  const rawBorderAlpha = dark
    ? parseFloat(glassBorder.match(/[\d.]+\)$/)?.[0] ?? "0.20")
    : 0.14;
  const borderAlpha   = rawBorderAlpha * surface.borderAlpha * tuning.borderBoost;
  const border        = glassBorder.replace(/[\d.]+\)$/, `${borderAlpha.toFixed(3)})`);
  const borderHi      = glassBorder.replace(/[\d.]+\)$/, `${Math.min(0.40, borderAlpha * 1.8).toFixed(3)})`);

  // ── Accent derivatives ─────────────────────────────────────
  const accentColor  = accent.accent;
  const accentSub    = hexToRgba(accentColor, dark ? 0.16 : 0.10);
  const accentBorder = hexToRgba(accentColor, dark ? 0.36 : 0.28);

  // ── Note colors ────────────────────────────────────────────
  const noteRoot       = accent.noteRoot;
  const noteRootGlow   = hexToRgba(noteRoot, dark ? 0.22 : 0.24);
  const noteTarget     = accent.noteTarget;
  const noteTargetGlow = hexToRgba(noteTarget, dark ? 0.18 : 0.20);
  const noteScale      = accent.noteScale;
  const noteScaleGlow  = hexToRgba(noteScale, dark ? 0.14 : 0.16);

  // ── Glass composite ────────────────────────────────────────
  const blurPx = clamp(parseBlurPx(surface.blur) + tuning.blurOffset, 0, 40);
  const saturateValue = clamp(surface.saturate + tuning.saturateBoost, 100, 260);
  const blurStr = surface.blur === "none" && blurPx <= 0
    ? "none"
    : `blur(${blurPx}px) saturate(${saturateValue}%)`;
  const shadow = scaleRgbaAlpha(dark ? surface.shadowDark : surface.shadowLight, tuning.shadowBoost);

  return {
    // Identification
    themeId:       `${bgId}--${accentId}--${surfaceId}`,
    themeName:     `${bg.name} · ${accent.name}`,
    themeDark:     dark,
    // Three-axis IDs (for reverse lookup)
    bgScheme:      bgId,
    accentSchemeId: accentId,
    surfaceSchemeId: surfaceId,

    // Surfaces
    surface0: bg.base,
    surface1,
    surface2,
    surface3,

    // Text
    textPrimary, textSecondary, textTertiary,

    // Borders
    border, borderHi,

    // Accent
    accent:      accentColor,
    accentSub,
    accentBorder,

    // Semantic
    positive:    accent.positive,
    negative:    accent.negative,
    warning:     accent.warning,

    // Note dots
    noteRoot, noteRootText: dark ? "#1a0e00" : "#ffffff", noteRootGlow,
    noteTarget, noteTargetText: dark ? "#001a16" : "#ffffff", noteTargetGlow,
    noteScale, noteScaleText: dark ? "#001a06" : "#ffffff", noteScaleGlow,

    // Blur helpers
    blur1: "blur(16px)", blur2: "blur(32px)", blur3: "blur(56px)",

    // Springs (backward compat)
    spring:     SPRINGS.spring,
    springSnap: SPRINGS.springSnap,

    // Background config (consumed by MeshBackground)
    bg: {
      type:     dark ? "mesh" : "mesh-light",
      animType: bg.animType,
      base:     bg.base,
      blobA:    bg.blobA,
      blobB:    bg.blobB,
      blobC:    bg.blobC,
      // Extra per-animType data
      aurora:   bg.aurora ?? null,
      silk:     bg.silk   ?? null,
      grain:    bg.grain  ?? null,
    },

    // Glass config (consumed by card components)
    glass: {
      blur:           blurStr,
      surface1,
      border:         glassBorder,
      borderTop:      glassBorder.replace(/[\d.]+\)$/, s => String(Math.min(0.40, parseFloat(s)*1.9)) + ")"),
      noiseOverlay:   surface.noiseOverlay,
      noiseOpacity:   surface.noiseOpacity,
      insetHighlight: surface.insetHighlight,
      shadow,
    },

    // Arc pair (trainer arc colors)
    arcPair: {
      color: accentColor,
      glow:  hexToRgba(accentColor, dark ? 0.32 : 0.22),
    },

    // Fretboard
    fretboard: {
      woodColor:   bg.fretBase,
      fretColor:   bg.fretWire,
      markerColor: bg.fretWire.replace(/[\d.]+\)$/, s => String(parseFloat(s)*0.44) + ")"),
    },

    materialTuning: tuning,
  };
}

// ─────────────────────────────────────────────────────────────
// getTokensForTheme — backward-compatible entry point
// Maps old themeId → getTokensV2 via LEGACY_TO_PRESET
// ─────────────────────────────────────────────────────────────
export function getTokensForTheme(themeId) {
  // 1. Try the 11 curated themes (exact match, legacy path)
  if (THEMES[themeId]) return THEMES[themeId];

  // 2. Try legacy mapping → three-axis
  const mapped = LEGACY_TO_PRESET[themeId];
  if (mapped) return getTokensV2(mapped);

  // 3. Default fallback
  return THEMES["svu-light"];
}

export function getTheme(themeId) {
  return getTokensForTheme(themeId);
}

// ── THEME_GROUPS (for ControlCenter / ThemePickerSheet) ───────
export const THEME_GROUPS = {
  dark:  Object.values(THEMES).filter(t => t.themeDark),
  light: Object.values(THEMES).filter(t => !t.themeDark),
};

export const PALETTE_KEYS = Object.keys(THEMES);

// ── Backward compat exports ───────────────────────────────────
export const DT = THEMES["indigo-night"];
export const LT = THEMES["svu-light"];

export const PALETTE_DEFS = {
  DT, LT,
  ...Object.fromEntries(Object.keys(THEMES).map(id => [id, THEMES[id]])),
};

// ── Re-export three-axis scheme data for convenience ──────────
export {
  BG_SCHEMES,
  DARK_BG_SCHEMES,
  LIGHT_BG_SCHEMES,
  RECOMMENDED_DARK_BG_SCHEMES,
  RECOMMENDED_LIGHT_BG_SCHEMES,
  DEFAULT_BG_DARK,
  DEFAULT_BG_LIGHT,
  ACCENT_SCHEMES,
  ACCENT_SCHEME_KEYS,
  DEFAULT_ACCENT_DARK,
  DEFAULT_ACCENT_LIGHT,
  SURFACE_SCHEMES,
  SURFACE_SCHEME_KEYS,
  DEFAULT_SURFACE,
  getSurfaceFilter,
  getSurfaceBg,
  PRESETS,
  PRESET_KEYS,
  DEFAULT_PRESET,
  CURATED_DARK_THEME_IDS,
  CURATED_LIGHT_THEME_IDS,
  LEGACY_TO_PRESET,
  PALETTE_REFERENCES,
};
