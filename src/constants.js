// ─────────────────────────────────────────────────────────────
// CONSTANTS v3.0
//
// 批次 3-2 / 4-2 改动：
//   • 新增 SCALE_META — 完整两视角数据（首调 + 固定调）
//     每条包含：formula, intervals, fromMajor, quality,
//               parentDegree, parentMode, chordType,
//               bestContext, example, modeFamily, modePosition
//   • 新增 getParentKey() — 使用 MAJOR_INTERVALS + parentDegree
//     准确算法（blueprint spec 对齐）
//   • PROGRESSIONS 分类调整：
//     Basics → Fundamentals
//     Rhythm → Rhythm Changes
//     Turns  → Turnarounds
//     新增 Latin（Blue Bossa, Girl From Ipanema 从 Standards 移出）
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// BASIC NOTE DATA
// ─────────────────────────────────────────────────────────────
export const NOTE_NAMES      = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
export const FLAT_NAMES      = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
export const INTERVAL_LABELS = ["R","b2","2","b3","3","4","b5","5","b6","6","b7","7"];
export const FRET_MARKERS    = [3,5,7,9,12];
export const DOUBLE_MARKERS  = [12];

// ─────────────────────────────────────────────────────────────
// INSTRUMENTS
// ─────────────────────────────────────────────────────────────
export const INSTRUMENTS = {
  "6-String Guitar": {
    defaultTuning: [40,45,50,55,59,64],
    tunings: {
      "Standard (EADGBe)":   [40,45,50,55,59,64],
      "Drop D (DADGBe)":     [38,45,50,55,59,64],
      "Open G (DGDGBd)":     [38,43,50,55,59,62],
      "DADGAD":              [38,45,50,55,57,62],
      "Half Step Down (Eb)": [39,44,49,54,58,63],
    },
    stringNames: ["E","A","D","G","B","e"],
  },
  "7-String Guitar": {
    defaultTuning: [35,40,45,50,55,59,64],
    tunings: {
      "Standard (BEADGBe)":  [35,40,45,50,55,59,64],
      "Drop A (AEADGBe)":    [33,40,45,50,55,59,64],
    },
    stringNames: ["B","E","A","D","G","B","e"],
  },
  "4-String Bass": {
    defaultTuning: [28,33,38,43],
    tunings: {
      "Standard (EADG)":     [28,33,38,43],
      "Drop D (DADG)":       [26,33,38,43],
    },
    stringNames: ["E","A","D","G"],
  },
  "5-String Bass": {
    defaultTuning: [23,28,33,38,43],
    tunings: {
      "Standard (BEADG)":    [23,28,33,38,43],
    },
    stringNames: ["B","E","A","D","G"],
  },
};

// ─────────────────────────────────────────────────────────────
// CHORD & SCALE DATA
// ─────────────────────────────────────────────────────────────
export const CHORD_INTERVALS = {
  "Maj7":[0,4,7,11],"maj7":[0,4,7,11],"M7":[0,4,7,11],
  "m7":[0,3,7,10],"7":[0,4,7,10],
  "m7b5":[0,3,6,10],"ø7":[0,3,6,10],
  "dim7":[0,3,6,9],
  "Maj6":[0,4,7,9],"6":[0,4,7,9],
  "m6":[0,3,7,9],
  "sus4":[0,5,7],"7sus4":[0,5,7,10],
  "aug":[0,4,8],
  "m9":[0,3,7,10,14],"9":[0,4,7,10,14],"Maj9":[0,4,7,11,14],
  "m":[0,3,7],
  "":[0,4,7],
};

export const CHORD_TONE_LABELS = {0:"R",1:"b2",2:"2",3:"b3",4:"3",5:"4",6:"b5",7:"5",8:"b6",9:"6",10:"b7",11:"7"};

