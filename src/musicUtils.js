// ─────────────────────────────────────────────────────────────
// src/musicUtils.js
//
// Music theory pure functions — no React, no audio, no side effects.
//
// ARCHITECTURE NOTE:
//   Audio logic (YIN, StabilityFilter, NoiseFloor) has been moved to
//   src/engine/. Import those directly from the engine in hooks.
//   This file contains ONLY music theory computations.
// ─────────────────────────────────────────────────────────────
import {
  NOTE_NAMES, FLAT_NAMES, CHORD_INTERVALS, INTERVAL_LABELS,
  INSTRUMENTS,
} from './constants';

export { NOTE_NAMES, FLAT_NAMES, INTERVAL_LABELS };

export function getMidi(strIdx, fret, tuning) {
  return tuning[strIdx] + fret;
}

export function midiToNote(midi) {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

export function freqToMidi(freq, pitchOffset = 1.0) {
  if (freq <= 0) return -1;
  return Math.round(69 + 12 * Math.log2((freq * pitchOffset) / 440));
}

export function freqToCents(freq) {
  if (freq <= 0) return 0;
  const midi    = 69 + 12 * Math.log2(freq / 440);
  const rounded = Math.round(midi);
  return Math.round((midi - rounded) * 100);
}

export function noteNameToChroma(name) {
  const base = NOTE_NAMES.indexOf(name);
  if (base >= 0) return base;
  return ({ Db: 1, Eb: 3, Gb: 6, Ab: 8, Bb: 10, Cb: 11, 'E#': 5, 'B#': 0 })[name] ?? -1;
}

export function findNotePositions(noteName, tuning, minFret = 0, maxFret = 15) {
  const pos = [];
  for (let s = 0; s < tuning.length; s++)
    for (let f = minFret; f <= maxFret; f++)
      if (midiToNote(getMidi(s, f, tuning)) === noteName) pos.push({ string: s, fret: f });
  return pos;
}

export function transposeChord(chord, semitones) {
  const m = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!m) return chord;
  const chroma = noteNameToChroma(m[1]);
  if (chroma < 0) return chord;
  return FLAT_NAMES[((chroma + semitones) % 12 + 12) % 12] + m[2];
}

export function parseChord(s) {
  const m = s.match(/^([A-G][b#]?)(.*)$/);
  return m ? { root: m[1], type: m[2] || '' } : { root: 'C', type: 'Maj7' };
}

export function getChordIvs(type) {
  return CHORD_INTERVALS[type] ?? [0, 4, 7];
}

export function computeVoiceLead(chordName, fromMidi, maxTones = 99) {
  const { root, type } = parseChord(chordName);
  const rootChroma     = noteNameToChroma(root);
  if (rootChroma < 0) return { midi: fromMidi, iv: 0 };

  let ivs = getChordIvs(type).slice(0, Math.max(1, maxTones));
  if (maxTones === 2) ivs = getChordIvs(type).filter(iv => iv === 0 || iv === 7).slice(0, 2);
  if (!ivs.length) ivs = [0];

  const cands = [];
  for (let oct = 2; oct <= 6; oct++)
    for (const iv of ivs) {
      const m = (oct + 1) * 12 + ((rootChroma + iv) % 12);
      if (m >= 23 && m <= 88) cands.push({ midi: m, iv });
    }

  if (!cands.length) return { midi: fromMidi, iv: 0 };
  return cands.reduce((b, c) =>
    Math.abs(c.midi - fromMidi) < Math.abs(b.midi - fromMidi) ? c : b
  );
}

export function haptic(type = 'correct') {
  if (!navigator.vibrate) return;
  type === 'correct' ? navigator.vibrate([25]) : navigator.vibrate([12, 24, 12]);
}
