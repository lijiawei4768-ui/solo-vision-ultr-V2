// ─────────────────────────────────────────────────────────────
// bgSchemes.js — Background Axis
// Solo Vision Ultra Theme System v2.0
//
// 17 background schemes
// Recommended display set:
//   dark  (5): indigo-night-bg, slate-ocean-bg, jade-whisper-bg, mauve-void-bg, warm-noir-bg
//   light (5): sky-mist-light, petal-breeze-light, sage-cloud-light, linen-dusk-light, frost-iris-light
// Legacy/extra:
//   mesh-indigo, ocean-depth, aurora-dark, hybrid-dark, noir-warm,
//   silk-light, frost-light, grain-light, petal-light, sage-light, mesh-void
// Each scheme defines: page base color, blob colors, animation type,
// glass surface base, and optional texture parameters.
//
// animType values:
//   "mesh"   — 3 floating radial-gradient blobs (classic)
//   "aurora" — 3 layered elliptical gradients with scale animation
//   "silk"   — large rotating linear-gradient fluid
//   "grain"  — static noise texture + slow hue-rotate
// ─────────────────────────────────────────────────────────────

export const BG_SCHEMES = {

  // ══ Dark backgrounds ══════════════════════════════════════

  "mesh-indigo": {
    id:        "mesh-indigo",
    name:      "Indigo Mesh",
    nameZh:    "靛蓝光网",
    dark:      true,
    animType:  "mesh",
    base:      "#080a1a",
    blobA:     "rgba(109,40,217,0.32)",
    blobB:     "rgba(59,130,246,0.26)",
    blobC:     "rgba(139,92,246,0.18)",
    // Glass surface built from base
    glassBase: "rgba(10,12,32,0.65)",
    glassBorder: "rgba(167,139,250,0.20)",
    // Fretboard
    fretBase:  "rgba(8,10,26,1)",
    fretWire:  "rgba(167,139,250,0.30)",
  },

  "indigo-night-bg": {
    id:        "indigo-night-bg",
    name:      "Indigo Night",
    nameZh:    "靛蓝深夜",
    dark:      true,
    animType:  "mesh",
    base:      "#080a1a",
    blobA:     "rgba(139,92,246,0.25)",
    blobB:     "rgba(59,130,246,0.20)",
    blobC:     "rgba(99,102,241,0.16)",
    glassBase: "rgba(10,12,32,0.65)",
    glassBorder: "rgba(167,139,250,0.25)",
    fretBase:  "rgba(8,10,26,1)",
    fretWire:  "rgba(167,139,250,0.30)",
  },

  "ocean-depth": {
    id:        "ocean-depth",
    name:      "Ocean Depth",
    nameZh:    "深海雾蓝",
    dark:      true,
    animType:  "mesh",
    base:      "#060e1a",
    blobA:     "rgba(14,165,233,0.30)",
    blobB:     "rgba(6,182,212,0.24)",
    blobC:     "rgba(56,189,248,0.16)",
    glassBase: "rgba(6,14,30,0.66)",
    glassBorder: "rgba(56,189,248,0.20)",
    fretBase:  "rgba(6,14,26,1)",
    fretWire:  "rgba(56,189,248,0.30)",
  },

  "slate-ocean-bg": {
    id:        "slate-ocean-bg",
    name:      "Slate Ocean",
    nameZh:    "深海石板",
    dark:      true,
    animType:  "mesh",
    base:      "#060e1a",
    blobA:     "rgba(14,165,233,0.22)",
    blobB:     "rgba(6,182,212,0.18)",
    blobC:     "rgba(56,189,248,0.16)",
    glassBase: "rgba(6,14,30,0.66)",
    glassBorder: "rgba(56,189,248,0.22)",
    fretBase:  "rgba(6,14,26,1)",
    fretWire:  "rgba(56,189,248,0.30)",
  },

  "mesh-void": {
    id:        "mesh-void",
    name:      "Deep Void",
    nameZh:    "极深虚空",
    dark:      true,
    animType:  "mesh",
    base:      "#07080f",
    blobA:     "rgba(50,20,100,0.20)",
    blobB:     "rgba(30,40,80,0.14)",
    blobC:     "rgba(80,30,120,0.10)",
    glassBase: "rgba(8,8,18,0.70)",
    glassBorder: "rgba(120,100,200,0.12)",
    fretBase:  "rgba(7,8,15,1)",
    fretWire:  "rgba(120,100,200,0.20)",
  },

  "aurora-dark": {
    id:        "aurora-dark",
    name:      "Soft Aurora",
    nameZh:    "极光暗夜",
    dark:      true,
    animType:  "aurora",
    base:      "#0a0d1a",
    // Aurora uses elliptical layers, blobA/B/C reused as layer colors
    blobA:     "rgba(0,200,180,0.18)",
    blobB:     "rgba(99,102,241,0.20)",
    blobC:     "rgba(167,139,250,0.16)",
    glassBase: "rgba(8,10,24,0.65)",
    glassBorder: "rgba(103,232,249,0.18)",
    fretBase:  "rgba(10,13,26,1)",
    fretWire:  "rgba(103,232,249,0.24)",
    // Aurora-specific params
    aurora: {
      layer1: "rgba(0,200,180,0.18)",
      layer2: "rgba(99,102,241,0.20)",
      layer3: "rgba(167,139,250,0.16)",
    },
  },

  "jade-whisper-bg": {
    id:        "jade-whisper-bg",
    name:      "Jade Whisper",
    nameZh:    "翡翠低语",
    dark:      true,
    animType:  "mesh",
    base:      "#060d0b",
    blobA:     "rgba(16,185,129,0.22)",
    blobB:     "rgba(52,211,153,0.16)",
    blobC:     "rgba(110,231,183,0.12)",
    glassBase: "rgba(6,14,10,0.66)",
    glassBorder: "rgba(110,231,183,0.22)",
    fretBase:  "rgba(6,13,9,1)",
    fretWire:  "rgba(110,231,183,0.28)",
  },

  "mauve-void-bg": {
    id:        "mauve-void-bg",
    name:      "Mauve Void",
    nameZh:    "紫雾虚空",
    dark:      true,
    animType:  "mesh",
    base:      "#0c0812",
    blobA:     "rgba(168,85,247,0.24)",
    blobB:     "rgba(232,121,249,0.18)",
    blobC:     "rgba(196,181,253,0.16)",
    glassBase: "rgba(14,8,20,0.66)",
    glassBorder: "rgba(232,121,249,0.25)",
    fretBase:  "rgba(12,8,18,1)",
    fretWire:  "rgba(232,121,249,0.28)",
  },

  "hybrid-dark": {
    id:        "hybrid-dark",
    name:      "Hybrid Glow",
    nameZh:    "混合霓雾",
    dark:      true,
    animType:  "hybrid",
    base:      "#070912",
    blobA:     "rgba(109,40,217,0.30)",
    blobB:     "rgba(14,165,233,0.25)",
    blobC:     "rgba(236,72,153,0.20)",
    glassBase: "rgba(7,9,18,0.58)",
    glassBorder: "rgba(167,139,250,0.20)",
    fretBase:  "rgba(7,9,18,1)",
    fretWire:  "rgba(110,168,255,0.28)",
    aurora: {
      layer1: "rgba(99,102,241,0.14)",
      layer2: "rgba(14,165,233,0.12)",
      layer3: "rgba(236,72,153,0.10)",
    },
  },

  "noir-warm": {
    id:        "noir-warm",
    name:      "Warm Noir",
    nameZh:    "暖黑琥珀",
    dark:      true,
    animType:  "mesh",
    base:      "#0d0a06",
    blobA:     "rgba(217,119,6,0.28)",
    blobB:     "rgba(251,191,36,0.22)",
    blobC:     "rgba(252,211,77,0.14)",
    glassBase: "rgba(18,14,4,0.65)",
    glassBorder: "rgba(251,191,36,0.18)",
    fretBase:  "rgba(13,10,4,1)",
    fretWire:  "rgba(251,191,36,0.28)",
  },

  "warm-noir-bg": {
    id:        "warm-noir-bg",
    name:      "Warm Noir",
    nameZh:    "暖黑琥珀",
    dark:      true,
    animType:  "mesh",
    base:      "#0d0a06",
    blobA:     "rgba(217,119,6,0.22)",
    blobB:     "rgba(251,191,36,0.16)",
    blobC:     "rgba(252,211,77,0.12)",
    glassBase: "rgba(18,14,4,0.66)",
    glassBorder: "rgba(251,191,36,0.22)",
    fretBase:  "rgba(13,10,4,1)",
    fretWire:  "rgba(251,191,36,0.28)",
  },

  // ══ Light backgrounds ══════════════════════════════════════

  "silk-light": {
    id:        "silk-light",
    name:      "Silk Flow",
    nameZh:    "丝绸流光",
    dark:      false,
    animType:  "silk",
    base:      "#f0f4ff",
    // Silk uses a gradient rotation — blobA/B are gradient stops
    blobA:     "rgba(199,210,254,0.65)",
    blobB:     "rgba(232,230,255,0.45)",
    blobC:     "rgba(186,230,255,0.50)",
    glassBase: "rgba(255,255,255,0.70)",
    glassBorder: "rgba(165,180,252,0.22)",
    fretBase:  "rgba(240,244,255,0.96)",
    fretWire:  "rgba(129,140,248,0.30)",
    silk: {
      from:  "#c7d2fe",
      mid:   "#e8e6ff",
      via:   "#bae6ff",
      to:    "#fecdd3",
    },
  },

  "sky-mist-light": {
    id:        "sky-mist-light",
    name:      "Sky Mist",
    nameZh:    "天青雾白",
    dark:      false,
    animType:  "mesh",
    base:      "#eef2ff",
    blobA:     "rgba(165,180,252,0.50)",
    blobB:     "rgba(196,181,253,0.40)",
    blobC:     "rgba(129,140,248,0.26)",
    glassBase: "rgba(255,255,255,0.74)",
    glassBorder: "rgba(165,180,252,0.35)",
    fretBase:  "rgba(238,242,255,0.96)",
    fretWire:  "rgba(129,140,248,0.30)",
  },

  "frost-light": {
    id:        "frost-light",
    name:      "Frost Iris",
    nameZh:    "霜感鸢尾",
    dark:      false,
    animType:  "mesh",
    base:      "#eef2ff",
    blobA:     "rgba(165,180,252,0.50)",
    blobB:     "rgba(196,181,253,0.40)",
    blobC:     "rgba(129,140,248,0.26)",
    glassBase: "rgba(255,255,255,0.72)",
    glassBorder: "rgba(165,180,252,0.22)",
    fretBase:  "rgba(238,242,255,0.96)",
    fretWire:  "rgba(129,140,248,0.30)",
  },

  "grain-light": {
    id:        "grain-light",
    name:      "Grain Warm",
    nameZh:    "颗粒温纸",
    dark:      false,
    animType:  "grain",
    base:      "#f7f5f0",
    blobA:     "rgba(240,232,255,0.60)",
    blobB:     "rgba(232,244,255,0.50)",
    blobC:     "rgba(240,255,248,0.50)",
    glassBase: "rgba(255,255,255,0.75)",
    glassBorder: "rgba(180,170,160,0.14)",
    fretBase:  "rgba(247,245,240,0.96)",
    fretWire:  "rgba(180,160,140,0.28)",
    grain: {
      gradFrom:    "#f0e8ff",
      gradMid:     "#e8f4ff",
      gradVia:     "#f0fff8",
      gradTo:      "#fff8f0",
      noiseOpacity: 0.12,
    },
  },

  "linen-dusk-light": {
    id:        "linen-dusk-light",
    name:      "Linen Dusk",
    nameZh:    "亚麻暖暮",
    dark:      false,
    animType:  "mesh",
    base:      "#fdf8f0",
    blobA:     "rgba(253,230,138,0.50)",
    blobB:     "rgba(252,211,77,0.35)",
    blobC:     "rgba(245,158,11,0.20)",
    glassBase: "rgba(255,255,255,0.74)",
    glassBorder: "rgba(245,158,11,0.28)",
    fretBase:  "rgba(253,248,240,0.96)",
    fretWire:  "rgba(245,158,11,0.28)",
  },

  "petal-light": {
    id:        "petal-light",
    name:      "Petal Mist",
    nameZh:    "樱花雾霭",
    dark:      false,
    animType:  "mesh",
    base:      "#fff0f8",
    blobA:     "rgba(251,207,232,0.65)",
    blobB:     "rgba(253,186,116,0.40)",
    blobC:     "rgba(244,114,182,0.28)",
    glassBase: "rgba(255,255,255,0.72)",
    glassBorder: "rgba(244,114,182,0.18)",
    fretBase:  "rgba(255,240,248,0.96)",
    fretWire:  "rgba(244,114,182,0.26)",
  },

  "petal-breeze-light": {
    id:        "petal-breeze-light",
    name:      "Petal Breeze",
    nameZh:    "樱花微风",
    dark:      false,
    animType:  "mesh",
    base:      "#fff0f8",
    blobA:     "rgba(251,207,232,0.65)",
    blobB:     "rgba(253,186,116,0.40)",
    blobC:     "rgba(244,114,182,0.28)",
    glassBase: "rgba(255,255,255,0.74)",
    glassBorder: "rgba(244,114,182,0.25)",
    fretBase:  "rgba(255,240,248,0.96)",
    fretWire:  "rgba(244,114,182,0.26)",
  },

  "sage-light": {
    id:        "sage-light",
    name:      "Sage Veil",
    nameZh:    "薄荷雾白",
    dark:      false,
    animType:  "mesh",
    base:      "#f0faf5",
    blobA:     "rgba(110,231,183,0.50)",
    blobB:     "rgba(167,243,208,0.42)",
    blobC:     "rgba(96,165,250,0.18)",
    glassBase: "rgba(255,255,255,0.72)",
    glassBorder: "rgba(52,211,153,0.18)",
    fretBase:  "rgba(240,250,245,0.96)",
    fretWire:  "rgba(52,211,153,0.26)",
  },

  "sage-cloud-light": {
    id:        "sage-cloud-light",
    name:      "Sage Cloud",
    nameZh:    "薄荷云雾",
    dark:      false,
    animType:  "mesh",
    base:      "#f0faf5",
    blobA:     "rgba(110,231,183,0.45)",
    blobB:     "rgba(167,243,208,0.40)",
    blobC:     "rgba(52,211,153,0.22)",
    glassBase: "rgba(255,255,255,0.74)",
    glassBorder: "rgba(52,211,153,0.28)",
    fretBase:  "rgba(240,250,245,0.96)",
    fretWire:  "rgba(52,211,153,0.28)",
  },

  "frost-iris-light": {
    id:        "frost-iris-light",
    name:      "Frost Iris",
    nameZh:    "霜紫鸢尾",
    dark:      false,
    animType:  "mesh",
    base:      "#f5f0ff",
    blobA:     "rgba(196,181,253,0.50)",
    blobB:     "rgba(167,139,250,0.35)",
    blobC:     "rgba(139,92,246,0.20)",
    glassBase: "rgba(255,255,255,0.74)",
    glassBorder: "rgba(167,139,250,0.30)",
    fretBase:  "rgba(245,240,255,0.96)",
    fretWire:  "rgba(167,139,250,0.30)",
  },
};

// Convenience groupings
export const BG_SCHEME_KEYS   = Object.keys(BG_SCHEMES);
export const DARK_BG_SCHEMES  = BG_SCHEME_KEYS.filter(k => BG_SCHEMES[k].dark);
export const LIGHT_BG_SCHEMES = BG_SCHEME_KEYS.filter(k => !BG_SCHEMES[k].dark);
export const RECOMMENDED_DARK_BG_SCHEMES = [
  "indigo-night-bg",
  "slate-ocean-bg",
  "jade-whisper-bg",
  "mauve-void-bg",
  "warm-noir-bg",
];
export const RECOMMENDED_LIGHT_BG_SCHEMES = [
  "sky-mist-light",
  "petal-breeze-light",
  "sage-cloud-light",
  "linen-dusk-light",
  "frost-iris-light",
];

export const DEFAULT_BG_DARK  = "mesh-indigo";
export const DEFAULT_BG_LIGHT = "frost-light";