export const SCALES = {
  "Major / Ionian":          [0,2,4,5,7,9,11],
  "Natural Minor / Aeolian": [0,2,3,5,7,8,10],
  "Dorian":                  [0,2,3,5,7,9,10],
  "Phrygian":                [0,1,3,5,7,8,10],
  "Lydian":                  [0,2,4,6,7,9,11],
  "Mixolydian":              [0,2,4,5,7,9,10],
  "Locrian":                 [0,1,3,5,6,8,10],
  "Melodic Minor":           [0,2,3,5,7,9,11],
  "Harmonic Minor":          [0,2,3,5,7,8,11],
  "Harmonic Major":          [0,2,4,5,7,8,11],
  "Lydian Dominant":         [0,2,4,6,7,9,10],
  "Altered / Super Locrian": [0,1,3,4,6,8,10],
  "Whole Tone":              [0,2,4,6,8,10],
  "Diminished (HW)":         [0,1,3,4,6,7,9,10],
  "Diminished (WH)":         [0,2,3,5,6,8,9,11],
  "Pentatonic Major":        [0,2,4,7,9],
  "Pentatonic Minor":        [0,3,5,7,10],
  "Blues Major":             [0,2,3,4,7,9],
  "Blues Minor":             [0,3,5,6,7,10],
  "Bebop Dominant":          [0,2,4,5,7,9,10,11],
  "Spanish Phrygian":        [0,1,4,5,7,8,10],
  "Hungarian Minor":         [0,2,3,6,7,8,11],
  "Lydian Augmented":        [0,2,4,6,8,9,11],
  "Phrygian Dominant":       [0,1,4,5,7,8,10],
  "Double Harmonic":         [0,1,4,5,7,8,11],
};

