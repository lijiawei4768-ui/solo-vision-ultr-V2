// ─────────────────────────────────────────────────────────────
// trainers/intervals/constants.js
// Interval Trainer 专属常量和预设数据
// 从 IntervalsTrainer.jsx 提取，与逻辑完全解耦
// ─────────────────────────────────────────────────────────────

export const STRING_NAMES = ["E2", "A2", "D3", "G3", "B3", "e4"];

export const MODE_SEQUENCE = ["learning", "rootFirst", "blind", "coreDrill"];

export const MODE_CARDS = [
  { id: "learning",  label: "Visual",     sublabel: "Fretboard visible" },
  { id: "blind",     label: "Blind",      sublabel: "Fretboard hidden" },
  { id: "rootFirst", label: "Root First", sublabel: "Play root first" },
  { id: "coreDrill", label: "Core Drill", sublabel: "Reveal all shapes" },
];

export const INTERVAL_CARDS = [
  { id: "triad",   label: "Triad",   sublabel: "3rd + 5th" },
  { id: "seventh", label: "7th",     sublabel: "3rd + 5th + b7" },
  { id: "guide",   label: "Guide",   sublabel: "3rd + 7th" },
  { id: "all",     label: "All",     sublabel: "All 11 intervals" },
  { id: "custom",  label: "Custom",  sublabel: "Open editor →" },
];

export const INTERVAL_PRESETS = [
  { id: "triad",   label: "Triad",   summary: "3rd + 5th",        intervals: [3, 7] },
  { id: "seventh", label: "7th",     summary: "3rd + 5th + b7",   intervals: [3, 7, 10] },
  { id: "guide",   label: "Guide",   summary: "3rd + 7th",        intervals: [3, 10] },
  { id: "all",     label: "All",     summary: "All 11 intervals",  intervals: [1,2,3,4,5,6,7,8,9,10,11] },
  { id: "custom",  label: "Custom",  summary: null,                intervals: null },
];
export const INTERVAL_CYCLE = ["triad", "seventh", "guide", "all"];

export const SPACE_PRESETS = [
  { id: "full",   label: "Full",    summary: "All frets",     fretRange: { min:0,  max:12 }, strings: null,    enabled: false },
  { id: "pos1",   label: "Pos 1–5", summary: "Frets 1–5",    fretRange: { min:1,  max:5  }, strings: null,    enabled: true  },
  { id: "pos5",   label: "Pos 5–9", summary: "Frets 5–9",    fretRange: { min:5,  max:9  }, strings: null,    enabled: true  },
  { id: "ead",    label: "EAD",     summary: "E A D 1–5",     fretRange: { min:1,  max:5  }, strings: [0,1,2], enabled: true  },
  { id: "custom", label: "Custom",  summary: "Custom range",  fretRange: { min:0,  max:12 }, strings: null,    enabled: true  },
];
export const SPACE_CYCLE = ["full", "pos1", "pos5", "ead"];

export const FLOW_PRESETS = [
  { id: "free",     label: "Free",     summary: "No order",      order: "random",   enabled: false },
  { id: "low-high", label: "Low→High", summary: "E→A→D→G→B→e",  order: "low-high", enabled: true  },
  { id: "high-low", label: "High→Low", summary: "e→B→G→D→A→E",  order: "high-low", enabled: true  },
  { id: "custom",   label: "Custom",   summary: "Custom strings", order: "random",   enabled: true  },
];
export const FLOW_CYCLE = ["free", "low-high", "high-low"];

export const ENHARMONIC_PAIRS = {
  "b3": { partners: ["#2","#9"],  context: "b3 = minor chord tones; #2/#9 = altered dominants" },
  "#2": { partners: ["b3","#9"],  context: "#2 and #9 share the same shape — practice separately" },
  "#9": { partners: ["b3","#2"],  context: "#9 appears in dominant 7th (#9 chord) contexts" },
  "b6": { partners: ["#5"],       context: "b6 and #5 share one shape, different harmonic roles" },
  "#5": { partners: ["b6"],       context: "#5 = augmented/altered chords; b6 = minor" },
  "b7": { partners: ["#6"],       context: "b7 = dominant quality; rarely called #6" },
};

export const SEQ_INFO = {
  ascending:  { title: "Ascending ↑",     body: "Practice the scale going upward — from root to octave." },
  descending: { title: "Descending ↓",    body: "Practice going downward — from highest note back to root." },
  random:     { title: "Random Degree ⟳", body: "A random degree is chosen each rep." },
};

export const ROOT_INFO = {
  static:    { title: "Static Root",   body: "The root stays the same every cycle." },
  chromatic: { title: "Chromatic +½",  body: "Root rises by one semitone after each complete cycle." },
  random:    { title: "Random Root",   body: "Root changes randomly after each cycle." },
};

export const ENTRY_INFO = {
  title: "Entry Point",
  body:  "Selects which scale degree you start from. Starting on 3 or 5 instead of 1 builds deep knowledge.",
};

// ── 工具函数（无副作用，与 constants 同属数据层）─────────────
export function getShapeType(rootStr, rootFret, targetStr, targetFret) {
  const ds = targetStr - rootStr;
  const df = targetFret - rootFret;
  if (ds === 0) return "same string";
  if (Math.abs(ds) === 1) return df >= 0 ? "ascending +1 string" : "descending +1 string";
  if (Math.abs(ds) === 2) return df >= 0 ? "skip string ascending" : "skip string descending";
  return `${Math.abs(ds)}-string span`;
}
