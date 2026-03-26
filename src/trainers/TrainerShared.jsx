// ─────────────────────────────────────────────────────────────
// TRAINER SHARED v3.0
//
// 导出：
//   UniversalTopRail — 新的统一顶栏，对齐 Intervals 的 TopUtilityRail island 风格
//                      新增 Tuner 和 Calibration 入口图标
//   TrainerHeader    — 保留向后兼容，老调用不炸
//
// UniversalTopRail props：
//   title         string    训练器名称
//   micActive     bool      麦克风是否开启
//   rms           number    0–1 音量值
//   answerState   string    'idle' | 'correct' | 'wrong'
//   onMicToggle   fn        麦克风切换
//   onOpenTuner   fn        打开调音器
//   onRecalibrate fn        重新校准
//   onTheme       fn        单击 → 切换深浅色（长按 → 可扩展主题选择器）
//   onSettings    fn        打开控制中心 / 设置
//   isDark        bool
// ─────────────────────────────────────────────────────────────
import React, { useContext, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../contexts";
import { DT, FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { PhysicalButton, SignalBar, StatusPill } from "../components/ui";

// ── token hook ───────────────────────────────────────────────
function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ── RMS bar weights（与 TopUtilityRail 一致）────────────────
const RMS_WEIGHTS = [0.70, 0.50, 1.00, 0.60, 0.85];

// ─────────────────────────────────────────────────────────────
// UniversalTopRail
// ─────────────────────────────────────────────────────────────
export function UniversalTopRail({
  title        = "Trainer",
  micActive    = false,
  rms          = 0,
  answerState  = "idle",
  onMicToggle,
  onOpenTuner,
  onRecalibrate,
  onTheme,
  onSettings,
  isDark       = true,
}) {
  const T = useT();

  // ── mic 状态计算 ─────────────────────────────────────────
  const hasSignal = micActive && rms > 0.008;
  const rmsLevel  = rms ? Math.min(1, rms * 20) : 0;
  const rmsBars   = RMS_WEIGHTS.map(w => 2 + Math.round(rmsLevel * w * 11));
  const isCorrect = micActive && answerState === "correct";
  const isWrong   = micActive && answerState === "wrong";

  const micColor = micActive
    ? (isCorrect ? "#30D158" : isWrong ? "#FF9F0A" : "#30D158")
    : (isDark ? "rgba(235,235,245,0.48)" : "rgba(0,0,0,0.45)");

  // ── island 样式计算（直接从 T tokens 取，与 TopUtilityRail 完全对齐）
  const islandBg     = T.glass?.surface1 ?? (isDark ? "rgba(14,10,38,0.65)" : "rgba(255,255,255,0.82)");
  const islandBorder = T.glass?.border   ?? (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)");
  const islandBlur   = T.glass?.blur     ?? "blur(20px) saturate(180%)";
  const islandShadow = `inset 0 0.5px 0 ${T.glass?.borderTop ?? islandBorder}`;
  const micSubBg     = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const dividerColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)";
  const iconStroke   = T.textSecondary ?? (isDark ? "rgba(235,235,245,0.52)" : "rgba(0,0,0,0.45)");
  const titleColor   = T.textPrimary   ?? (isDark ? "rgba(235,235,245,0.88)" : "rgba(0,0,0,0.85)");

  // ── 长按主题按钮逻辑 ─────────────────────────────────────
  const themeTimerRef = useRef(null);
  const themeFiredRef = useRef(false);

  const onThemeDown = useCallback(() => {
    themeFiredRef.current = false;
    themeTimerRef.current = setTimeout(() => {
      themeFiredRef.current = true;
      // 预留：onOpenThemePicker?.()
    }, 500);
  }, []);

  const onThemeUp = useCallback(() => {
    clearTimeout(themeTimerRef.current);
    if (!themeFiredRef.current) onTheme?.();
    themeFiredRef.current = false;
  }, [onTheme]);

  const onThemeCancel = useCallback(() => {
    clearTimeout(themeTimerRef.current);
    themeFiredRef.current = false;
  }, []);

  const iconBtn = {
    width: 28, height: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", background: "none", border: "none", flexShrink: 0,
    padding: 0,
  };

  return (
    <div style={{
      paddingTop:   "max(20px, env(safe-area-inset-top, 20px))",
      paddingLeft: 18, paddingRight: 18, paddingBottom: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      {/* Title */}
      <span style={{
        fontSize: 17, fontWeight: 600, color: titleColor,
        fontFamily: FONT_TEXT, letterSpacing: "-0.025em",
      }}>
        {title}
      </span>

      {/* Island */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        background: islandBg,
        border: `0.5px solid ${islandBorder}`,
        borderRadius: 18, padding: "3px 5px 3px 4px",
        boxShadow: islandShadow,
        backdropFilter: islandBlur,
        WebkitBackdropFilter: islandBlur,
      }}>

        {/* ── Mic pill ──────────────────────────────────────── */}
        <motion.div
          onClick={onMicToggle}
          whileTap={{ scale: 0.93 }}
          transition={SPRINGS.tap}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 8px", borderRadius: 13,
            background: micActive
              ? (isCorrect ? "rgba(48,209,88,0.12)" : isWrong ? "rgba(255,159,10,0.10)" : "rgba(48,209,88,0.10)")
              : micSubBg,
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {/* Mic icon (SVG, no external dep) */}
          <svg width="10" height="13" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
            <rect x="2.5" y="0.5" width="5" height="8.5" rx="2.5" stroke={micColor} strokeWidth="1.1"/>
            <path d="M0.5 7 C0.5 10.5 9.5 10.5 9.5 7" stroke={micColor} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
            <line x1="5" y1="10.5" x2="5"   y2="12.5" stroke={micColor} strokeWidth="1.1" strokeLinecap="round"/>
            <line x1="3.5" y1="12.5" x2="6.5" y2="12.5" stroke={micColor} strokeWidth="1.1" strokeLinecap="round"/>
          </svg>

          {/* RMS bars when signal active */}
          <AnimatePresence>
            {hasSignal && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 11, overflow: "hidden" }}
              >
                {rmsBars.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: h }}
                    transition={{ duration: 0.07, ease: "linear" }}
                    style={{ width: 2, borderRadius: 1, background: micColor }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.span
            layout
            style={{
              fontSize: 10, fontWeight: 500, color: micColor,
              fontFamily: FONT_TEXT, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {!micActive ? "MIC" : isCorrect ? "✓" : isWrong ? "Retry" : "On"}
          </motion.span>
        </motion.div>

        {/* Divider */}
        <div style={{ width: 0.5, height: 14, background: dividerColor, margin: "0 2px", flexShrink: 0 }} />

        {/* ── Tuner icon ─────────────────────────────────────── */}
        <motion.button
          onClick={onOpenTuner}
          whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }}
          title="调音器"
          style={iconBtn}
        >
          {/* Tuning fork SVG */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v8"/>
            <path d="M8 6c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.5-.8 2.8-2 3.5"/>
            <path d="M10 6c0-1.1.9-2 2-2s2 .9 2 2"/>
            <line x1="12" y1="10" x2="12" y2="22"/>
          </svg>
        </motion.button>

        {/* ── Calibration icon ───────────────────────────────── */}
        <motion.button
          onClick={onRecalibrate}
          whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }}
          title="重新校准"
          style={iconBtn}
        >
          {/* Crosshair / calibration SVG */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          </svg>
        </motion.button>

        <div style={{ width: 0.5, height: 14, background: dividerColor, margin: "0 2px", flexShrink: 0 }} />

        {/* ── Theme toggle (short press = dark/light) ─────────── */}
        <motion.button
          onMouseDown={onThemeDown}
          onMouseUp={onThemeUp}
          onMouseLeave={onThemeCancel}
          onTouchStart={onThemeDown}
          onTouchEnd={onThemeUp}
          onTouchCancel={onThemeCancel}
          whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }}
          title="切换深浅色"
          style={iconBtn}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {isDark ? (
              <>
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="2"  y1="12" x2="4"  y2="12"/>
                <line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            )}
          </svg>
        </motion.button>

        {/* ── Settings ───────────────────────────────────────── */}
        <motion.button
          onClick={onSettings}
          whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }}
          title="设置"
          style={iconBtn}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </motion.button>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TrainerHeader — 保留向后兼容，老调用不炸
