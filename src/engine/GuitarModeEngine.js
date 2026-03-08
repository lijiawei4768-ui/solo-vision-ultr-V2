// ─────────────────────────────────────────────────────────────
// src/engine/GuitarModeEngine.js  — v1.2
//
// Purpose-built for standard 6-string guitar. NOT a general detector.
// Handles ONLY E2 A2 D3 G3 B3 E4.
//
// Processing pipeline (order is mandatory):
//   1️⃣  Frequency whitelist window matching   (±40 cents per string)
//   2️⃣  Octave auto-correction                (freq ≈ target×2 → freq/2)
//   3️⃣  Attack cool-down layer                (per-string from profile, fallback 120 ms)
//   4️⃣  Lock window debounce                  (per-string from profile / 150 ms hysteresis)
//   5️⃣  Stability window — 5 帧中位数过滤     ← v1.2 新增
//   6️⃣  Apply per-string calibration offset
//
// v1.2 changes vs v1.1:
//   • 稳定窗口升级：2 帧 → 5 帧中位数过滤
//     低频泛音（E2 谐波抖动）导致的误跳频现象大幅减少。
//     中位数策略比平均值更鲁棒，单帧异常值不影响输出。
//   • 新增 _stableWindow 对象（每弦独立窗口，防止跨弦污染）
//   • isStable 仅在 5 帧均落在同一弦 + 中位数 cents 稳定时为 true
//
// v1.1 changes vs v1.0.1:
//   • Attack cool-down now reads per-string attackTime from CalibrationProfile.
//   • Lock window now reads per-string lockWindow from CalibrationProfile.
// ─────────────────────────────────────────────────────────────

export const GUITAR_STRINGS = {
  E2: 82.41,
  A2: 110.0,
  D3: 146.83,
  G3: 196.0,
  B3: 246.94,
  E4: 329.63,
};

const STRING_NAMES = Object.keys(GUITAR_STRINGS);
const STRING_FREQS = STRING_NAMES.map(k => GUITAR_STRINGS[k]);

// ── Parameters ────────────────────────────────────────────────

/** Half-width of per-string acceptance window (cents). */
const MATCH_WINDOW_CENTS = 40;

/**
 * Default attack cool-down (ms) used when profile has no data for a string.
 * Low strings are given more time physically; defaults reflect that.
 */
const ATTACK_COOLDOWN_MS_DEFAULT = {
  E2: 140,
  A2: 130,
  D3: 120,
  G3: 110,
  B3: 100,
  E4:  90,
};

/** RMS multiplier above rolling baseline that triggers attack detection. */
const ATTACK_RMS_SPIKE   = 1.8;

/** Rolling baseline window for attack detection (ms). */
const ATTACK_BASELINE_MS = 50;

/**
 * Default per-string lock window half-widths (cents).
 * Used when profile is absent or was created with an older schema (no lockWindow).
 * Low strings need wider windows due to mic response and inharmonicity.
 */
const DEFAULT_LOCK_WINDOWS = {
  E2: 45,
  A2: 40,
  D3: 32,
  G3: 28,
  B3: 22,
  E4: 20,
};

/** Must be continuously outside the lock window for this long before unlocking. */
const UNLOCK_DURATION_MS = 150;

/**
 * v1.2: 稳定窗口大小（帧数）
 * 5 帧中位数策略：必须连续 5 帧命中同一根弦，才输出 isStable=true
 * E2/A2 上的泛音误跳通常只持续 1-2 帧，5 帧窗口足以过滤掉
 */
const STABILITY_WINDOW_SIZE = 5;

// ── Utility ───────────────────────────────────────────────────

function freqToCents(freq, ref) {
  return 1200 * Math.log2(freq / ref);
}

/** 中位数：对奇数长度数组，返回排序后中间值 */
function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// ─────────────────────────────────────────────────────────────
// GuitarModeEngine
// ─────────────────────────────────────────────────────────────

export class GuitarModeEngine {
  /**
   * @param {import('./CalibrationProfile').CalibrationProfile | null} profile
   */
  constructor(profile = null) {
    this._profile      = profile;
    this._rmsHistory   = [];   // { rms, ts }
    this._attackStart  = null; // ms timestamp, or null
    this._attackString = null; // which string triggered the current cooldown
    this._lockedString = null; // currently locked string name
    this._outsideStart = null; // ms when we first went outside the lock window

    // v1.2: 稳定窗口（每弦独立，防止跨弦帧污染）
    // _stableWindow[stringName] = [cents, cents, ...]（FIFO，最多 STABILITY_WINDOW_SIZE 帧）
    this._stableWindow = {};
    STRING_NAMES.forEach(n => { this._stableWindow[n] = []; });
  }

