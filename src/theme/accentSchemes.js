// ─────────────────────────────────────────────────────────────
// accentSchemes.js — Accent / Color Axis
// Solo Vision Ultra Theme System v2.0
//
// 10 accent schemes — controls all semantic colors
// Each scheme is independent of background and surface.
//
// Fields:
//   accent      — primary action color (buttons, active states, links)
//   accentAlt   — secondary accent (noteScale, subtle contrast)
//   positive    — success / correct / streak
//   warning     — caution / calibration reminder
//   negative    — error / weak spots / danger
//   noteRoot    — root note dot color on fretboard
//   noteTarget  — target interval dot (usually = accent)
//   noteScale   — scale tone dot (usually = accentAlt)
// ─────────────────────────────────────────────────────────────

export const ACCENT_SCHEMES = {

  "indigo": {
    id:         "indigo",
    name:       "Indigo",
    nameZh:     "靛蓝",
    // SVU signature — balanced, professional
    accent:     "#5a5ad6",
    accentAlt:  "#22a672",
    positive:   "#22a672",
    warning:    "#c07830",
    negative:   "#c24050",
    noteRoot:   "#d97706",
    noteTarget: "#5a5ad6",
    noteScale:  "#22a672",
  },

  "violet": {
    id:         "violet",
    name:       "Violet",
    nameZh:     "紫罗兰",
    // Soft purple — ideal for dark backgrounds
    accent:     "#a78bfa",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#a78bfa",
    noteScale:  "#34d399",
  },

  "ocean": {
    id:         "ocean",
    name:       "Ocean",
    nameZh:     "深海蓝",
    // Cool blue — focused, calm
    accent:     "#38bdf8",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#38bdf8",
    noteScale:  "#34d399",
  },

  "jade": {
    id:         "jade",
    name:       "Jade",
    nameZh:     "翡翠绿",
    // Natural mint — fresh, easy on eyes
    accent:     "#6ee7b7",
    accentAlt:  "#60a5fa",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#6ee7b7",
    noteScale:  "#60a5fa",
  },

  "mauve": {
    id:         "mauve",
    name:       "Mauve",
    nameZh:     "紫粉霓",
    // Vibrant purple-pink — expressive, bold
    accent:     "#e879f9",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fde68a",
    negative:   "#f87171",
    noteRoot:   "#fde68a",
    noteTarget: "#e879f9",
    noteScale:  "#34d399",
  },

  "amber": {
    id:         "amber",
    name:       "Amber",
    nameZh:     "琥珀金",
    // Warm gold — tool-like, warm, focused
    accent:     "#fbbf24",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fb923c",
    negative:   "#f87171",
    noteRoot:   "#fb923c",
    noteTarget: "#fbbf24",
    noteScale:  "#34d399",
  },

  "rose": {
    id:         "rose",
    name:       "Rose",
    nameZh:     "玫瑰粉",
    // Soft pink — delicate, feminine
    accent:     "#f472b6",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#f472b6",
    noteScale:  "#34d399",
  },

  "sage": {
    id:         "sage",
    name:       "Sage",
    nameZh:     "薄荷绿",
    // Herbal green — natural, restful
    accent:     "#34d399",
    accentAlt:  "#60a5fa",
    positive:   "#10b981",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#34d399",
    noteScale:  "#60a5fa",
  },

  "sky": {
    id:         "sky",
    name:       "Sky",
    nameZh:     "矢车菊",
    // Cornflower blue-indigo — gentle, digital
    accent:     "#818cf8",
    accentAlt:  "#34d399",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "#fbbf24",
    noteTarget: "#818cf8",
    noteScale:  "#34d399",
  },

  "mono": {
    id:         "mono",
    name:       "Mono",
    nameZh:     "极简黑白",
    // Monochrome — absolute minimalism (dark mode only recommended)
    accent:     "rgba(255,255,255,0.82)",
    accentAlt:  "rgba(255,255,255,0.50)",
    positive:   "#34d399",
    warning:    "#fbbf24",
    negative:   "#f87171",
    noteRoot:   "rgba(255,255,255,0.90)",
    noteTarget: "rgba(255,255,255,0.85)",
    noteScale:  "rgba(255,255,255,0.55)",
  },
};

export const ACCENT_SCHEME_KEYS = Object.keys(ACCENT_SCHEMES);
export const DEFAULT_ACCENT_DARK  = "violet";
export const DEFAULT_ACCENT_LIGHT = "indigo";
