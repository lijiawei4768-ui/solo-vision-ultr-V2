
// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES v3.2 — T3 浅色模式玻璃修复
//
// v3.2 修复（T3）：
//   • GlassCard 浅色模式 backdropFilter: "none" → "blur(14px)"
//   • GlassCard 浅色模式 background: rgba(120,120,120,0.04)
//   • GlassCard 浅色模式 borderTop: rgba(60,60,67,0.16)
//   • PhysicalButton 浅色模式 backdropFilter 同步修复
// v3.1 修复：
//   • BottomSheet 滚动内容区增加 WebkitOverflowScrolling: "touch"
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_TEXT, FONT_DISPLAY } from "../theme";
import { ThemeContext } from "../contexts";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ── Glass Card ───────────────────────────────────────────────
export function GlassCard({ children, style = {}, className = "", onClick, elevated = false }) {
  const T = useT();
  const isDark = useContext(ThemeContext)?.dark ?? true;
  return (
    <div onClick={onClick} className={className} style={{
      background:          isDark
        ? (elevated ? T.surface2 : T.surface1)
        : "rgba(120,120,120,0.04)",
      backdropFilter:      isDark ? DT.blur2 : "blur(14px)",
      WebkitBackdropFilter: isDark ? DT.blur2 : "blur(14px)",
      boxShadow: isDark
        ? "none"
        : elevated
          ? "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      borderTop:    isDark ? `0.5px solid ${T.borderHi}` : "1px solid rgba(60,60,67,0.16)",
      borderLeft:   `0.5px solid ${T.border}`,
      borderRight:  `0.5px solid ${T.border}`,
      borderBottom: `0.5px solid ${T.border}`,
      borderRadius: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Physical Button ──────────────────────────────────────────
export function PhysicalButton({ children, onClick, active = false, style = {}, className = "", title = "" }) {
  const T = useT();
  const isDark = useContext(ThemeContext)?.dark ?? true;
  return (
    <motion.button
      onClick={onClick} title={title} className={className}
      whileTap={{ scale: 0.93 }} transition={DT.springSnap}
      style={{
        background:     active ? T.surface3 : T.surface1,
        backdropFilter: isDark ? DT.blur1 : "blur(8px)",
        WebkitBackdropFilter: isDark ? DT.blur1 : "blur(8px)",
        border:       `0.5px solid ${active ? T.borderHi : T.border}`,
        borderRadius: 12, cursor: "pointer",
        color:        active ? T.textPrimary : T.textSecondary,
        fontFamily:   FONT_TEXT,
        ...style,
      }}>
      {children}
    </motion.button>
  );
}

// ── Accent Chip ──────────────────────────────────────────────
export function AccentChip({ children, onClick, active = false, style = {} }) {
  const T = useT();
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.92 }} transition={DT.springSnap}
      style={{
        background:   active ? T.accentSub : T.surface1,
        border:       `0.5px solid ${active ? T.accentBorder : T.border}`,
        borderRadius: 10, padding: "6px 12px",
        color:        active ? T.accent : T.textSecondary,
        fontFamily:   FONT_TEXT,
        fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer",
        ...style,
      }}>
      {children}
    </motion.button>
  );
}

// ── iOS Toggle ───────────────────────────────────────────────
export function GlassToggle({ value, onChange, label }) {
  const T = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `0.5px solid ${T.border}` }}>
      <span style={{ fontSize: 14, color: T.textSecondary, fontFamily: FONT_TEXT }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 46, height: 26, borderRadius: 13, position: "relative",
        cursor: "pointer", border: "none",
        background: value ? T.positive : T.surface3,
        transition: "background 0.2s",
      }}>
        <motion.div animate={{ x: value ? 20 : 2 }} transition={DT.springSnap}
          style={{ position: "absolute", top: 2, width: 22, height: 22, borderRadius: 11, background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.35)" }} />
      </button>
    </div>
  );
}

