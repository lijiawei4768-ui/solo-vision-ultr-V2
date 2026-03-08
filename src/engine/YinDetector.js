// ─────────────────────────────────────────────────────────────
// src/engine/YinDetector.js
//
// Pure, zero-dependency implementations of:
//   • yinDetect()   — fundamental frequency estimation
//   • computeRMS()  — root mean square amplitude
//   • midiToFreq()  — MIDI note number → Hz
//
// Designed to be identical in behaviour when ported to Swift/C++.
// No side effects. No imports. No state.
// ─────────────────────────────────────────────────────────────

/**
 * YIN pitch detector with parabolic interpolation (de Cheveigné & Kawahara, 2002).
 *
 * Requirements:
 *   buffer.length MUST be ≥ 2048 to detect E2 (82 Hz) at 44100 Hz.
 *   MAX_TAU = buffer.length / 2 ≥ sampleRate / lowestFreq
 *   E2 (MIDI 40): sampleRate / freq ≈ 535 samples → need MAX_TAU ≥ 535 → buffer ≥ 1070.
 *   B1 (bass): 44100 / 61.74 ≈ 714 → need buffer ≥ 1428.
 *   2048 covers all guitar/bass strings with margin. ✓
 *
 * @param {Float32Array} buffer     - Time-domain PCM samples.
 * @param {number}       sampleRate - Samples per second (e.g. 44100).
 * @param {number}       [threshold=0.14] - CMNDF threshold (lower = stricter).
 * @returns {number} Fundamental frequency in Hz, or -1 if not detected.
 */
export function yinDetect(buffer, sampleRate, threshold = 0.14) {
  const SIZE    = buffer.length;
  const MAX_TAU = Math.floor(SIZE / 2);

  // Step 1 — Difference function
  // d[τ] = Σ(x[i] - x[i+τ])² for i in [0, MAX_TAU)
  const df = new Float32Array(MAX_TAU);
  for (let tau = 1; tau < MAX_TAU; tau++) {
    for (let i = 0; i < MAX_TAU; i++) {
      const diff = buffer[i] - buffer[i + tau];
      df[tau] += diff * diff;
    }
  }

  // Step 2 — Cumulative mean normalised difference function (CMNDF)
  // Avoids the bias of the raw difference function at small τ.
  const cmdf = new Float32Array(MAX_TAU);
  cmdf[0] = 1;
  let running = 0;
  for (let tau = 1; tau < MAX_TAU; tau++) {
    running   += df[tau];
    cmdf[tau]  = running > 0 ? (df[tau] * tau) / running : 0;
  }

  // Step 3 — Absolute threshold with parabolic interpolation
  // Find the first local minimum below the threshold.
  for (let tau = 2; tau < MAX_TAU - 1; tau++) {
    if (
      cmdf[tau] < threshold &&
      cmdf[tau] <= cmdf[tau - 1] &&
      cmdf[tau] <= cmdf[tau + 1]
    ) {
      // Parabolic refinement for sub-sample accuracy.
      const denom   = 2 * (2 * cmdf[tau] - cmdf[tau - 1] - cmdf[tau + 1]);
      const refined = denom !== 0
        ? tau + (cmdf[tau + 1] - cmdf[tau - 1]) / denom
        : tau;
      return sampleRate / refined;
    }
  }

  return -1; // no pitch detected
}

/**
 * Root mean square amplitude of a PCM buffer.
 * Used as a proxy for note loudness / pluck transient detection.
 *
 * @param {Float32Array} data
 * @returns {number} RMS in [0, 1] (normalised float audio).
 */
export function computeRMS(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  return Math.sqrt(sum / data.length);
}

/**
 * Convert a MIDI note number to its fundamental frequency in Hz.
 * A4 = MIDI 69 = 440 Hz (ISO 16).
 *
 * @param {number} midi - MIDI note number (e.g. 40 = E2, 64 = E4).
 * @returns {number} Frequency in Hz.
 */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