  // ── Public ─────────────────────────────────────────────────

  /**
   * Process one raw frequency frame（YIN / hybridDetect 已处理的频率）。
   *
   * @param {number} rawFreq  Hz, or ≤0 for silent/no-pitch
   * @param {number} rms      Frame RMS
   * @param {number} [nowMs]  Timestamp in ms (use performance.now())
   * @returns {{ stringName: string, cents: number, isStable: boolean } | null}
   */
  process(rawFreq, rms, nowMs = performance.now()) {
    this._pushRms(rms, nowMs);

    // Silent / no-pitch frame — maintain unlock countdown, no output
    if (rawFreq <= 0) {
      this._advanceUnlockTimer(nowMs);
      this._clearStableWindow(); // 静音时重置稳定窗口
      return null;
    }

    // ── 1️⃣  Whitelist matching ──────────────────────────────
    let matched = this._matchString(rawFreq);

    // ── 2️⃣  Octave auto-correction ──────────────────────────
    // 如果 hybridDetect 没能纠正倍频，这里再兜底一次
    if (!matched) {
      const half = this._matchString(rawFreq / 2);
      if (half) matched = half;
    }

    if (!matched) {
      this._advanceUnlockTimer(nowMs);
      return null;
    }

    // ── 3️⃣  Attack cool-down ────────────────────────────────
    const baseline    = this._rmsBaseline();
    const cooldownMs  = this._getAttackCooldown(matched.stringName);

    if (baseline > 0 && rms > baseline * ATTACK_RMS_SPIKE) {
      this._attackStart  = nowMs;
      this._attackString = matched.stringName;
    }
    if (this._attackStart !== null) {
      if (nowMs - this._attackStart < cooldownMs) {
        return null; // muted during transient
      }
      this._attackStart  = null;
      this._attackString = null;
    }

    // ── 4️⃣  Lock window debounce ────────────────────────────
    const output = this._applyLockLogic(matched, nowMs);

    // ── 5️⃣  Per-string calibration offset ───────────────────
    let finalCents = output.cents;
    const sp = this._profile?.strings?.[output.stringName];
    if (sp) finalCents -= sp.offset;

    // ── 6️⃣  v1.2: 5 帧稳定窗口 ─────────────────────────────
    // 只有 lock 逻辑已判定 isStable=true 的帧才进入稳定窗口
    // 非稳定帧清空该弦的窗口，防止旧帧污染
    let isStableOutput = false;
    if (output.isStable) {
      const win = this._stableWindow[output.stringName];
      win.push(finalCents);
      // 保持固定窗口大小
      if (win.length > STABILITY_WINDOW_SIZE) win.shift();

      if (win.length >= STABILITY_WINDOW_SIZE) {
        // 5 帧都在同一弦 → 取中位数作为最终 cents，输出稳定帧
        finalCents    = median(win);
        isStableOutput = true;
      }
    } else {
      // 不稳定帧：清空该弦稳定窗口（切弦/泛音误跳导致的中断）
      this._stableWindow[output.stringName] = [];
    }

    return {
      stringName: output.stringName,
      cents:      finalCents,
      isStable:   isStableOutput,
    };
  }

  /** Swap calibration profile at runtime (after re-calibration). */
  setProfile(profile) { this._profile = profile; }

  /** Reset all state. Call when stopping audio or switching sessions. */
  reset() {
    this._rmsHistory   = [];
    this._attackStart  = null;
    this._attackString = null;
    this._lockedString = null;
    this._outsideStart = null;
    this._clearStableWindow();
  }

  // ── Private ────────────────────────────────────────────────

  /** 清空所有弦的稳定窗口 */
  _clearStableWindow() {
    STRING_NAMES.forEach(n => { this._stableWindow[n] = []; });
  }

