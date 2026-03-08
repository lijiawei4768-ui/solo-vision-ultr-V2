
// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS v4.1 — Solo Vision Ultra
// 主题系统升级：10+ 配色方案 + SPRINGS 动画规范
//
// Bug 修复 v4.1：
//   • getTokensForTheme() 增加 themeName 字段
//   • PALETTE_DEFS 的 theme token 含 name，ControlCenter 可直接读取
//   • 移除 isDark override 参数（改为在 App/CC 层通过 themeId 同步）
//
// 6 个可定制区域：
//   1. bg         — 背景颜色与材质（solid / mesh / gradient-mesh）
//   2. glass      — GlassCard 模糊 + 边框
//   3. noteRoot   — 根音点颜色
//   4. noteTarget — 目标音点颜色
//   5. arcPair    — 两点连线弧线颜色
//   6. fretboard  — 指板木色 / 品丝颜色 / 标记点颜色
// ─────────────────────────────────────────────────────────────

export const FONT_DISPLAY = "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif";
export const FONT_TEXT    = "'SF Pro Text',    -apple-system, 'Helvetica Neue', sans-serif";
export const FONT_MONO    = "'SF Mono', 'Fira Code', 'Courier New', monospace";

// ─────────────────────────────────────────────────────────────
// 工具函数：hex/rgba → rgba with opacity
// ─────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(136,117,255,${alpha})`;
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
    const match = hex.match(/[\d.]+/g);
    if (match && match.length >= 3) {
      return `rgba(${match[0]},${match[1]},${match[2]},${alpha})`;
    }
    return hex;
  }
  if (hex.startsWith("linear-gradient")) return hex; // 渐变直接返回
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────
// SPRINGS — 全局动画规范（PART 10.4）
// ─────────────────────────────────────────────────────────────
export const SPRINGS = {
  // ── Navigation ──────────────────────────────────────────────
  tabSwitch:       { type: "spring", stiffness: 320, damping: 30, mass: 1.0 },
  pageTransition:  { type: "spring", stiffness: 260, damping: 26, mass: 1.1 },
  // ── Sheet / Modal ───────────────────────────────────────────
  sheetPresent:    { type: "spring", stiffness: 280, damping: 28, mass: 1.2 },
  sheetDismiss:    { type: "spring", stiffness: 350, damping: 34, mass: 0.9 },
  // ── Tap / Icon ──────────────────────────────────────────────
  iconTap:         { type: "spring", stiffness: 600, damping: 35 },
  tap:             { type: "spring", stiffness: 600, damping: 32, mass: 0.5 },
  iconActivate:    { type: "spring", stiffness: 500, damping: 20 },
  iconIdle:        { duration: 2, repeat: Infinity, ease: "easeInOut" }, // NOTE: not a spring
  // ── Trainer Feedback ────────────────────────────────────────
  correct:         { type: "spring", stiffness: 480, damping: 20, mass: 0.7 },
  noteCorrect:     { type: "spring", stiffness: 520, damping: 18, mass: 0.6 },
  wrong:           { type: "spring", stiffness: 400, damping: 22, mass: 0.8 },
  // ── Card / Content ──────────────────────────────────────────
  cardExpand:      { type: "spring", stiffness: 340, damping: 28 },
  cardAppear:      { type: "spring", stiffness: 340, damping: 28, mass: 1.0 },
  jelly:           { type: "spring", stiffness: 460, damping: 22, mass: 0.8 },
  // ── Counter / Note ──────────────────────────────────────────
  counter:         { type: "spring", stiffness: 450, damping: 22 },
  noteAppear:      { type: "spring", stiffness: 500, damping: 22, mass: 0.6 },
  // ── Subtle / Ambient ────────────────────────────────────────
  settle:          { type: "spring", stiffness: 200, damping: 26, mass: 1.3 },
  pulse:           { type: "spring", stiffness: 150, damping: 12, mass: 1.5 },
  feather:         { type: "spring", stiffness: 420, damping: 26, mass: 0.6 },
  typewriter:      { duration: 0.04 },
};

// ─────────────────────────────────────────────────────────────
// BASE TOKENS — 深色 / 浅色基础（向后兼容保留）
// ─────────────────────────────────────────────────────────────

