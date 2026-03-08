
// ─────────────────────────────────────────────────────────────
// src/hooks/CalibrationProfile.js  — v3.0 (T4 Step 3/4/5 fields)  — v2.0
//
// v2.0 (Batch 1):
//   • CalibrationProfile now includes:
//     - noiseFloorRaw: raw P85 (pre-multiplier), for diagnostics
//     - noiseForced: true if user accepted noisy environment
//     - verificationScore: 0-1, filled by caller after verify step
//     - skippedStrings: array of string names that were skipped
//   • defaultCalibrationProfile() and saveCalibrationProfile() updated
//   • No behavioural changes — all new fields are optional / informational
//
// v1.2 (retained):
//   • _noiseFloorRaw stored alongside _noiseFloor
//   • feedString: no double-gating
// ─────────────────────────────────────────────────────────────

import { GUITAR_STRINGS } from '../engine/GuitarModeEngine';

/**
 * @typedef {Object} StringProfile
 * @property {number} offset      - Average cents deviation from target
 * @property {number} avgRms      - Average RMS during calibration
 * @property {number} attackTime  - Average attack time in ms
 * @property {number} lockWindow  - Note lock window in cents
 */

/**
 * @typedef {Object} CalibrationProfile
 * @property {Record<string, StringProfile>} strings
 * @property {number}   noiseFloor        - Gated P85 × multiplier (runtime gate)
 * @property {number}   noiseFloorRaw     - Raw P85 (pre-multiplier, for diagnostics)
 * @property {boolean}  noiseForced       - User accepted noisy environment
 * @property {number}   verificationScore - 0-1, filled after verification step
 * @property {string[]} skippedStrings    - String names that were skipped
 * @property {number}   createdAt         - Unix timestamp ms
 */

const STORAGE_KEY        = 'svultra_guitar_calib_v2'; // bumped to v2
const SAMPLES_PER_STRING = 8;
const CALIB_WINDOW_CENTS = 60;
const NOISE_SAMPLE_MS    = 3000;
const PLUCK_SPIKE        = 1.5;
const GATE_MULTIPLIER    = 2.8;
const GATE_FLOOR         = 0.005;
const GATE_CEIL          = 0.06;

const DEFAULT_LOCK_WINDOWS = {
  E2: 45, A2: 40, D3: 32, G3: 28, B3: 22, E4: 20,
};
const LOCK_WIN_MIN = 18;
const LOCK_WIN_MAX = 55;

