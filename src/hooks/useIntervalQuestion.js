// ─────────────────────────────────────────────────────────────
// hooks/useIntervalQuestion.js — Question generation logic
//
// Generates the next interval question based on:
//   • activeMode       ('findRoot' | 'findInterval')
//   • spaceSettings    ({ fretRange: {min, max}, strings: bool[6]|null })
//   • intervalsPreset  ('all' | 'triad' | 'seventh' | 'guide' | 'custom')
//   • selectedIntervals (string[] — only when preset === 'custom')
//
// Returns a question object matching the shape used throughout
// IntervalsTrainer.jsx:
//   {
//     rootString:   number,   // 0–5 (E2=0, e4=5)
//     rootFret:     number,   // 0–12
//     rootNote:     string,   // e.g. 'C'
//     targetString: number,
//     targetFret:   number,
//     targetNote:   string,
//     intervalName: string,   // e.g. 'M3'
//     intervalSemitones: number,
//   }
//
// Data sourced from existing constants — no new data invented:
//   src/trainers/intervals/constants.js  (INTERVAL_PRESETS, SPACE_PRESETS)
//   src/musicUtils.js                    (getMidi, midiToNote, NOTE_NAMES)
//   src/constants.js                     (INTERVAL_LABELS)
//
// This hook does NOT drive audio, scoring, or state persistence.
// It only concerns itself with what the next question should be.
// ─────────────────────────────────────────────────────────────
import { useCallback, useRef } from 'react';
import { getMidi, midiToNote, findNotePositions } from '../musicUtils';
import { INTERVAL_LABELS } from '../constants';
import { INTERVAL_PRESETS } from '../trainers/intervals/constants';

// Standard open-string MIDI values for E2→e4
const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 e4

// Full list of interval semitone values we can pick from
const ALL_INTERVAL_SEMITONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Map preset id → semitone list (from INTERVAL_PRESETS)
function getIntervalSemitones(intervalsPreset, selectedIntervals) {
  if (intervalsPreset === 'custom') {
    // selectedIntervals is an array of INTERVAL_LABELS strings e.g. ['b3','P5']
    // Convert back to semitone numbers
    const labelToSemitone = {};
    Object.entries(INTERVAL_LABELS).forEach(([semi, label]) => {
      labelToSemitone[label] = Number(semi);
    });
    return (selectedIntervals ?? [])
      .map(l => labelToSemitone[l])
      .filter(n => n !== undefined && n >= 1);
  }
  const preset = INTERVAL_PRESETS.find(p => p.id === intervalsPreset);
  return preset?.intervals ?? ALL_INTERVAL_SEMITONES;
}

// Random integer in [min, max] inclusive
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random element from an array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {object} params
 * @param {'findRoot'|'findInterval'} params.activeMode
 * @param {{ fretRange: {min:number, max:number}, strings: boolean[]|null }} params.spaceSettings
 * @param {'all'|'triad'|'seventh'|'guide'|'custom'} params.intervalsPreset
 * @param {string[]} params.selectedIntervals  — only used when preset==='custom'
 *
 * @returns {{ generateQuestion: () => object|null }}
 */
export function useIntervalQuestion({
  activeMode,
  spaceSettings,
  intervalsPreset,
  selectedIntervals,
}) {
  // Track the last question to avoid immediate repeats
  const lastQuestionRef = useRef(null);

  const generateQuestion = useCallback(() => {
    const { fretRange, strings } = spaceSettings ?? {
      fretRange: { min: 0, max: 12 },
      strings: null,
    };

    // Active string indices (0=E2 … 5=e4)
    const activeStrings = strings
      ? strings.reduce((acc, on, i) => (on ? [...acc, i] : acc), [])
      : [0, 1, 2, 3, 4, 5];

    if (activeStrings.length === 0) return null;

    const semitones = getIntervalSemitones(intervalsPreset, selectedIntervals);
    if (semitones.length === 0) return null;

    // Max attempts to find a non-repeat question
    for (let attempt = 0; attempt < 20; attempt++) {
      const rootStr  = pick(activeStrings);
      const rootFret = randInt(fretRange.min, fretRange.max);
      const rootMidi = OPEN_MIDI[rootStr] + rootFret;

      const intervalSemitones = pick(semitones);
      const targetMidi = activeMode === 'findRoot'
        ? rootMidi - intervalSemitones   // player hears interval note, finds root
        : rootMidi + intervalSemitones;  // player hears root, finds interval

      // Find a valid fret position for the target note on an active string
      const candidatePositions = [];
      for (const str of activeStrings) {
        const openMidi = OPEN_MIDI[str];
        const fret     = targetMidi - openMidi;
        if (fret >= fretRange.min && fret <= fretRange.max) {
          candidatePositions.push({ string: str, fret });
        }
      }

      if (candidatePositions.length === 0) continue;

      const { string: targetStr, fret: targetFret } = pick(candidatePositions);

      const intervalLabel = INTERVAL_LABELS[intervalSemitones] ?? String(intervalSemitones);
      const rootNote   = midiToNote(rootMidi);
      const targetNote = midiToNote(targetMidi);

      const question = {
        rootString:        rootStr,
        rootFret,
        rootNote,
        targetString:      targetStr,
        targetFret,
        targetNote,
        intervalName:      intervalLabel,
        intervalSemitones,
      };

      // Skip if identical to last question
      const last = lastQuestionRef.current;
      if (
        last &&
        last.rootString   === rootStr    &&
        last.rootFret     === rootFret   &&
        last.targetString === targetStr  &&
        last.targetFret   === targetFret
      ) {
        continue;
      }

      lastQuestionRef.current = question;
      return question;
    }

    return null; // Could not find a valid question after max attempts
  }, [activeMode, spaceSettings, intervalsPreset, selectedIntervals]);

  return { generateQuestion };
}
