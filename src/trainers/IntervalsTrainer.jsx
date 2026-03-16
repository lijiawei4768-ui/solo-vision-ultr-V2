// ─────────────────────────────────────────────────────────────
// trainers/IntervalsTrainer.jsx  — NEW (rebuilt from zero)
//
// This is the state bus for the Intervals trainer.
// It orchestrates the L0 layout and wires all hooks.
// L1 / L2 / L3 are NOT implemented in this batch — slots are
// marked with TODO comments.
//
// Replaces: IntervalsTrainer.LEGACY.jsx
// (Rename the old file to .LEGACY.jsx manually before deploying)
//
// Execute mother doc layer: L0 only (Batch B scope)
// ─────────────────────────────────────────────────────────────
import React, {
  useState, useEffect, useCallback, useContext, useRef,
} from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts';
import { DT } from '../theme';
import { freqToMidi, haptic } from '../musicUtils';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useIntervalQuestion } from '../hooks/useIntervalQuestion';

// ── L0 components ────────────────────────────────────────────
import { TopUtilityRail }        from '../components/intervals/l0/TopUtilityRail';
import { FindModeCapsules }      from '../components/intervals/l0/FindModeCapsules';
import { FocusCard }             from '../components/intervals/l0/FocusCard';
import { PositionStripPro }      from '../components/intervals/l0/PositionStripPro';
import { FretboardStageCard }    from '../components/intervals/l0/FretboardStageCard';
import { BottomQuickStatusBar }  from '../components/intervals/l0/BottomQuickStatusBar';

// ── Shared app components (not rebuilt — still from App.jsx) ──
import { SettingsSheet, StatsSheet } from '../components/ControlCenter';

// Standard open-string MIDI values: E2 A2 D3 G3 B3 e4
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

// Correct-answer cooldown — prevents double-trigger (ms)
const CORRECT_COOLDOWN_MS = 1000;

