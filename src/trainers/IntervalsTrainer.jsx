// ─────────────────────────────────────────────────────────────
// INTERVAL TRAINER v4.0 — Full UI Rebuild
//
// L0: Fixed stage (position:fixed, overflow:hidden)
//   ├── TopBar            48px   [MIC ON/OFF | SIGNAL | STREAK]
//   ├── FindModeCapsules  40px   [Find Root] [Find Interval]  ← NEW
//   ├── FocusCard        172px   locked height (= Notes trainer)
//   ├── FretboardPanel   flex:1  swipe-up to open L1
//   └── BottomBar         56px   HANDLE (top) + 4 status chips (bottom)
//
// L1: ControlCenter — iOS style half-sheet
//   Backdrop tap OR swipe-down to dismiss (no × button)
//   ├── Mode card stack  (swipe/tap to cycle)
//   ├── Intervals card   (swipe/tap to cycle, custom → L2)
//   ├── Space chip       (tap = next preset, long-press = L2)
//   └── Flow chip        (tap = next preset, long-press = L2)
//
// L2: Editors — slide in from right, swipe-right from left edge to dismiss
// (no × button — pure iOS push navigation)
//
// Fixed vs v3.1:
//   • Tab hidden only while trainer mounted (correct)
//   • BottomBar = merged Handle + StatusStrip (handle on top)
//   • FindModeCapsules above FocusCard (NEW)
//   • FocusCard height locked at 172px
//   • L1 uses backdrop blur + swipe-down close
//   • L2 uses right-push + left-edge swipe close
//   • Space/Flow: tap = cycle preset, long-press → L2
//   • Long-press visual: border accent + haptic vibrate([8,50,8])
//   • Body scroll locked while trainer is mounted
//   • All audio/pitch detection 100% preserved
// ─────────────────────────────────────────────────────────────

import React, {
  useState, useEffect, useRef, useCallback, useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT, FONT_MONO, SPRINGS } from "../theme";
import { INTERVAL_LABELS, NOTE_NAMES, FLAT_NAMES, SCALES, SCALE_META, getParentKey } from "../constants";
import { getMidi, midiToNote, freqToMidi, findNotePositions, noteNameToChroma, haptic } from "../musicUtils";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useLongPress, useSwipe } from "../hooks/useGestures";
import { GlassCard, SignalBar, StatusPill, PhysicalButton, AccentChip, BottomSheet } from "../components/ui";
import { FretboardSurface } from "../components/Fretboard";
import { StatsSheet } from "../components/ControlCenter";
import { useToast } from "../components/Toast";
import { ThemeContext, CalibContext } from "../contexts";
import { calculateTargetCoordinates } from "../engine/theory/TwoPointSystem";
import { L2PushScreen } from "../components/L2PushScreen";
import {
  STRING_NAMES, MODE_CARDS, INTERVAL_CARDS,
  INTERVAL_PRESETS, SPACE_PRESETS, SPACE_CYCLE,
  FLOW_PRESETS, FLOW_CYCLE, ENHARMONIC_PAIRS,
  SEQ_INFO, ROOT_INFO, ENTRY_INFO, getShapeType,
} from "./intervals/constants";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ─────────────────────────────────────────────────────────────
// SVG Icon Components
// ─────────────────────────────────────────────────────────────
function ModeIcon({ mode, size = 20, color = "currentColor" }) {
  switch (mode) {
    case "learning":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <ellipse cx="10" cy="10" rx="7" ry="5" />
          <circle cx="10" cy="10" r="2.5" fill={color} stroke="none" />
        </svg>
      );
    case "blind":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 10 Q10 4 17 10 Q10 16 3 10" />
          <line x1="3" y1="3" x2="17" y2="17" strokeWidth="1.5" />
        </svg>
      );
    case "rootFirst":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="6" cy="10" r="2.5" fill={color} stroke="none" />
          <circle cx="14" cy="10" r="2.5" />
          <path d="M8.5 9 Q10 6 11.5 9" strokeLinecap="round" />
        </svg>
      );
    case "coreDrill":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <path d="M10 3 A7 7 0 1 1 9.9 3" strokeLinecap="round" />
          <polyline points="10,3 10,7 13,5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default: return null;
  }
}