// ─────────────────────────────────────────────────────────────
// SCALE META — 两视角完整数据（首调 + 固定调）
//
// 字段说明：
//   formula       — 首调视角：度数标签数组（混合数字与字符串）
//   intervals     — 音程半音数组（同 SCALES）
//   fromMajor     — 相对大调的变化度数（用于 Blueprint 差异显示）
//   quality       — 和声性质：major / minor / dominant / diminished / augmented / symmetric
//   parentDegree  — 固定调视角：此调式在大调中的第几级（null = 无大调关联）
//   parentMode    — 母音阶类型（"Ionian" = 大调，"Melodic Minor" 等）
//   chordType     — 典型和弦类型
//   bestContext   — 最佳使用场景（一句话）
//   example       — 具体例子
//   modeFamily    — 音阶族系
//   modePosition  — 在族系中的位置
//   description   — 简短描述（UI 显示用）
// ─────────────────────────────────────────────────────────────
export const SCALE_META = {
  "Major / Ionian": {
    formula:      [1, 2, 3, 4, 5, 6, 7],
    intervals:    [0,2,4,5,7,9,11],
    fromMajor:    [],
    quality:      "major",
    parentDegree: 1,
    parentMode:   "Ionian",
    chordType:    "Maj7",
    bestContext:  "Tonic major chords; the blueprint for all other modes",
    example:      "CMaj7 in C major",
    modeFamily:   "major_modes",
    modePosition: 1,
    description:  "The foundation — all other modes are measured against this.",
  },
  "Natural Minor / Aeolian": {
    formula:      [1, 2, "b3", 4, 5, "b6", "b7"],
    intervals:    [0,2,3,5,7,8,10],
    fromMajor:    ["b3","b6","b7"],
    quality:      "minor",
    parentDegree: 6,
    parentMode:   "Ionian",
    chordType:    "m7",
    bestContext:  "Tonic minor chords; natural resolution in minor keys",
    example:      "Am7 in C major / A natural minor",
    modeFamily:   "major_modes",
    modePosition: 6,
    description:  "The relative minor. b3, b6, b7 give it a melancholic quality.",
  },
  "Dorian": {
    formula:      [1, 2, "b3", 4, 5, 6, "b7"],
    intervals:    [0,2,3,5,7,9,10],
    fromMajor:    ["b3","b7"],
    quality:      "minor",
    parentDegree: 2,
    parentMode:   "Ionian",
    chordType:    "m7",
    bestContext:  "ii chord in major key; funk, jazz, and rock minor grooves",
    example:      "Dm7 in C major; Em7 in D major",
    modeFamily:   "major_modes",
    modePosition: 2,
    description:  "Minor with a natural 6. The jazz/funk minor scale.",
  },
  "Phrygian": {
    formula:      [1, "b2", "b3", 4, 5, "b6", "b7"],
    intervals:    [0,1,3,5,7,8,10],
    fromMajor:    ["b2","b3","b6","b7"],
    quality:      "minor",
    parentDegree: 3,
    parentMode:   "Ionian",
    chordType:    "m7",
    bestContext:  "iii chord in major key; Spanish and flamenco flavors",
    example:      "Em7 in C major; Phrygian vamp E–F",
    modeFamily:   "major_modes",
    modePosition: 3,
    description:  "Spanish/Flamenco flavor. The flat 2 defines it.",
  },
  "Lydian": {
    formula:      [1, 2, 3, "#4", 5, 6, 7],
    intervals:    [0,2,4,6,7,9,11],
    fromMajor:    ["#4"],
    quality:      "major",
    parentDegree: 4,
    parentMode:   "Ionian",
    chordType:    "Maj7#11",
    bestContext:  "IV chord in major key; dreamy and floating major sound",
    example:      "FMaj7#11 in C major",
    modeFamily:   "major_modes",
    modePosition: 4,
    description:  "Major with a raised 4th. Dreamy and floating.",
  },
  "Mixolydian": {
    formula:      [1, 2, 3, 4, 5, 6, "b7"],
    intervals:    [0,2,4,5,7,9,10],
    fromMajor:    ["b7"],
    quality:      "dominant",
    parentDegree: 5,
    parentMode:   "Ionian",
    chordType:    "7",
    bestContext:  "Dominant 7th chords; blues and rock over unresolved dominants",
    example:      "G7 in C major; rock riffs on one chord",
    modeFamily:   "major_modes",
    modePosition: 5,
    description:  "Dominant scale. Perfect for blues and rock over 7th chords.",
  },
  "Locrian": {
    formula:      [1, "b2", "b3", 4, "b5", "b6", "b7"],
    intervals:    [0,1,3,5,6,8,10],
    fromMajor:    ["b2","b3","b5","b6","b7"],
    quality:      "diminished",
    parentDegree: 7,
    parentMode:   "Ionian",
    chordType:    "m7b5",
    bestContext:  "viiø chord in major key; half-diminished chord tones",
    example:      "Bm7b5 in C major",
    modeFamily:   "major_modes",
    modePosition: 7,
    description:  "The diminished mode. Rarely used as a tonal center.",
  },
  "Melodic Minor": {
    formula:      [1, 2, "b3", 4, 5, 6, 7],
    intervals:    [0,2,3,5,7,9,11],
    fromMajor:    ["b3"],
    quality:      "minor",
    parentDegree: null,
    parentMode:   "Melodic Minor",
    chordType:    "mMaj7",
    bestContext:  "Tonic minor with major 7; generates Lydian Dominant (mode 4) and Altered (mode 7)",
    example:      "CmMaj7; parent of G Lydian Dominant and B Altered",
    modeFamily:   "melodic_minor_modes",
    modePosition: 1,
    description:  "Minor with natural 6 and 7. The jazz minor scale.",
  },
  "Harmonic Minor": {
    formula:      [1, 2, "b3", 4, 5, "b6", 7],
    intervals:    [0,2,3,5,7,8,11],
    fromMajor:    ["b3","b6"],
    quality:      "minor",
    parentDegree: null,
    parentMode:   "Harmonic Minor",
    chordType:    "mMaj7",
    bestContext:  "Creates a V7 chord in minor key; classical minor sound",
    example:      "Am harmonic minor → E7 (V7) resolves to Am",
    modeFamily:   "harmonic_minor_modes",
    modePosition: 1,
    description:  "Natural minor with a raised 7th. Enables V7 in minor.",
  },
  "Harmonic Major": {
    formula:      [1, 2, 3, 4, 5, "b6", 7],
    intervals:    [0,2,4,5,7,8,11],
    fromMajor:    ["b6"],
    quality:      "major",
    parentDegree: null,
    parentMode:   "Harmonic Major",
    chordType:    "Maj7",
    bestContext:  "Tonic major with exotic color; cinematic and neo-soul",
    example:      "CMaj7 with a flat 6 passing tone",
    modeFamily:   "harmonic_major_modes",
    modePosition: 1,
    description:  "Major with a flat 6. Exotic and cinematic.",
  },
  "Lydian Dominant": {
    formula:      [1, 2, 3, "#4", 5, 6, "b7"],
    intervals:    [0,2,4,6,7,9,10],
    fromMajor:    ["#4","b7"],
    quality:      "dominant",
    parentDegree: 4,
    parentMode:   "Melodic Minor",
    chordType:    "7#11",
    bestContext:  "Tritone substitution; dominant chords with #11",
    example:      "Bb7#11 as tritone sub for E7",
    modeFamily:   "melodic_minor_modes",
    modePosition: 4,
    description:  "Mode 4 of Melodic Minor. The tritone substitution sound.",
  },
  "Altered / Super Locrian": {
    formula:      [1, "b2", "b3", "b4", "b5", "b6", "b7"],
    intervals:    [0,1,3,4,6,8,10],
    fromMajor:    ["b2","b3","b4","b5","b6","b7"],
    quality:      "dominant",
    parentDegree: 7,
    parentMode:   "Melodic Minor",
    chordType:    "7alt",
    bestContext:  "Dominant 7th chords with maximum tension; all extensions altered",
    example:      "G7alt resolving to Cm; all upper structure altered",
    modeFamily:   "melodic_minor_modes",
    modePosition: 7,
    description:  "Mode 7 of Melodic Minor. All extensions altered.",
  },
  "Whole Tone": {
    formula:      [1, 2, 3, "#4", "#5", "b7"],
    intervals:    [0,2,4,6,8,10],
    fromMajor:    ["#4","#5","b7"],
    quality:      "dominant",
    parentDegree: null,
    parentMode:   "Symmetric",
    chordType:    "7#5",
    bestContext:  "Augmented dominant chords; dream sequences",
    example:      "C7#5 chord tones",
    modeFamily:   "symmetric",
    modePosition: 1,
    description:  "Symmetric scale — only 2 unique versions. Dreamy.",
  },
  "Diminished (HW)": {
    formula:      [1, "b2", "b3", 3, "b5", 5, 6, "b7"],
    intervals:    [0,1,3,4,6,7,9,10],
    fromMajor:    ["b2","b3","b5","b6"],
    quality:      "dominant",
    parentDegree: null,
    parentMode:   "Symmetric",
    chordType:    "7b9",
    bestContext:  "Dominant 7b9 chords; tense unresolved dominant",
    example:      "G7b9 with diminished (HW) colors",
    modeFamily:   "symmetric",
    modePosition: 2,
    description:  "Half-Whole diminished. Used over dominant 7b9 chords.",
  },
  "Diminished (WH)": {
    formula:      [1, 2, "b3", 4, "b5", "b6", 6, 7],
    intervals:    [0,2,3,5,6,8,9,11],
    fromMajor:    ["b3","b5","b6"],
    quality:      "diminished",
    parentDegree: null,
    parentMode:   "Symmetric",
    chordType:    "dim7",
    bestContext:  "Fully diminished chords; symmetrical passing",
    example:      "Bdim7 chord tones",
    modeFamily:   "symmetric",
    modePosition: 3,
    description:  "Whole-Half diminished. Used over fully diminished chords.",
  },
  "Pentatonic Major": {
    formula:      [1, 2, 3, 5, 6],
    intervals:    [0,2,4,7,9],
    fromMajor:    [],
    quality:      "major",
    parentDegree: null,
    parentMode:   "Pentatonic",
    chordType:    "Maj6/9",
    bestContext:  "Universal — country, rock, pop, jazz; any major context",
    example:      "C pentatonic major over CMaj7",
    modeFamily:   "pentatonic",
    modePosition: 1,
    description:  "Major without 4 and 7. The universal happy scale.",
  },
  "Pentatonic Minor": {
    formula:      [1, "b3", 4, 5, "b7"],
    intervals:    [0,3,5,7,10],
    fromMajor:    ["b3","b7"],
    quality:      "minor",
    parentDegree: null,
    parentMode:   "Pentatonic",
    chordType:    "m7",
    bestContext:  "Rock, blues, minor jazz; avoids potential avoid notes",
    example:      "Am pentatonic over Am7",
    modeFamily:   "pentatonic",
    modePosition: 2,
    description:  "Minor without b2 and b6. The rock/blues foundation.",
  },
  "Blues Major": {
    formula:      [1, 2, "b3", 3, 5, 6],
    intervals:    [0,2,3,4,7,9],
    fromMajor:    ["b3"],
    quality:      "major",
    parentDegree: null,
    parentMode:   "Blues",
    chordType:    "Maj6",
    bestContext:  "Major blues; uplifting sound with blue note tension",
    example:      "C blues major over C7 in a major blues",
    modeFamily:   "blues",
    modePosition: 1,
    description:  "Pentatonic major + blue note (b3). Uplifting blues feel.",
  },
  "Blues Minor": {
    formula:      [1, "b3", 4, "b5", 5, "b7"],
    intervals:    [0,3,5,6,7,10],
    fromMajor:    ["b3","b5","b7"],
    quality:      "minor",
    parentDegree: null,
    parentMode:   "Blues",
    chordType:    "m7",
    bestContext:  "Minor blues and rock; the classic blues sound",
    example:      "Am blues over 12-bar minor blues",
    modeFamily:   "blues",
    modePosition: 2,
    description:  "Pentatonic minor + b5 blue note. Classic blues/rock.",
  },
  "Bebop Dominant": {
    formula:      [1, 2, 3, 4, 5, 6, "b7", 7],
    intervals:    [0,2,4,5,7,9,10,11],
    fromMajor:    ["b7"],
    quality:      "dominant",
    parentDegree: null,
    parentMode:   "Bebop",
    chordType:    "7",
    bestContext:  "Dominant 7th chords at bebop tempos; chord tones land on beats",
    example:      "G7 with bebop dominant keeps chord tones on beats",
    modeFamily:   "bebop",
    modePosition: 1,
    description:  "Mixolydian + passing major 7. Keeps chord tones on beats.",
  },
  "Spanish Phrygian": {
    formula:      [1, "b2", 3, 4, 5, "b6", "b7"],
    intervals:    [0,1,4,5,7,8,10],
    fromMajor:    ["b2","b6","b7"],
    quality:      "dominant",
    parentDegree: null,
    parentMode:   "Hybrid",
    chordType:    "7b9",
    bestContext:  "Flamenco; dominant chords with Phrygian flat 2",
    example:      "E Spanish Phrygian over E7b9 resolving to Am",
    modeFamily:   "exotic",
    modePosition: 1,
    description:  "Phrygian with a major 3rd. Flamenco and Middle-Eastern colors.",
  },
  "Hungarian Minor": {
    formula:      [1, 2, "b3", "#4", 5, "b6", 7],
    intervals:    [0,2,3,6,7,8,11],
    fromMajor:    ["b3","#4","b6"],
    quality:      "minor",
    parentDegree: null,
    parentMode:   "Exotic",
    chordType:    "mMaj7",
    bestContext:  "Eastern European folk; exotic minor with raised 4",
    example:      "Dm with a raised 4 and major 7",
    modeFamily:   "exotic",
    modePosition: 2,
    description:  "Harmonic minor with a raised 4th. Eastern European sound.",
  },
  "Lydian Augmented": {
    formula:      [1, 2, 3, "#4", "#5", 6, 7],
    intervals:    [0,2,4,6,8,9,11],
    fromMajor:    ["#4","#5"],
    quality:      "major",
    parentDegree: 3,
    parentMode:   "Melodic Minor",
    chordType:    "Maj7#5",
    bestContext:  "Tonic major with raised 5; otherworldly and ethereal",
    example:      "CMaj7#5 in Melodic Minor context",
    modeFamily:   "melodic_minor_modes",
    modePosition: 3,
    description:  "Mode 3 of Melodic Minor. Ethereal and otherworldly.",
  },
  "Phrygian Dominant": {
    formula:      [1, "b2", 3, 4, 5, "b6", "b7"],
    intervals:    [0,1,4,5,7,8,10],
    fromMajor:    ["b2","b6","b7"],
    quality:      "dominant",
    parentDegree: 5,
    parentMode:   "Harmonic Minor",
    chordType:    "7b9",
    bestContext:  "Dominant in minor keys; Flamenco and Spanish over dominant",
    example:      "E Phrygian Dominant over E7b9 resolving to Am harmonic minor",
    modeFamily:   "harmonic_minor_modes",
    modePosition: 5,
    description:  "Mode 5 of Harmonic Minor. Flamenco over dominants.",
  },
  "Double Harmonic": {
    formula:      [1, "b2", 3, 4, 5, "b6", 7],
    intervals:    [0,1,4,5,7,8,11],
    fromMajor:    ["b2","b6"],
    quality:      "major",
    parentDegree: null,
    parentMode:   "Exotic",
    chordType:    "Maj7",
    bestContext:  "Byzantine and Arabic music; exotic cinematic",
    example:      "C Double Harmonic (Byzantine scale)",
    modeFamily:   "exotic",
    modePosition: 3,
    description:  "Two augmented seconds. Arabic/Byzantine character.",
  },
};