// Viewport computation: finds the optimal 5-fret window
function computeViewport(rootFret, targetFret, total = 12, width = 5) {
  const lo   = Math.min(rootFret, targetFret);
  const hi   = Math.max(rootFret, targetFret);
  const span = hi - lo;
  const w    = Math.max(width, span + 1);
  const idealLeft = Math.round(lo + span / 2 - w / 2);
  const left = Math.max(0, Math.min(idealLeft, total - w));
  return { min: left, max: left + w - 1 };
}

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ─────────────────────────────────────────────────────────────
// IntervalTrainer — named export matches App.jsx import
// ─────────────────────────────────────────────────────────────
export function IntervalTrainer({ settings, onSettings }) {
  const T      = useT();
  const themeCtx = useContext(ThemeContext);
  const isDark   = themeCtx?.dark ?? true;

  // ── Core state (execution mother doc Part 5.2) ────────────
  const [activeMode,       setActiveMode]       = useState('findRoot');
  const [currentQuestion,  setCurrentQuestion]  = useState(null);
  const [answerState,      setAnswerState]       = useState('idle');
  const [micActive,        setMicActive]         = useState(false);
  const [l1Open,           setL1Open]            = useState(false);
  // TODO Batch C: const [l2Active, setL2Active] = useState(null);
  // TODO Batch C: const [l3Active, setL3Active] = useState(null);

  // ── Training settings state ───────────────────────────────
  const [spaceSettings, setSpaceSettings] = useState({
    fretRange: { min: 0, max: 12 },
    strings:   null, // null = all strings
  });
  const [flowPreset,        setFlowPreset]       = useState('free');
  const [intervalsPreset,   setIntervalsPreset]  = useState('all');
  const [selectedIntervals, setSelectedIntervals] = useState([]);

  // ── Score / streak ────────────────────────────────────────
  const [score,  setScore]  = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  // ── Viewport state ────────────────────────────────────────
  const [viewportMin, setViewportMin] = useState(0);
  const [viewportMax, setViewportMax] = useState(4);

  // ── Sheets ────────────────────────────────────────────────
  const [statsOpen, setStatsOpen] = useState(false);
  const statsRef = useRef({});

  // ── Question generation ───────────────────────────────────
  const { generateQuestion } = useIntervalQuestion({
    activeMode,
    spaceSettings,
    intervalsPreset,
    selectedIntervals,
  });

  // Advance to next question.
  // Viewport updates immediately; FocusCard updates 100ms later (spec).
  const advanceQuestion = useCallback(() => {
    const next = generateQuestion();
    if (!next) return;

    // Viewport moves first (Motion: allowed / fretboard viewport tracking)
    const vp = computeViewport(next.rootFret, next.targetFret);
    setViewportMin(vp.min);
    setViewportMax(vp.max);

    // FocusCard content updates 100ms later — initialSuggested timing
    setTimeout(() => {
      setCurrentQuestion(next);
      setAnswerState('idle');
    }, 100);
  }, [generateQuestion]);

  // Generate first question on mount or when mode/settings change
  useEffect(() => {
    advanceQuestion();
  }, [activeMode, spaceSettings, intervalsPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Answer handling ───────────────────────────────────────
  const correctRef = useRef(false); // prevents concurrent correct triggers

  const handleCorrect = useCallback(() => {
    if (correctRef.current) return;
    correctRef.current = true;

    setAnswerState('correct');
    setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
    setStreak(s => s + 1);
    haptic('success');

    setTimeout(() => {
      correctRef.current = false;
      advanceQuestion();
    }, CORRECT_COOLDOWN_MS);
  }, [advanceQuestion]);

  const handleWrong = useCallback(() => {
    if (answerState !== 'idle') return;
    setAnswerState('wrong');
    setScore(s => ({ ...s, total: s.total + 1 }));
    setStreak(0);
    haptic('error');
    setTimeout(() => setAnswerState('idle'), 600);
  }, [answerState]);

  // ── Fret tap handler ──────────────────────────────────────
  const handleFretTap = useCallback((string, fret) => {
    if (answerState !== 'idle' || !currentQuestion) return;

    const answerString = activeMode === 'findInterval'
      ? currentQuestion.targetString
      : currentQuestion.rootString;
    const answerFret = activeMode === 'findInterval'
      ? currentQuestion.targetFret
      : currentQuestion.rootFret;

    if (string === answerString && fret === answerFret) {
      handleCorrect();
    } else {
      handleWrong();
    }
  }, [answerState, currentQuestion, activeMode, handleCorrect, handleWrong]);

  // ── Mic / audio handling ──────────────────────────────────
  const handlePitchDetected = useCallback((freq) => {
    if (answerState !== 'idle' || !currentQuestion || correctRef.current) return;

    const detected = freqToMidi(freq);
    const targetMidi = activeMode === 'findInterval'
      ? OPEN_MIDI[currentQuestion.targetString] + currentQuestion.targetFret
      : OPEN_MIDI[currentQuestion.rootString]   + currentQuestion.rootFret;

    // Within 50 cents = correct match
    if (Math.abs(detected - targetMidi) < 0.5) {
      handleCorrect();
    }
  }, [answerState, currentQuestion, activeMode, handleCorrect]);

  const { rms } = useAudioEngine({
    onPitchDetected: handlePitchDetected,
    enabled:         micActive,
  });

  // ── Mode change ───────────────────────────────────────────
  const handleModeChange = useCallback((id) => {
    setActiveMode(id);
    setAnswerState('idle');
    // advanceQuestion will fire via the useEffect above
  }, []);

  // ── Build fretboard highlights ────────────────────────────
  const highlights = currentQuestion ? [
    {
      string: currentQuestion.rootString,
      fret:   currentQuestion.rootFret,
      type:   'root',
    },
    {
      string: currentQuestion.targetString,
      fret:   currentQuestion.targetFret,
      type:   answerState === 'correct' ? 'correct'
            : answerState === 'wrong'   ? 'wrong'
            : 'interval',
    },
  ] : [];

  // ── Quick status labels ───────────────────────────────────
  const spaceLabel = spaceSettings.fretRange.min === 0 && spaceSettings.fretRange.max === 12
    ? 'Full' : `${spaceSettings.fretRange.min}–${spaceSettings.fretRange.max}`;
  const flowLabel  = flowPreset === 'free' ? 'Free' : flowPreset;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{
      flex:        1,
      display:     'flex',
      flexDirection: 'column',
      minHeight:   0,
      overflow:    'hidden',
      background:  T.surface0 ?? 'rgba(10,10,15,1)',
      // PaddingBottom reserves space for the App-level TabBar (60px mobile)
      paddingBottom: `calc(${60}px + env(safe-area-inset-bottom, 0px))`,
    }}>

      {/* ── L0 stage wrapper ──────────────────────────────── */}
      {/* Scales back + blurs when L1 is open */}
      <motion.div
        animate={{
          scale:  l1Open ? 0.96 : 1,
          filter: l1Open ? 'blur(4px)' : 'blur(0px)',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          minHeight:     0,
          transformOrigin: 'top center',
        }}
      >
        {/* TopUtilityRail */}
        <TopUtilityRail
          micActive={micActive}
          rms={rms}
          answerState={answerState}
          onMicToggle={() => setMicActive(m => !m)}
          onStats={() => setStatsOpen(true)}
          onTheme={() => onSettings?.({
            ...settings,
            colorMode: isDark ? 'light' : 'dark',
            themeId:   isDark ? 'ios-light' : 'violet-deep',
          })}
          onSettings={() => {/* TODO: open app settings */}}
          isDark={isDark}
        />

        {/* FindModeCapsules */}
        <FindModeCapsules
          activeMode={activeMode}
          onModeChange={handleModeChange}
        />

        {/* FocusCard */}
        <FocusCard
          question={currentQuestion}
          activeMode={activeMode}
          answerState={answerState}
        />

        {/* PositionStripPro */}
        <PositionStripPro
          viewportMin={viewportMin}
          viewportMax={viewportMax}
          rootFret={currentQuestion?.rootFret ?? null}
          targetFret={currentQuestion?.targetFret ?? null}
        />

        {/* Spacer A — absorbs vertical space, L0 never fills 100% */}
        <div style={{ flex: 1, minHeight: 8, maxHeight: 24 }} />

        {/* FretboardStageCard */}
        <FretboardStageCard
          viewportMin={viewportMin}
          viewportMax={viewportMax}
          highlights={highlights}
          onFretTap={handleFretTap}
        />

        {/* Spacer B */}
        <div style={{ flex: 1, minHeight: 6, maxHeight: 18 }} />

        {/* BottomQuickStatusBar */}
        <BottomQuickStatusBar
          activeMode={activeMode}
          intervalsPreset={intervalsPreset}
          spacePresetLabel={spaceLabel}
          flowPresetLabel={flowLabel}
          onOpen={() => setL1Open(true)}
        />
      </motion.div>

      {/* ── L1 placeholder ────────────────────────────────── */}
      {/* TODO Batch C: PracticeControlSheet */}
      {l1Open && (
        <div
          onClick={() => setL1Open(false)}
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     40,
            background: 'rgba(0,0,0,0.01)',
          }}
        />
      )}

      {/* ── Stats sheet (App-level, preserved from LEGACY) ── */}
      <StatsSheet
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        statsRef={statsRef}
      />
    </div>
  );
}