export const DT = {
  surface0:      "rgba(14,14,16,1)",
  surface1:      "rgba(255,255,255,0.055)",
  surface2:      "rgba(255,255,255,0.09)",
  surface3:      "rgba(255,255,255,0.14)",
  border:        "rgba(255,255,255,0.10)",
  borderHi:      "rgba(255,255,255,0.20)",
  textPrimary:   "rgba(255,255,255,0.95)",
  textSecondary: "rgba(255,255,255,0.65)",
  textTertiary:  "rgba(255,255,255,0.40)",
  accent:        "#8875FF",
  accentSub:     "rgba(136,117,255,0.16)",
  accentBorder:  "rgba(136,117,255,0.35)",
  positive:      "#30D158",
  negative:      "#FF453A",
  warning:       "#FFD60A",
  noteRoot:        "#C99A50",
  noteRootText:    "#1a0e00",
  noteRootGlow:    "rgba(201,154,80,0.18)",
  noteTarget:      "#3CC9B5",
  noteTargetText:  "#001a16",
  noteTargetGlow:  "rgba(60,201,181,0.15)",
  noteScale:       "#30D158",
  noteScaleText:   "#001a06",
  noteScaleGlow:   "rgba(48,209,88,0.12)",
  blur1: "blur(16px)",
  blur2: "blur(32px)",
  blur3: "blur(56px)",
  spring:     { type: "spring", stiffness: 320, damping: 26 },
  springSnap: { type: "spring", stiffness: 460, damping: 30 },
  bg: {
    type:   "mesh",
    color1: "rgba(30,20,80,0.22)",
    color2: "rgba(80,20,60,0.14)",
    color3: "rgba(20,30,60,0.10)",
  },
  glass: {
    blur:      "blur(20px)",
    surface1:  "rgba(255,255,255,0.055)",
    border:    "rgba(255,255,255,0.10)",
    borderTop: "rgba(255,255,255,0.18)",
  },
  arcPair: {
    color: "#8875FF",
    glow:  "rgba(136,117,255,0.3)",
  },
  fretboard: {
    woodColor:   "rgba(30,25,20,0.95)",
    fretColor:   "rgba(200,180,140,0.35)",
    markerColor: "rgba(255,255,255,0.12)",
  },
};

export const LT = {
  surface0:      "#F2F2F7",
  surface1:      "rgba(255,255,255,0.72)",
  surface2:      "rgba(255,255,255,0.85)",
  surface3:      "rgba(0,0,0,0.08)",
  border:        "rgba(60,60,67,0.18)",
  borderHi:      "rgba(60,60,67,0.32)",
  textPrimary:   "#1C1C1E",
  textSecondary: "#8E8E93",
  textTertiary:  "#C7C7CC",
  accent:        "#7B63FF",
  accentSub:     "rgba(123,99,255,0.10)",
  accentBorder:  "rgba(123,99,255,0.28)",
  positive:      "#34C759",
  negative:      "#FF3B30",
  warning:       "#FF9500",
  noteRoot:        "#B8862A",
  noteRootText:    "#ffffff",
  noteRootGlow:    "rgba(184,134,42,0.20)",
  noteTarget:      "#2AB5A2",
  noteTargetText:  "#ffffff",
  noteTargetGlow:  "rgba(42,181,162,0.18)",
  noteScale:       "#28A745",
  noteScaleText:   "#ffffff",
  noteScaleGlow:   "rgba(40,167,69,0.15)",
  blur1: "blur(16px)",
  blur2: "blur(32px)",
  blur3: "blur(56px)",
  spring:     { type: "spring", stiffness: 320, damping: 26 },
  springSnap: { type: "spring", stiffness: 460, damping: 30 },
  bg: {
    type:  "solid",
    color: "#F2F2F7",
  },
  glass: {
    blur:      "blur(14px)",
    surface1:  "rgba(255,255,255,0.68)",
    border:    "rgba(60,60,67,0.18)",
    borderTop: "rgba(60,60,67,0.28)",
  },
  arcPair: {
    color: "#7B63FF",
    glow:  "rgba(123,99,255,0.18)",
  },
  fretboard: {
    woodColor:   "rgba(245,240,235,0.96)",
    fretColor:   "rgba(100,80,60,0.35)",
    markerColor: "rgba(100,80,60,0.15)",
  },
};

