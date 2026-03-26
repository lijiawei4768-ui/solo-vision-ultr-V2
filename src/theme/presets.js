// ─────────────────────────────────────────────────────────────
// presets.js — Quick Preset Combinations
// Solo Vision Ultra Theme System v2.0
//
// 8 presets = curated bg × accent × surface combinations
// Presets are shortcuts — user can still adjust each axis after.
//
// Also contains LEGACY_TO_PRESET mapping for backward compat:
// maps old themeId strings → { bgScheme, accentId, surfaceId }
// ─────────────────────────────────────────────────────────────

export const PRESETS = {

  "svu-classic": {
    id:        "svu-classic",
    name:      "SVU Classic",
    nameZh:    "经典浅色",
    desc:      "Original SVU light visual language",
    descZh:    "SVU 原版浅色视觉语言",
    bgScheme:  "frost-light",
    accentId:  "indigo",
    surfaceId: "glass-mid",
    // Preview swatch — shown in preset picker
    previewBg: "#eef2ff",
    previewAccent: "#5a5ad6",
  },

  "night-studio": {
    id:        "night-studio",
    name:      "Night Studio",
    nameZh:    "夜间工作室",
    desc:      "Deep indigo mesh — premium dark experience",
    descZh:    "靛蓝光网，沉浸深色首选",
    bgScheme:  "mesh-indigo",
    accentId:  "violet",
    surfaceId: "glass-hi",
    previewBg: "#080a1a",
    previewAccent: "#a78bfa",
  },

  "ocean-focus": {
    id:        "ocean-focus",
    name:      "Ocean Focus",
    nameZh:    "深海专注",
    desc:      "Cool blue — clarity and concentration",
    descZh:    "冷蓝清爽，专注力最强",
    bgScheme:  "mesh-indigo",
    accentId:  "ocean",
    surfaceId: "glass-hi",
    previewBg: "#080a1a",
    previewAccent: "#38bdf8",
  },

  "aurora-dream": {
    id:        "aurora-dream",
    name:      "Aurora Dream",
    nameZh:    "极光梦境",
    desc:      "Soft aurora animation — vivid and atmospheric",
    descZh:    "极光缓流，最具氛围感",
    bgScheme:  "aurora-dark",
    accentId:  "mauve",
    surfaceId: "frosted-vivid",
    previewBg: "#0a0d1a",
    previewAccent: "#e879f9",
  },

  "warm-amber": {
    id:        "warm-amber",
    name:      "Warm Amber",
    nameZh:    "暖黄沉浸",
    desc:      "Warm noir background — late night practice feel",
    descZh:    "暗琥珀底，深夜练习氛围",
    bgScheme:  "noir-warm",
    accentId:  "amber",
    surfaceId: "glass-mid",
    previewBg: "#0d0a06",
    previewAccent: "#fbbf24",
  },

  "paper-sage": {
    id:        "paper-sage",
    name:      "Paper Sage",
    nameZh:    "纸质自然",
    desc:      "Warm grain texture — natural and tactile",
    descZh:    "颗粒温纸，自然触感首选",
    bgScheme:  "grain-light",
    accentId:  "sage",
    surfaceId: "grain-surface",
    previewBg: "#f7f5f0",
    previewAccent: "#34d399",
  },

  "petal-soft": {
    id:        "petal-soft",
    name:      "Petal Soft",
    nameZh:    "樱花柔和",
    desc:      "Blush pink — delicate and soft",
    descZh:    "樱花粉，最轻柔温柔",
    bgScheme:  "petal-light",
    accentId:  "rose",
    surfaceId: "glass-lo",
    previewBg: "#fff0f8",
    previewAccent: "#f472b6",
  },

  "pure-mono": {
    id:        "pure-mono",
    name:      "Pure Mono",
    nameZh:    "极简黑白",
    desc:      "Absolute minimalism — no color, only structure",
    descZh:    "极简黑白，零色彩干扰",
    bgScheme:  "mesh-void",
    accentId:  "mono",
    surfaceId: "solid",
    previewBg: "#07080f",
    previewAccent: "rgba(255,255,255,0.82)",
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);
export const DEFAULT_PRESET = "svu-classic";
export const CURATED_DARK_THEME_IDS = [
  "indigo-night",
  "slate-ocean",
  "jade-whisper",
  "mauve-void",
  "warm-noir",
];
export const CURATED_LIGHT_THEME_IDS = [
  "sky-mist",
  "petal-breeze",
  "sage-cloud",
  "linen-dusk",
  "frost-iris",
];

// ─────────────────────────────────────────────────────────────
// LEGACY_TO_PRESET
// Maps old themeId strings → three-axis equivalent
// Covers all 23 themes from v5.x (11 kept + 12 retired)
// ─────────────────────────────────────────────────────────────
export const LEGACY_TO_PRESET = {
  // ── New-era themes (kept in theme.js) ─────────────────────
  "svu-light":    { bgScheme: "frost-light",  accentId: "indigo",  surfaceId: "glass-mid"    },
  "indigo-night": { bgScheme: "indigo-night-bg", accentId: "violet", surfaceId: "glass-hi"      },
  "slate-ocean":  { bgScheme: "slate-ocean-bg", accentId: "ocean",  surfaceId: "glass-hi"      },
  "jade-whisper": { bgScheme: "jade-whisper-bg", accentId: "jade",   surfaceId: "glass-hi"      },
  "mauve-void":   { bgScheme: "mauve-void-bg", accentId: "mauve",   surfaceId: "frosted-vivid" },
  "warm-noir":    { bgScheme: "warm-noir-bg", accentId: "amber",   surfaceId: "glass-mid"     },
  "ios-light":    { bgScheme: "sky-mist-light", accentId: "sky",    surfaceId: "glass-mid"     },
  "sky-mist":     { bgScheme: "sky-mist-light", accentId: "sky",    surfaceId: "glass-mid"     },
  "petal-breeze": { bgScheme: "petal-breeze-light", accentId: "rose",   surfaceId: "glass-lo"      },
  "sage-cloud":   { bgScheme: "sage-cloud-light", accentId: "sage",   surfaceId: "glass-mid"     },
  "linen-dusk":   { bgScheme: "linen-dusk-light", accentId: "amber",  surfaceId: "glass-mid"     },
  "frost-iris":   { bgScheme: "frost-iris-light", accentId: "violet", surfaceId: "glass-mid"     },

  // ── Retired legacy themes (12) ─────────────────────────────
  "violet-deep":  { bgScheme: "mesh-indigo",  accentId: "violet",  surfaceId: "glass-hi"     },
  "midnight-blue":{ bgScheme: "mesh-indigo",  accentId: "ocean",   surfaceId: "glass-hi"     },
  "ember":        { bgScheme: "noir-warm",    accentId: "amber",   surfaceId: "glass-mid"    },
  "forest":       { bgScheme: "mesh-indigo",  accentId: "jade",    surfaceId: "glass-hi"     },
  "crimson":      { bgScheme: "mesh-void",    accentId: "rose",    surfaceId: "glass-mid"    },
  "aurora":       { bgScheme: "aurora-dark",  accentId: "ocean",   surfaceId: "frosted-vivid"},
  "rose-gold":    { bgScheme: "petal-light",  accentId: "rose",    surfaceId: "glass-mid"    },
  "obsidian":     { bgScheme: "mesh-void",    accentId: "mono",    surfaceId: "solid"        },
  "sunset":       { bgScheme: "noir-warm",    accentId: "mauve",   surfaceId: "glass-mid"    },
  "ocean":        { bgScheme: "mesh-indigo",  accentId: "ocean",   surfaceId: "glass-hi"     },
  "sakura":       { bgScheme: "petal-light",  accentId: "rose",    surfaceId: "glass-lo"     },
};
