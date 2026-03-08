// ─────────────────────────────────────────────────────────────
// SCALE TRAINER v3.0 — 批次 3-1
//
// 全量更新：
//   • 全图标化控件（Seq ↑ ↓ ⟳ / Root Static +½ Rnd / Entry Point）
//     每个图标均支持：激活跳动动画 + 长按 → 功能说明 Sheet
//   • TypewriterHint — 首次出现时打字机效果提示"Long-press for info"
//   • ScaleBlueprintBar — Blueprint 差异显示
//     - 度数格子：altered degrees 高亮显示
//     - "vs. Major: b3, b7 lowered" 差异说明
//     - 母调显示 + 首调/固定调视角切换 toggle
//   • SCALE_META / getParentKey — 从 constants.js 引入
//   • 所有现有音频/音高检测逻辑完整保留
// ─────────────────────────────────────────────────────────────
import React, {
  useState, useEffect, useRef, useCallback, useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT, FONT_MONO } from "../theme";
import {
  NOTE_NAMES, FLAT_NAMES, INTERVAL_LABELS, SCALES,
  SCALE_META, getParentKey,
} from "../constants";
import {
  getMidi, midiToNote, freqToMidi, noteNameToChroma, haptic,
} from "../musicUtils";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useLongPress } from "../hooks/useGestures";
import { GlassCard, AccentChip, BottomSheet } from "../components/ui";
import { FretboardSurface } from "../components/Fretboard";
import { TrainerHeader } from "./TrainerShared";
import { useToast } from "../components/Toast";
import { ThemeContext, CalibContext } from "../contexts";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ─────────────────────────────────────────────────────────────
// TypewriterHint — 首次出现时打字机效果（仅显示一次）
// ─────────────────────────────────────────────────────────────
function TypewriterHint({ visible, text, onDone }) {
  const T = useT();
  const [displayed, setDisplayed] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShow(true);
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) {
        clearInterval(timer);
        const hide = setTimeout(() => {
          setShow(false);
          onDone?.();
        }, 2000);
        return () => clearTimeout(hide);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tw-hint"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        style={{
          position: "absolute",
          bottom: "110%",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          background: "rgba(30,30,40,0.92)",
          borderRadius: 8,
          padding: "5px 10px",
          fontSize: 11,
          color: "rgba(255,255,255,0.6)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {displayed}
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// InfoIcon — 图标按钮
//   激活：颜色变 + 弹跳动画
//   长按：打开功能说明 Sheet（Level 3）
//   首次出现：TypewriterHint "Long-press for info"
// ─────────────────────────────────────────────────────────────
function InfoIcon({
  icon, isActive, onPress, onLongPress,
  showHintOnMount = false,
}) {
  const T = useT();
  const hintShownRef = useRef(false);
  const [showHint, setShowHint] = useState(false);

  // 首次 mount 后延迟显示打字机提示（全局一次）
  useEffect(() => {
    if (!showHintOnMount || hintShownRef.current) return;
    hintShownRef.current = true;
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, [showHintOnMount]);

  const lp = useLongPress(onLongPress, { delay: 600 });

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <TypewriterHint
        visible={showHint}
        text="Long-press for info"
        onDone={() => setShowHint(false)}
      />
      <motion.button
        {...lp}
        onClick={onPress}
        animate={isActive ? { scale: [1, 1.18, 1], y: [0, -3, 0] } : {}}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        whileHover={{ y: -1 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: isActive ? T.accentSub : T.surface2,
          border: `0.5px solid ${isActive ? T.accentBorder : T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          color: isActive ? T.accent : T.textSecondary,
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
      >
        {icon}
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScaleBlueprintBar — Blueprint 差异显示 + 母调
//   首调视角：度数格子 + "vs. Major: b3, b7 lowered"
//   固定调视角：Parent key = X Major（切换按钮）
// ─────────────────────────────────────────────────────────────
function ScaleBlueprintBar({ scaleName, rootNote }) {
  const T = useT();
  const [viewMode, setViewMode] = useState("relative"); // "relative" | "fixed"

  const meta      = SCALE_META[scaleName];
  const parentKey = meta ? getParentKey(rootNote, scaleName) : null;

  if (!meta) return null;

  const formula   = meta.formula;   // e.g. [1,2,"b3",4,5,6,"b7"]
  const fromMajor = meta.fromMajor; // e.g. ["b3","b7"]

  return (
    <div style={{
      borderRadius: 12,
      background: T.surface1,
      border: `0.5px solid ${T.border}`,
      padding: "12px 14px",
    }}>
      {/* 视角切换 toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase" }}>
          Scale Blueprint
        </span>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `0.5px solid ${T.border}` }}>
          {[
            { id: "relative", label: "首调" },
            { id: "fixed",    label: "固定调" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              style={{
                padding: "3px 10px",
                fontSize: 10,
                background: viewMode === v.id ? T.accentSub : T.surface2,
                color: viewMode === v.id ? T.accent : T.textTertiary,
                border: "none",
                cursor: "pointer",
                fontFamily: FONT_TEXT,
                fontWeight: viewMode === v.id ? 700 : 400,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 度数格子 */}
      <div style={{ display: "flex", gap: 3, marginBottom: 8, justifyContent: "center" }}>
        {formula.map((deg, i) => {
          const degStr    = String(deg);
          const isAltered = fromMajor.some(fd => String(fd) === degStr);
          return (
            <div
              key={i}
              style={{
                minWidth: 30,
                height: 30,
                borderRadius: 8,
                background:  isAltered ? T.accentSub  : T.surface2,
                border:      `0.5px solid ${isAltered ? T.accentBorder : T.border}`,
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
                fontSize:    11,
                fontWeight:  isAltered ? 700 : 400,
                color:       isAltered ? T.accent : T.textSecondary,
                fontFamily:  FONT_MONO,
              }}
            >
              {degStr}
            </div>
          );
        })}
      </div>

      {/* 首调视角：差异说明 */}
      {viewMode === "relative" && fromMajor.length > 0 && (
        <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 4 }}>
          vs. Major: <span style={{ color: T.accent, fontWeight: 600 }}>
            {fromMajor.join(", ")}
          </span> lowered
        </div>
      )}
      {viewMode === "relative" && fromMajor.length === 0 && (
        <div style={{ fontSize: 11, color: T.textTertiary }}>
          Same as Major — the blueprint reference
        </div>
      )}

      {/* 固定调视角：母调 */}
      {viewMode === "fixed" && (
        <div style={{ fontSize: 11, color: T.textSecondary }}>
          {parentKey ? (
            <>
              {rootNote} {scaleName} → Parent key:{" "}
              <span style={{ color: T.accent, fontWeight: 700 }}>
                {parentKey} Major
              </span>
            </>
          ) : (
            <span style={{ color: T.textTertiary }}>
              No single major parent (symmetric / hybrid scale)
            </span>
          )}
        </div>
      )}

      {/* 描述 */}
      {meta.description && (
        <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 4, lineHeight: 1.5 }}>
          {meta.description}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 功能说明数据（长按 Sheet 内容）
// ─────────────────────────────────────────────────────────────
const SEQ_INFO = {
  ascending:  { title: "Ascending ↑",   body: "Practice the scale going upward — from root to octave. Great for internalizing the sequence." },
  descending: { title: "Descending ↓",  body: "Practice going downward — from the highest note back to root. Pairs with ascending for full fluency." },
  random:     { title: "Random Degree ⟳", body: "A random degree is chosen each rep. This tests whether you truly know the scale or just the pattern." },
};
const ROOT_INFO = {
  static:     { title: "Static Root",    body: "The root stays the same every cycle. Useful for isolating a scale in one key before transposing." },
  chromatic:  { title: "Chromatic +½",  body: "After each complete cycle, the root rises by one semitone. Builds the habit of playing in all 12 keys." },
  random:     { title: "Random Root",    body: "The root changes randomly after each cycle. Maximum transposition challenge." },
};
const ENTRY_INFO = {
  title: "Entry Point",
  body:  "Selects which scale degree you start from. Starting on 3 or 5 instead of 1 builds deep knowledge of the scale — you learn it from every angle, not just as a sequence from the root.",
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function ScaleTrainer({ settings, audioEnabled, setAudioEnabled }) {
  const T        = useT();
  const tuning   = settings.tuning;
  const toast    = useToast();
  const calibCtx = useContext(CalibContext);
  const scaleNames = Object.keys(SCALES);

  // ── state ──
  const [selectedScale,   setSelectedScale]   = useState("Dorian");
  const [rootNote,        setRootNote]         = useState("A");
  const [seqMode,         setSeqMode]          = useState("ascending");
  const [rootMovement,    setRootMovement]      = useState("static");
  const [startDegree,     setStartDegree]       = useState(0);
  const [scaleNoteIdx,    setScaleNoteIdx]      = useState(0);
  const [status,          setStatus]            = useState("listening");
  const [streak,          setStreak]            = useState(0);
  const [score,           setScore]             = useState({ correct: 0, total: 0 });
  const [showScalePicker, setShowScalePicker]   = useState(false);

  // 说明 Sheet 状态
  const [infoSheet, setInfoSheet] = useState(null); // { title, body }

  // 打字机提示（只显示一次）
  const hintFiredRef = useRef(false);
  const [showGlobalHint, setShowGlobalHint] = useState(false);
  useEffect(() => {
    if (hintFiredRef.current) return;
    hintFiredRef.current = true;
    const t = setTimeout(() => setShowGlobalHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // ── audio refs ──
  const prevRef      = useRef({ midi: -1, frames: 0 });
  const coolRef      = useRef(false);
  const completedRef = useRef(0);

  const scaleIntervals   = SCALES[selectedScale] ?? [];
  const currentTarget    = scaleIntervals[scaleNoteIdx % scaleIntervals.length] ?? 0;
  const currentTargetNote = NOTE_NAMES[(noteNameToChroma(rootNote) + currentTarget) % 12];

  const advanceRoot = useCallback(cur => {
    if (rootMovement === "static")   return cur;
    if (rootMovement === "chromatic") {
      const c = (noteNameToChroma(cur) + 1) % 12;
      return FLAT_NAMES[c];
    }
    return NOTE_NAMES[Math.floor(Math.random() * 12)];
  }, [rootMovement]);

  const onPitchDetected = useCallback(freq => {
    if (status !== "listening") return;
    const midi = freqToMidi(freq, calibCtx.pitchOffset);
    const st   = prevRef.current;
    if (midi === st.midi) { st.frames++; } else { st.midi = midi; st.frames = 1; }
    if (st.frames < 2) return;
    st.frames = 0;

    const played = ((midi % 12) + 12) % 12;
    const tC     = (noteNameToChroma(rootNote) + currentTarget) % 12;

    if (played === tC) {
      haptic("correct");
      toast?.correct(`✓ ${currentTargetNote} (${INTERVAL_LABELS[currentTarget]})`);
      setStatus("correct");
      setStreak(s => s + 1);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      setTimeout(() => {
        const len  = scaleIntervals.length;
        let   next;
        if      (seqMode === "ascending")  next = (scaleNoteIdx + 1) % len;
        else if (seqMode === "descending") next = (scaleNoteIdx - 1 + len) % len;
        else                               next = Math.floor(Math.random() * len);
        const wrapped =
          (seqMode === "ascending"  && scaleNoteIdx === len - 1) ||
          (seqMode === "descending" && scaleNoteIdx === 0);
        if (wrapped) {
          completedRef.current++;
          if (rootMovement !== "static") setRootNote(prev => advanceRoot(prev));
          next = startDegree;
        }
        prevRef.current = { midi: -1, frames: 0 };
        coolRef.current = false;
        setScaleNoteIdx(next);
        setStatus("listening");
      }, 800);
    } else if (!coolRef.current) {
      coolRef.current = true;
      haptic("wrong");
      toast?.wrong("✗ Try again");
      setScore(s => ({ ...s, total: s.total + 1 }));
      setStreak(0);
      setStatus("wrong");
      setTimeout(() => { coolRef.current = false; setStatus("listening"); }, 700);
    }
  }, [status, rootNote, currentTarget, currentTargetNote, scaleNoteIdx, scaleIntervals, seqMode, rootMovement, startDegree, advanceRoot, toast, calibCtx.pitchOffset]);

  const { rms } = useAudioEngine({ onPitchDetected, enabled: audioEnabled });

  useEffect(() => {
    setStatus("listening");
    setScaleNoteIdx(startDegree);
    prevRef.current = { midi: -1, frames: 0 };
    coolRef.current = false;
    completedRef.current = 0;
  }, [selectedScale, rootNote, startDegree]);

  const longPress = useLongPress(() => {
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setScaleNoteIdx(startDegree);
    completedRef.current = 0;
  });

  // ── Fretboard highlights ──
  const highlights = [];
  for (let s = 0; s < tuning.length; s++) {
    for (let f = settings.minFret; f <= settings.maxFret; f++) {
      const chroma = getMidi(s, f, tuning) % 12;
      const rC     = noteNameToChroma(rootNote);
      const tC     = (rC + currentTarget) % 12;
      if (chroma === rC)
        highlights.push({ string: s, fret: f, role: "root",   label: settings.showNoteNames ? rootNote : "R" });
      else if (chroma === tC)
        highlights.push({ string: s, fret: f, role: "target", label: settings.showNoteNames ? currentTargetNote : INTERVAL_LABELS[currentTarget] });
    }
  }

  // ── Entry Point labels for icon grid ──
  const entryLabels = scaleIntervals.map((iv, i) => ({
    i,
    label: INTERVAL_LABELS[iv],
  }));

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      flex: 1,
      minHeight: 0,
      gap: 14 
    }} {...longPress}>
      <TrainerHeader
        title="Scale Trainer"
        subtitle="Navigate scale degrees"
        status={status}
        streak={streak}
        score={score}
        rms={rms}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled?.(v => !v)}
      />

      {/* ── Root selector ── */}
      <GlassCard style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
          Root
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
          {NOTE_NAMES.map(n => (
            <AccentChip
              key={n}
              active={rootNote === n}
              onClick={() => setRootNote(n)}
              style={{ minWidth: 36, textAlign: "center", padding: "5px 4px", fontSize: 13, fontWeight: rootNote === n ? 700 : 400 }}
            >
              {n}
            </AccentChip>
          ))}
        </div>
      </GlassCard>

      {/* ── Scale selector + Blueprint bar ── */}
      <GlassCard style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Scale name button */}
        <button
          onClick={() => setShowScalePicker(true)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", borderRadius: 12, cursor: "pointer",
            border: `0.5px solid ${T.border}`, background: T.surface2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_TEXT }}>
            {selectedScale}
          </span>
          <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_MONO }}>
            [{(SCALES[selectedScale] || []).map(iv => INTERVAL_LABELS[iv]).join(" ")}]
          </span>
        </button>

        {/* Blueprint差异显示 */}
        <ScaleBlueprintBar scaleName={selectedScale} rootNote={rootNote} />
      </GlassCard>

      {/* ── Icon controls ── */}
      <GlassCard style={{ padding: "14px 16px" }}>
        {/* Seq row */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
            Sequence
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "ascending",  icon: "↑" },
              { id: "descending", icon: "↓" },
              { id: "random",     icon: "⟳" },
            ].map((m, idx) => (
              <InfoIcon
                key={m.id}
                icon={m.icon}
                isActive={seqMode === m.id}
                onPress={() => setSeqMode(m.id)}
                onLongPress={() => setInfoSheet(SEQ_INFO[m.id])}
                showHintOnMount={idx === 0 && showGlobalHint}
              />
            ))}
          </div>
        </div>

        {/* Root row */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
            Root Movement
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "static",    icon: "⊙"  },
              { id: "chromatic", icon: "+½" },
              { id: "random",    icon: "?"  },
            ].map(m => (
              <InfoIcon
                key={m.id}
                icon={m.icon}
                isActive={rootMovement === m.id}
                onPress={() => setRootMovement(m.id)}
                onLongPress={() => setInfoSheet(ROOT_INFO[m.id])}
              />
            ))}
          </div>
        </div>

        {/* Entry Point row */}
        {scaleIntervals.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 0.8, textTransform: "uppercase" }}>
                Entry Point
              </span>
              {/* 长按说明 */}
              <InfoIcon
                icon="?"
                isActive={false}
                onPress={() => setInfoSheet(ENTRY_INFO)}
                onLongPress={() => setInfoSheet(ENTRY_INFO)}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {entryLabels.map(({ i, label }) => (
                <motion.button
                  key={i}
                  onClick={() => setStartDegree(i)}
                  animate={startDegree === i ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: startDegree === i ? 700 : 400,
                    background: startDegree === i ? T.accentSub  : T.surface2,
                    border: `0.5px solid ${startDegree === i ? T.accentBorder : T.border}`,
                    color:  startDegree === i ? T.accent : T.textSecondary,
                    cursor: "pointer",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── Focus card（精简版）──── */}
      <GlassCard elevated style={{ padding: "16px 12px", textAlign: "center" }}>
        <motion.div
          key={`${scaleNoteIdx}-${rootNote}-${selectedScale}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", color: "#4FC3F7", fontFamily: FONT_DISPLAY }}>
              {INTERVAL_LABELS[currentTarget]}
            </span>
            <span style={{ fontSize: 16, color: T.textTertiary, fontWeight: 300 }}>of</span>
            <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-1.5px", color: T.accent, fontFamily: FONT_DISPLAY }}>
              {rootNote}
            </span>
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 4 }}>
            {selectedScale}
          </div>
          {/* Degree progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 10 }}>
            {scaleIntervals.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: 3,
                  transition: "all 0.2s",
                  background:
                    i === scaleNoteIdx % scaleIntervals.length ? "#4FC3F7"
                    : i === startDegree ? "rgba(232,162,60,0.4)"
                    : "rgba(255,255,255,0.1)",
                  transform:
                    i === scaleNoteIdx % scaleIntervals.length ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </GlassCard>

      {/* 指板区域 - 固定高度 */}
      <div style={{ height: 12 }} />
      <div style={{ height: "45%", minHeight: 180 }}>
        <FretboardSurface settings={settings} highlights={highlights} tuning={tuning} />
      </div>

      {/* ── Scale picker sheet ── */}
      <BottomSheet open={showScalePicker} onClose={() => setShowScalePicker(false)} title="Select Scale">
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: "65vh", overflowY: "auto" }}>
          {scaleNames.map(name => {
            const act = selectedScale === name;
            const meta = SCALE_META[name];
            return (
              <button
                key={name}
                onClick={() => { setSelectedScale(name); setShowScalePicker(false); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  border: "none", textAlign: "left",
                  background: act ? T.accentSub : T.surface1,
                  borderTop: `0.5px solid ${act ? T.accentBorder : T.border}`,
                  borderLeft: "0.5px solid transparent",
                  borderRight: "0.5px solid transparent",
                  borderBottom: "0.5px solid transparent",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: act ? 600 : 400, color: act ? T.accent : T.textSecondary, fontFamily: FONT_TEXT }}>
                    {name}
                  </div>
                  {meta?.description && (
                    <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>
                      {meta.description}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: T.textTertiary, fontFamily: FONT_MONO, flexShrink: 0, marginLeft: 8 }}>
                  {(SCALES[name] || []).map(iv => INTERVAL_LABELS[iv]).join(" ")}
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ── 功能说明 Sheet（长按图标进入）── */}
      <BottomSheet
        open={!!infoSheet}
        onClose={() => setInfoSheet(null)}
        title={infoSheet?.title ?? ""}
      >
        <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, margin: 0 }}>
          {infoSheet?.body}
        </p>
      </BottomSheet>
    </div>
  );
}