// ─────────────────────────────────────────────────────────────
export function TrainerHeader({
  title, subtitle,
  status, streak, score,
  rms, audioEnabled,
  onToggleAudio,
  onStats,
}) {
  const T = useT();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.3px", fontFamily: FONT_DISPLAY }}>{title}</div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SignalBar rms={rms} enabled={audioEnabled} />
          <StatusPill status={status} />

          {streak > 1 && (
            <motion.span
              initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={SPRINGS.springSnap}
              style={{ padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(232,162,60,0.18)", color: T.accent, border: `0.5px solid ${T.accentBorder}` }}
            >
              🔥 {streak}
            </motion.span>
          )}

          {onToggleAudio && (
            <motion.button
              onClick={onToggleAudio}
              whileTap={{ scale: 0.9 }}
              transition={SPRINGS.springSnap}
              style={{
                padding: "5px 11px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_TEXT,
                cursor: "pointer",
                border: `0.5px solid ${audioEnabled ? "rgba(52,199,89,0.5)" : T.border}`,
                background: audioEnabled ? "rgba(52,199,89,0.15)" : T.surface2,
                color: audioEnabled ? T.positive : T.textTertiary,
                transition: "background 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              {audioEnabled ? "🎤 On" : "🎤 Off"}
            </motion.button>
          )}

          {onStats && score?.total >= 5 && (
            <PhysicalButton onClick={onStats} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 10 }}>
              Stats
            </PhysicalButton>
          )}
        </div>
      </div>

      {score?.total > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: "rgba(52,199,89,0.1)", color: T.positive }}>✓ {score.correct}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: T.surface1, color: T.textTertiary }}>Total {score.total}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "rgba(10,132,255,0.1)", color: "#4FC3F7" }}>
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