// ─────────────────────────────────────────────────────────────
// getParentKey — 计算母调（固定调视角）
//
// 算法（对应 blueprint spec）：
//   使用 MAJOR_INTERVALS[parentDegree - 1] 算出从根音到母调根音的半音距
//   例：E Dorian → parentDegree=2 → MAJOR_INTERVALS[1]=2 → (4-2+12)%12=2 → D
//   例：A Aeolian → parentDegree=6 → MAJOR_INTERVALS[5]=9 → (9-9+12)%12=0 → C
// ─────────────────────────────────────────────────────────────
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

export function getParentKey(rootNote, scaleName) {
  const meta = SCALE_META[scaleName];
  if (!meta || meta.parentDegree === null) return null;
  if (meta.parentDegree === 1) return rootNote; // IS the major scale

  const rootChroma = NOTE_NAMES.indexOf(rootNote) !== -1
    ? NOTE_NAMES.indexOf(rootNote)
    : FLAT_NAMES.indexOf(rootNote);
  if (rootChroma === -1) return null;

  const semitones    = MAJOR_INTERVALS[meta.parentDegree - 1];
  const parentChroma = ((rootChroma - semitones) + 12) % 12;
  return NOTE_NAMES[parentChroma];
}

// ─────────────────────────────────────────────────────────────
// DIFFICULTY LEVELS
// ─────────────────────────────────────────────────────────────
export const DIFFICULTY_LEVELS = [
  { id:1, label:"Root",      short:"R",   maxTones:1,  desc:"Root note only" },
  { id:2, label:"Root+5",    short:"R+5", maxTones:2,  desc:"Root and fifth" },
  { id:3, label:"Triad",     short:"Tri", maxTones:3,  desc:"Root, 3rd, 5th" },
  { id:4, label:"7th Chord", short:"7th", maxTones:4,  desc:"Full 7th chord tones" },
  { id:5, label:"Voice Lead",short:"VL",  maxTones:99, desc:"Smooth voice leading" },
];