// ─────────────────────────────────────────────────────────────
// THEMES — 12 个完整配色方案
// dark: true  → OLED 黑色基础
// dark: false → iOS 白色基础
// ─────────────────────────────────────────────────────────────
export const THEMES = {

  "violet-deep": {
    id: "violet-deep", name: "Violet Deep", dark: true, accent: "#8875FF",
    bg: { type: "mesh", color1: "rgba(30,20,80,0.22)", color2: "rgba(80,20,60,0.14)", color3: "rgba(20,30,60,0.10)" },
    glass: { blur: "blur(20px)", surface1: "rgba(255,255,255,0.055)", border: "rgba(255,255,255,0.10)", borderTop: "rgba(255,255,255,0.18)" },
    noteRoot: "#C99A50", noteTarget: "#8875FF", noteScale: "#30D158",
    arcPair: { color: "#8875FF", glow: "rgba(136,117,255,0.3)" },
    fretboard: { woodColor: "rgba(30,25,20,0.95)", fretColor: "rgba(200,180,140,0.35)", markerColor: "rgba(255,255,255,0.12)" },
  },

  "midnight-blue": {
    id: "midnight-blue", name: "Midnight Blue", dark: true, accent: "#4A9EFF",
    bg: { type: "mesh", color1: "rgba(10,30,80,0.28)", color2: "rgba(20,60,120,0.16)", color3: "rgba(5,20,50,0.12)" },
    glass: { blur: "blur(24px)", surface1: "rgba(255,255,255,0.05)", border: "rgba(100,160,255,0.12)", borderTop: "rgba(100,160,255,0.22)" },
    noteRoot: "#FFD166", noteTarget: "#4A9EFF", noteScale: "#2ECC71",
    arcPair: { color: "#4A9EFF", glow: "rgba(74,158,255,0.3)" },
    fretboard: { woodColor: "rgba(10,20,40,0.95)", fretColor: "rgba(100,160,255,0.30)", markerColor: "rgba(100,160,255,0.15)" },
  },

  "ember": {
    id: "ember", name: "Ember", dark: true, accent: "#E8A23C",
    bg: { type: "mesh", color1: "rgba(80,40,10,0.22)", color2: "rgba(140,60,10,0.16)", color3: "rgba(60,20,5,0.10)" },
    glass: { blur: "blur(18px)", surface1: "rgba(255,255,255,0.05)", border: "rgba(232,162,60,0.12)", borderTop: "rgba(232,162,60,0.22)" },
    noteRoot: "#E8A23C", noteTarget: "#3CC9B5", noteScale: "#30D158",
    arcPair: { color: "#E8A23C", glow: "rgba(232,162,60,0.35)" },
    fretboard: { woodColor: "rgba(40,25,10,0.96)", fretColor: "rgba(200,150,60,0.35)", markerColor: "rgba(232,162,60,0.15)" },
  },

  "forest": {
    id: "forest", name: "Forest", dark: true, accent: "#30D158",
    bg: { type: "mesh", color1: "rgba(10,50,20,0.24)", color2: "rgba(20,80,30,0.14)", color3: "rgba(5,30,15,0.10)" },
    glass: { blur: "blur(20px)", surface1: "rgba(255,255,255,0.05)", border: "rgba(48,209,88,0.12)", borderTop: "rgba(48,209,88,0.20)" },
    noteRoot: "#FFD166", noteTarget: "#30D158", noteScale: "#4A9EFF",
    arcPair: { color: "#30D158", glow: "rgba(48,209,88,0.30)" },
    fretboard: { woodColor: "rgba(15,30,15,0.95)", fretColor: "rgba(48,209,88,0.28)", markerColor: "rgba(48,209,88,0.12)" },
  },

  "crimson": {
    id: "crimson", name: "Crimson", dark: true, accent: "#FF453A",
    bg: { type: "mesh", color1: "rgba(80,10,10,0.22)", color2: "rgba(120,20,20,0.14)", color3: "rgba(50,5,5,0.10)" },
    glass: { blur: "blur(20px)", surface1: "rgba(255,255,255,0.05)", border: "rgba(255,69,58,0.12)", borderTop: "rgba(255,69,58,0.22)" },
    noteRoot: "#FFD166", noteTarget: "#FF453A", noteScale: "#30D158",
    arcPair: { color: "#FF453A", glow: "rgba(255,69,58,0.30)" },
    fretboard: { woodColor: "rgba(40,10,10,0.96)", fretColor: "rgba(255,69,58,0.28)", markerColor: "rgba(255,69,58,0.12)" },
  },

  "aurora": {
    id: "aurora", name: "Aurora", dark: true, accent: "#A0E4FF",
    bg: { type: "gradient-mesh", color1: "rgba(0,200,180,0.16)", color2: "rgba(60,120,255,0.14)", color3: "rgba(140,50,255,0.12)" },
    glass: { blur: "blur(24px)", surface1: "rgba(255,255,255,0.06)", border: "rgba(160,228,255,0.12)", borderTop: "rgba(160,228,255,0.22)" },
    noteRoot: "#FFD166", noteTarget: "#A0E4FF", noteScale: "#2ECC71",
    arcPair: { color: "linear-gradient(90deg, #3CF0D0, #6BA4FF)", glow: "rgba(160,228,255,0.30)" },
    fretboard: { woodColor: "rgba(10,20,30,0.96)", fretColor: "rgba(160,228,255,0.25)", markerColor: "rgba(160,228,255,0.10)" },
  },

  "rose-gold": {
    id: "rose-gold", name: "Rose Gold", dark: true, accent: "#FF9F7F",
    bg: { type: "mesh", color1: "rgba(100,40,50,0.22)", color2: "rgba(150,80,60,0.14)", color3: "rgba(80,30,40,0.10)" },
    glass: { blur: "blur(20px)", surface1: "rgba(255,255,255,0.06)", border: "rgba(255,159,127,0.14)", borderTop: "rgba(255,159,127,0.24)" },
    noteRoot: "#FFD166", noteTarget: "#FF9F7F", noteScale: "#30D158",
    arcPair: { color: "#FF9F7F", glow: "rgba(255,159,127,0.30)" },
    fretboard: { woodColor: "rgba(50,20,20,0.96)", fretColor: "rgba(255,159,127,0.28)", markerColor: "rgba(255,159,127,0.12)" },
  },

  "obsidian": {
    id: "obsidian", name: "Obsidian", dark: true, accent: "rgba(255,255,255,0.80)",
    bg: { type: "solid", color: "#000000" },
    glass: { blur: "blur(12px)", surface1: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)", borderTop: "rgba(255,255,255,0.12)" },
    noteRoot: "rgba(255,255,255,0.90)", noteTarget: "rgba(255,255,255,0.60)", noteScale: "rgba(255,255,255,0.45)",
    arcPair: { color: "rgba(255,255,255,0.60)", glow: "rgba(255,255,255,0.12)" },
    fretboard: { woodColor: "rgba(5,5,5,0.98)", fretColor: "rgba(255,255,255,0.18)", markerColor: "rgba(255,255,255,0.08)" },
  },

  // ── 唯一浅色主题（dark: false）────────────────────────────
  "ios-light": {
    id: "ios-light", name: "iOS Light", dark: false, accent: "#7B63FF",
    bg: { type: "solid", color: "#F2F2F7" },
    glass: { blur: "blur(20px)", surface1: "#FFFFFF", border: "rgba(60,60,67,0.18)", borderTop: "rgba(60,60,67,0.28)" },
    noteRoot: "#B8862A", noteTarget: "#2AB5A2", noteScale: "#28A745",
    arcPair: { color: "#7B63FF", glow: "rgba(123,99,255,0.18)" },
    fretboard: { woodColor: "rgba(245,240,235,0.96)", fretColor: "rgba(100,80,60,0.35)", markerColor: "rgba(100,80,60,0.15)" },
  },

  "sunset": {
    id: "sunset", name: "Sunset", dark: true, accent: "#FF7B54",
    bg: { type: "gradient-mesh", color1: "rgba(255,80,50,0.15)", color2: "rgba(100,20,120,0.18)", color3: "rgba(180,60,80,0.10)" },
    glass: { blur: "blur(22px)", surface1: "rgba(255,255,255,0.055)", border: "rgba(255,123,84,0.12)", borderTop: "rgba(255,123,84,0.22)" },
    noteRoot: "#FFD166", noteTarget: "#FF7B54", noteScale: "#A0E4FF",
    arcPair: { color: "linear-gradient(90deg, #FF7B54, #C44FFF)", glow: "rgba(255,123,84,0.28)" },
    fretboard: { woodColor: "rgba(35,15,10,0.96)", fretColor: "rgba(255,123,84,0.25)", markerColor: "rgba(255,123,84,0.10)" },
  },

  "ocean": {
    id: "ocean", name: "Ocean", dark: true, accent: "#00CED1",
    bg: { type: "mesh", color1: "rgba(0,80,100,0.24)", color2: "rgba(0,120,140,0.14)", color3: "rgba(0,50,80,0.12)" },
    glass: { blur: "blur(22px)", surface1: "rgba(255,255,255,0.05)", border: "rgba(0,206,209,0.14)", borderTop: "rgba(0,206,209,0.24)" },
    noteRoot: "#FFD166", noteTarget: "#00CED1", noteScale: "#5ED0A8",
    arcPair: { color: "#00CED1", glow: "rgba(0,206,209,0.32)" },
    fretboard: { woodColor: "rgba(5,25,35,0.96)", fretColor: "rgba(0,206,209,0.28)", markerColor: "rgba(0,206,209,0.12)" },
  },

  "sakura": {
    id: "sakura", name: "Sakura", dark: true, accent: "#FF8FA3",
    bg: { type: "mesh", color1: "rgba(120,30,60,0.20)", color2: "rgba(180,50,90,0.12)", color3: "rgba(80,20,50,0.10)" },
    glass: { blur: "blur(22px)", surface1: "rgba(255,255,255,0.06)", border: "rgba(255,143,163,0.14)", borderTop: "rgba(255,143,163,0.26)" },
    noteRoot: "#FFE0A3", noteTarget: "#FF8FA3", noteScale: "#A8E6CF",
    arcPair: { color: "#FF8FA3", glow: "rgba(255,143,163,0.28)" },
    fretboard: { woodColor: "rgba(45,15,25,0.96)", fretColor: "rgba(255,143,163,0.25)", markerColor: "rgba(255,143,163,0.10)" },
  },
};

