// trainers/IntervalsTrainer.jsx — v9
// Fix: 去掉根 div overflow:hidden → 改用 overscrollBehavior:none
//      防止滚动的同时不裁剪 BottomQuickStatusBar

import React, {
  useState, useEffect, useCallback, useContext, useRef,
} from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../contexts';
import { INTERVAL_LABELS } from '../constants';
import { freqToMidi, haptic } from '../musicUtils';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useIntervalQuestion } from '../hooks/useIntervalQuestion';
import { SPACE_PRESETS } from './intervals/constants';

import { TopUtilityRail }      from '../components/intervals/l0/TopUtilityRail';
import { FindModeCapsules }     from '../components/intervals/l0/FindModeCapsules';
import { FocusCard }            from '../components/intervals/l0/FocusCard';
import { PositionStripPro }     from '../components/intervals/l0/PositionStripPro';
import { FretboardStageCard }   from '../components/intervals/l0/FretboardStageCard';
import { BottomQuickStatusBar } from '../components/intervals/l0/BottomQuickStatusBar';
import { PracticeControlSheet } from '../components/intervals/l1/PracticeControlSheet';
import { SpaceEditorL2 }        from '../components/intervals/l2/SpaceEditorL2';
import { FlowEditorL2 }         from '../components/intervals/l2/FlowEditorL2';
import { IntervalsEditorL2 }    from '../components/intervals/l2/IntervalsEditorL2';
import { SpaceEditorL3 }        from '../components/intervals/l3/SpaceEditorL3';
import { FlowEditorL3 }         from '../components/intervals/l3/FlowEditorL3';
import { IntervalsEditorL3 }    from '../components/intervals/l3/IntervalsEditorL3';

const OPEN_MIDI        = [40, 45, 50, 55, 59, 64];
const CORRECT_COOLDOWN = 1000;
const ALL_INTERVALS    = INTERVAL_LABELS.filter(l => l !== 'R');

function computeViewport(rootFret, targetFret, total = 12, width = 5) {
  const lo   = Math.min(rootFret, targetFret);
  const hi   = Math.max(rootFret, targetFret);
  const w    = Math.max(width, hi - lo + 1);
  const ctr  = Math.round(lo + (hi - lo) / 2 - w / 2);
  const left = Math.max(0, Math.min(ctr, total - w));
  return { min: left, max: left + w - 1 };
}

const spaceLabel = id => ({ full:'Full', pos1:'1–5', pos5:'5–9', ead:'EAD', custom:'Custom' })[id] ?? 'Full';
const flowLabel  = id => ({ free:'Free', 'low-high':'↑', 'high-low':'↓', custom:'···' })[id] ?? 'Free';