// ─────────────────────────────────────────────────────────────
// PROGRESSIONS v3.0
//   Basics → Fundamentals | Rhythm → Rhythm Changes
//   Turns  → Turnarounds  | 新增 Latin 分类
// ─────────────────────────────────────────────────────────────
export const PROGRESSIONS = [
  // ── FUNDAMENTALS ──
  { name:"Single – Maj7",          cat:"Fundamentals", key:"C",  changes:["CMaj7","CMaj7","CMaj7","CMaj7"] },
  { name:"Single – m7",            cat:"Fundamentals", key:"Dm", changes:["Dm7","Dm7","Dm7","Dm7"] },
  { name:"Single – Dom 7",         cat:"Fundamentals", key:"G",  changes:["G7","G7","G7","G7"] },
  { name:"Single – m7b5",          cat:"Fundamentals", key:"B",  changes:["Bm7b5","Bm7b5","Bm7b5","Bm7b5"] },
  { name:"Two-Chord: Dm7–G7",      cat:"Fundamentals", key:"Dm", changes:["Dm7","G7","Dm7","G7"] },
  // ── ii–V–I ──
  { name:"ii-V-I in C (Major)",    cat:"ii-V-I",   key:"C",  changes:["Dm7","G7","CMaj7","CMaj7"] },
  { name:"ii-V-I in F (Major)",    cat:"ii-V-I",   key:"F",  changes:["Gm7","C7","FMaj7","FMaj7"] },
  { name:"ii-V-I in Bb (Major)",   cat:"ii-V-I",   key:"Bb", changes:["Cm7","F7","BbMaj7","BbMaj7"] },
  { name:"ii-V-I in Eb (Major)",   cat:"ii-V-I",   key:"Eb", changes:["Fm7","Bb7","EbMaj7","EbMaj7"] },
  { name:"ii-V-I in Ab (Major)",   cat:"ii-V-I",   key:"Ab", changes:["Bbm7","Eb7","AbMaj7","AbMaj7"] },
  { name:"ii-V-i in Dm (Minor)",   cat:"ii-V-I",   key:"Dm", changes:["Em7b5","A7","Dm","Dm"] },
  { name:"ii-V-i in Cm (Minor)",   cat:"ii-V-I",   key:"Cm", changes:["Dm7b5","G7","Cm","Cm"] },
  { name:"ii-V-i in Gm (Minor)",   cat:"ii-V-I",   key:"Gm", changes:["Am7b5","D7","Gm","Gm"] },
  { name:"ii-V-I + Turnaround",    cat:"ii-V-I",   key:"C",  changes:["Dm7","G7","CMaj7","Am7","Dm7","G7","CMaj7","CMaj7"] },
  { name:"Tritone Sub ii-V-I",     cat:"ii-V-I",   key:"C",  changes:["Dm7","Db7","CMaj7","CMaj7"] },
  { name:"Descending ii-V-Is",     cat:"ii-V-I",   key:"C",  changes:["Dm7","G7","CMaj7","Cm7","F7","BbMaj7","Bbm7","Eb7","AbMaj7","AbMaj7"] },
  { name:"4-Key ii-V Chain",       cat:"ii-V-I",   key:"C",  changes:["Dm7","G7","Gm7","C7","Cm7","F7","Fm7","Bb7"] },
  // ── BLUES ──
  { name:"12-Bar Blues in G",      cat:"Blues",    key:"G",  changes:["G7","G7","G7","G7","C7","C7","G7","G7","D7","C7","G7","D7"] },
  { name:"12-Bar Blues in F",      cat:"Blues",    key:"F",  changes:["F7","F7","F7","F7","Bb7","Bb7","F7","F7","C7","Bb7","F7","C7"] },
  { name:"12-Bar Blues in Bb",     cat:"Blues",    key:"Bb", changes:["Bb7","Bb7","Bb7","Bb7","Eb7","Eb7","Bb7","Bb7","F7","Eb7","Bb7","F7"] },
  { name:"Minor Blues in Am",      cat:"Blues",    key:"Am", changes:["Am7","Am7","Am7","Am7","Dm7","Dm7","Am7","Am7","Em7","Dm7","Am7","Em7"] },
  { name:"Jazz Blues in F",        cat:"Blues",    key:"F",  changes:["FMaj7","Bb7","FMaj7","Cm7","F7","Bb7","Bdim7","FMaj7","Am7b5","D7","Gm7","C7"] },
  { name:"Bird Blues (F)",         cat:"Blues",    key:"F",  changes:["FMaj7","Em7b5","A7","Dm7","Db7","Gm7","C7","FMaj7","Am7b5","D7","Gm7","C7"] },
  // ── STANDARDS ──
  { name:"Autumn Leaves",          cat:"Standards",key:"Gm",
    changes:["Cm7","F7","BbMaj7","EbMaj7","Am7b5","D7","Gm","Gm","Am7b5","D7","Gm","Gm","Cm7","F7","BbMaj7","EbMaj7","Am7b5","D7","Gm","Gm"] },
  { name:"All The Things You Are", cat:"Standards",key:"Ab",
    changes:["Fm7","Bbm7","Eb7","AbMaj7","DbMaj7","Dm7","G7","CMaj7","Cm7","Fm7","Bb7","EbMaj7","AbMaj7","Am7b5","D7","GMaj7","GMaj7","Gm7","C7","FMaj7","Fm7","Bb7","EbMaj7","Am7b5","D7","GMaj7"] },
  { name:"There Will Never…",      cat:"Standards",key:"Eb",
    changes:["EbMaj7","Bbm7","Eb7","AbMaj7","Ab6","Abm7","Db7","EbMaj7","Fm7","Bb7","Gm7","C7","Fm7","Bb7","EbMaj7","Bb7"] },
  { name:"Solar",                  cat:"Standards",key:"Cm",
    changes:["Cm","Cm","Gm7","C7","FMaj7","FMaj7","Fm7","Bb7","EbMaj7","EbMaj7","Am7b5","D7","Gm7","G7"] },
  { name:"Stella By Starlight",    cat:"Standards",key:"Bb",
    changes:["Em7b5","A7","Cm7","F7","Fm7","Bb7","EbMaj7","EbMaj7","Am7b5","D7","GMaj7","GMaj7","Bbm7","Eb7","AbMaj7","AbMaj7","Am7b5","D7","GMaj7","Gm7","C7","FMaj7","Fm7","Bb7","EbMaj7","Dm7b5","G7","Cm","Am7b5","D7","BbMaj7","BbMaj7"] },
  { name:"Misty",                  cat:"Standards",key:"Eb",
    changes:["EbMaj7","Bbm7","Eb7","AbMaj7","Abm7","Db7","EbMaj7","Cm7","Fm7","Bb7","EbMaj7","Gm7","C7","Fm7","Bb7","Gm7","C7","Fm7","Bb7"] },
  { name:"Nardis",                 cat:"Standards",key:"Em",
    changes:["Em7","A7","FMaj7","BbMaj7","Em7","Am7","B7","Em7"] },
  { name:"Have You Met Miss Jones",cat:"Standards",key:"F",
    changes:["FMaj7","Dm7","Gm7","C7","FMaj7","Db7","Gm7","C7","FMaj7","Dm7","Gm7","C7","FMaj7","Fm7","Bb7","BbMaj7","AbMaj7","GbMaj7","Em7","A7","Gm7","C7","FMaj7"] },
  { name:"Summertime",             cat:"Standards",key:"Am",
    changes:["Am","E7","Am","Am","Dm","Am","E7","E7","Am","F7","E7","E7","Am","E7","Am","Am"] },
  { name:"Softly (Morning Sunrise)",cat:"Standards",key:"Cm",
    changes:["Cm","Cm","Dm7b5","G7","Cm","Cm","Dm7b5","G7","Fm","Fm","Dm7b5","G7","Cm","Cm","Dm7b5","G7"] },
  { name:"Satin Doll",             cat:"Standards",key:"C",
    changes:["Dm7","G7","Dm7","G7","Em7","A7","Em7","A7","Am7","D7","Abm7","Db7","CMaj7","CMaj7"] },
  { name:"Take The A Train",       cat:"Standards",key:"C",
    changes:["CMaj7","CMaj7","D7","D7","Dm7","G7","CMaj7","CMaj7"] },
  { name:"Round Midnight",         cat:"Standards",key:"Ebm",
    changes:["Ebm","Bdim7","Bbm7","Eb7","AbMaj7","Db7","Gm7b5","C7","Fm7","Bb7","Ebm","C7","Fm7","Bb7","Ebm","Ebm"] },
  // ── LATIN（从 Standards 分离）──
  { name:"Blue Bossa",             cat:"Latin",    key:"Cm",
    changes:["Cm","Cm","Fm7","Fm7","Dm7b5","G7","Cm","Cm","EbMaj7","EbMaj7","Abm7","Db7","EbMaj7","EbMaj7","Dm7b5","G7"] },
  { name:"Girl From Ipanema",      cat:"Latin",    key:"F",
    changes:["FMaj7","FMaj7","G7","G7","Gm7","C7","FMaj7","FMaj7","GbMaj7","GbMaj7","B7","B7","Bbm7","Eb7","GbMaj7","Gm7","C7","FMaj7"] },
  // ── COLTRANE ──
  { name:"Giant Steps",            cat:"Coltrane", key:"B",
    changes:["BMaj7","D7","GMaj7","Bb7","EbMaj7","Am7","D7","GMaj7","Bb7","EbMaj7","F#m7","B7","BMaj7","Fm7","Bb7","EbMaj7","C#m7","F#7"] },
  { name:"Countdown",              cat:"Coltrane", key:"C",
    changes:["CMaj7","Em7","A7","DMaj7","F#m7","B7","EMaj7","Bbm7","Eb7","AbMaj7","Cm7","F7","BbMaj7","BbMaj7"] },
  // ── RHYTHM CHANGES（原 Rhythm）──
  { name:"Rhythm Changes (A)",     cat:"Rhythm Changes", key:"Bb",
    changes:["BbMaj7","Gm7","Cm7","F7","Dm7","G7","Cm7","F7","BbMaj7","Bb7","EbMaj7","Ebm7","Dm7","G7","Cm7","F7"] },
  { name:"Rhythm Changes (Full)",  cat:"Rhythm Changes", key:"Bb",
    changes:["BbMaj7","Gm7","Cm7","F7","Dm7","G7","Cm7","F7","BbMaj7","Bb7","EbMaj7","Ebm7","Dm7","G7","Cm7","F7","D7","D7","G7","G7","C7","C7","F7","F7","BbMaj7","Gm7","Cm7","F7","Dm7","G7","Cm7","F7","BbMaj7","Bb7","EbMaj7","Ebm7","Dm7","G7","Cm7","F7"] },
  // ── MODAL ──
  { name:"So What / Impressions",  cat:"Modal",    key:"D",  changes:["Dm7","Dm7","Dm7","Dm7","Dm7","Dm7","Dm7","Dm7","Ebm7","Ebm7","Ebm7","Ebm7","Dm7","Dm7","Dm7","Dm7"] },
  { name:"Maiden Voyage",          cat:"Modal",    key:"D",  changes:["Dm7sus4","Dm7sus4","Fm7sus4","Fm7sus4","Bbm7sus4","Bbm7sus4","Dbm7sus4","Dbm7sus4"] },
  { name:"Dorian Vamp",            cat:"Modal",    key:"Dm", changes:["Dm7","Em7b5","Dm7","Em7b5"] },
  { name:"Phrygian Vamp",          cat:"Modal",    key:"E",  changes:["Em7","FMaj7","Em7","FMaj7"] },
  { name:"Lydian Vamp",            cat:"Modal",    key:"F",  changes:["FMaj7","GbMaj7","FMaj7","GbMaj7"] },
  { name:"Mixolydian Vamp",        cat:"Modal",    key:"G",  changes:["G7","FMaj7","G7","FMaj7"] },
  // ── TURNAROUNDS（原 Turns）──
  { name:"Turnaround I-VI-ii-V",   cat:"Turnarounds", key:"C", changes:["CMaj7","Am7","Dm7","G7"] },
  { name:"Turnaround Tritone Sub", cat:"Turnarounds", key:"C", changes:["CMaj7","Eb7","Dm7","Db7"] },
  { name:"Ladybird",               cat:"Turnarounds", key:"C", changes:["CMaj7","CMaj7","Ebm7","Ab7","CMaj7","Bm7","E7"] },
  { name:"Backdoor Cadence",       cat:"Turnarounds", key:"C", changes:["CMaj7","Cm7","F7","CMaj7"] },
  // ── POP ──
  { name:"I-IV-V in G",            cat:"Pop",      key:"G",  changes:["G","C","D","G"] },
  { name:"I-V-vi-IV in C",         cat:"Pop",      key:"C",  changes:["CMaj7","GMaj7","Am7","FMaj7"] },
  { name:"50s Progression",        cat:"Pop",      key:"C",  changes:["CMaj7","Am7","FMaj7","G7"] },
];