// ── Range Slider ─────────────────────────────────────────────
export function GlassSlider({ min, max, value, onChange, label, unit = "", step }) {
  const T = useT();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: "12px 0", borderBottom: `0.5px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: T.textSecondary, fontFamily: FONT_TEXT }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{
          width: "100%", height: 3, borderRadius: 2,
          appearance: "none", WebkitAppearance: "none", cursor: "pointer",
          background: `linear-gradient(to right,${T.accent} ${pct}%,${T.surface3} ${pct}%)`,
        }} />
    </div>
  );
}

// ── Status Pill ──────────────────────────────────────────────
export function StatusPill({ status }) {
  const T = useT();
  const cfg = {
    idle:      { text: "—",         bg: "rgba(128,128,128,0.10)", color: T.textTertiary },
    listening: { text: "Listening", bg: T.accentSub,              color: T.accent },
    correct:   { text: "Correct ✓", bg: "rgba(52,199,89,0.15)",   color: T.positive },
    wrong:     { text: "Try again", bg: "rgba(255,69,58,0.15)",    color: T.negative },
  };
  const c = cfg[status] || cfg.idle;
  return (
    <motion.span key={status}
      initial={{ opacity: 0, y: -3, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={DT.springSnap}
      style={{ display: "inline-flex", alignItems: "center", padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 500, letterSpacing: 0.2, background: c.bg, color: c.color, fontFamily: FONT_TEXT }}>
      {c.text}
    </motion.span>
  );
}

// ── Signal Bar (RMS meter) ────────────────────────────────────
export function SignalBar({ rms, enabled }) {
  const T = useT();
  if (!enabled) return null;
  const pct = Math.min(100, rms * 600);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 44, height: 3, borderRadius: 2, background: T.surface3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, transition: "width 80ms",
          width: `${pct}%`,
          background: pct > 80 ? T.negative : pct > 40 ? T.accent : T.positive,
        }} />
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    </div>
  );
}

// ── Bottom Sheet ─────────────────────────────────────────────
// FIX v3.1: 滚动内容区加 WebkitOverflowScrolling: "touch" → iOS 惯性滚动正常
export function BottomSheet({ open, onClose, title, children }) {
  const T = useT();
  const isDark = useContext(ThemeContext)?.dark ?? true;
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  const sheetBg          = isDark ? "rgba(18,18,22,0.97)" : "#F2F2F7";
  const borderTopColor   = isDark ? "rgba(255,255,255,0.14)" : "rgba(60,60,67,0.12)";
  const handleColor      = isDark ? "rgba(255,255,255,0.18)" : "rgba(60,60,67,0.22)";
  const closeSvgStroke   = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const sheetShadow      = isDark
    ? "0 -24px 80px rgba(0,0,0,0.50)"
    : "0 -8px 40px rgba(0,0,0,0.12)";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            background: isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)",
            backdropFilter: "blur(6px)",
          }}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={DT.spring}
            drag={isDraggingHandle ? "y" : false}
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
              setIsDraggingHandle(false);
            }}
            className="w-full max-w-2xl mx-2 mb-2"
            style={{
              background: sheetBg,
              backdropFilter: isDark ? DT.blur3 : "none",
              WebkitBackdropFilter: isDark ? DT.blur3 : "none",
              borderTop:   `0.5px solid ${borderTopColor}`,
              borderLeft:  `0.5px solid ${T.border}`,
              borderRight: `0.5px solid ${T.border}`,
              borderRadius: "24px 24px 16px 16px",
              boxShadow: sheetShadow,
            }}>
            {/* Drag handle */}
            <div
              onPointerDown={() => setIsDraggingHandle(true)}
              style={{ display: "flex", justifyContent: "center", padding: "16px 16px 8px", cursor: "grab", touchAction: "none" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: handleColor }} />
            </div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px 12px", borderBottom: `0.5px solid ${T.border}` }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>{title}</span>
              <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: T.surface2, border: `0.5px solid ${T.border}`, cursor: "pointer" }}>
                <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke={closeSvgStroke} strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* Scrollable Content — FIX: WebkitOverflowScrolling for iOS momentum scroll */}
            <div style={{
              padding: "16px 20px",
              maxHeight: "70vh",
              overflowY: "auto",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}