// ─────────────────────────────────────────────────────────────
// NOTE TRAINER
//
// FIX v2.1: 接受 setAudioEnabled prop，在 TrainerHeader 中
//           显示 🎤 开关，用户现在可以在 Trainer 内开/关麦克风
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { motion } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { NOTE_NAMES } from "../constants";
import { getMidi, midiToNote, freqToMidi, findNotePositions, haptic } from "../musicUtils";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useLongPress, useSwipe } from "../hooks/useGestures";
import { GlassCard } from "../components/ui";
import { FretboardSurface } from "../components/Fretboard";
import { TrainerHeader } from "./TrainerShared";
import { useToast } from "../components/Toast";
import { ThemeContext, CalibContext } from "../contexts";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}


export function NoteTrainer({ settings, audioEnabled, setAudioEnabled }) {
  const T = useT();
  const tuning = settings.tuning;
  const toast  = useToast();
  const calibCtx = useContext(CalibContext);

  const [targetNote, setTargetNote] = useState("C");
  const [status,     setStatus]     = useState("listening");
  const [streak,     setStreak]     = useState(0);
  const [score,      setScore]      = useState({ correct: 0, total: 0 });
  const [successPos, setSuccessPos] = useState(null);
  const [showAll,    setShowAll]    = useState(false);

  const prevRef = useRef({ midi: -1, frames: 0 });
  const coolRef = useRef(false);

  const next = useCallback(() => {
    setTargetNote(NOTE_NAMES[Math.floor(Math.random() * 12)]);
    setStatus("listening"); setSuccessPos(null); setShowAll(false);
    prevRef.current = { midi: -1, frames: 0 }; coolRef.current = false;
  }, []);

  useEffect(() => { next(); }, []);

  const onPitchDetected = useCallback(freq => {
    if (status !== "listening") return;
    const midi = freqToMidi(freq, calibCtx.pitchOffset);
    const st = prevRef.current;
    if (midi === st.midi) { st.frames++; } else { st.midi = midi; st.frames = 1; }
    if (st.frames < 2) return; st.frames = 0;
    const played = midiToNote(midi);
    if (played === targetNote) {
      haptic("correct");
      toast?.correct(`✓ ${targetNote}`);
      setStatus("correct");
      setStreak(s => s + 1);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      const pos = findNotePositions(targetNote, tuning, settings.minFret, settings.maxFret);
      if (pos.length) setSuccessPos(pos[0]);
      setTimeout(next, 1300);
    } else if (!coolRef.current) {
      coolRef.current = true; haptic("wrong");
      toast?.wrong(`✗ ${played}`);
      setScore(s => ({ ...s, total: s.total + 1 })); setStreak(0); setStatus("wrong");
      setTimeout(() => { coolRef.current = false; setStatus("listening"); }, 700);
    }
  }, [status, targetNote, settings, tuning, next, toast, calibCtx.pitchOffset]);

  const { rms } = useAudioEngine({ onPitchDetected, enabled: audioEnabled });
  const longPress = useLongPress(() => { setScore({ correct: 0, total: 0 }); setStreak(0); next(); });
  const swipe = useSwipe(() => setShowAll(true), () => setShowAll(false));

  const positions = (settings.showAllPositions || showAll)
    ? findNotePositions(targetNote, tuning, settings.minFret, settings.maxFret)
    : (successPos ? [successPos] : []);
  const highlights = positions.map(p => ({ ...p, role: "root", label: settings.showNoteNames ? targetNote : "R" }));

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      flex: 1,
      minHeight: 0,
      gap: 14 
    }} {...longPress}>
      <TrainerHeader
        title="Note Trainer"
        subtitle="Find the note on the fretboard"
        status={status}
        streak={streak}
        score={score}
        rms={rms}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled?.(v => !v)}
      />

      <GlassCard style={{ padding: "32px 20px", textAlign: "center" }}>
        <motion.div key={targetNote}
          initial={{ scale: 0.75, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={DT.springSnap}
          style={{ fontSize: 88, fontWeight: 800, letterSpacing: "-4px", lineHeight: 1, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
          {targetNote}
        </motion.div>
        <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 10, letterSpacing: 1, textTransform: "uppercase" }}>
          Find this note · Swipe ← to reveal all
        </div>
      </GlassCard>

      {/* 指板区域 - 固定高度 */}
      <div style={{ height: 12 }} />
      <div style={{ height: "45%", minHeight: 180 }}>
        <FretboardSurface settings={settings} highlights={highlights} tuning={tuning} swipeHandlers={swipe} />
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: T.textTertiary, marginTop: 4 }}>Long press to reset</div>
    </div>
  );
}