  /**
   * Returns the attack cooldown duration (ms) for a given string.
   * Prefers profile-measured value; falls back to per-string defaults.
   * A profile attackTime of 0 means it was never measured — use default.
   */
  _getAttackCooldown(stringName) {
    const profAtk = this._profile?.strings?.[stringName]?.attackTime;
    if (profAtk && profAtk > 20) return profAtk; // measured, use it
    return ATTACK_COOLDOWN_MS_DEFAULT[stringName] ?? 120;
  }

  /**
   * Returns the lock window half-width (cents) for a given string.
   * Prefers profile-measured value; falls back to per-string defaults.
   */
  _getLockWindow(stringName) {
    const profWin = this._profile?.strings?.[stringName]?.lockWindow;
    if (profWin && profWin > 0) return profWin;
    return DEFAULT_LOCK_WINDOWS[stringName] ?? 35;
  }

  /** Stage 1 helper: closest string within ±MATCH_WINDOW_CENTS, or null. */
  _matchString(freq) {
    let bestName  = null;
    let bestAbsC  = Infinity;
    let bestCents = 0;

    for (let i = 0; i < STRING_NAMES.length; i++) {
      const c    = freqToCents(freq, STRING_FREQS[i]);
      const absC = Math.abs(c);
      if (absC <= MATCH_WINDOW_CENTS && absC < bestAbsC) {
        bestName  = STRING_NAMES[i];
        bestAbsC  = absC;
        bestCents = c;
      }
    }
    return bestName ? { stringName: bestName, cents: bestCents } : null;
  }

  /**
   * Stage 4 helper: hysteresis lock/unlock logic.
   * Always returns an object — never null.
   * cents in the returned object is ALWAYS relative to the reported stringName,
   * so resultToFreq() is always coherent.
   * Lock window size is now per-string (from profile or defaults).
   */
  _applyLockLogic(matched, nowMs) {
    const { stringName, cents } = matched;
    const absCents    = Math.abs(cents);
    const lockWindow  = this._getLockWindow(this._lockedString ?? stringName);

    // First detection after silence / reset
    if (this._lockedString === null) {
      this._lockedString = stringName;
      this._outsideStart = null;
      return { stringName, cents, isStable: false };
    }

    if (this._lockedString === stringName) {
      if (absCents <= lockWindow) {
        // Inside window — fully stable
        this._outsideStart = null;
        return { stringName, cents, isStable: true };
      }
      // Outside window — start unlock countdown
      if (this._outsideStart === null) this._outsideStart = nowMs;
      if (nowMs - this._outsideStart >= UNLOCK_DURATION_MS) {
        // Unlock confirmed
        this._lockedString = stringName;
        this._outsideStart = null;
        return { stringName, cents, isStable: false };
      }
      // Still in hysteresis — keep locked string
      return { stringName: this._lockedString, cents, isStable: false };
    }

    // Different string detected
    if (this._outsideStart === null) this._outsideStart = nowMs;
    if (nowMs - this._outsideStart >= UNLOCK_DURATION_MS) {
      // Switch confirmed
      this._lockedString = stringName;
      this._outsideStart = null;
      return { stringName, cents, isStable: false };
    }
    // Hysteresis: stay on locked string.
    const lockedTarget = GUITAR_STRINGS[this._lockedString];
    const lockedFreq   = GUITAR_STRINGS[matched.stringName] * Math.pow(2, cents / 1200);
    const lockedCents  = freqToCents(lockedFreq, lockedTarget);
    return { stringName: this._lockedString, cents: lockedCents, isStable: false };
  }

  /** Advance unlock timer during silent / rejected frames. */
  _advanceUnlockTimer(nowMs) {
    if (this._lockedString === null) return;
    if (this._outsideStart === null) this._outsideStart = nowMs;
    if (nowMs - this._outsideStart >= UNLOCK_DURATION_MS) {
      this._lockedString = null;
      this._outsideStart = null;
    }
  }

  _pushRms(rms, nowMs) {
    this._rmsHistory.push({ rms, ts: nowMs });
    const cutoff = nowMs - ATTACK_BASELINE_MS;
    while (this._rmsHistory.length > 0 && this._rmsHistory[0].ts < cutoff) {
      this._rmsHistory.shift();
    }
  }

  _rmsBaseline() {
    if (this._rmsHistory.length < 2) return 0;
    // Exclude the most recent sample (the one we're testing against)
    const sub = this._rmsHistory.slice(0, -1);
    return sub.reduce((a, s) => a + s.rms, 0) / sub.length;
  }
}
