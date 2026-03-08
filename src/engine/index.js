// src/engine/index.js
// Single import point for all engine modules.
// Hooks import from here; components NEVER import from engine directly.

export { audioCore }                         from './AudioCore';
export { yinDetect, computeRMS, midiToFreq } from './YinDetector';
export { NoiseFloor }                        from './NoiseFloor';
// StabilityFilter has been removed — double-smoothing conflicted with
// GuitarModeEngine's own attack cooldown and lock-window logic.

// GuitarModeEngine v1.1 — per-string profile-driven pipeline
export { GuitarModeEngine, GUITAR_STRINGS }  from './GuitarModeEngine';
export {
  CalibrationRecorder,
  saveCalibrationProfile,
  loadCalibrationProfile,
  defaultCalibrationProfile,
} from './CalibrationProfile';
