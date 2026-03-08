// ─────────────────────────────────────────────────────────────
// src/engine/NoiseFloor.js
//
// Adaptive ambient noise floor estimator.
//
// Algorithm: P85 percentile of N sampled RMS frames.
//   • P85 (not mean) is robust against transient noise spikes
//     (AC hum, traffic, one-off sounds) that inflate the mean.
//   • minRms = P85 × GATE_MULTIPLIER provides a noise gate
//     that silences residual background without clipping real notes.
//   • Absolute floor prevents over-sensitivity in dead-silent rooms.
//
// Equivalent Swift port:
//   var samples: [Float] = []
//   func feed(_ rms: Float) -> Bool { … identical logic … }
// ─────────────────────────────────────────────────────────────

/** Number of rAF frames to sample (≈ 3 s at 30 fps). */
const SAMPLE_COUNT    = 90;
/** Percentile used to characterise the ambient noise level. */
const PERCENTILE      = 0.85;
/** Gate threshold = noiseP85 × this multiplier. */
const GATE_MULTIPLIER = 2.8;
/** Absolute floor — prevents the gate from being set below this value
 *  even in genuinely silent environments (avoids false note triggers). */
const ABSOLUTE_FLOOR  = 0.005;
/** Maximum gate ceiling — prevents very loud rooms from silencing everything. */
const ABSOLUTE_CEIL   = 0.06;

export class NoiseFloor {
  constructor() {
    /** @type {number[]} */
    this._samples = [];
    this._done    = false;
    this._minRms  = ABSOLUTE_FLOOR;
  }

  // ── Accessors ────────────────────────────────────────────────

  /** True once SAMPLE_COUNT frames have been collected. */
  get isDone() { return this._done; }

  /**
   * Computed noise gate threshold (Hz RMS).
   * Valid after isDone === true; before that, returns ABSOLUTE_FLOOR.
   */
  get minRms() { return this._minRms; }

  /**
   * Sampling progress [0, 1].
   * Use this to drive a progress bar during Step 1.
   */
  get progress() {
    return Math.min(1, this._samples.length / SAMPLE_COUNT);
  }

  /**
   * True when the ambient noise is low enough for reliable pitch detection.
   * Threshold: gate < 0.025 (≈ -32 dBFS) is considered acceptable.
   */
  get isQuiet() { return this._minRms < 0.025; }

  // ── API ──────────────────────────────────────────────────────

  /**
   * Feed one RMS frame into the sampler.
   *
   * @param {number} rms - Current frame RMS (0–1 float audio).
   * @returns {boolean}  True when sampling is complete.
   */
  feed(rms) {
    if (this._done) return true;

    this._samples.push(rms);

    if (this._samples.length >= SAMPLE_COUNT) {
      this._minRms = this._compute();
      this._done   = true;
    }

    return this._done;
  }

  /** Reset for re-use (e.g. user retries calibration). */
  reset() {
    this._samples = [];
    this._done    = false;
    this._minRms  = ABSOLUTE_FLOOR;
  }

  // ── Internal ─────────────────────────────────────────────────

  _compute() {
    const sorted = [...this._samples].sort((a, b) => a - b);
    const idx    = Math.min(
      sorted.length - 1,
      Math.floor(sorted.length * PERCENTILE),
    );
    const p85    = sorted[idx];
    const gate   = p85 * GATE_MULTIPLIER;
    return Math.min(ABSOLUTE_CEIL, Math.max(ABSOLUTE_FLOOR, gate));
  }
}