function ControlIcon({ icon, size = 18, color = "currentColor" }) {
  switch (icon) {
    case "space":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <rect x="3"  y="3"  width="5" height="5" rx="1.5" />
          <rect x="12" y="3"  width="5" height="5" rx="1.5" />
          <rect x="3"  y="12" width="5" height="5" rx="1.5" />
          <rect x="12" y="12" width="5" height="5" rx="1.5" />
        </svg>
      );
    case "flow":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <line x1="3" y1="5"  x2="17" y2="5"  />
          <line x1="3" y1="8"  x2="17" y2="8"  />
          <line x1="3" y1="11" x2="17" y2="11" />
          <line x1="3" y1="14" x2="17" y2="14" />
          <line x1="3" y1="17" x2="17" y2="17" />
        </svg>
      );
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────
// VocalizationPrompt
// ─────────────────────────────────────────────────────────────
function VocalizationPrompt({ interval, shapeType, onDismiss }) {
  const T = useT();
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  return (
    <motion.div
      key="voc-prompt"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={SPRINGS.feather}
      onClick={onDismiss}
      style={{
        borderRadius: 14,
        background: T.accentSub ?? "rgba(232,162,60,0.12)",
        border: `0.5px solid ${T.accentBorder ?? "rgba(232,162,60,0.25)"}`,
        padding: "12px 16px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 9, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        Say aloud
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.accent, fontFamily: FONT_TEXT }}>
        {interval}
        {shapeType && (
          <span style={{ fontWeight: 400, color: T.textTertiary }}> · {shapeType}</span>
        )}
      </div>
      <div style={{ fontSize: 9, color: T.textTertiary, marginTop: 6 }}>tap to dismiss</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// EnharmonicHint
// ─────────────────────────────────────────────────────────────
function EnharmonicHint({ selectedLabels }) {
  const hints = selectedLabels
    .map(l => ENHARMONIC_PAIRS[l])
    .filter(Boolean)
    .filter((h, i, arr) => arr.indexOf(h) === i);
  if (!hints.length) return null;
  const h = hints[0];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: "hidden" }}
    >
      <div style={{
        borderRadius: 10,
        background: "rgba(255,214,0,0.07)",
        border: "0.5px solid rgba(255,214,0,0.18)",
        padding: "8px 12px",
        fontSize: 11,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.6,
        marginBottom: 4,
      }}>
        <span style={{ color: "#FFD600", fontWeight: 600 }}>
          {selectedLabels.filter(l => ENHARMONIC_PAIRS[l]).join(", ")} ↔ {h.partners.join(" / ")}
        </span>{" "}
        — {h.context}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// FretRangeSlider — dual-thumb fret picker
// ─────────────────────────────────────────────────────────────
function FretRangeSlider({ value, onChange }) {
  const T = useT();
  const MAX_SPAN = 7, MIN = 0, MAX = 12;
  const trackRef = useRef(null);
  const pct = v => `${((v - MIN) / (MAX - MIN)) * 100}%`;

  function dragStart(e, which) {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    function move(ev) {
      const rect = track.getBoundingClientRect();
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const fret = Math.round(ratio * (MAX - MIN) + MIN);
      if (which === "start") {
        const newStart = Math.max(MIN, Math.min(fret, value.end - 1));
        onChange(value.end - newStart <= MAX_SPAN
          ? { ...value, start: newStart }
          : { start: value.end - MAX_SPAN, end: value.end });
      } else {
        const newEnd = Math.min(MAX, Math.max(fret, value.start + 1));
        onChange(newEnd - value.start <= MAX_SPAN
          ? { ...value, end: newEnd }
          : { start: value.start, end: value.start + MAX_SPAN });
      }
    }
    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  }

  const thumbStyle = {
    width: 24, height: 24, borderRadius: 12, background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)", cursor: "grab",
    position: "absolute", top: -10, transform: "translateX(-50%)",
    touchAction: "none",
  };

  return (
    <div style={{ padding: "16px 8px" }}>
      <div ref={trackRef} style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", margin: "0 12px" }}>
        <div style={{
          position: "absolute",
          left: pct(value.start),
          right: `${100 - ((value.end - MIN) / (MAX - MIN)) * 100}%`,
          height: "100%",
          background: T.accent, borderRadius: 2,
        }} />
        <div style={{ ...thumbStyle, left: pct(value.start) }}
          onMouseDown={e => dragStart(e, "start")}
          onTouchStart={e => dragStart(e, "start")} />
        <div style={{ ...thumbStyle, left: pct(value.end) }}
          onMouseDown={e => dragStart(e, "end")}
          onTouchStart={e => dragStart(e, "end")} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
        <span>0</span>
        <span style={{ color: "white", fontSize: 11, fontWeight: 600 }}>
          Fret {value.start}–{value.end}
        </span>
        <span>12</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VerticalCardStack — swipeable card deck for Mode & Intervals
// ─────────────────────────────────────────────────────────────
function VerticalCardStack({ cards, activeId, onSelect, renderCard }) {
  const startYRef  = useRef(null);
  const [offsetY,    setOffsetY]    = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const currentIdx = Math.max(0, cards.findIndex(c => c.id === activeId));
  const N = cards.length;
  const prevIdx = (currentIdx - 1 + N) % N;
  const nextIdx = (currentIdx + 1) % N;

  function handleTouchStart(e) {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  }
  function handleTouchMove(e) {
    if (startYRef.current === null) return;
    e.stopPropagation();
    setOffsetY(e.touches[0].clientY - startYRef.current);
  }
  function handleTouchEnd() {
    if (startYRef.current === null) return;
    if (Math.abs(offsetY) > 28) {
      onSelect(offsetY > 0
        ? cards[(currentIdx - 1 + N) % N].id
        : cards[(currentIdx + 1) % N].id);
    }
    startYRef.current = null;
    setIsDragging(false);
    setOffsetY(0);
  }

  const drag = isDragging ? offsetY * 0.25 : 0;

  return (
    <div
      style={{ position: "relative", height: 140, overflow: "hidden", userSelect: "none", WebkitUserSelect: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {[
        { card: cards[prevIdx],    y: -62 + drag, scale: 0.92, opacity: 0.50 },
        { card: cards[currentIdx], y:   0 + drag, scale: 1.0,  opacity: 1.0  },
        { card: cards[nextIdx],    y:  62 + drag, scale: 0.92, opacity: 0.50 },
      ].map(({ card, y, scale, opacity }, i) => (
        <motion.div
          key={card.id + "-" + i}
          animate={{ y, scale, opacity }}
          transition={SPRINGS.jelly}
          onClick={() => i !== 1 ? onSelect(card.id) : undefined}
          style={{ position: "absolute", width: "100%", left: 0, top: "50%", marginTop: -31 }}
        >
          {renderCard(card, i === 1)}
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FindModeCapsules — NEW: Find Root / Find Interval above FocusCard
// ─────────────────────────────────────────────────────────────
function FindModeCapsules({ findMode, onSelect }) {
  const T = useT();
  const options = [
    { id: "root",     label: "Find Root" },
    { id: "interval", label: "Find Interval" },
  ];
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 40,
      paddingLeft: 16,
      paddingRight: 16,
      flexShrink: 0,
    }}>
      {options.map(opt => {
        const active = findMode === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            whileTap={{ scale: 0.95 }}
            transition={SPRINGS.tap}
            style={{
              height: 30,
              padding: "0 14px",
              borderRadius: 15,
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              fontFamily: FONT_TEXT,
              cursor: "pointer",
              border: `1px solid ${active ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
              background: active ? (T.accentSub ?? "rgba(232,162,60,0.1)") : "rgba(255,255,255,0.04)",
              color: active ? (T.accent ?? "#E8A23C") : (T.textTertiary ?? "rgba(255,255,255,0.35)"),
              transition: "all 0.18s",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomBar — NEW: merged Handle (top) + 4 status chips (bottom)
// Entire bar: tap or swipe-up opens L1
// ─────────────────────────────────────────────────────────────
function BottomBar({ content, space, flow, onOpen, isOpen }) {
  const T = useT();
  const startYRef = useRef(null);

  function handleTouchStart(e) { startYRef.current = e.touches[0].clientY; }
  function handleTouchEnd(e) {
    if (startYRef.current === null) return;
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (dy > 12) onOpen();
    startYRef.current = null;
  }

  const modeLabel = {
    learning: "Visual", blind: "Blind",
    rootFirst: "Root 1st", coreDrill: "Core Drill",
  }[content.mode] ?? content.mode;

  const presetLabel = content.intervalPreset === "custom" ? "Custom" : content.intervalPreset;
  const spaceLabel = `${space.fretRange.min}–${space.fretRange.max}`;
  const flowLabel = {
    "low-high": "Low→Hi", "high-low": "Hi→Low",
    random: "Random", free: "Free",
  }[flow.order] ?? flow.order;

  const chips = [modeLabel, presetLabel, spaceLabel, flowLabel];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onOpen}
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "none",
        // ── 规范要求：T.surface2 背景，顶部圆角，贴底 ──────
        background: T.surface2 ?? "rgba(255,255,255,0.06)",
        borderRadius: "16px 16px 0 0",
        borderTop: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
      }}
    >
      {/* Handle line */}
      <motion.div
        animate={{
          width: isOpen ? 38 : 42,
          opacity: isOpen ? 0.6 : [0.35, 0.5, 0.35],
          background: isOpen ? (T.accent ?? "#E8A23C") : "rgba(255,255,255,0.4)",
        }}
        transition={isOpen ? SPRINGS.feather : {
          opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
          width: SPRINGS.feather,
        }}
        style={{ height: 4, borderRadius: 2, flexShrink: 0 }}
      />
      {/* 4 Status chips */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {chips.map((label, i) => (
          <div key={i} style={{
            height: 20, padding: "0 8px", borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
            fontSize: 9, color: T.textTertiary ?? "rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center",
            letterSpacing: 0.3, fontFamily: FONT_TEXT,
          }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FocusCardContent — renders inside the locked FocusCard
// ─────────────────────────────────────────────────────────────
function FocusCardContent({ findMode, contentMode, stage, rootNote, ivName }) {
  const T = useT();

  // Root First mode — stage = root
  if (contentMode === "rootFirst" && stage === "root") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: FONT_TEXT }}>
          PLAY ROOT
        </div>
        <div style={{
          fontSize: 76, fontWeight: 800, letterSpacing: "-3px", lineHeight: 1,
          color: T.textPrimary, fontFamily: FONT_DISPLAY,
        }}>
          {rootNote}
        </div>
      </div>
    );
  }

  // Find Root mode: "Root of [b3] — find it"
  if (findMode === "root") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: FONT_TEXT }}>
          FIND ROOT
        </div>
        <div style={{
          fontSize: 64, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1,
          color: T.accent, fontFamily: FONT_DISPLAY,
        }}>
          {ivName}
        </div>
        <div style={{ fontSize: 13, color: T.textTertiary, marginTop: 8, fontFamily: FONT_TEXT, letterSpacing: 0.3 }}>
          target · find its root
        </div>
      </div>
    );
  }

  // Normal: "[b3] from [G]"
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 9, color: T.textTertiary, letterSpacing: 2, textTransform: "uppercase", fontFamily: FONT_TEXT }}>
        {contentMode === "coreDrill" ? "CORE DRILL"
          : contentMode === "blind" ? "BLIND MODE"
          : "FIND INTERVAL"}
      </div>
      <div style={{
        fontSize: 68, fontWeight: 800, letterSpacing: "-2.5px", lineHeight: 1,
        color: T.accent, fontFamily: FONT_DISPLAY,
      }}>
        {ivName}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textTertiary, fontFamily: FONT_TEXT }}>
        <span>from</span>
        <span style={{
          fontSize: 22, fontWeight: 700, color: T.textSecondary,
          fontFamily: FONT_DISPLAY, letterSpacing: "-0.5px",
        }}>
          {rootNote}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ControlCenter — iOS-style half-sheet, swipe-down to close
// ─────────────────────────────────────────────────────────────
function ControlCenter({
  open, onClose,
  contentMode, onCycleMode,
  intervalPreset, onSetIntervalPreset,
  space, onCycleSpacePreset,
  flow, onCycleFlowPreset,
  onEditIntervals, onEditSpace, onEditFlow,
}) {
  const T = useT();
  const startYRef = useRef(null);
  const [dragY, setDragY] = useState(0);

  function onPanelTouchStart(e) { startYRef.current = e.touches[0].clientY; setDragY(0); }
  function onPanelTouchMove(e) {
    if (startYRef.current === null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) setDragY(dy);
  }
  function onPanelTouchEnd() {
    if (dragY > 60) onClose();
    setDragY(0);
    startYRef.current = null;
  }

  // Space long-press
  const spaceTimerRef       = useRef(null);
  const [spaceLPActive, setSpaceLPActive] = useState(false);

  function spaceDown() {
    setSpaceLPActive(true);
    spaceTimerRef.current = setTimeout(() => {
      setSpaceLPActive(false);
      navigator.vibrate?.([8, 50, 8]);
      onClose();
      setTimeout(onEditSpace, 80);
    }, 500);
  }
  function spaceUp(cycle = true) {
    clearTimeout(spaceTimerRef.current);
    if (spaceLPActive && cycle) onCycleSpacePreset();
    setSpaceLPActive(false);
  }

  // Flow long-press
  const flowTimerRef        = useRef(null);
  const [flowLPActive, setFlowLPActive] = useState(false);

  function flowDown() {
    setFlowLPActive(true);
    flowTimerRef.current = setTimeout(() => {
      setFlowLPActive(false);
      navigator.vibrate?.([8, 50, 8]);
      onClose();
      setTimeout(onEditFlow, 80);
    }, 500);
  }
  function flowUp(cycle = true) {
    clearTimeout(flowTimerRef.current);
    if (flowLPActive && cycle) onCycleFlowPreset();
    setFlowLPActive(false);
  }

  const spaceMeta = SPACE_PRESETS.find(p => p.id === space.preset) ?? SPACE_PRESETS[0];
  const flowMeta  = FLOW_PRESETS.find(p => p.id === flow.preset)   ?? FLOW_PRESETS[0];

  const chipBase = (active, lpActive) => ({
    borderRadius: 14,
    background: active ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
    border: `1px solid ${lpActive ? (T.accent ?? "#E8A23C") : active ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
    padding: "10px 8px",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 4, cursor: "pointer",
    userSelect: "none", WebkitUserSelect: "none",
    transition: "border-color 0.15s",
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cc-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              zIndex: 100,
            }}
          />

          {/* Panel */}
          <motion.div
            key="cc-panel"
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={SPRINGS.sheetPresent}
            onTouchStart={onPanelTouchStart}
            onTouchMove={onPanelTouchMove}
            onTouchEnd={onPanelTouchEnd}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              height: "54%",
              borderTopLeftRadius: 26, borderTopRightRadius: 26,
              background: "rgba(22,22,26,0.96)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
              borderBottom: "none",
              boxShadow: "0 -2px 40px rgba(0,0,0,0.55)",
              zIndex: 101,
              display: "flex", flexDirection: "column",
              padding: "0 14px",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
              userSelect: "none", WebkitUserSelect: "none",
              overflow: "hidden",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.22)" }} />
            </div>

            {/* Title */}
            <div style={{
              fontSize: 10, color: T.textTertiary, letterSpacing: 1.2,
              textTransform: "uppercase", marginBottom: 10,
              textAlign: "center", fontFamily: FONT_TEXT,
            }}>
              Practice Settings
            </div>

            {/* 2×2 Grid
                行1: Mode (VerticalCardStack) + Intervals (VerticalCardStack)
                行2: Space chip                + Flow chip
                每个 renderCard 内 motion.div 固定 height:62px 匹配偏移量 ±62px
            */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "140px auto",
              gap: 10, flex: 1, minHeight: 0,
            }}>
              {/* Mode stack */}
              <div>
                <VerticalCardStack
                  cards={MODE_CARDS}
                  activeId={contentMode}
                  onSelect={id => { if (id !== contentMode) onCycleMode(id); }}
                  renderCard={(card, isActive) => (
                    <motion.div whileTap={{ scale: 0.96 }} style={{
                      height: 62,
                      padding: "8px 10px", borderRadius: 16,
                      background: isActive ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                      border: `1px solid ${isActive ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 3,
                      overflow: "hidden",
                    }}>
                      <ModeIcon mode={card.id} size={20} color={isActive ? (T.accent ?? "#E8A23C") : (T.textSecondary ?? "rgba(255,255,255,0.55)")} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? (T.accent ?? "#E8A23C") : T.textPrimary, lineHeight: 1 }}>{card.label}</span>
                      <span style={{ fontSize: 8, color: T.textTertiary, lineHeight: 1 }}>{card.sublabel}</span>
                    </motion.div>
                  )}
                />
              </div>

              {/* Intervals stack */}
              <div>
                <VerticalCardStack
                  cards={INTERVAL_CARDS}
                  activeId={intervalPreset}
                  onSelect={id => {
                    const p = INTERVAL_PRESETS.find(x => x.id === id);
                    if (id === "custom") { onClose(); setTimeout(onEditIntervals, 80); }
                    else if (p) onSetIntervalPreset(id, p.intervals);
                  }}
                  renderCard={(card, isActive) => (
                    <motion.div whileTap={{ scale: 0.96 }} style={{
                      height: 62,
                      padding: "8px 10px", borderRadius: 16,
                      background: isActive ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                      border: `1px solid ${isActive ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 3,
                      overflow: "hidden",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 22 22" fill="none"
                        stroke={isActive ? (T.accent ?? "#E8A23C") : (T.textSecondary ?? "rgba(255,255,255,0.55)")}
                        strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="6" cy="11" r="2.5" fill={isActive ? (T.accent ?? "#E8A23C") : (T.textSecondary ?? "rgba(255,255,255,0.55)")} stroke="none" />
                        <circle cx="16" cy="11" r="2.5" />
                        <path d="M8.5 10 Q11 6.5 13.5 10" />
                      </svg>
                      <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? (T.accent ?? "#E8A23C") : T.textPrimary, lineHeight: 1 }}>{card.label}</span>
                      <span style={{ fontSize: 8, color: T.textTertiary, lineHeight: 1 }}>{card.sublabel}</span>
                    </motion.div>
                  )}
                />
              </div>

              {/* Space chip */}
              <motion.div
                onTouchStart={spaceDown}
                onTouchEnd={() => spaceUp(true)}
                onTouchMove={() => { clearTimeout(spaceTimerRef.current); setSpaceLPActive(false); }}
                onMouseDown={spaceDown}
                onMouseUp={() => spaceUp(true)}
                onMouseLeave={() => { clearTimeout(spaceTimerRef.current); setSpaceLPActive(false); }}
                onClick={e => e.preventDefault()}
                whileTap={{ scale: 0.96 }}
                style={chipBase(space.enabled, spaceLPActive)}
              >
                <ControlIcon icon="space" size={20} color={space.enabled ? (T.accent ?? "#E8A23C") : (T.textSecondary ?? "rgba(255,255,255,0.55)")} />
                <span style={{ fontSize: 8, color: space.enabled ? (T.accent ?? "#E8A23C") : T.textTertiary, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>SPACE</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: space.enabled ? (T.accent ?? "#E8A23C") : T.textPrimary }}>{spaceMeta.label}</span>
                <span style={{ fontSize: 9, color: T.textTertiary }}>hold: edit</span>
              </motion.div>

              {/* Flow chip */}
              <motion.div
                onTouchStart={flowDown}
                onTouchEnd={() => flowUp(true)}
                onTouchMove={() => { clearTimeout(flowTimerRef.current); setFlowLPActive(false); }}
                onMouseDown={flowDown}
                onMouseUp={() => flowUp(true)}
                onMouseLeave={() => { clearTimeout(flowTimerRef.current); setFlowLPActive(false); }}
                onClick={e => e.preventDefault()}
                whileTap={{ scale: 0.96 }}
                style={chipBase(flow.enabled, flowLPActive)}
              >
                <ControlIcon icon="flow" size={20} color={flow.enabled ? (T.accent ?? "#E8A23C") : (T.textSecondary ?? "rgba(255,255,255,0.55)")} />
                <span style={{ fontSize: 8, color: flow.enabled ? (T.accent ?? "#E8A23C") : T.textTertiary, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>FLOW</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: flow.enabled ? (T.accent ?? "#E8A23C") : T.textPrimary }}>{flowMeta.label}</span>
                <span style={{ fontSize: 9, color: T.textTertiary }}>hold: edit</span>
              </motion.div>
            </div>

            <div style={{
              textAlign: "center", fontSize: 9, color: T.textTertiary,
              marginTop: 8, opacity: 0.45, fontFamily: FONT_TEXT, letterSpacing: 0.3,
            }}>
              swipe down to close · hold Space/Flow to edit
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// IntervalsEditor — L2 interval selection
// ─────────────────────────────────────────────────────────────
function IntervalsEditor({ open, onClose, selectedIntervals, setSelectedIntervals, intervalPreset, setIntervalPreset }) {
  const T = useT();
  const selectedLabels = selectedIntervals.map(i => INTERVAL_LABELS[i]);
  const allIntervals   = INTERVAL_LABELS.slice(1).map((label, idx) => ({ iv: idx + 1, label }));

  return (
    <L2PushScreen open={open} onClose={onClose} title="Intervals" subtitle="Content">
      <div style={{ padding: "20px 20px 60px" }}>
        {/* Presets */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Presets</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {INTERVAL_PRESETS.filter(p => p.intervals).map(p => {
              const active = intervalPreset === p.id;
              return (
                <motion.button key={p.id} whileTap={{ scale: 0.94 }}
                  onClick={() => { setIntervalPreset(p.id); setSelectedIntervals(p.intervals); }}
                  style={{
                    padding: "10px 16px", borderRadius: 12, fontSize: 13,
                    background: active ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                    border: `0.5px solid ${active ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                    color: active ? (T.accent ?? "#E8A23C") : T.textSecondary,
                    cursor: "pointer", fontFamily: FONT_TEXT,
                  }}>
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: active ? (T.accent ?? "#E8A23C") : T.textTertiary, marginTop: 2 }}>{p.summary}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Individual toggles */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            Tap to toggle
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {allIntervals.map(({ iv, label }) => {
              const active = selectedIntervals.includes(iv);
              return (
                <motion.button key={iv} whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIntervalPreset("custom");
                    setSelectedIntervals(prev => {
                      if (prev.includes(iv)) return prev.length === 1 ? prev : prev.filter(x => x !== iv);
                      return [...prev, iv].sort((a, b) => a - b);
                    });
                  }}
                  style={{
                    width: 52, height: 52, borderRadius: 12,
                    border: `1px solid ${active ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                    background: active ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? (T.accent ?? "#E8A23C") : T.textSecondary,
                    fontSize: 12, fontFamily: FONT_MONO, cursor: "pointer",
                    fontWeight: active ? 700 : 400,
                  }}>
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          <EnharmonicHint selectedLabels={selectedLabels} />
        </AnimatePresence>

        {selectedIntervals.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: T.surface2 ?? "rgba(255,255,255,0.06)", border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}` }}>
            <div style={{ fontSize: 10, color: T.textTertiary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Selected ({selectedIntervals.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedIntervals.map(iv => (
                <span key={iv} style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: T.accentSub ?? "rgba(232,162,60,0.1)",
                  border: `0.5px solid ${T.accentBorder ?? "rgba(232,162,60,0.35)"}`,
                  fontSize: 12, color: T.accent ?? "#E8A23C", fontFamily: FONT_MONO,
                }}>
                  {INTERVAL_LABELS[iv]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </L2PushScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// SpaceEditor — L2 fret zone editor
// ─────────────────────────────────────────────────────────────
function SpaceEditor({ open, onClose, space, setSpace, onApply }) {
  const T = useT();
  const [draft, setDraft] = useState(space);
  useEffect(() => { if (open) setDraft(space); }, [open]); // eslint-disable-line

  function apply() {
    setSpace({ ...draft, enabled: true, preset: "custom" });
    onApply?.();
    onClose();
  }

  return (
    <L2PushScreen open={open} onClose={onClose} title="Fret Zone" subtitle="Space">
      <div style={{ padding: "20px 20px 60px" }}>
        {/* Presets */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Presets</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPACE_PRESETS.map(p => (
              <button key={p.id}
                onClick={() => setDraft(d => ({ ...d, fretRange: p.fretRange, strings: p.strings, preset: p.id }))}
                style={{
                  padding: "10px 14px", borderRadius: 12, fontSize: 12,
                  background: draft.preset === p.id ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                  border: `0.5px solid ${draft.preset === p.id ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                  color: draft.preset === p.id ? (T.accent ?? "#E8A23C") : T.textSecondary,
                  cursor: "pointer", fontFamily: FONT_TEXT,
                }}>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>{p.summary}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fret range */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            Fret Range
          </div>
          <FretRangeSlider
            value={{ start: draft.fretRange.min, end: draft.fretRange.max }}
            onChange={v => setDraft(d => ({ ...d, fretRange: { min: v.start, max: v.end } }))}
          />
        </div>

        {/* Strings */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            Strings (none = all)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {STRING_NAMES.map((name, i) => {
              const sel = draft.strings ? draft.strings.includes(i) : false;
              return (
                <motion.button key={i} whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    if (!draft.strings) { setDraft(d => ({ ...d, strings: [i] })); return; }
                    const next = sel ? draft.strings.filter(x => x !== i) : [...draft.strings, i].sort((a, b) => a - b);
                    setDraft(d => ({ ...d, strings: next.length ? next : null }));
                  }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 11,
                    fontWeight: sel ? 700 : 400,
                    background: sel ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                    border: `0.5px solid ${sel ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                    color: sel ? (T.accent ?? "#E8A23C") : "rgba(255,255,255,0.4)",
                    cursor: "pointer", fontFamily: FONT_MONO,
                  }}>
                  {name}
                </motion.button>
              );
            })}
          </div>
        </div>

        <button onClick={apply} style={{
          width: "100%", padding: "14px", borderRadius: 14, fontSize: 15,
          fontWeight: 700,
          background: T.accentSub ?? "rgba(232,162,60,0.1)",
          border: `0.5px solid ${T.accentBorder ?? "rgba(232,162,60,0.35)"}`,
          color: T.accent ?? "#E8A23C",
          cursor: "pointer", fontFamily: FONT_TEXT,
        }}>
          Apply Zone
        </button>

        {space.enabled && (
          <button
            onClick={() => { setSpace(s => ({ ...s, enabled: false, preset: "full" })); onApply?.(); onClose(); }}
            style={{
              width: "100%", padding: "12px", borderRadius: 14, fontSize: 13, marginTop: 10,
              background: "transparent",
              border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
              color: "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: FONT_TEXT,
            }}>
            Remove Restriction
          </button>
        )}
      </div>
    </L2PushScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// FlowEditor — L2 string order editor
// ─────────────────────────────────────────────────────────────
function FlowEditor({ open, onClose, flow, setFlow, onApply }) {
  const T = useT();
  const [draftOrder,   setDraftOrder]   = useState(flow.order);
  const [draftStrings, setDraftStrings] = useState(flow.strings);
  const [draftPos,     setDraftPos]     = useState(flow.posPerStr || 4);

  useEffect(() => {
    if (open) {
      setDraftOrder(flow.order);
      setDraftStrings(flow.strings);
      setDraftPos(flow.posPerStr || 4);
    }
  }, [open]); // eslint-disable-line

  function apply() {
    setFlow(prev => ({ ...prev, order: draftOrder, strings: draftStrings, posPerStr: draftPos, enabled: true, preset: "custom", stringIdx: 0 }));
    onApply?.();
    onClose();
  }

  const orderOptions = [
    { id: "low-high", label: "Low → High" },
    { id: "high-low", label: "High → Low" },
    { id: "random",   label: "Random" },
  ];

  const btnStyle = (active) => ({
    flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 11,
    fontWeight: active ? 700 : 400,
    background: active ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
    border: `0.5px solid ${active ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
    color: active ? (T.accent ?? "#E8A23C") : "rgba(255,255,255,0.4)",
    cursor: "pointer", fontFamily: FONT_TEXT,
  });

  return (
    <L2PushScreen open={open} onClose={onClose} title="String Order" subtitle="Flow">
      <div style={{ padding: "20px 20px 60px" }}>
        {/* Order */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Order</div>
          <div style={{ display: "flex", gap: 8 }}>
            {orderOptions.map(o => (
              <button key={o.id} onClick={() => setDraftOrder(o.id)} style={btnStyle(draftOrder === o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Strings */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            Strings (none = all)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {STRING_NAMES.map((name, i) => {
              const sel = draftStrings ? draftStrings.includes(i) : true;
              return (
                <motion.button key={i} whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    if (!draftStrings) { setDraftStrings(STRING_NAMES.map((_, x) => x).filter(x => x !== i)); return; }
                    const next = sel ? draftStrings.filter(x => x !== i) : [...draftStrings, i].sort((a, b) => a - b);
                    setDraftStrings(next.length > 0 ? next : null);
                  }}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 11,
                    fontWeight: sel ? 700 : 400,
                    background: sel ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                    border: `0.5px solid ${sel ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                    color: sel ? (T.accent ?? "#E8A23C") : "rgba(255,255,255,0.4)",
                    cursor: "pointer", fontFamily: FONT_MONO,
                  }}>
                  {name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Positions per string */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Positions per String</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[2, 3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => setDraftPos(n)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                fontWeight: draftPos === n ? 700 : 400,
                background: draftPos === n ? (T.accentSub ?? "rgba(232,162,60,0.1)") : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                border: `0.5px solid ${draftPos === n ? (T.accentBorder ?? "rgba(232,162,60,0.35)") : (T.border ?? "rgba(255,255,255,0.1)")}`,
                color: draftPos === n ? (T.accent ?? "#E8A23C") : "rgba(255,255,255,0.4)",
                cursor: "pointer", fontFamily: FONT_MONO,
              }}>{n}</button>
            ))}
          </div>
        </div>

        <button onClick={apply} style={{
          width: "100%", padding: "14px", borderRadius: 14, fontSize: 15,
          fontWeight: 700,
          background: T.accentSub ?? "rgba(232,162,60,0.1)",
          border: `0.5px solid ${T.accentBorder ?? "rgba(232,162,60,0.35)"}`,
          color: T.accent ?? "#E8A23C",
          cursor: "pointer", fontFamily: FONT_TEXT,
        }}>
          Enable Flow Mode
        </button>

        {flow.enabled && (
          <button
            onClick={() => { setFlow(f => ({ ...f, enabled: false, preset: "free", stringIdx: 0 })); onApply?.(); onClose(); }}
            style={{
              width: "100%", padding: "12px", borderRadius: 14, fontSize: 13, marginTop: 10,
              background: "transparent",
              border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
              color: "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: FONT_TEXT,
            }}>
            Disable Flow Mode
          </button>
        )}
      </div>
    </L2PushScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT — IntervalTrainer v4.0
// ─────────────────────────────────────────────────────────────
export function IntervalTrainer({ settings, audioEnabled, setAudioEnabled }) {
  const T        = useT();
  const tuning   = settings.tuning;
  const calibCtx = useContext(CalibContext);
  const toast    = useToast();

  // ── STATE ──────────────────────────────────────────────────

  const [findMode,    setFindMode]    = useState("interval"); // "interval" | "root"
  const [contentMode, setContentMode] = useState("learning");
  const [zenMode,     setZenMode]     = useState(false);

  const [selectedIntervals, setSelectedIntervals] = useState([3, 5, 7]);
  const [intervalPreset,    setIntervalPreset]    = useState("custom");

  const [space, setSpace] = useState({
    preset: "full", enabled: false,
    fretRange: { min: 0, max: 12 }, strings: null,
  });

  const [flow, setFlow] = useState({
    preset: "free", enabled: false, order: "random",
    posPerStr: 4, strings: null, stringIdx: 0,
  });

  const [question,   setQuestion]   = useState(null);
  const [status,     setStatus]     = useState("listening");
  const [streak,     setStreak]     = useState(0);
  const [score,      setScore]      = useState({ correct: 0, total: 0 });
  const [stage,      setStage]      = useState("interval");
  const [hitPos,     setHitPos]     = useState(null);
  const [wrongHint,  setWrongHint]  = useState(false);
  const [vocPrompt,  setVocPrompt]  = useState(null);

  const [showCC,          setShowCC]          = useState(false);
  const [showIVEditor,    setShowIVEditor]    = useState(false);
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);
  const [showFlowEditor,  setShowFlowEditor]  = useState(false);
  const [showStats,       setShowStats]       = useState(false);

  const anyLayerOpen = showCC || showIVEditor || showSpaceEditor || showFlowEditor;

  // ── BODY SCROLL LOCK ───────────────────────────────────────
  // TabBar 始终可见（通过 App.jsx paddingBottom 留出空间）
  // 不再需要 onCCChange 通知 App 隐藏 TabBar
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []); // eslint-disable-line

  // ── DERIVED MODE FLAGS (audio logic compat) ────────────────
  const revealMode    = contentMode === "blind" ? "blind" : "learning";
  const rootFirst     = contentMode === "rootFirst";
  const coreDrillMode = contentMode === "coreDrill";

  const prevRef    = useRef({ midi: -1, frames: 0 });
  const coolRef    = useRef(false);
  const startRef   = useRef(null);
  const lastKeyRef = useRef(null);
  const statsRef   = useRef({});

  // ── PRESET CYCLING ─────────────────────────────────────────
  function handleCycleMode(mode) {
    setContentMode(mode);
    if (mode !== "blind") setZenMode(false);
  }

  function cycleSpacePreset() {
    const idx    = SPACE_CYCLE.indexOf(space.preset);
    const nextId = SPACE_CYCLE[(idx + 1) % SPACE_CYCLE.length];
    const preset = SPACE_PRESETS.find(p => p.id === nextId);
    if (preset) {
      setSpace({ preset: nextId, enabled: preset.enabled, fretRange: preset.fretRange, strings: preset.strings });
      setTimeout(genQ, 0);
    }
  }

  function cycleFlowPreset() {
    const idx    = FLOW_CYCLE.indexOf(flow.preset);
    const nextId = FLOW_CYCLE[(idx + 1) % FLOW_CYCLE.length];
    const preset = FLOW_PRESETS.find(p => p.id === nextId);
    if (preset) {
      setFlow(prev => ({ ...prev, preset: nextId, enabled: preset.enabled, order: preset.order, stringIdx: 0 }));
      setTimeout(genQ, 0);
    }
  }

  // ── genQ — unchanged logic from v3.1 ───────────────────────
  const genQ = useCallback(() => {
    if (!selectedIntervals.length) return;
    const iv       = selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];
    const minFret  = space.enabled ? space.fretRange.min : settings.minFret;
    const maxFret  = space.enabled ? space.fretRange.max : settings.maxFret;

    let stringPool;
    if (flow.enabled && flow.strings && flow.strings.length > 0) {
      const orderedStrings =
        flow.order === "low-high" ? [...flow.strings].sort((a, b) => a - b) :
        flow.order === "high-low" ? [...flow.strings].sort((a, b) => b - a) :
        [...flow.strings].sort(() => Math.random() - 0.5);
      stringPool = [orderedStrings[flow.stringIdx % orderedStrings.length]];
    } else if (space.enabled && space.strings) {
      stringPool = space.strings;
    } else {
      stringPool = [...Array(tuning.length).keys()];
    }

    const rootStr  = stringPool[Math.floor(Math.random() * stringPool.length)];
    const rootFret = minFret + Math.floor(Math.random() * Math.max(1, maxFret - minFret));
    const rM       = getMidi(rootStr, rootFret, tuning);
    const tM       = rM + iv;

    const cands = [];
    for (const s of [...Array(tuning.length).keys()])
      for (let f = minFret; f <= maxFret; f++)
        if (getMidi(s, f, tuning) === tM && !(s === rootStr && f === rootFret))
          cands.push({ string: s, fret: f });

    if (!cands.length) { setTimeout(genQ, 0); return; }

    let pool = cands.filter(c => Math.abs(c.string - rootStr) <= 2);
    if (!pool.length) pool = cands;
    if (lastKeyRef.current) {
      const filt = pool.filter(c => `${iv}-${c.string}-${c.fret}` !== lastKeyRef.current);
      if (filt.length) pool = filt;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastKeyRef.current = `${iv}-${pick.string}-${pick.fret}`;

    setQuestion({ rootStr, rootFret, targetStr: pick.string, targetFret: pick.fret, intervalIdx: iv });
    setHitPos(null);
    setWrongHint(false);
    setStage(rootFirst ? "root" : "interval");
    prevRef.current = { midi: -1, frames: 0 };
    coolRef.current = false;
    startRef.current = Date.now();
    setStatus("listening");
    setVocPrompt(null);
  }, [selectedIntervals, settings, tuning, rootFirst, space, flow]); // eslint-disable-line

  useEffect(() => { genQ(); }, []); // eslint-disable-line

  // ── PITCH DETECTION — preserved 100% from v3.1 ─────────────
  const onPitchDetected = useCallback(freq => {
    if (status !== "listening" || !question) return;
    const midi = freqToMidi(freq, calibCtx.pitchOffset);
    const st   = prevRef.current;
    if (midi === st.midi) { st.frames++; } else { st.midi = midi; st.frames = 1; }
    if (st.frames < 2) return;
    st.frames = 0;

    if (rootFirst && stage === "root") {
      const rM = getMidi(question.rootStr, question.rootFret, tuning);
      if (Math.abs(midi - rM) <= 1) {
        haptic("correct");
        setStage("interval");
        prevRef.current = { midi: -1, frames: 0 };
      }
      return;
    }

    const tMidi = getMidi(question.targetStr, question.targetFret, tuning);
    if (Math.abs(midi - tMidi) <= 1) {
      let best = null, bestSc = Infinity;
      for (let s = 0; s < tuning.length; s++)
        for (let f = settings.minFret; f <= settings.maxFret; f++)
          if (Math.abs(getMidi(s, f, tuning) - midi) <= 1) {
            const ds = Math.abs(s - question.rootStr);
            const df = Math.abs(f - question.rootFret);
            if (ds > 3 || df > 6) continue;
            const sc = ds * 2 + df;
            if (sc < bestSc) { bestSc = sc; best = { string: s, fret: f }; }
          }

      if (revealMode === "learning" && best) {
        const onT = best.string === question.targetStr && best.fret === question.targetFret;
        if (!onT) { setWrongHint(true); setTimeout(() => setWrongHint(false), 900); return; }
      }
      if (best) setHitPos(best);

      const rt  = startRef.current ? Date.now() - startRef.current : 0;
      const key = `${question.intervalIdx}-${(best || question).string}-${(best || question).fret}`;
      const prev = statsRef.current[key] || { count: 0, totalMs: 0, avgMs: 0, weak: false };
      const nxt  = { count: prev.count + 1, totalMs: prev.totalMs + rt };
      nxt.avgMs  = nxt.totalMs / nxt.count;
      nxt.weak   = nxt.avgMs > 2000;
      statsRef.current[key] = nxt;

      haptic("correct");
      toast?.correct(`✓ ${INTERVAL_LABELS[question.intervalIdx]}`);
      setStatus("correct");
      setStreak(s => s + 1);
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));

      if (coreDrillMode) {
        const shapeType = best ? getShapeType(question.rootStr, question.rootFret, best.string, best.fret) : "";
        setVocPrompt({ interval: INTERVAL_LABELS[question.intervalIdx], shapeType });
        setStage("showingShapes");
        if (flow.enabled) setFlow(f => ({ ...f, stringIdx: f.stringIdx + 1 }));
      } else {
        if (flow.enabled) setFlow(f => ({ ...f, stringIdx: f.stringIdx + 1 }));
        setTimeout(genQ, revealMode === "blind" ? 2200 : 1600);
      }
    } else {
      const rM = getMidi(question.rootStr, question.rootFret, tuning);
      if (Math.abs(midi - rM) > 1 && !coolRef.current) {
        coolRef.current = true;
        haptic("wrong");
        toast?.wrong("✗ Try again");
        setScore(s => ({ ...s, total: s.total + 1 }));
        setStreak(0);
        setStatus("wrong");
        setTimeout(() => { coolRef.current = false; setStatus("listening"); }, 700);
      }
    }
  }, [status, question, tuning, settings, revealMode, rootFirst, stage, coreDrillMode, genQ, toast, calibCtx.pitchOffset, flow]);

  const { rms } = useAudioEngine({ onPitchDetected, enabled: audioEnabled });
  const longPress = useLongPress(() => { setScore({ correct: 0, total: 0 }); setStreak(0); genQ(); });
  const swipe = useSwipe(
    () => setZenMode(false),
    () => { if (contentMode === "blind") setZenMode(true); }
  );

  // ── DERIVED DISPLAY ────────────────────────────────────────
  const rootNote        = question ? midiToNote(getMidi(question.rootStr, question.rootFret, tuning)) : "—";
  const ivName          = question ? INTERVAL_LABELS[question.intervalIdx] : "—";
  const shouldReveal    = revealMode === "learning" || status === "correct";
  const showingAllShapes = stage === "showingShapes" && question;

  const allShapeTargets = (() => {
    if (!showingAllShapes) return [];
    const semitones = question.intervalIdx;
    const bounds    = { minFret: settings.minFret, maxFret: settings.maxFret, numStrings: tuning.length };
    const asc  = calculateTargetCoordinates({ rootString: question.rootStr, rootFret: question.rootFret, interval: semitones, direction: "ascending",  tuning, bounds });
    const desc = calculateTargetCoordinates({ rootString: question.rootStr, rootFret: question.rootFret, interval: semitones, direction: "descending", tuning, bounds });
    const seen = new Set();
    return [...asc, ...desc].filter(p => { const k = `${p.string}-${p.fret}`; if (seen.has(k)) return false; seen.add(k); return true; });
  })();

  const tdp = (() => {
    if (!question) return null;
    if (hitPos && shouldReveal) return hitPos;
    if (revealMode === "learning") return { string: question.targetStr, fret: question.targetFret };
    return null;
  })();

  const highlights = question ? [
    { string: question.rootStr, fret: question.rootFret, role: "root", label: "R" },
    ...(showingAllShapes
      ? allShapeTargets.map(p => ({ string: p.string, fret: p.fret, role: "target", label: settings.showNoteNames ? midiToNote(getMidi(p.string, p.fret, tuning)) : INTERVAL_LABELS[question.intervalIdx] }))
      : tdp && shouldReveal
        ? [{ string: tdp.string, fret: tdp.fret, role: wrongHint ? "wrong-hint" : "target", label: settings.showNoteNames ? midiToNote(getMidi(tdp.string, tdp.fret, tuning)) : INTERVAL_LABELS[question.intervalIdx] }]
        : []
    ),
  ] : [];

  const arcPair = shouldReveal && tdp && question && !showingAllShapes
    ? { from: { string: question.rootStr, fret: question.rootFret }, to: { string: tdp.string, fret: tdp.fret } }
    : null;

  const fbHidden = zenMode && contentMode === "blind" && status !== "correct";

  // ── FRETBOARD SWIPE-UP handler ref ─────────────────────────
  const fbStartYRef = useRef(null);

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════ L0 — FIXED STAGE ══════════════ */}
      <motion.div
        animate={anyLayerOpen
          ? { scale: 0.965, opacity: 0.85, filter: "blur(6px)" }
          : { scale: 1,     opacity: 1,    filter: "blur(0px)" }
        }
        transition={SPRINGS.sheetPresent}
        style={{
          // 不再用 position:fixed — App.jsx 已为 trainer 内容区设置正确高度
          // 此容器在普通文档流中填满父级空间，TabBar 始终可见
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: T.surface0,   // 背景填满，遮住 MeshBackground（修复透明漏光 bug）
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          touchAction: "none",
          pointerEvents: anyLayerOpen ? "none" : "auto",
        }}
        onContextMenu={e => e.preventDefault()}
        {...longPress}
      >
        {/* ── TRAINER HEADER — 48px ─────────────────────
            左：训练名称 + 当前模式
            右：MIC 按钮 + 信号条 + Streak + 准确率
            App header 在 trainer 页面已隐藏，所以这里承担标题功能
        ─────────────────────────────────────────────── */}
        <div style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 16, paddingRight: 16,
          flexShrink: 0,
        }}>
          {/* 左：标题 */}
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, lineHeight: 1,
              color: T.textPrimary, fontFamily: FONT_DISPLAY,
              letterSpacing: -0.3,
            }}>
              Intervals
            </div>
            <div style={{
              fontSize: 10, color: T.textTertiary, marginTop: 2,
              fontFamily: FONT_TEXT, letterSpacing: 0.2,
            }}>
              {{
                learning:  "Visual mode",
                blind:     "Blind mode",
                rootFirst: "Root first",
                coreDrill: "Core drill",
              }[contentMode] ?? contentMode}
            </div>
          </div>

          {/* 右：MIC + 信号 + Streak + 准确率 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mic toggle */}
            <motion.button
              onClick={() => setAudioEnabled?.(v => !v)}
              whileTap={{ scale: 0.88 }}
              transition={SPRINGS.tap}
              style={{
                height: 30, padding: "0 10px", borderRadius: 15,
                fontSize: 10, fontWeight: 600, fontFamily: FONT_TEXT,
                cursor: "pointer",
                border: `0.5px solid ${audioEnabled ? "rgba(52,199,89,0.45)" : (T.border ?? "rgba(255,255,255,0.1)")}`,
                background: audioEnabled ? "rgba(52,199,89,0.12)" : (T.surface2 ?? "rgba(255,255,255,0.06)"),
                color: audioEnabled ? "#34C759" : (T.textTertiary ?? "rgba(255,255,255,0.35)"),
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8"  y1="23" x2="16" y2="23"/>
              </svg>
              {audioEnabled ? "ON" : "OFF"}
            </motion.button>

            <SignalBar rms={rms} enabled={audioEnabled} />

            <AnimatePresence>
              {streak > 0 && (
                <motion.div
                  key="streak"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={SPRINGS.correct}
                  style={{
                    padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: "rgba(232,162,60,0.14)",
                    color: T.accent ?? "#E8A23C",
                    border: `0.5px solid ${T.accentBorder ?? "rgba(232,162,60,0.35)"}`,
                    display: "flex", alignItems: "center", gap: 3,
                    fontFamily: FONT_MONO,
                  }}
                >
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <path d="M5 0C5 0 8 3 8 5.5C8 7.5 6.8 9 5 9C3.2 9 2 7.5 2 5.5C2 3 5 0 5 0Z" opacity="0.9"/>
                    <path d="M5 6C5 6 6.5 7 6.5 8C6.5 9 5.8 10 5 10C4.2 10 3.5 9 3.5 8C3.5 7 5 6 5 6Z" opacity="0.55"/>
                  </svg>
                  {streak}
                </motion.div>
              )}
            </AnimatePresence>

            {score.total > 0 && (
              <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_MONO }}>
                {Math.round((score.correct / score.total) * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* ── FIND MODE CAPSULES — 40px (NEW) ───────── */}
        <FindModeCapsules findMode={findMode} onSelect={setFindMode} />

        {/* ── FOCUS CARD — 172px LOCKED ─────────────── */}
        <div style={{ paddingLeft: 12, paddingRight: 12, flexShrink: 0 }}>
          <GlassCard style={{
            height: 172,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <motion.div
              key={(question?.intervalIdx ?? "none") + "-" + (question?.rootStr ?? "x") + "-" + findMode + "-" + stage}
              initial={{ scale: 0.85, opacity: 0, filter: "blur(6px)" }}
              animate={{ scale: 1,    opacity: 1, filter: "blur(0px)" }}
              transition={SPRINGS.cardAppear}
            >
              <FocusCardContent
                findMode={findMode}
                contentMode={contentMode}
                stage={stage}
                rootNote={rootNote}
                ivName={ivName}
              />
            </motion.div>

            {/* Correct flash ring */}
            <AnimatePresence>
              {status === "correct" && (
                <motion.div
                  key="correct-ring"
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: 20,
                    border: `1.5px solid ${T.accent ?? "#E8A23C"}`,
                    pointerEvents: "none",
                  }}
                />
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* ── VOCALIZATION PROMPT ───────────────────── */}
        <AnimatePresence>
          {vocPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRINGS.feather}
              style={{ overflow: "hidden", paddingLeft: 12, paddingRight: 12, paddingTop: 6, flexShrink: 0 }}
            >
              <VocalizationPrompt
                interval={vocPrompt.interval}
                shapeType={vocPrompt.shapeType}
                onDismiss={() => setVocPrompt(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CORE DRILL NEXT ───────────────────────── */}
        <AnimatePresence>
          {stage === "showingShapes" && !vocPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", paddingLeft: 12, paddingRight: 12, paddingTop: 6, flexShrink: 0 }}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStage("interval"); genQ(); }}
                style={{
                  width: "100%", padding: "10px 20px", borderRadius: 12,
                  border: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
                  background: T.surface2 ?? "rgba(255,255,255,0.06)",
                  color: T.accent ?? "#E8A23C",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT_TEXT,
                }}
              >
                Next →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FRETBOARD — flex:1, swipe-up opens L1 ─── */}
        <div
          style={{ flex: 1, minHeight: 0, paddingTop: 8, display: "flex", flexDirection: "column" }}
          onTouchStart={e => { fbStartYRef.current = e.touches[0].clientY; }}
          onTouchEnd={e => {
            if (fbStartYRef.current !== null) {
              const dy = fbStartYRef.current - e.changedTouches[0].clientY;
              if (dy > 40 && !anyLayerOpen) setShowCC(true);
              fbStartYRef.current = null;
            }
          }}
        >
          {!fbHidden ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
            >
              <FretboardSurface
                settings={settings}
                highlights={highlights}
                tuning={tuning}
                arcPair={arcPair}
                swipeHandlers={swipe}
                containerStyle={{
                  flex: 1, minHeight: 0,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}
              />
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setZenMode(false)}
              style={{
                flex: 1, margin: "0 12px", borderRadius: 18,
                border: `0.5px dashed ${T.border ?? "rgba(255,255,255,0.1)"}`,
                background: "transparent",
                color: T.textTertiary ?? "rgba(255,255,255,0.35)",
                fontSize: 13, cursor: "pointer", fontFamily: FONT_TEXT,
              }}
            >
              Tap to show fretboard
            </motion.button>
          )}
        </div>

        {/* ── BOTTOM BAR — Handle + 4 chips ─────────── */}
        <BottomBar
          content={{ mode: contentMode, intervalPreset }}
          space={space}
          flow={flow}
          onOpen={() => setShowCC(true)}
          isOpen={showCC}
        />
      </motion.div>
      {/* ══════════════ L0 END ═══════════════════════ */}

      {/* ── L1: Control Center ─────────────────────── */}
      <ControlCenter
        open={showCC}
        onClose={() => setShowCC(false)}
        contentMode={contentMode}
        onCycleMode={handleCycleMode}
        intervalPreset={intervalPreset}
        onSetIntervalPreset={(id, intervals) => {
          setIntervalPreset(id);
          if (intervals) setSelectedIntervals(intervals);
        }}
        space={space}
        onCycleSpacePreset={cycleSpacePreset}
        flow={flow}
        onCycleFlowPreset={cycleFlowPreset}
        onEditIntervals={() => setShowIVEditor(true)}
        onEditSpace={() => setShowSpaceEditor(true)}
        onEditFlow={() => setShowFlowEditor(true)}
      />

      {/* ── L2: Interval Editor ────────────────────── */}
      <IntervalsEditor
        open={showIVEditor}
        onClose={() => setShowIVEditor(false)}
        selectedIntervals={selectedIntervals}
        setSelectedIntervals={setSelectedIntervals}
        intervalPreset={intervalPreset}
        setIntervalPreset={setIntervalPreset}
      />

      {/* ── L2: Space Editor ───────────────────────── */}
      <SpaceEditor
        open={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        space={space}
        setSpace={setSpace}
        onApply={() => setTimeout(genQ, 0)}
      />

      {/* ── L2: Flow Editor ────────────────────────── */}
      <FlowEditor
        open={showFlowEditor}
        onClose={() => setShowFlowEditor(false)}
        flow={flow}
        setFlow={setFlow}
        onApply={() => setTimeout(genQ, 0)}
      />

      {/* Stats sheet */}
      <StatsSheet
        open={showStats}
        onClose={() => setShowStats(false)}
        statsRef={statsRef}
      />
    </>
  );
}
function ScaleBlueprintBar({ scaleName, rootNote }) {
  const T = useT();
  const [viewMode, setViewMode] = useState("relative");

  const meta      = SCALE_META[scaleName];
  const parentKey = meta ? getParentKey(rootNote, scaleName) : null;

  if (!meta) return null;

  const formula   = meta.formula;
  const fromMajor = meta.fromMajor;

  return (
    <div style={{
      borderRadius: 12,
      background: T.surface1,
      border: `0.5px solid ${T.border}`,
      padding: "12px 14px",
    }}>
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontFamily: FONT_MONO,
                fontWeight: 700,
                color: isAltered ? T.negative : T.textPrimary,
                background: isAltered ? T.surface2 : "transparent",
                border: `0.5px solid ${T.border}`,
              }}
            >
              {degStr}
            </div>
          );
        })}
      </div>

        {meta.description && (
        <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 4, lineHeight: 1.5 }}>
          {meta.description}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TypewriterHint — animated tooltip shown above icon buttons
// ─────────────────────────────────────────────────────────────
function TypewriterHint({ visible, text, onDone }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.92 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(28,28,30,0.92)",
            border: "0.5px solid rgba(255,255,255,0.14)",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 10,
            color: "rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 20,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoIcon({
  icon,
  isActive,
  onPress,
  onLongPress,
  showHintOnMount = false,
}) {
  const T = useT();
  const hintShownRef = useRef(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!showHintOnMount || hintShownRef.current) return;
    hintShownRef.current = true;
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, [showHintOnMount]);

  const lp = useLongPress(onLongPress, { delay: 600 });

  // Determines whether to delegate rendering to ControlIcon (SVG) or render text symbol directly
  const isSvgIcon = ["ascending", "descending", "random", "static", "chromatic", "?"].includes(icon);

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
        whileTap={{ scale: 0.88 }}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `0.5px solid ${isActive
            ? (T.accentBorder ?? "rgba(232,162,60,0.35)")
            : (T.border ?? "rgba(255,255,255,0.1)")}`,
          background: isActive
            ? (T.accentSub ?? "rgba(232,162,60,0.1)")
            : (T.surface2 ?? "rgba(255,255,255,0.06)"),
          color: isActive
            ? (T.accent ?? "#E8A23C")
            : (T.textTertiary ?? "rgba(255,255,255,0.4)"),
          cursor: "pointer",
          fontSize: 14,
          fontFamily: FONT_MONO,
          fontWeight: isActive ? 700 : 400,
          transition: "background 0.18s, border-color 0.18s, color 0.18s",
        }}
      >
        {isSvgIcon
          ? <ControlIcon icon={icon} size={16} color="currentColor" />
          : icon
        }
      </motion.button>
    </div>
  );
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }} {...longPress}>
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

      <FretboardSurface settings={settings} highlights={highlights} tuning={tuning} swipeHandlers={swipe} />
      <div style={{ textAlign: "center", fontSize: 10, color: T.textTertiary }}>Long press to reset</div>
    </div>
  );
}

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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }} {...longPress}>
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

      {/* ── Focus card ── */}
      <GlassCard elevated style={{ padding: "28px 20px", textAlign: "center" }}>
        <motion.div
          key={`${scaleNoteIdx}-${rootNote}-${selectedScale}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
            Play
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 }}>
            <span style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-2.5px", color: DT.accent ?? "#E8A23C", fontFamily: FONT_DISPLAY }}>
              {INTERVAL_LABELS[currentTarget]}
            </span>
            <span style={{ fontSize: 20, color: T.textTertiary, fontWeight: 300 }}>of</span>
            <span style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-2.5px", color: T.accent, fontFamily: FONT_DISPLAY }}>
              {rootNote}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 6 }}>
            {selectedScale}
          </div>
          {rootMovement !== "static" && completedRef.current > 0 && (
            <div style={{ fontSize: 11, color: T.positive, marginTop: 4 }}>
              Cycle {completedRef.current} complete
            </div>
          )}
          {/* Degree progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
            {scaleIntervals.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: 3,
                  transition: "all 0.2s",
                  background:
                    i === scaleNoteIdx % scaleIntervals.length ? T.accent ?? "#E8A23C"
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

      <FretboardSurface settings={settings} highlights={highlights} tuning={tuning} />

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

export function TrainerHeader({
  title, subtitle,
  status, streak, score,
  rms, audioEnabled,
  onToggleAudio,   // NEW — called when mic button is tapped
  onStats,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: DT.textPrimary, letterSpacing: "-0.3px", fontFamily: FONT_DISPLAY }}>{title}</div>
          <div style={{ fontSize: 11, color: DT.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SignalBar rms={rms} enabled={audioEnabled} />
          <StatusPill status={status} />

          {streak > 1 && (
            <motion.span initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={DT.springSnap}
              style={{ padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(232,162,60,0.18)", color: DT.accent, border: `0.5px solid ${DT.accentBorder}`, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1C6 1 8 3 8 5C8 7 7 8 6 8C5 8 4 7 4 5C4 3 6 1 6 1Z" fill="currentColor"/>
                <path d="M6 6C6 6 7 7 7 8C7 9 6.5 10 6 10C5.5 10 5 9 5 8C5 7 6 6 6 6Z" fill="currentColor" opacity="0.6"/>
              </svg>
              {streak}
            </motion.span>
          )}

          {/* ── Mic toggle ─────────────────────────────── */}
          {onToggleAudio && (
            <motion.button
              onClick={onToggleAudio}
              whileTap={{ scale: 0.9 }}
              transition={DT.springSnap}
              style={{
                padding: "5px 11px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_TEXT,
                cursor: "pointer",
                border: `0.5px solid ${audioEnabled ? "rgba(52,199,89,0.5)" : DT.border}`,
                background: audioEnabled ? "rgba(52,199,89,0.15)" : DT.surface2,
                color: audioEnabled ? DT.positive : DT.textTertiary,
                transition: "background 0.2s, color 0.2s, border-color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              {audioEnabled ? "On" : "Off"}
            </motion.button>
          )}

          {onStats && score.total >= 5 && (
            <PhysicalButton onClick={onStats} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 10 }}>
              Stats
            </PhysicalButton>
          )}
        </div>
      </div>

      {score.total > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: "rgba(52,199,89,0.1)", color: DT.positive }}>✓ {score.correct}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: DT.surface1, color: DT.textTertiary }}>Total {score.total}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: DT.accentSub ?? "rgba(232,162,60,0.08)", color: DT.accent ?? "#E8A23C" }}>
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

/*
INTVL.4.1 — 2026-03-10

Updated:
- 删除 onCCChange prop 和相关 useEffect 调用（不再需要隐藏 TabBar）
- L0 容器：position:fixed → flex:1（脱离 fixed，融入 App.jsx 正常文档流）
- L0 容器：加 background:T.surface0（防止透明漏光 bug）
- BottomBar：加 background:T.surface2 + borderRadius "16px 16px 0 0"（规范要求）
- VerticalCardStack：height 120→140px，偏移 ±48→±62，marginTop -28→-31
- ControlCenter grid：gridTemplateRows "1fr auto" → "140px auto"（明确行高，防止卡片压缩）
- renderCard：加固定 height:62px，与偏移量对齐（修复卡片挤叠乱码 bug）
- 图标尺寸优化：图标直接显示（删外层 40×40 圆框），保留规范的 Secondary Tool Icon 尺寸
- TrainerHeader 重写：左侧加训练名 "Intervals" + 当前模式，右侧 MIC 更紧凑

Fixed:
- bug: L0 用 position:fixed 覆盖了 TabBar，进入 Intervals 后无法切换其他 tab
- bug: 根容器透明，App 的"我的训练"标题和 ☀️⚙️ 从后面透出来
- bug: BottomBar 无背景色，与页面内容区视觉边界不清
- bug: VerticalCardStack 中卡片间距不足，三张卡片叠在一起（乱码感）
- bug: ControlCenter grid 行高计算不稳定，Mode/Intervals 压缩变形

Pending:
- L2 规范对齐（当前 L2 实际是规范里的 L3，缺少 QuickAdjustLayer 中间层）
- 指板 5 品窗口追踪动画
- iPad / PC 布局适配
- 48 个音程形状系统
*/