export function IntervalTrainer({ settings, onSettings }) {
  const themeCtx = useContext(ThemeContext);
  const isDark   = themeCtx?.dark ?? true;

  const [activeMode,        setActiveMode]       = useState('findRoot');
  const [currentQuestion,   setCurrentQuestion]  = useState(null);
  const [answerState,       setAnswerState]      = useState('idle');
  const [micActive,         setMicActive]        = useState(false);
  const [viewportMin,       setViewportMin]      = useState(0);
  const [viewportMax,       setViewportMax]      = useState(4);
  const [score,             setScore]            = useState({ correct:0, total:0 });
  const [streak,            setStreak]           = useState(0);

  const [intervalsPreset,   setIntervalsPreset]   = useState('all');
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [spacePresetId,     setSpacePresetId]     = useState('full');
  const [spaceSettings,     setSpaceSettings]     = useState({ fretRange:{ min:0, max:12 }, strings:null });
  const [flowPreset,        setFlowPreset]        = useState('free');
  const [positionsPerStr,   setPosPerStr]         = useState(3);
  const [practiceMode,      setPracticeMode]      = useState('learning');
  const [zoneId,            setZoneId]            = useState('off');

  const [l1Open,   setL1Open]   = useState(false);
  const [l2Active, setL2Active] = useState(null);
  const [l3Active, setL3Active] = useState(null);

  const { generateQuestion } = useIntervalQuestion({
    activeMode, spaceSettings, intervalsPreset, selectedIntervals,
  });

  const advanceQuestion = useCallback(() => {
    const next = generateQuestion();
    if (!next) return;
    const vp = computeViewport(next.rootFret, next.targetFret);
    setViewportMin(vp.min);
    setViewportMax(vp.max);
    setTimeout(() => { setCurrentQuestion(next); setAnswerState('idle'); }, 100);
  }, [generateQuestion]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { advanceQuestion(); }, [activeMode, spacePresetId, intervalsPreset, selectedIntervals.join(',')]);

  const correctRef = useRef(false);

  const handleCorrect = useCallback(() => {
    if (correctRef.current) return;
    correctRef.current = true;
    setAnswerState('correct');
    setScore(s => ({ correct:s.correct+1, total:s.total+1 }));
    setStreak(s => s+1);
    haptic?.('success');
    setTimeout(() => { correctRef.current = false; advanceQuestion(); }, CORRECT_COOLDOWN);
  }, [advanceQuestion]);

  const handleWrong = useCallback(() => {
    if (answerState !== 'idle') return;
    setAnswerState('wrong');
    setScore(s => ({ ...s, total:s.total+1 }));
    setStreak(0);
    haptic?.('error');
    setTimeout(() => setAnswerState('idle'), 600);
  }, [answerState]);

  const handleFretTap = useCallback((string, fret) => {
    if (answerState !== 'idle' || !currentQuestion) return;
    const ansStr  = activeMode==='findInterval' ? currentQuestion.targetString : currentQuestion.rootString;
    const ansFret = activeMode==='findInterval' ? currentQuestion.targetFret   : currentQuestion.rootFret;
    if (string===ansStr && fret===ansFret) handleCorrect(); else handleWrong();
  }, [answerState, currentQuestion, activeMode, handleCorrect, handleWrong]);

  const handlePitchDetected = useCallback((freq) => {
    if (answerState!=='idle' || !currentQuestion || correctRef.current) return;
    const detected   = freqToMidi(freq);
    const targetMidi = activeMode==='findInterval'
      ? OPEN_MIDI[currentQuestion.targetString] + currentQuestion.targetFret
      : OPEN_MIDI[currentQuestion.rootString]   + currentQuestion.rootFret;
    if (Math.abs(detected - targetMidi) < 0.5) handleCorrect();
  }, [answerState, currentQuestion, activeMode, handleCorrect]);

  const { rms } = useAudioEngine({ onPitchDetected:handlePitchDetected, enabled:micActive });

  const handleModeChange     = useCallback((id) => { setActiveMode(id); setAnswerState('idle'); }, []);
  const handleToggleInterval = useCallback((ivl) => {
    setSelectedIntervals(prev => {
      if (prev.length===0) return ALL_INTERVALS.filter(i => i!==ivl);
      if (prev.includes(ivl)) { const next = prev.filter(i => i!==ivl); return next.length===0 ? [] : next; }
      const next = [...prev, ivl];
      return next.length===ALL_INTERVALS.length ? [] : next;
    });
    setIntervalsPreset('custom');
  }, []);

  const handleSpacePreset = useCallback((id) => {
    setSpacePresetId(id);
    const p = SPACE_PRESETS.find(x => x.id===id);
    if (p) setSpaceSettings({ fretRange:p.fretRange, strings:p.strings });
  }, []);

  const handleThemeToggle = useCallback(() => {
    if (!onSettings) return;
    onSettings({ ...settings, colorMode:isDark?'light':'dark', themeId:isDark?'ios-light':'violet-deep' });
  }, [isDark, settings, onSettings]);

  const openL2 = useCallback((which) => {
    setL1Open(false);
    setTimeout(() => setL2Active(which), 160);
  }, []);

  const openL3 = useCallback((which) => {
    setL2Active(null);
    setTimeout(() => setL3Active(which), 160);
  }, []);

  const highlights = currentQuestion ? [
    { string:currentQuestion.rootString,   fret:currentQuestion.rootFret,   type:'root' },
    { string:currentQuestion.targetString, fret:currentQuestion.targetFret,
      type: answerState==='correct' ? 'correct' : answerState==='wrong' ? 'wrong' : 'interval' },
  ] : [];

  const tabBarH   = 'calc(60px + env(safe-area-inset-bottom, 0px))';
  const pageBg    = isDark ? '#000' : '#F2F2F7';
  const anyL2Open = l2Active !== null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: pageBg,
      paddingBottom: tabBarH,
      // ── FIX: 不用 overflow:hidden（会裁掉 BottomQuickStatusBar） ──
      // 用 overscrollBehavior:none 防止系统 bounce 滚动
      overscrollBehavior: 'none',
      // iOS: 阻止橡皮筋效果
      WebkitOverflowScrolling: 'auto',
      position: 'relative',
    }}>

      {/* ── L0 ── */}
      <motion.div
        animate={{
          scale:  l1Open || anyL2Open ? 0.96 : 1,
          filter: l1Open || anyL2Open ? 'blur(4px) brightness(0.75)' : 'blur(0px) brightness(1)',
        }}
        transition={{ type:'spring', stiffness:380, damping:38 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          transformOrigin: '50% 40%',
          // 不加 overflow:hidden — 保持 BottomQuickStatusBar handle 完整显示
        }}
      >
        <TopUtilityRail
          micActive={micActive} rms={rms} answerState={answerState}
          onMicToggle={() => setMicActive(m => !m)}
          onStats={() => {}} onTheme={handleThemeToggle}
          onSettings={() => setL1Open(true)} isDark={isDark}
        />
        <FindModeCapsules activeMode={activeMode} onModeChange={handleModeChange} />
        <FocusCard
          question={currentQuestion} activeMode={activeMode}
          answerState={answerState} score={score} streak={streak}
        />
        <PositionStripPro
          viewportMin={viewportMin} viewportMax={viewportMax}
          rootFret={currentQuestion?.rootFret ?? null}
          targetFret={currentQuestion?.targetFret ?? null}
        />
        <div style={{ flex:1, minHeight:4, maxHeight:14 }} />
        <FretboardStageCard
          viewportMin={viewportMin} viewportMax={viewportMax}
          highlights={highlights} onFretTap={handleFretTap}
        />
        <div style={{ flexShrink:0, height:8 }} />
        {/* ── L0 Handle + Quick Status ── 保持完整不裁剪 */}
        <BottomQuickStatusBar
          activeMode={activeMode}
          intervalsPreset={intervalsPreset}
          spacePresetLabel={spaceLabel(spacePresetId)}
          flowPresetLabel={flowLabel(flowPreset)}
          onOpen={() => setL1Open(true)}
        />
      </motion.div>

      {/* ── L1 ── */}
      <PracticeControlSheet
        open={l1Open}
        onClose={() => setL1Open(false)}
        practiceMode={practiceMode}
        onPracticeModeChange={setPracticeMode}
        zoneId={zoneId}
        onZoneChange={setZoneId}
        intervalsPreset={intervalsPreset}
        onIntervalsPreset={(id) => {
          setIntervalsPreset(id);
          if (id !== 'custom') setSelectedIntervals([]);
        }}
        spacePresetId={spacePresetId}
        onSpacePreset={handleSpacePreset}
        flowPreset={flowPreset}
        onFlowPreset={setFlowPreset}
        onOpenSpaceL2={() => openL2('space')}
        onOpenFlowL2={() => openL2('flow')}
        onOpenIntervalsL2={() => openL2('intervals')}
        bottomOffset={`calc(${tabBarH})`}
      />

      {/* ── L2 ── */}
      <SpaceEditorL2
        isOpen={l2Active === 'space'}
        onClose={() => setL2Active(null)}
        spacePresetId={spacePresetId}
        onSpaceChange={handleSpacePreset}
        onOpenL3={() => openL3('space')}
      />
      <FlowEditorL2
        isOpen={l2Active === 'flow'}
        onClose={() => setL2Active(null)}
        flowPreset={flowPreset}
        onFlowChange={setFlowPreset}
        onOpenL3={() => openL3('flow')}
      />
      <IntervalsEditorL2
        isOpen={l2Active === 'intervals'}
        onClose={() => setL2Active(null)}
        intervalsPreset={intervalsPreset}
        selectedIntervals={selectedIntervals}
        onPresetChange={(id) => {
          setIntervalsPreset(id);
          if (id !== 'custom') setSelectedIntervals([]);
        }}
        onToggleInterval={handleToggleInterval}
        onOpenL3={() => openL3('intervals')}
      />

      {/* ── L3 ── */}
      <SpaceEditorL3
        isOpen={l3Active === 'space'}
        onClose={() => setL3Active(null)}
        spaceSettings={spaceSettings}
        onSpaceSettings={(s) => { setSpaceSettings(s); setSpacePresetId('custom'); }}
      />
      <FlowEditorL3
        isOpen={l3Active === 'flow'}
        onClose={() => setL3Active(null)}
        flowPreset={flowPreset}
        positionsPerString={positionsPerStr}
        onFlowSettings={({ order, positionsPerString }) => {
          setFlowPreset(order);
          setPosPerStr(positionsPerString);
        }}
      />
      <IntervalsEditorL3
        isOpen={l3Active === 'intervals'}
        onClose={() => setL3Active(null)}
        selectedIntervals={selectedIntervals}
        onIntervalsChange={(ivls) => {
          setSelectedIntervals(ivls);
          setIntervalsPreset(ivls.length===0 ? 'all' : 'custom');
        }}
      />
    </div>
  );
}
