// ─────────────────────────────────────────────────────────────
// trainers/IntervalsTrainer.jsx  — Batch B Visual Correction
//
// Changes vs Batch B:
//   • Spacer B: maxHeight 18 → 60px  — pushes BottomBar down
//     toward TabBar, away from fretboard
//   • No structural or functional changes
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

import { TopUtilityRail }       from '../components/intervals/l0/TopUtilityRail';
import { FindModeCapsules }     from '../components/intervals/l0/FindModeCapsules';
import { FocusCard }            from '../components/intervals/l0/FocusCard';
import { PositionStripPro }     from '../components/intervals/l0/PositionStripPro';
import { FretboardStageCard }   from '../components/intervals/l0/FretboardStageCard';
import { BottomQuickStatusBar } from '../components/intervals/l0/BottomQuickStatusBar';
import { SettingsSheet, StatsSheet } from '../components/ControlCenter';

const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const CORRECT_COOLDOWN_MS = 1000;

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

export function IntervalTrainer({ settings, onSettings }) {
  const T        = useT();
  const themeCtx = useContext(ThemeContext);
  const isDark   = themeCtx?.dark ?? true;

  const [activeMode,       setActiveMode]       = useState('findRoot');
  const [currentQuestion,  setCurrentQuestion]  = useState(null);
  const [answerState,      setAnswerState]       = useState('idle');
  const [micActive,        setMicActive]         = useState(false);
  const [l1Open,           setL1Open]            = useState(false);

  const [spaceSettings, setSpaceSettings] = useState({
    fretRange: { min: 0, max: 12 },
    strings:   null,
  });
  const [flowPreset,        setFlowPreset]      = useState('free');
  const [intervalsPreset,   setIntervalsPreset] = useState('all');
  const [selectedIntervals, setSelectedIntervals] = useState([]);

  const [score,  setScore]  = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [viewportMin, setViewportMin] = useState(0);
  const [viewportMax, setViewportMax] = useState(4);
  const [statsOpen, setStatsOpen]     = useState(false);
  const statsRef = useRef({});

  const { generateQuestion } = useIntervalQuestion({
    activeMode, spaceSettings, intervalsPreset, selectedIntervals,
  });

  const advanceQuestion = useCallback(() => {
    const next = generateQuestion();
    if (!next) return;
    const vp = computeViewport(next.rootFret, next.targetFret);
    setViewportMin(vp.min);
    setViewportMax(vp.max);
    setTimeout(() => {
      setCurrentQuestion(next);
      setAnswerState('idle');
    }, 100);
  }, [generateQuestion]);

  useEffect(() => { advanceQuestion(); },
    [activeMode, spaceSettings, intervalsPreset]); // eslint-disable-line

  const correctRef = useRef(false);

  const handleCorrect = useCallback(() => {
    if (correctRef.current) return;
    correctRef.current = true;
    setAnswerState('correct');
    setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
    setStreak(s => s + 1);
    haptic('success');
    setTimeout(() => { correctRef.current = false; advanceQuestion(); }, CORRECT_COOLDOWN_MS);
  }, [advanceQuestion]);

  const handleWrong = useCallback(() => {
    if (answerState !== 'idle') return;
    setAnswerState('wrong');
    setScore(s => ({ ...s, total: s.total + 1 }));
    setStreak(0);
    haptic('error');
    setTimeout(() => setAnswerState('idle'), 600);
  }, [answerState]);

  const handleFretTap = useCallback((string, fret) => {
    if (answerState !== 'idle' || !currentQuestion) return;
    const answerString = activeMode === 'findInterval'
      ? currentQuestion.targetString : currentQuestion.rootString;
    const answerFret = activeMode === 'findInterval'
      ? currentQuestion.targetFret : currentQuestion.rootFret;
    if (string === answerString && fret === answerFret) handleCorrect();
    else handleWrong();
  }, [answerState, currentQuestion, activeMode, handleCorrect, handleWrong]);

  const handlePitchDetected = useCallback((freq) => {
    if (answerState !== 'idle' || !currentQuestion || correctRef.current) return;
    const detected  = freqToMidi(freq);
    const targetMidi = activeMode === 'findInterval'
      ? OPEN_MIDI[currentQuestion.targetString] + currentQuestion.targetFret
      : OPEN_MIDI[currentQuestion.rootString]   + currentQuestion.rootFret;
    if (Math.abs(detected - targetMidi) < 0.5) handleCorrect();
  }, [answerState, currentQuestion, activeMode, handleCorrect]);

  const { rms } = useAudioEngine({ onPitchDetected: handlePitchDetected, enabled: micActive });

  const handleModeChange = useCallback((id) => {
    setActiveMode(id);
    setAnswerState('idle');
  }, []);

  const highlights = currentQuestion ? [
    { string: currentQuestion.rootString,   fret: currentQuestion.rootFret,   type: 'root' },
    { string: currentQuestion.targetString, fret: currentQuestion.targetFret,
      type: answerState === 'correct' ? 'correct' : answerState === 'wrong' ? 'wrong' : 'interval' },
  ] : [];

  const spaceLabel = spaceSettings.fretRange.min === 0 && spaceSettings.fretRange.max === 12
    ? 'Full' : `${spaceSettings.fretRange.min}–${spaceSettings.fretRange.max}`;
  const flowLabel  = flowPreset === 'free' ? 'Free' : flowPreset;

  return (
    <div style={{
      flex:            1,
      display:         'flex',
      flexDirection:   'column',
      minHeight:       0,
      overflow:        'hidden',
      background:      T.surface0 ?? 'rgba(10,10,15,1)',
      paddingBottom:   `calc(${60}px + env(safe-area-inset-bottom, 0px))`,
    }}>
      <motion.div
        animate={{
          scale:  l1Open ? 0.96 : 1,
          filter: l1Open ? 'blur(4px)' : 'blur(0px)',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        style={{
          flex:            1,
          display:         'flex',
          flexDirection:   'column',
          minHeight:       0,
          transformOrigin: 'top center',
        }}
      >
        <TopUtilityRail
          micActive={micActive} rms={rms} answerState={answerState}
          onMicToggle={() => setMicActive(m => !m)}
          onStats={() => setStatsOpen(true)}
          onTheme={() => onSettings?.({
            ...settings,
            colorMode: isDark ? 'light' : 'dark',
            themeId:   isDark ? 'ios-light' : 'violet-deep',
          })}
          onSettings={() => {}}
          isDark={isDark}
        />

        <FindModeCapsules activeMode={activeMode} onModeChange={handleModeChange} />

        <FocusCard
          question={currentQuestion} activeMode={activeMode} answerState={answerState}
          score={score} streak={streak}
        />

        <PositionStripPro
          viewportMin={viewportMin} viewportMax={viewportMax}
          rootFret={currentQuestion?.rootFret ?? null}
          targetFret={currentQuestion?.targetFret ?? null}
        />

        {/* Spacer A — between PositionStrip and Fretboard */}
        <div style={{ flex: 1, minHeight: 8, maxHeight: 24 }} />

        <FretboardStageCard
          viewportMin={viewportMin} viewportMax={viewportMax}
          highlights={highlights} onFretTap={handleFretTap}
        />

        {/* ─── Spacer B — Visual Correction: pushes BottomBar toward TabBar ───
            Increased maxHeight from 18 → 60 so BottomBar floats at the base
            of the screen, building a closer relationship with TabBar below. */}
        <div style={{ flex: 1, minHeight: 20, maxHeight: 60 }} />

        <BottomQuickStatusBar
          activeMode={activeMode} intervalsPreset={intervalsPreset}
          spacePresetLabel={spaceLabel} flowPresetLabel={flowLabel}
          onOpen={() => setL1Open(true)}
        />
      </motion.div>

      {/* L1 placeholder */}
      {l1Open && (
        <div onClick={() => setL1Open(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.01)' }} />
      )}

      <StatsSheet open={statsOpen} onClose={() => setStatsOpen(false)} statsRef={statsRef} />
    </div>
  );
}
