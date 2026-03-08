// ─────────────────────────────────────────────────────────────
// Solo Vision Ultra — Training Curriculum v5.0
//
// 新架构：开放模块系统（不强制关卡解锁）
// New architecture: Open Module System (no forced level gates)
//
// 包含：
//   • MODULE_GROUPS  — 3个训练模块组，自由进入
//   • PRACTICE_TRACKS — 推荐路径 A/B/C（非强制）
//   • CURRICULUM     — 向后兼容（PersonaView / StageMapModal）
//   • getLevelById / getAllLevels / getTodayAssignment — 工具函数
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// MODULE GROUPS — 自由进入，无等级锁定
// ═══════════════════════════════════════════════════════════════
export const MODULE_GROUPS = [
  {
    id: "fretboard",
    title: "Fretboard Literacy",
    titleZh: "指板识字",
    subtitle: "See any note in 0.5 seconds",
    subtitleZh: "任意音符 0.5 秒定位",
    description: "Know every note by sight and sound. No shapes — pure note recognition.",
    descriptionZh: "通过视觉和声音认识指板上每个音符，不依赖把位形状。",
    icon: "♩",
    color: "#4A9EFF",
    trainer: "note",
    modules: [
      {
        id: "fb-learn",
        title: "Note Recognition",
        titleZh: "音符识别",
        desc: "Find any note on the fretboard",
        descZh: "在指板上找到任意音符",
        presets: {
          basic:    { minFret: 0, maxFret: 5,  timerSeconds: null, label: "基础",    labelEn: "Basic"    },
          advanced: { minFret: 0, maxFret: 12, timerSeconds: 4,    label: "进阶",    labelEn: "Advanced"  },
          pro:      { minFret: 0, maxFret: 12, timerSeconds: 1.5,  label: "职业强度", labelEn: "Pro"       },
        },
      },
      {
        id: "fb-string",
        title: "String Focus",
        titleZh: "单弦专注",
        desc: "Master one string at a time",
        descZh: "逐弦精通",
        presets: {
          basic:    { minFret: 0, maxFret: 12, timerSeconds: null, label: "基础",    labelEn: "Basic"    },
          advanced: { minFret: 0, maxFret: 12, timerSeconds: 3,    label: "进阶",    labelEn: "Advanced"  },
          pro:      { minFret: 0, maxFret: 12, timerSeconds: 1.2,  label: "职业强度", labelEn: "Pro"       },
        },
      },
      {
        id: "fb-blind",
        title: "Blind Mode",
        titleZh: "盲弹模式",
        desc: "Note labels hidden — ear + visual memory",
        descZh: "隐藏音符标签，靠耳朵和视觉记忆",
        presets: {
          basic:    { minFret: 0, maxFret: 5,  timerSeconds: null, label: "基础",    labelEn: "Basic"    },
          advanced: { minFret: 0, maxFret: 12, timerSeconds: 3,    label: "进阶",    labelEn: "Advanced"  },
          pro:      { minFret: 0, maxFret: 12, timerSeconds: 1.5,  label: "职业强度", labelEn: "Pro"       },
        },
      },
    ],
  },
  {
    id: "interval",
    title: "Interval Vision",
    titleZh: "音程视觉",
    subtitle: "See intervals without shapes",
    subtitleZh: "不依赖把位，直接看到音程",
    description: "From any root, instantly see all 3rds, 5ths, 7ths. Two-point line-of-sight thinking.",
    descriptionZh: "从任意根音出发，立即看到所有三度、五度、七度。两点视线思维。",
    icon: "◎",
    color: "#A78BFA",
    trainer: "interval",
    modules: [
      {
        id: "iv-core",
        title: "Root Anchoring",
        titleZh: "根音锚点",
        desc: "Root + perfect 4th, 5th, octave",
        descZh: "根音 + 纯四度、纯五度、八度",
        presets: {
          basic:    { intervals: ["P4","P5","P8"], timerSeconds: 8,   label: "基础",    labelEn: "Basic"    },
          advanced: { intervals: ["P4","P5","M3","m3"], timerSeconds: 4, label: "进阶", labelEn: "Advanced"  },
          pro:      { intervals: ["P4","P5","M3","m3","M7","m7"], timerSeconds: 2, label: "职业强度", labelEn: "Pro" },
        },
      },
      {
        id: "iv-two",
        title: "Two-Point Drill",
        titleZh: "双点练习",
        desc: "Root-to-interval across all zones",
        descZh: "根音到音程，所有区域",
        presets: {
          basic:    { intervals: ["M3","m3","P5"], timerSeconds: 6,   label: "基础",    labelEn: "Basic"    },
          advanced: { intervals: ["M3","m3","P5","M7","m7","M2"], timerSeconds: 4, label: "进阶", labelEn: "Advanced" },
          pro:      { intervals: ["M3","m3","P5","M7","m7","M2","P4","A4"], timerSeconds: 1.5, label: "职业强度", labelEn: "Pro" },
        },
      },
      {
        id: "iv-speed",
        title: "Speed Reaction",
        titleZh: "速度挑战",
        desc: "All intervals — reaction under 2 seconds",
        descZh: "所有音程，2 秒内反应",
        presets: {
          basic:    { intervals: ["P5","M3","m3"], timerSeconds: 4,   label: "基础",    labelEn: "Basic"    },
          advanced: { intervals: ["P5","M3","m3","M7","m7"], timerSeconds: 2.5, label: "进阶", labelEn: "Advanced" },
          pro:      { intervals: ["M3","m3","P5","M7","m7","M2","P4","A4","m6","M6"], timerSeconds: 1.5, label: "职业强度", labelEn: "Pro" },
        },
      },
    ],
  },
  {
    id: "harmony",
    title: "Harmonic Navigation",
    titleZh: "和声导航",
    subtitle: "Navigate harmony without patterns",
    subtitleZh: "脱离 Pattern 进行和声移动",
    description: "From root to chord tones, guide tones, and real-time changes. Function-based, not shape-based.",
    descriptionZh: "从根音到和弦音、引导音、实时和弦进行。功能性思维，不是形状思维。",
    icon: "♫",
    color: "#F97316",
    trainer: "changes",
    modules: [
      {
        id: "hm-root",
        title: "Root-to-Root Navigation",
        titleZh: "根音导航",
        desc: "Follow chord roots through progressions",
        descZh: "在和弦进行中跟踪根音",
        presets: {
          basic:    { target: "root",  bpm: 60,  label: "基础",    labelEn: "Basic"    },
          advanced: { target: "root",  bpm: 100, label: "进阶",    labelEn: "Advanced"  },
          pro:      { target: "root",  bpm: 140, label: "职业强度", labelEn: "Pro"       },
        },
      },
      {
        id: "hm-chord",
        title: "Chord Tone Focus",
        titleZh: "和弦音专注",
        desc: "Root, 3rd, 5th, 7th navigation",
        descZh: "根音、三度、五度、七度导航",
        presets: {
          basic:    { target: "chord", bpm: 60,  label: "基础",    labelEn: "Basic"    },
          advanced: { target: "chord", bpm: 90,  label: "进阶",    labelEn: "Advanced"  },
          pro:      { target: "chord", bpm: 130, label: "职业强度", labelEn: "Pro"       },
        },
      },
      {
        id: "hm-guide",
        title: "Guide Tone Focus",
        titleZh: "引导音专注",
        desc: "3rd and 7th voice leading",
        descZh: "三度和七度声部进行",
        presets: {
          basic:    { target: "guide", bpm: 60,  label: "基础",    labelEn: "Basic"    },
          advanced: { target: "guide", bpm: 90,  label: "进阶",    labelEn: "Advanced"  },
          pro:      { target: "guide", bpm: 120, label: "职业强度", labelEn: "Pro"       },
        },
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// PRACTICE TRACKS — 推荐路径（非强制）
// ═══════════════════════════════════════════════════════════════
export const PRACTICE_TRACKS = [
  {
    id: "beginner",
    label: "Track A",
    labelZh: "路径 A",
    name: "Beginner Path",
    nameZh: "初学者路径",
    color: "#4A9EFF",
    steps: [
      { groupId: "fretboard", moduleId: "fb-learn",  preset: "basic"    },
      { groupId: "interval",  moduleId: "iv-core",   preset: "basic"    },
      { groupId: "interval",  moduleId: "iv-two",    preset: "basic"    },
      { groupId: "harmony",   moduleId: "hm-root",   preset: "basic"    },
    ],
    desc: "Build note recognition → add intervals → intro to harmony",
    descZh: "建立音符识别 → 添加音程 → 和声入门",
  },
  {
    id: "intermediate",
    label: "Track B",
    labelZh: "路径 B",
    name: "Intermediate Path",
    nameZh: "中级路径",
    color: "#A78BFA",
    steps: [
      { groupId: "interval",  moduleId: "iv-two",    preset: "advanced" },
      { groupId: "interval",  moduleId: "iv-speed",  preset: "basic"    },
      { groupId: "harmony",   moduleId: "hm-chord",  preset: "advanced" },
      { groupId: "harmony",   moduleId: "hm-guide",  preset: "basic"    },
    ],
    desc: "Deepen interval vision → chord tones → voice leading",
    descZh: "深化音程视觉 → 和弦音 → 声部进行",
  },
  {
    id: "pro",
    label: "Track C",
    labelZh: "路径 C",
    name: "Pro Speed Track",
    nameZh: "职业速度路径",
    color: "#F97316",
    steps: [
      { groupId: "fretboard", moduleId: "fb-blind",  preset: "pro"      },
      { groupId: "interval",  moduleId: "iv-speed",  preset: "pro"      },
      { groupId: "harmony",   moduleId: "hm-guide",  preset: "pro"      },
    ],
    desc: "Full neck · Reaction < 1.5s · Real-time changes",
    descZh: "全颈 · 反应 < 1.5 秒 · 实时和弦进行",
  },
];

// ═══════════════════════════════════════════════════════════════
// CURRICULUM — 向后兼容（PersonaView / StageMapModal / useProgressSystem）
// Backward compat: kept for existing components
// ═══════════════════════════════════════════════════════════════
export const CURRICULUM = {
  stages: [
    {
      id: 1,
      title: "Fretboard Literacy",  titleZh: "指板识字",
      subtitle: "See any note in 0.5 seconds", subtitleZh: "任意音符 0.5 秒定位",
      color: "#4A9EFF",
      icon: "♩",
      description:   "Know every note by sight and sound. No shapes — pure note recognition.",
      descriptionZh: "通过视觉和声音认识指板上每个音符，不依赖把位形状。",
      levels: [
        {
          id: "1-1", level: 1,
          title: "Open Position",  titleZh: "开放把位",
          description: "Open strings + frets 1–5, all strings. No timer.",
          descriptionZh: "开放弦 + 1–5 品，全弦，无时间限制",
          trainer: "note",
          config: { minFret: 0, maxFret: 5, timerSeconds: null, mode: "learning" },
          successCriteria: { accuracy: 90, streak: 5 },
          unlocks: ["1-2"],
        },
        {
          id: "1-2", level: 2,
          title: "Mid Neck", titleZh: "中把位",
          description: "Frets 5–9, all strings. 5-second timer.",
          descriptionZh: "5–9 品全弦，5 秒计时",
          trainer: "note",
          config: { minFret: 5, maxFret: 9, timerSeconds: 5, mode: "practice" },
          successCriteria: { accuracy: 85, streak: 8 },
          unlocks: ["1-3"],
        },
        {
          id: "1-3", level: 3,
          title: "Full Neck",      titleZh: "全颈",
          description: "All frets, 4-second reaction time.",
          descriptionZh: "全品格，4 秒反应",
          trainer: "note",
          config: { minFret: 0, maxFret: 12, timerSeconds: 4, mode: "practice" },
          successCriteria: { accuracy: 80, streak: 10 },
          unlocks: ["1-4"],
        },
        {
          id: "1-4", level: 4,
          title: "Blind Mode",     titleZh: "盲弹模式",
          description: "Note labels hidden. 2-second limit.",
          descriptionZh: "音符标签隐藏，2 秒限制",
          trainer: "note",
          config: { minFret: 0, maxFret: 12, timerSeconds: 2, mode: "blind" },
          successCriteria: { accuracy: 80, streak: 12 },
          unlocks: ["1-5"],
        },
        {
          id: "1-5", level: 5,
          title: "Speed Master",   titleZh: "速度精通",
          description: "Full neck, 1.5 second reactions.",
          descriptionZh: "全颈，1.5 秒反应，精通等级",
          trainer: "note",
          config: { minFret: 0, maxFret: 12, timerSeconds: 1.5, mode: "speed" },
          successCriteria: { accuracy: 85, streak: 15 },
          unlocks: ["2-1"],
        },
      ],
    },
    {
      id: 2,
      title: "Interval Vision",    titleZh: "音程视觉",
      subtitle: "See intervals without shapes", subtitleZh: "不依赖把位，直接看到音程",
      color: "#A78BFA",
      icon: "◎",
      description:   "From any root, instantly see all 3rds, 5ths, 7ths. Two-point line-of-sight thinking.",
      descriptionZh: "从任意根音出发，立即看到所有三度、五度、七度。两点视线思维。",
      levels: [
        {
          id: "2-1", level: 1,
          title: "Perfect Consonances", titleZh: "纯协和音程",
          description: "Root, 4th, 5th, octave — the strongest intervals.",
          descriptionZh: "根音、四度、五度、八度——最稳固的音程",
          trainer: "interval",
          config: { intervals: ["P4","P5"], zone: "ead15", timerSeconds: 6, mode: "learning" },
          successCriteria: { accuracy: 88, streak: 8 },
          unlocks: ["2-2"],
        },
        {
          id: "2-2", level: 2,
          title: "Core Chord Tones", titleZh: "核心和弦音",
          description: "Root, 3rd, 5th, 7th — the jazz foundation.",
          descriptionZh: "根音、三度、五度、七度——爵士基础",
          trainer: "interval",
          config: { intervals: ["M3","m3","P5","M7","m7"], zone: "ead15", timerSeconds: 5, mode: "core_drill" },
          successCriteria: { accuracy: 82, streak: 8 },
          unlocks: ["2-3"],
        },
        {
          id: "2-3", level: 3,
          title: "Two-Point Drill",  titleZh: "双点练习",
          description: "Root-to-interval, all zones. 4 seconds.",
          descriptionZh: "根音到音程，所有区域，4 秒",
          trainer: "interval",
          config: { intervals: ["M3","m3","P5","M7","m7","M2"], zone: "full", timerSeconds: 4, mode: "two_point" },
          successCriteria: { accuracy: 80, streak: 10 },
          unlocks: ["2-4"],
        },
        {
          id: "2-4", level: 4,
          title: "Blind Mode",       titleZh: "盲视模式",
          description: "No interval label shown. Ear + visual memory.",
          descriptionZh: "不显示音程标签，靠耳朵 + 视觉记忆",
          trainer: "interval",
          config: { intervals: ["M3","m3","P5","M7","m7"], zone: "full", timerSeconds: 3, mode: "blind" },
          successCriteria: { accuracy: 78, streak: 10 },
          unlocks: ["2-5"],
        },
        {
          id: "2-5", level: 5,
          title: "Speed Challenge",  titleZh: "速度挑战",
          description: "All intervals, all zones. 1.5 seconds.",
          descriptionZh: "所有音程，全区域，1.5 秒，精英模式",
          trainer: "interval",
          config: { intervals: ["M3","m3","P5","M7","m7","M2","P4","A4"], zone: "full", timerSeconds: 1.5, mode: "speed" },
          successCriteria: { accuracy: 80, streak: 12 },
          unlocks: ["3-1"],
        },
      ],
    },
    {
      id: 3,
      title: "Harmonic Navigation", titleZh: "和声导航",
      subtitle: "Navigate without pattern dependency", subtitleZh: "脱离 Pattern，功能性和声移动",
      color: "#F97316",
      icon: "♫",
      description:   "Navigate chord tones, guide tones, and voice leading over real progressions.",
      descriptionZh: "在真实和弦进行上导航和弦音、引导音和声部进行。",
      levels: [
        {
          id: "3-1", level: 1,
          title: "Root Navigation",  titleZh: "根音导航",
          description: "Find chord roots across progressions. 80 BPM.",
          descriptionZh: "在和弦进行中找根音，80 BPM",
          trainer: "changes",
          config: { target: "root", bpm: 80, progression: "iivi" },
          successCriteria: { accuracy: 85, streak: 8 },
          unlocks: ["3-2"],
        },
        {
          id: "3-2", level: 2,
          title: "Chord Tone Focus", titleZh: "和弦音专注",
          description: "Root + 3rd + 5th. 90 BPM.",
          descriptionZh: "根音 + 三度 + 五度，90 BPM",
          trainer: "changes",
          config: { target: "chord", bpm: 90, progression: "iivi" },
          successCriteria: { accuracy: 82, streak: 8 },
          unlocks: ["3-3"],
        },
        {
          id: "3-3", level: 3,
          title: "Guide Tones",      titleZh: "引导音",
          description: "3rd & 7th voice leading. 100 BPM.",
          descriptionZh: "三度和七度声部进行，100 BPM",
          trainer: "changes",
          config: { target: "guide", bpm: 100, progression: "iivi" },
          successCriteria: { accuracy: 80, streak: 10 },
          unlocks: ["3-4"],
        },
        {
          id: "3-4", level: 4,
          title: "Diatonic Movement", titleZh: "调式移动",
          description: "Stepwise diatonic lines. 110 BPM.",
          descriptionZh: "调式级进旋律线，110 BPM",
          trainer: "changes",
          config: { target: "diatonic", bpm: 110, progression: "blues" },
          successCriteria: { accuracy: 80, streak: 10 },
          unlocks: ["3-5"],
        },
        {
          id: "3-5", level: 5,
          title: "Real-Time Engine",  titleZh: "实时引擎",
          description: "Random progressions, random keys. 120 BPM.",
          descriptionZh: "随机进行，随机调性，120 BPM，大师等级",
          trainer: "changes",
          config: { target: "full", bpm: 120, progression: "random" },
          successCriteria: { accuracy: 78, streak: 12 },
          unlocks: [],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Get a level by ID (e.g. "1-3") → returns { level, stage } or null */
export function getLevelById(id) {
  for (const stage of CURRICULUM.stages) {
    for (const level of stage.levels) {
      if (level.id === id) return { level, stage };
    }
  }
  return null;
}

/** Get all levels as a flat array */
export function getAllLevels() {
  return CURRICULUM.stages.flatMap(s => s.levels);
}

/**
 * Get today's suggested assignment based on progress data.
 * Returns a trainer suggestion with reason.
 */
export function getTodayAssignment(progress = {}) {
  const { weakIntervals, weakNotes, weakChords, intervalHeatmap, noteHeatmap } = progress;

  // If weak intervals → suggest interval trainer
  if (weakIntervals && weakIntervals.length > 0) {
    const top = weakIntervals[0];
    return {
      trainer: "interval",
      title: `Weak Area: ${top}`,
      titleZh: `弱项练习：${top}`,
      reason: `${top} 反应时间较慢，重点训练`,
      reasonEn: `${top} reaction time is slow — focus drill`,
      color: "#A78BFA",
      icon: "◎",
    };
  }

  // If weak notes → suggest note trainer
  if (weakNotes && weakNotes.length > 0) {
    return {
      trainer: "note",
      title: "Fretboard Weak Spots",
      titleZh: "指板弱点区域",
      reason: `有 ${weakNotes.length} 个音符识别率低于 60%`,
      reasonEn: `${weakNotes.length} notes below 60% accuracy`,
      color: "#4A9EFF",
      icon: "♩",
    };
  }

  // Default → interval trainer (core skill)
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      trainer: "interval",
      title: "Morning: Core Intervals",
      titleZh: "早练：核心音程",
      reason: "早上是培养 Two-Point 视觉的最佳时机",
      reasonEn: "Morning is ideal for Two-Point interval vision",
      color: "#A78BFA",
      icon: "◎",
    };
  } else if (hour < 18) {
    return {
      trainer: "note",
      title: "Afternoon: Full Neck",
      titleZh: "午练：全颈识别",
      reason: "白天注意力最集中，适合全颈速度练习",
      reasonEn: "Peak focus time — full neck speed drill",
      color: "#4A9EFF",
      icon: "♩",
    };
  } else {
    return {
      trainer: "changes",
      title: "Evening: Harmony",
      titleZh: "晚练：和声导航",
      reason: "晚间适合慢速和声练习，培养听觉",
      reasonEn: "Evening is great for slow harmonic navigation",
      color: "#F97316",
      icon: "♫",
    };
  }
}
