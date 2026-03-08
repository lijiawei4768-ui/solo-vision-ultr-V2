// ─────────────────────────────────────────────────────────────
// src/i18n.js — Solo Vision Ultra 三语言系统
// Languages: "en" | "zh" | "mixed" (default)
// "mixed" = 操作用中文，音乐理论术语保留英文
// ─────────────────────────────────────────────────────────────
import { createContext, useContext } from "react";

export const LANG_KEYS = ["mixed", "zh", "en"];

export const LANG_LABELS = {
  mixed: "中英混合",
  zh:    "中文",
  en:    "English",
};

// ── Translation table ─────────────────────────────────────────
const T = {
  // ── App Shell
  appName:           { en: "Solo Vision", zh: "Solo Vision", mixed: "Solo Vision" },
  tabHome:           { en: "Home",        zh: "主页",         mixed: "主页" },
  tabNotes:          { en: "Notes",       zh: "音符",         mixed: "音符" },
  tabIntervals:      { en: "Intervals",   zh: "音程",         mixed: "Intervals" },
  tabChanges:        { en: "Changes",     zh: "和弦进行",      mixed: "Changes" },
  tabScales:         { en: "Scales",      zh: "音阶",         mixed: "音阶" },
  tabMe:             { en: "Me",          zh: "我",           mixed: "我" },

  // ── Home View
  todaysChallenge:   { en: "Today's Challenge", zh: "今日挑战", mixed: "今日挑战" },
  startPractice:     { en: "Start Practice →",  zh: "开始练习 →", mixed: "开始练习 →" },
  continueWhere:     { en: "Continue where you left off", zh: "继续上次练习", mixed: "继续上次练习" },
  resume:            { en: "Resume →",      zh: "继续 →",     mixed: "继续 →" },
  trainers:          { en: "Trainers",      zh: "训练器",      mixed: "训练器" },
  whatsNew:          { en: "What's New",    zh: "最新动态",    mixed: "What's New" },
  tapToRead:         { en: "Tap to read more", zh: "点击阅读更多", mixed: "点击阅读更多" },
  practiceTips:      { en: "Practice Tips", zh: "练习技巧",    mixed: "Practice Tips" },
  next:              { en: "Next →",        zh: "下一条 →",   mixed: "Next →" },
  streak:            { en: "Streak",        zh: "连续",        mixed: "Streak" },
  accuracy:          { en: "Accuracy",      zh: "准确率",      mixed: "准确率" },
  today:             { en: "Today",         zh: "今日",        mixed: "今日" },

  // ── Trainer Tutorial Section
  trainerBasic:      { en: "Basic",         zh: "基础",        mixed: "基础用法" },
  trainerAdvanced:   { en: "Advanced",      zh: "进阶",        mixed: "进阶用法" },
  trainerExtension:  { en: "Extension",     zh: "拓展",        mixed: "拓展用法" },

  // ── Notes Trainer
  noteTrainerTitle:  { en: "Note Trainer",  zh: "音符练习器",  mixed: "Note Trainer" },
  noteTrainerSub:    { en: "Find the note on the fretboard", zh: "在指板上找到该音符", mixed: "在指板上找到音符" },
  findNote:          { en: "Find this note", zh: "找到这个音符", mixed: "找到这个音符" },
  swipeReveal:       { en: "Swipe ← to reveal all", zh: "← 左滑显示全部位置", mixed: "← 左滑显示全部位置" },
  longPressReset:    { en: "Long press to reset", zh: "长按重置", mixed: "长按重置" },

  // ── Interval Trainer
  intervalTrainerTitle: { en: "Interval Trainer", zh: "音程练习器", mixed: "Interval Trainer" },
  intervalTrainerSub:   { en: "Find the interval", zh: "找到音程目标音", mixed: "找到 Interval" },
  fromRoot:          { en: "From root · find interval", zh: "从根音 · 找目标音程", mixed: "从根音 · find interval" },
  rootToInterval:    { en: "Root → Interval", zh: "根音 → 目标音程", mixed: "Root → Interval" },
  findRoot:          { en: "Find root",     zh: "找根音",      mixed: "找 Root" },
  limitZone:         { en: "Limit zone",    zh: "限制区域",    mixed: "Limit zone" },
  playRoot:          { en: "1. Play the ROOT", zh: "1. 弹奏根音 (Root)", mixed: "1. 弹奏 Root" },
  sayAloud:          { en: '2. Say aloud: "${iv}, ${shape}"', zh: '2. 大声说出："${iv}, ${shape}"', mixed: '2. 大声说出: "${iv}, ${shape}"' },
  speakBefore:       { en: "Speak before you play — engage your ear, not your muscle memory",
                       zh: "先开口再弹奏 — 启动大脑，不是肌肉记忆",
                       mixed: "先说出来再弹 — 用耳朵思考，不是手指记忆" },
  playInterval:      { en: "3. Play the ${iv}", zh: "3. 弹奏 ${iv}", mixed: "3. 弹奏 ${iv}" },

  // ── Changes Trainer
  changesTrainerTitle:  { en: "Changes Trainer", zh: "和弦进行练习器", mixed: "Changes Trainer" },
  changesTrainerSub:    { en: "Navigate chord tones", zh: "找和弦音", mixed: "找和弦音 (chord tones)" },
  nowChord:          { en: "Now",           zh: "当前",        mixed: "Now" },
  nextChord:         { en: "Next",          zh: "下一个",      mixed: "Next" },
  progression:       { en: "Progression",   zh: "和弦进行",    mixed: "Progression" },
  progressions:      { en: "Progressions",  zh: "和弦进行列表", mixed: "Progressions" },

  // ── Scale Trainer
  scaleTrainerTitle:    { en: "Scale Trainer",  zh: "音阶练习器",  mixed: "Scale Trainer" },
  scaleTrainerSub:      { en: "Navigate scale degrees", zh: "音阶度数导航", mixed: "音阶度数导航" },
  play:              { en: "Play",          zh: "弹奏",        mixed: "弹奏" },
  selectScale:       { en: "Select Scale",  zh: "选择音阶",    mixed: "选择音阶" },

  // ── Settings
  settings:          { en: "Settings",      zh: "设置",        mixed: "设置" },
  language:          { en: "Language",      zh: "语言",        mixed: "语言" },
  theme:             { en: "Theme",         zh: "主题",        mixed: "主题" },
  colorScheme:       { en: "Color Scheme",  zh: "配色方案",    mixed: "配色方案" },
  accentColor:       { en: "Accent Color",  zh: "强调色",      mixed: "强调色" },
  darkMode:          { en: "Dark Mode",     zh: "深色模式",    mixed: "深色模式" },
  lightMode:         { en: "Light Mode",    zh: "浅色模式",    mixed: "浅色模式" },
  instrument:        { en: "Instrument",    zh: "乐器",        mixed: "乐器" },
  tuning:            { en: "Tuning",        zh: "调音",        mixed: "调音" },
  display:           { en: "Display",       zh: "显示",        mixed: "显示" },
  leftHanded:        { en: "Left-Handed",   zh: "左手模式",    mixed: "左手模式" },
  showNoteNames:     { en: "Show Note Names", zh: "显示音符名称", mixed: "显示音名" },
  showAllPositions:  { en: "Show All Positions", zh: "显示全部位置", mixed: "显示全部位置" },
  fretRange:         { en: "Fret Range",    zh: "品格范围",    mixed: "Fret Range" },
  minFret:           { en: "Min Fret",      zh: "最低品",      mixed: "Min Fret" },
  maxFret:           { en: "Max Fret",      zh: "最高品",      mixed: "Max Fret" },
  calibration:       { en: "Calibration",   zh: "校准",        mixed: "校准" },
  rerunCalib:        { en: "⟳ Re-run Calibration", zh: "⟳ 重新校准", mixed: "⟳ 重新校准" },
  audioInput:        { en: "Audio Input",   zh: "音频输入",    mixed: "音频输入" },
  sensitivity:       { en: "Pickup Sensitivity", zh: "拾音灵敏度", mixed: "灵敏度" },
  about:             { en: "About",         zh: "关于",        mixed: "关于" },

  // ── Onboarding
  onboardWelcome:    { en: "Welcome to Solo Vision", zh: "欢迎使用 Solo Vision", mixed: "欢迎使用 Solo Vision" },
  onboardSub:        { en: "Master the fretboard with Tom Quayle's Intervallic Functions Method",
                       zh: "用 Tom Quayle 的音程函数法系统性提升你的指板视觉能力",
                       mixed: "用 Tom Quayle 的 Intervallic Functions 系统性掌握指板" },
  onboardSkip:       { en: "Skip intro", zh: "跳过介绍", mixed: "跳过介绍" },
  onboardNext:       { en: "Next →",     zh: "下一步 →", mixed: "下一步 →" },
  onboardDone:       { en: "Start Practicing →", zh: "开始练习 →", mixed: "开始练习 →" },

  // ── Stats
  stats:             { en: "Stats",          zh: "统计",        mixed: "统计" },
  sessionStats:      { en: "Session Stats",  zh: "本次统计",    mixed: "Session Stats" },
  practiceHistory:   { en: "Practice History", zh: "练习记录",  mixed: "练习记录" },
  heatmap:           { en: "Practice Heatmap — 12 Weeks", zh: "练习热力图 — 12周", mixed: "练习热力图 — 12 Weeks" },
  streakDays:        { en: "${n} day streak",  zh: "连续 ${n} 天", mixed: "连续 ${n} 天" },
  totalSessions:     { en: "Total Sessions",  zh: "总练习次数",  mixed: "总练习次数" },

  // ── Common
  correct:           { en: "Correct ✓",  zh: "正确 ✓",  mixed: "正确 ✓" },
  tryAgain:          { en: "Try again",  zh: "再试一次", mixed: "再试一次" },
  listening:         { en: "Listening",  zh: "聆听中",   mixed: "Listening" },
  total:             { en: "Total",      zh: "总计",     mixed: "总计" },
  on:                { en: "On",         zh: "开",       mixed: "开" },
  off:               { en: "Off",        zh: "关",       mixed: "关" },
  save:              { en: "Save",       zh: "保存",     mixed: "保存" },
  cancel:            { en: "Cancel",     zh: "取消",     mixed: "取消" },
  close:             { en: "Close",      zh: "关闭",     mixed: "关闭" },
  all:               { en: "All",        zh: "全部",     mixed: "全部" },
  clear:             { en: "Clear",      zh: "清除",     mixed: "清除" },
  learning:          { en: "Learning",   zh: "学习模式", mixed: "Learning" },
  blind:             { en: "Blind",      zh: "盲弹模式", mixed: "Blind" },
  rootFirst:         { en: "Root First", zh: "先找根音", mixed: "Root First" },
  coreDrill:         { en: "Core Drill", zh: "核心训练", mixed: "Core Drill" },
  zen:               { en: "Zen",        zh: "禅模式",   mixed: "Zen" },

  // ── Trainer descriptions for Home
  noteDesc:      { en: "Single note recognition across the fretboard", zh: "全指板单音识别练习", mixed: "全指板音符识别" },
  intervalDesc:  { en: "Relative pitch · Two-point intervals", zh: "相对音高 · 两点音程系统", mixed: "相对音高 · Two-point Intervals" },
  changesDesc:   { en: "28 progressions · Chord tone navigation", zh: "28个和弦进行 · 和弦音导航", mixed: "28个进行 · Chord Tone Navigation" },
  scaleDesc:     { en: "Scale modes · Melodic sequences", zh: "音阶模式 · 旋律序列", mixed: "音阶模式 · Melodic Sequences" },
};

// ── Interpolation helper ──────────────────────────────────────
// Usage: i18n("playInterval", { iv: "Major 3rd" })
export function i18n(key, vars = {}, lang = "mixed") {
  const entry = T[key];
  if (!entry) return key;
  let str = entry[lang] ?? entry.mixed ?? entry.en ?? key;
  // Replace ${varName} placeholders
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`\${${k}}`, v);
  }
  return str;
}

// ── Language Context ──────────────────────────────────────────
export const LangContext = createContext({ lang: "mixed", setLang: () => {} });
export function useLang() { return useContext(LangContext); }

// ── Hook for easy use in components ──────────────────────────
export function useI18n() {
  const { lang } = useLang();
  return (key, vars) => i18n(key, vars, lang);
}