function freqToCents(freq, ref) {
  return 1200 * Math.log2(freq / ref);
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const mean     = arr.reduce((a, v) => a + v, 0) / arr.length;
  const variance = arr.reduce((a, v) => a + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

export class CalibrationRecorder {
  constructor() {
    this.state           = 'idle';
    /** Full gated threshold (P85 × GATE_MULTIPLIER) — used for runtime detection. */
    this._noiseFloor     = 0;
    /** Raw P85 of silence samples — used for calibration YIN gate (more sensitive). */
    this._noiseFloorRaw  = 0;
    this._noiseSamples   = [];
    this._noiseStartMs   = 0;

    this._stringQueue    = [...Object.keys(GUITAR_STRINGS)];
    this._currentString  = null;
    this._stringSamples  = [];
    this._rmsHistory     = [];
    this._pluckStartMs   = null;
    this._skippedStrings = [];

    this._profile  = {
      strings:           {},
      noiseFloor:        0,
      noiseFloorRaw:     0,   // v2: raw P85 for diagnostics
      noiseForced:       false,
      verificationScore: 0,
      skippedStrings:    [],
      createdAt:         0,
    };
    this.progress  = 0;
    this.statusMsg = '';
  }

  startNoise(nowMs = Date.now()) {
    this.state         = 'listening';
    this._noiseStartMs = nowMs;
    this._noiseSamples = [];
    this.statusMsg     = 'Silence please — sampling room noise…';
    this.progress      = 0;
  }

  feedNoise(rms, nowMs = Date.now()) {
    if (this.state !== 'listening') return 'sampling';

    this._noiseSamples.push(rms);
    const elapsed = nowMs - this._noiseStartMs;
    this.progress = Math.min(1, elapsed / NOISE_SAMPLE_MS);

    if (elapsed >= NOISE_SAMPLE_MS) {
      const p85 = this._p85(this._noiseSamples);
      // Raw P85 — used by useCalibration as a gentle gate for string detection
      this._noiseFloorRaw       = p85;
      // Gated P85 × multiplier — used by runtime audio engine
      this._noiseFloor          = Math.min(GATE_CEIL, Math.max(GATE_FLOOR, p85 * GATE_MULTIPLIER));
      this._profile.noiseFloor     = this._noiseFloor;
      this._profile.noiseFloorRaw  = this._noiseFloorRaw; // v2
      this.state                = 'captured';
      this.statusMsg            = `Noise floor: ${(this._noiseFloor * 1000).toFixed(1)} mRMS`;
      return 'noise_done';
    }
    return 'sampling';
  }

  /** Set noiseForced flag — called when user clicks "continue anyway" */
  setNoiseForced(forced) {
    this._profile.noiseForced = forced;
  }

  /** Legacy: Set verificationScore (backward compat — use setVerificationResult for T4) */
  setVerificationScore(score) {
    // Legacy float 0-1 → T4 integer 0-5
    if (score <= 1) {
      this._profile.verificationScore = Math.round(score * 5);
    } else {
      this._profile.verificationScore = Math.max(0, Math.min(5, Math.round(score)));
    }
    this._profile.verificationPassed = (this._profile.verificationScore === 5);
  }

  nextString() {
    if (this._stringQueue.length === 0) {
      this._finalise();
      return null;
    }
    this._currentString = this._stringQueue.shift();
    this._stringSamples = [];
    this._rmsHistory    = [];
    this._pluckStartMs  = null;
    this.state          = 'listening';
    this.progress       = 0;
    this.statusMsg      = `Play open ${this._currentString} string…`;
    return this._currentString;
  }

  /**
   * Skip the current string: record default profile values and advance.
   * Returns the next string name, or null if all strings are done.
   */
  skipCurrentString() {
    const name = this._currentString;
    if (name) {
      this._skippedStrings.push(name);
      // Record sensible defaults for the skipped string
      const defWin = DEFAULT_LOCK_WINDOWS[name] ?? 35;
      this._profile.strings[name] = {
        offset: 0, avgRms: 0.05, attackTime: 0, lockWindow: defWin,
      };
    }
    return this.nextString();
  }

  feedString(rawFreq, rms, nowMs = Date.now()) {
    if (this.state !== 'listening' || !this._currentString) return 'listening';

    this._rmsHistory.push({ rms, ts: nowMs });
    const cutoff = nowMs - 50;
    this._rmsHistory = this._rmsHistory.filter(s => s.ts >= cutoff);

    const baseline = this._rmsBaseline();
    if (baseline > 0 && rms > baseline * PLUCK_SPIKE) {
      if (this._pluckStartMs === null) this._pluckStartMs = nowMs;
    }

    if (rawFreq > 0) {
      const target   = GUITAR_STRINGS[this._currentString];
      const cents    = freqToCents(rawFreq, target);
      const absCents = Math.abs(cents);

      // Octave correction: YIN often returns 2× for E2 / A2
      const halfFreq  = rawFreq / 2;
      const halfCents = freqToCents(halfFreq, target);

      let acceptedCents = null;
      if (absCents <= CALIB_WINDOW_CENTS) {
        acceptedCents = cents;
      } else if (Math.abs(halfCents) <= CALIB_WINDOW_CENTS) {
        acceptedCents = halfCents;
      }

      if (acceptedCents !== null) {
        const attackMs = this._pluckStartMs !== null ? (nowMs - this._pluckStartMs) : 0;
        this._stringSamples.push({ cents: acceptedCents, rms, attackMs });
        this.progress  = Math.min(1, this._stringSamples.length / SAMPLES_PER_STRING);
        this.statusMsg = `${this._currentString}: ${this._stringSamples.length}/${SAMPLES_PER_STRING} samples`;
      }
    }

    if (this._stringSamples.length >= SAMPLES_PER_STRING) {
      this._recordStringProfile(this._currentString);
      this.state = 'captured';
      if (this._stringQueue.length === 0) {
        this._finalise();
        return 'all_done';
      }
      return 'string_done';
    }

    return 'listening';
  }

  getProfile() {
    return this._profile.createdAt ? /** @type {CalibrationProfile} */ (this._profile) : null;
  }

  _recordStringProfile(name) {
    const samples  = this._stringSamples;
    const avgCents = samples.reduce((a, s) => a + s.cents, 0) / samples.length;
    const avgRms   = samples.reduce((a, s) => a + s.rms,   0) / samples.length;
    const avgAtk   = samples.reduce((a, s) => a + s.attackMs, 0) / samples.length;

    const sd         = stdDev(samples.map(s => s.cents));
    const defWin     = DEFAULT_LOCK_WINDOWS[name] ?? 35;
    const lockWindow = sd > 2
      ? Math.min(LOCK_WIN_MAX, Math.max(LOCK_WIN_MIN, sd * 2.5))
      : defWin;

    this._profile.strings[name] = {
      offset: avgCents, avgRms,
      attackTime: Math.max(0, avgAtk),
      lockWindow,
    };
  }

  /** T4 Step 3: 基于 noiseFloor 和增益计算 YIN 置信度阈值 */
  computeYinConfidence() {
    const nf = this._profile.noiseFloor ?? 0.02;
    // 低噪声环境：较严格的置信度；高噪声：放宽
    const base = nf < 0.02 ? 0.12 : nf < 0.05 ? 0.15 : 0.20;
    this._profile.yinConfidence = Math.round(base * 1000) / 1000;
    return this._profile.yinConfidence;
  }

  /** T4 Step 4: 检测 G→B 弦增益差，判断是否需要补偿 */
  detectGbCompensation() {
    const gStr = this._profile.strings["G3"];
    const bStr = this._profile.strings["B3"];
    if (!gStr || !bStr) { this._profile.gbCompensationDetected = false; return false; }
    const gainDiff = Math.abs((gStr.avgRms || 0.05) - (bStr.avgRms || 0.05));
    this._profile.gbCompensationDetected = gainDiff > 0.015;
    return this._profile.gbCompensationDetected;
  }

  /** T4 Step 5: 记录验证结果（0-5 整数分） */
  setVerificationResult(score) {
    const s = Math.max(0, Math.min(5, Math.round(score)));
    this._profile.verificationScore = s;
    this._profile.verificationPassed = (s === 5);
    return s;
  }

  /** 设置设备标识 */
  setDeviceProfile() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    this._profile.deviceProfile = isIOS ? "ios" : isAndroid ? "android" : "desktop";
  }

  _finalise() {
    this._profile.createdAt      = Date.now();
    this._profile.calibratedAt   = Date.now();
    this._profile.skippedStrings = [...this._skippedStrings];
    this.setDeviceProfile();
    this.state     = 'completed';
    this.statusMsg = 'Calibration complete!';
    this.progress  = 1;
    saveCalibrationProfile(/** @type {CalibrationProfile} */ (this._profile));
  }

  _p85(arr) {
    if (arr.length === 0) return GATE_FLOOR;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx    = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.85));
    return sorted[idx];
  }

  _rmsBaseline() {
    if (this._rmsHistory.length < 2) return 0;
    const sub = this._rmsHistory.slice(0, -1);
    return sub.reduce((a, s) => a + s.rms, 0) / sub.length;
  }
}

