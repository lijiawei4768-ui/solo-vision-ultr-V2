// ─────────────────────────────────────────────────────────────
// CHANGES TRAINER v3.0 — 批次 4-1
//
// 全量 UI 重建（audio/voiceleading 逻辑 100% 保留）：
//   • 主焦点区域（Now / Next）大幅放大
//     - 当前和弦名：28px  当前音符：26px  级别标签：16px
//     - Find: / Preview: 明确 section 标题
//   • 迷你进行条（MiniProgressionStrip）
//     - 仅显示 ±3 个和弦（上下文窗口）
//     - 点击 → 展开完整进行 BottomSheet
//     - 原完整横向滚动进行条降级为 Sheet 内
//   • Level 选择器移至底部
//   • 分类名称更新（Fundamentals / Rhythm Changes / Turnarounds / Latin）
//     已在 constants.js 中完成，此处 PROG_CATS 动态读取
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { ThemeContext, CalibContext } from "../contexts";
import {
  PROGRESSIONS, DIFFICULTY_LEVELS, CHORD_TONE_LABELS,
} from "../constants";
import {
  getMidi, midiToNote, freqToMidi,
  transposeChord, parseChord, getChordIvs,
  noteNameToChroma, computeVoiceLead, haptic,
} from "../musicUtils";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useLongPress } from "../hooks/useGestures";
import { GlassCard, AccentChip, BottomSheet } from "../components/ui";
import { FretboardSurface } from "../components/Fretboard";
import { UniversalTopRail } from "./TrainerShared";
import { useToast } from "../components/Toast";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// 动态从 PROGRESSIONS 取所有分类
const PROG_CATS = [...new Set(PROGRESSIONS.map(p => p.cat))];

const ORDER_OPTIONS = [
  { id: "forward", label: "Forward", icon: "→" },
  { id: "reverse", label: "Reverse", icon: "←" },
  { id: "random",  label: "Random",  icon: "⟳" },
];