// ─────────────────────────────────────────────────────────────
// getTheme() — 获取 theme 定义对象（不含展开 tokens）
// ─────────────────────────────────────────────────────────────
export function getTheme(themeId) {
  return THEMES[themeId] ?? THEMES["violet-deep"];
}

// ─────────────────────────────────────────────────────────────
// getTokensForTheme(themeId) — 主入口
//
// 返回完整 DT 结构兼容的 token 对象 + 6 区域配置。
// 设计原则：themeId 决定一切，dark/light 由 theme.dark 决定。
// 深/浅切换通过切换 themeId（配合 ControlCenter）实现，
// 不再依赖 settings.colorMode 与 T 之间的手动同步。
//
// App.jsx 用法：
//   const T    = getTokensForTheme(settings.themeId ?? "violet-deep");
//   const isDark = T.themeDark;   ← 从 T 读，不要另算
// ─────────────────────────────────────────────────────────────
export function getTokensForTheme(themeId) {
  const theme = THEMES[themeId] ?? THEMES["violet-deep"];
  const base  = theme.dark ? { ...DT } : { ...LT };

  const accentSub    = hexToRgba(theme.accent, theme.dark ? 0.16 : 0.10);
  const accentBorder = hexToRgba(theme.accent, theme.dark ? 0.35 : 0.28);
  const noteRootGlow   = hexToRgba(theme.noteRoot,   theme.dark ? 0.18 : 0.20);
  const noteTargetGlow = hexToRgba(theme.noteTarget, theme.dark ? 0.15 : 0.18);
  const noteScaleGlow  = hexToRgba(theme.noteScale,  theme.dark ? 0.12 : 0.15);

  return {
    ...base,

    // Accent
    accent:       theme.accent,
    accentSub,
    accentBorder,

    // Note dots
    noteRoot:        theme.noteRoot,
    noteRootText:    theme.dark ? "#1a0e00" : "#ffffff",
    noteRootGlow,
    noteTarget:      theme.noteTarget,
    noteTargetText:  theme.dark ? "#001a16" : "#ffffff",
    noteTargetGlow,
    noteScale:       theme.noteScale,
    noteScaleText:   theme.dark ? "#001a06" : "#ffffff",
    noteScaleGlow,

    // 6 区域
    bg:        theme.bg,
    glass:     theme.glass,
    arcPair:   theme.arcPair,
    fretboard: theme.fretboard,

    // 标识（供 App.jsx / ControlCenter 使用）
    themeId:   theme.id,
    themeName: theme.name,    // ← Bug fix：增加 name，ControlCenter 展示用
    themeDark: theme.dark,    // ← Bug fix：isDark 的唯一来源
  };
}

// ─────────────────────────────────────────────────────────────
// THEME_GROUPS — Settings UI 分组
// ─────────────────────────────────────────────────────────────
export const THEME_GROUPS = {
  dark:  Object.values(THEMES).filter(t =>  t.dark),
  light: Object.values(THEMES).filter(t => !t.dark),
};

// ─────────────────────────────────────────────────────────────
// 向后兼容层
// ─────────────────────────────────────────────────────────────
// PALETTE_KEYS：仅真实 theme IDs（不含 DT/LT）
export const PALETTE_KEYS = Object.keys(THEMES);

// PALETTE_DEFS：包含 DT/LT（旧代码用）+ 所有 theme 的完整 tokens
export const PALETTE_DEFS = {
  DT,
  LT,
  ...Object.fromEntries(
    Object.keys(THEMES).map(id => [id, getTokensForTheme(id)])
  ),
};