export function saveCalibrationProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }
  catch (e) { console.warn('GuitarMode: could not save calibration profile', e); }
}

export function loadCalibrationProfile() {
  try {
    // Try v2 key first, fall back to v1 for migration
    // 先读 v2 键，没有则读 v1 键做迁移
    const raw = localStorage.getItem(STORAGE_KEY)
              ?? localStorage.getItem('svultra_guitar_calib_v1');
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p?.strings || typeof p.noiseFloor !== 'number') return null;
    // Backfill v2 fields if loading an old v1 profile
    // 加载旧版 v1 档案时补充 v2 字段
    if (p.noiseFloorRaw === undefined)          p.noiseFloorRaw          = p.noiseFloor / 2.8;
    if (p.noiseForced === undefined)            p.noiseForced            = false;
    if (p.verificationScore === undefined)      p.verificationScore      = 0;
    if (p.verificationPassed === undefined)     p.verificationPassed     = false;
    if (p.skippedStrings === undefined)         p.skippedStrings         = [];
    if (p.gainPerString === undefined)          p.gainPerString          = [1,1,1,1,1,1];
    if (p.yinConfidence === undefined)          p.yinConfidence          = 0.15;
    if (p.gbCompensationDetected === undefined) p.gbCompensationDetected = false;
    if (p.deviceProfile === undefined)          p.deviceProfile          = "";
    if (p.calibratedAt === undefined)           p.calibratedAt           = p.createdAt ?? 0;
    return p;
  } catch { return null; }
}

export function defaultCalibrationProfile() {
  const strings = {};
  for (const name of Object.keys(GUITAR_STRINGS)) {
    strings[name] = { offset: 0, avgRms: 0.05, attackTime: 0, lockWindow: DEFAULT_LOCK_WINDOWS[name] ?? 35 };
  }
  return {
    strings,
    noiseFloor:             GATE_FLOOR,
    noiseFloorRaw:          GATE_FLOOR,
    noiseForced:            false,
    verificationScore:      0,
    verificationPassed:     false,
    skippedStrings:         [],
    gainPerString:          [1,1,1,1,1,1],
    yinConfidence:          0.15,
    gbCompensationDetected: false,
    deviceProfile:          "",
    calibratedAt:           0,
    createdAt:              0,
  };
}


// ---
// CAL.3.0 — 2026-03-05
//
// Updated:
// - T4：新增字段 gainPerString/yinConfidence/gbCompensationDetected/deviceProfile/calibratedAt/verificationPassed
// - T4：verificationScore 语义改为 0-5 整数（setVerificationResult）
// - T4：新增方法 computeYinConfidence() / detectGbCompensation() / setVerificationResult()
// - 向后兼容：旧版 setVerificationScore() 保留，float→integer 转换
// - loadCalibrationProfile() 新增所有 v3.0 字段的 backfill
// - defaultCalibrationProfile() 包含所有新字段
//
// Fixed:
// - T4：verificationScore 字段存在但未被实际使用
//
// Pending:
// - gainPerString 计算逻辑在 PreFlightView Step 3 中实现
// ---