// ─────────────────────────────────────────────────────────────
// MiniProgressionStrip — 显示 ±3 窗口，点击展开完整 Sheet
// ─────────────────────────────────────────────────────────────
function MiniProgressionStrip({ changes, currentIndex, onExpand }) {
  const T    = useT();
  const total = changes.length;

  // ±3 窗口，最多显示 7 项
  const WIN  = 3;
  const from = Math.max(0, currentIndex - WIN);
  const to   = Math.min(total - 1, currentIndex + WIN);
  const visible = [];
  for (let i = from; i <= to; i++) visible.push(i);

  return (
    <button
      onClick={onExpand}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "10px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: `0.5px solid rgba(255,255,255,0.08)`,
        cursor: "pointer",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {from > 0 && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginRight: 2 }}>◀</span>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, overflowX: "hidden" }}>
        {visible.map(i => {
          const isCur  = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: isCur ? 14 : 12,
                  fontWeight: isCur ? 700 : 400,
                  color:
                    isCur  ? "white"
                    : isPast ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.5)",
                  fontFamily: FONT_TEXT,
                  whiteSpace: "nowrap",
                  paddingBottom: 5,
                  transition: "all 0.2s",
                }}
              >
                {changes[i]}
              </div>
              <div
                style={{
                  height: 2,
                  borderRadius: 1,
                  background: isCur ? "#4FC3F7" : isPast ? "rgba(79,195,247,0.2)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.2s",
                }}
              />
            </div>
          );
        })}
      </div>
      {to < total - 1 && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 2 }}>▶</span>
      )}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 6, flexShrink: 0 }}>
        {currentIndex + 1}/{total} ›
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function ChangesTrainer({ settings, audioEnabled, setAudioEnabled, onOpenTuner, onRecalibrate, onOpenSettings }) {
  const T        = useT();
  const tuning   = settings.tuning;
  const toast    = useToast();
  const calibCtx = useContext(CalibContext);
  const themeCtx = useContext(ThemeContext);

  const [progIdx,      setProgIdx]      = useState(4);
  const [difficulty,   setDifficulty]   = useState(4);
  const [orderMode,    setOrderMode]    = useState("forward");
  const [randomizeKey, setRandomizeKey] = useState(false);
  const [transposeOff, setTransposeOff] = useState(0);
  const [chordIdx,     setChordIdx]     = useState(0);
  const [status,       setStatus]       = useState("listening");
  const [streak,       setStreak]       = useState(0);
  const [score,        setScore]        = useState({ correct: 0, total: 0 });
  const [currentTarget,setCurrentTarget]= useState({ midi: 60, iv: 0 });
  const [nextPreview,  setNextPreview]  = useState({ midi: 60, iv: 0 });

  // Sheet visibility
  const [showPicker,   setShowPicker]   = useState(false);
  const [showFullProg, setShowFullProg] = useState(false);
  const [filterCat,    setFilterCat]    = useState("All");

  

  const lastRef  = useRef(60);
  const prevRef  = useRef({ midi: -1, frames: 0 });
  const coolRef  = useRef(false);
  const loopRef  = useRef(0);

  const maxTones = DIFFICULTY_LEVELS.find(d => d.id === difficulty)?.maxTones ?? 4;
  const prog     = PROGRESSIONS[progIdx];
  const changes  = prog.changes.map(c => transposeChord(c, transposeOff));
  const getAt    = useCallback(idx => changes[((idx % changes.length) + changes.length) % changes.length], [changes]);
  const fromName = getAt(chordIdx);
  const toName   = getAt(chordIdx + (orderMode === "reverse" ? -1 : 1));

  // ── Voice leading state sync ──
  useEffect(() => {
    const cur = chordIdx === 0 && loopRef.current === 0
      ? computeVoiceLead(fromName, 60, maxTones)
      : computeVoiceLead(fromName, lastRef.current, maxTones);
    const nxt = computeVoiceLead(toName, cur.midi, maxTones);
    setCurrentTarget(cur);
    setNextPreview(nxt);
    prevRef.current = { midi: -1, frames: 0 };
    coolRef.current = false;
    setStatus("listening");
  }, [chordIdx, progIdx, difficulty, transposeOff]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    lastRef.current = 60;
    loopRef.current = 0;
    setChordIdx(0);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setTransposeOff(0);
  }, [progIdx, difficulty, orderMode]);

  const advance = useCallback(() => {
    setChordIdx(prev => {
      let next;
      if (orderMode === "forward") {
        next = prev + 1;
        if (next >= changes.length) {
          next = 0;
          loopRef.current++;
          if (randomizeKey) setTransposeOff(Math.floor(Math.random() * 12));
        }
      } else if (orderMode === "reverse") {
        next = prev - 1;
        if (next < 0) {
          next = changes.length - 1;
          loopRef.current++;
          if (randomizeKey) setTransposeOff(Math.floor(Math.random() * 12));
        }
      } else {
        next = Math.floor(Math.random() * changes.length);
      }
      return next;
    });
  }, [orderMode, changes.length, randomizeKey]);

  const onPitchDetected = useCallback(freq => {
    if (status !== "listening") return;
    const midi = freqToMidi(freq, calibCtx.pitchOffset);
    const st   = prevRef.current;
    if (midi === st.midi) { st.frames++; } else { st.midi = midi; st.frames = 1; }
    if (st.frames < 2) return;
    st.frames = 0;

    const { root, type } = parseChord(fromName);
    const rootChroma     = noteNameToChroma(root);
    const ivs            = getChordIvs(type).slice(0, Math.max(1, maxTones));
    const playedC        = ((midi % 12) + 12) % 12;
    const isChordTone    = ivs.some(iv => (rootChroma + iv) % 12 === playedC);
    const isTarget       = Math.abs(midi - currentTarget.midi) <= 1;

    if (isTarget || (maxTones >= 99 && isChordTone)) {
      lastRef.current = midi;
      haptic("correct");
      toast?.correct(`✓ ${midiToNote(currentTarget.midi)} (${CHORD_TONE_LABELS[currentTarget.iv] ?? "?"})`);
      setStatus("correct");
      setStreak(s => s + 1);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      setTimeout(() => advance(), 1500);
    } else if (!isChordTone && !coolRef.current) {
      coolRef.current = true;
      haptic("wrong");
      toast?.wrong("✗ Not a chord tone");
      setScore(s => ({ ...s, total: s.total + 1 }));
      setStreak(0);
      setStatus("wrong");
      setTimeout(() => { coolRef.current = false; setStatus("listening"); }, 700);
    }
  }, [status, currentTarget.midi, fromName, maxTones, advance, toast, calibCtx.pitchOffset]);

  const { rms } = useAudioEngine({ onPitchDetected, enabled: audioEnabled });
  const longPress = useLongPress(() => {
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setChordIdx(0);
    loopRef.current = 0;
    lastRef.current = 60;
    setTransposeOff(0);
  });

  const curNote  = midiToNote(currentTarget.midi);
  const nxtNote  = midiToNote(nextPreview.midi);
  const curLabel = CHORD_TONE_LABELS[currentTarget.iv] ?? "?";
  const nxtLabel = CHORD_TONE_LABELS[nextPreview.iv] ?? "?";
  const semMove  = Math.abs(currentTarget.midi - nextPreview.midi);
  const curPos   = chordIdx % changes.length;

  // ── Highlights ──
  const highlights = [];
  const fromRC = noteNameToChroma(parseChord(fromName).root);
  for (let s = 0; s < tuning.length; s++) {
    for (let f = settings.minFret; f <= settings.maxFret; f++) {
      const m = getMidi(s, f, tuning);
      if (Math.abs(m - currentTarget.midi) <= 1)
        highlights.push({ string: s, fret: f, role: "target", label: settings.showNoteNames ? curNote : curLabel });
      else if (m % 12 === fromRC)
        highlights.push({ string: s, fret: f, role: "root", label: "R" });
    }
  }

  const filteredProgs = filterCat === "All"
    ? PROGRESSIONS
    : PROGRESSIONS.filter(p => p.cat === filterCat);

  // ── RMS bar ──
  const rmsBarWidth = Math.min(100, Math.round((rms || 0) * 500));

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      width: "100%",
      gap: 14 
    }} {...longPress}>
      <UniversalTopRail
        title="Changes"
        micActive={audioEnabled}
        rms={rms}
        answerState={status === "listening" ? "idle" : status}
        onMicToggle={() => setAudioEnabled?.(!audioEnabled)}
        onOpenTuner={onOpenTuner}
        onRecalibrate={onRecalibrate}
        onTheme={themeCtx?.toggle}
        onSettings={onOpenSettings}
        isDark={themeCtx?.dark ?? true}
      />

      

      {/* ── Progression selector (one-line) ── */}
      <button
        onClick={() => setShowPicker(true)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 16px", borderRadius: 16, cursor: "pointer",
          border: `0.5px solid ${T.border}`, background: T.surface1, textAlign: "left",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_TEXT }}>
            {prog.name}
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
            {prog.cat} · {prog.key} · {prog.changes.length} chords
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {transposeOff !== 0 && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: T.accentSub, color: T.accent }}>
              +{transposeOff}st
            </span>
          )}
          <span style={{ fontSize: 13, color: T.textTertiary }}>›</span>
        </div>
      </button>

      {/* ── ORDER controls ── */}
      <GlassCard style={{ padding: "12px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", width: 38, flexShrink: 0 }}>
          Order
        </span>
        {ORDER_OPTIONS.map(m => (
          <AccentChip key={m.id} active={orderMode === m.id} onClick={() => setOrderMode(m.id)}>
            {m.icon} {m.label}
          </AccentChip>
        ))}
        <AccentChip active={randomizeKey} onClick={() => setRandomizeKey(k => !k)} style={{ marginLeft: "auto" }}>
          ⇌ Key
        </AccentChip>
      </GlassCard>

      {/* ── MAIN FOCUS AREA (Now → Next) ── */}
      <motion.div
        key={chordIdx}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "stretch" }}>

          {/* NOW card */}
          <GlassCard elevated style={{ padding: "20px 16px", textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 1.4, textTransform: "uppercase" }}>
              Now
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", color: T.accent, fontFamily: FONT_DISPLAY, lineHeight: 1.1 }}>
              {fromName}
            </div>

            {/* Find section */}
            <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                Find
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "white", fontFamily: FONT_DISPLAY, letterSpacing: "-1px" }}>
                {curNote}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.accent, marginTop: 1 }}>
                {curLabel}
              </div>
            </div>

            {/* RMS input bar */}
            <div style={{ height: 3, borderRadius: 2, background: T.surface3, marginTop: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${rmsBarWidth}%`,
                  background: status === "correct" ? T.positive : T.accent,
                  borderRadius: 2,
                  transition: "width 0.1s",
                }}
              />
            </div>
          </GlassCard>

          {/* Arrow + voice lead info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "0 4px" }}>
            <div style={{ fontSize: 18, color: T.textTertiary }}>→</div>
            <AnimatePresence>
              {status === "correct" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: "center", lineHeight: 1.4 }}
                >
                  <div style={{ fontSize: 10, color: T.positive, fontWeight: 700 }}>{curNote}</div>
                  <div style={{ fontSize: 9, color: T.textTertiary }}>{semMove}st</div>
                  <div style={{ fontSize: 10, color: "#4FC3F7", fontWeight: 700 }}>{nxtNote}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NEXT card */}
          <GlassCard style={{ padding: "20px 16px", textAlign: "center", opacity: 0.75, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 1.4, textTransform: "uppercase" }}>
              Next
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#4FC3F7", fontFamily: FONT_DISPLAY, lineHeight: 1.1 }}>
              {toName}
            </div>

            {/* Preview section */}
            <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                Preview
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: FONT_DISPLAY, letterSpacing: "-0.5px" }}>
                {nxtNote}
              </div>
              <div style={{ fontSize: 13, color: "#4FC3F7", marginTop: 1 }}>
                {nxtLabel}
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* ── Mini Progression Strip ── */}
      <MiniProgressionStrip
        changes={changes}
        currentIndex={curPos}
        onExpand={() => setShowFullProg(true)}
      />

      {/* ── Fretboard ── */}
      <div style={{ height: 12 }} />
      <div style={{ height: "45%", minHeight: 180 }}>
        <FretboardSurface settings={settings} highlights={highlights} tuning={tuning} />
      </div>

      {/* ── Level selector (bottom) ── */}
      <GlassCard style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
          Level
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DIFFICULTY_LEVELS.map(d => (
            <AccentChip key={d.id} active={difficulty === d.id} onClick={() => setDifficulty(d.id)}>
              {d.short}
            </AccentChip>
          ))}
        </div>
      </GlassCard>

      {/* ── Full Progression Sheet ── */}
      <BottomSheet
        open={showFullProg}
        onClose={() => setShowFullProg(false)}
        title={`${prog.name} — Full Progression`}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 16 }}>
          {changes.map((ch, i) => {
            const isCur  = i === curPos;
            const isPast = i < curPos;
            return (
              <div
                key={i}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isCur ? 700 : 400,
                  background:
                    isCur  ? T.accentSub
                    : isPast ? "rgba(255,255,255,0.04)"
                    : T.surface1,
                  border: `0.5px solid ${isCur ? T.accentBorder : T.border}`,
                  color:
                    isCur  ? T.accent
                    : isPast ? T.textTertiary
                    : T.textSecondary,
                  opacity: isPast ? 0.5 : 1,
                  fontFamily: FONT_TEXT,
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      {/* ── Progression Picker Sheet ── */}
      <BottomSheet
        open={showPicker}
        onClose={() => setShowPicker(false)}
        title={`Progressions (${PROGRESSIONS.length})`}
      >
        {/* Category filter tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {["All", ...PROG_CATS].map(cat => (
            <AccentChip key={cat} active={filterCat === cat} onClick={() => setFilterCat(cat)}>
              {cat}
            </AccentChip>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredProgs.map(p => {
            const ri  = PROGRESSIONS.indexOf(p);
            const act = ri === progIdx;
            return (
              <button
                key={ri}
                onClick={() => { setProgIdx(ri); setShowPicker(false); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "13px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                  border: "none",
                  background: act ? T.accentSub : T.surface1,
                  borderTop: `0.5px solid ${act ? T.accentBorder : T.border}`,
                  borderLeft: "0.5px solid transparent",
                  borderRight: "0.5px solid transparent",
                  borderBottom: "0.5px solid transparent",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: act ? 600 : 400, color: act ? T.accent : T.textSecondary, fontFamily: FONT_TEXT }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 11, color: T.textTertiary }}>
                  {p.key} · {p.changes.length}ch
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
