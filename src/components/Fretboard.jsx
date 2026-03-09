// ─────────────────────────────────────────────────────────────
// Fretboard v8 — 动态5品视口 + iOS 风格大尺寸精指板
//
// 设计目标：
//   • 动态视口：5品窗口，跟随题目平滑平移
//   • 纵向占据更大空间，在手机上清晰可见
//   • iOS 风格精致设计
//   • 音符和品位数字超大清晰
// ─────────────────────────────────────────────────────────────
import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT } from "../theme";
import { ThemeContext } from "../contexts";
import { INSTRUMENTS } from "../constants";
import { GlassCard } from "./ui";

const FRET_MARKERS = [3, 5, 7, 9, 12];
const DOUBLE_MARKERS = [12];

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ─────────────────────────────────────────────────────────────
// PositionStrip — 位置指示条（仅动态模式显示）
// ─────────────────────────────────────────────────────────────
function PositionStrip({ minFret, maxFret, effectiveMin, effectiveMax }) {
  const T = useT();
  const total = (maxFret - minFret) || 12;
  const leftPct  = ((effectiveMin - minFret) / total) * 100;
  const widthPct = ((effectiveMax - effectiveMin) / total) * 100;
  return (
    <div style={{
      height: 6,
      borderRadius: 3,
      margin: "0 12px 4px",
      background: "rgba(255,255,255,0.08)",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        height: "100%",
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        background: T.accent,
        borderRadius: 3,
        transition: "left 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// iOS 风格大尺寸 Fretboard
// ─────────────────────────────────────────────────────────────
export function Fretboard({
  tuning,
  highlights = [],
  leftHanded = false,
  minFret = 0,
  maxFret = 12,
  stringNames = null,
  arcPair = null,
  viewportCenter = null,  // null = 显示 minFret~maxFret 全部；数字 = 以此品为中心显示5品
}) {
  const T = useT();
  const isDark = useContext(ThemeContext)?.dark ?? true;

  const numStrings = tuning.length;

  // ── 动态视口计算 ──────────────────────────────────────────
  const VIEWPORT_WIDTH = 5;
  const effectiveMin = viewportCenter !== null
    ? Math.max(0, Math.min(viewportCenter - 2, 12 - VIEWPORT_WIDTH))
    : minFret;
  const effectiveMax = viewportCenter !== null
    ? effectiveMin + VIEWPORT_WIDTH
    : maxFret;

  // 尺寸参数（5品窗口下更大更清晰）
  const fretSpacing  = 56;   // 5品窗口宽度合理
  const stringSpacing = 40;  // 弦间距加大，指板更高
  const noteR         = 14;  // 音符更大更清晰

  // 动态 viewBox
  const span       = effectiveMax - effectiveMin;
  const boardWidth  = (span + 1) * fretSpacing + 45;
  const boardHeight = (numStrings - 1) * stringSpacing + 70;
  const leftPad     = 35;
  const topPad      = 28;

  // 颜色 - iOS 风格
  const fretColor   = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)";
  const markerColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.22)";
  const textColor   = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.38)";
  const labelColor  = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.42)";
  const stringColor = isDark ? "rgba(255,255,255,0.28)" : "rgba(60,60,68,0.5)";

  const NOTE_COLORS = {
    root: {
      fill: T.noteRoot,
      text: T.noteRootText,
      glow: T.noteRootGlow,
      shadow: isDark ? "rgba(201,154,80,0.4)" : "rgba(201,154,80,0.25)",
    },
    target: {
      fill: T.noteTarget,
      text: T.noteTargetText,
      glow: T.noteTargetGlow,
      shadow: isDark ? "rgba(60,201,181,0.4)" : "rgba(60,201,181,0.25)",
    },
    "wrong-hint": {
      fill: T.negative,
      text: "#ffffff",
      glow: isDark ? "rgba(255,69,58,0.35)" : "rgba(255,59,48,0.3)",
      shadow: isDark ? "rgba(255,69,58,0.4)" : "rgba(255,59,48,0.3)",
    },
    scale: {
      fill: T.noteScale,
      text: T.noteScaleText,
      glow: T.noteScaleGlow,
      shadow: isDark ? "rgba(79,195,247,0.35)" : "rgba(79,195,247,0.25)",
    },
  };

  const sNames = stringNames ?? ["E","A","D","G","B","e"].slice(0, numStrings);

  // sx/sy 使用 effectiveMin/effectiveMax
  const sx = (fret) => {
    const f = leftHanded
      ? (effectiveMax - fret + effectiveMin)
      : (fret - effectiveMin);
    return leftPad + f * fretSpacing;
  };
  const sy = (strIdx) => topPad + (numStrings - 1 - strIdx) * stringSpacing;

  // 生成唯一 gradient ID
  const gradientId = React.useRef(`fret-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <svg
      viewBox={`0 0 ${boardWidth} ${boardHeight}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      style={{
        display: "block",
        userSelect: "none",
        fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
      }}
    >
      <defs>
        {/* iOS 风格渐变 - 指板背景 */}
        <linearGradient id={`${gradientId}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={isDark ? "rgba(30,30,35,0)"    : "rgba(245,243,238,0)"} />
          <stop offset="100%" stopColor={isDark ? "rgba(0,0,0,0.15)"    : "rgba(0,0,0,0.03)"}   />
        </linearGradient>

        {/* 音符发光效果 */}
        <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 弧线渐变 */}
        <linearGradient id={`${gradientId}-arc`} gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={NOTE_COLORS.root.fill}   stopOpacity="0.8" />
          <stop offset="100%" stopColor={NOTE_COLORS.target.fill} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* 背景 */}
      <rect
        x={leftPad - 5} y={topPad - 10}
        width={span * fretSpacing + 10}
        height={(numStrings - 1) * stringSpacing + 20}
        fill={`url(#${gradientId}-bg)`} rx={4}
      />

      {/* 品位点 - iOS 风格圆形点 */}
      {FRET_MARKERS.filter(m => m >= effectiveMin && m <= effectiveMax).map(m =>
        DOUBLE_MARKERS.includes(m) ? (
          <g key={m}>
            <circle
              cx={sx(m) - fretSpacing / 2}
              cy={topPad + (numStrings - 1) * stringSpacing / 2 - stringSpacing * 0.45}
              r={5} fill={markerColor}
            />
            <circle
              cx={sx(m) - fretSpacing / 2}
              cy={topPad + (numStrings - 1) * stringSpacing / 2 + stringSpacing * 0.45}
              r={5} fill={markerColor}
            />
          </g>
        ) : (
          <circle key={m}
            cx={sx(m) - fretSpacing / 2}
            cy={topPad + (numStrings - 1) * stringSpacing / 2}
            r={5} fill={markerColor}
          />
        )
      )}

      {/* 品位数字 */}
      {[0, 3, 5, 7, 9, 12, 15].filter(f => f >= effectiveMin && f <= effectiveMax).map(f => (
        <text key={f}
          x={sx(f) - fretSpacing / 2} y={boardHeight - 6}
          textAnchor="middle" fontSize={12} fill={textColor} fontWeight={600}
          style={{ letterSpacing: 0.5 }}>
          {f === 0 ? "" : f}
        </text>
      ))}

      {/* 琴弦 - iOS 风格渐变粗细 */}
      {Array.from({ length: numStrings }, (_, s) => {
        const thickFrac = (numStrings - 1 - s) / (numStrings - 1);
        const strokeW   = 0.8 + thickFrac * 1.8;
        return (
          <line key={s}
            x1={leftPad - 10}               y1={sy(s)}
            x2={leftPad + span * fretSpacing + 10} y2={sy(s)}
            stroke={stringColor} strokeWidth={strokeW} strokeLinecap="round"
          />
        );
      })}

      {/* 品位线 */}
      {Array.from({ length: span + 1 }, (_, i) => i + effectiveMin).map(f => (
        <line key={f}
          x1={sx(f)} y1={topPad - 8}
          x2={sx(f)} y2={topPad + (numStrings - 1) * stringSpacing + 8}
          stroke={fretColor} strokeWidth={f === 0 ? 4 : 1.2}
        />
      ))}

      {/* 弦名 */}
      {sNames.map((nm, i) => (
        <text key={i} x={10} y={sy(i) + 3.5}
          textAnchor="middle" fontSize={11} fill={labelColor} fontWeight={600}
          style={{ letterSpacing: 0.3 }}>
          {nm}
        </text>
      ))}

      {/* 弧线 - iOS 风格 */}
      {arcPair && (() => {
        const fx = sx(arcPair.from.fret) - fretSpacing / 2;
        const fy = sy(arcPair.from.string);
        const tx = sx(arcPair.to.fret)   - fretSpacing / 2;
        const ty = sy(arcPair.to.string);
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2 - Math.abs(tx - fx) * 0.15;
        const pathD = `M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`;
        const col   = NOTE_COLORS.root.fill;

        return (
          <g>
            {/* 发光层 */}
            <path d={pathD} fill="none" stroke={col} strokeWidth={5}
              strokeOpacity={0.25} strokeLinecap="round" />
            {/* 主弧线 */}
            <path d={pathD} fill="none"
              stroke={`url(#${gradientId}-arc)`} strokeWidth={2} strokeLinecap="round" />
          </g>
        );
      })()}

      {/* 音符 - iOS 风格精致效果 */}
      <AnimatePresence>
        {highlights.map(({ string: s, fret: f, role, label }) => {
          const cx  = sx(f) - fretSpacing / 2;
          const cy  = sy(s);
          const col = NOTE_COLORS[role] ?? NOTE_COLORS.target;
          const key = `${role}-${s}-${f}`;

          return (
            <motion.g key={key}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* 外发光 */}
              <circle cx={cx} cy={cy} r={noteR + 8} fill={col.glow} />
              {/* 阴影层 */}
              <circle cx={cx} cy={cy} r={noteR + 1} fill={col.shadow} opacity={0.5} />
              {/* 主圆点 */}
              <circle cx={cx} cy={cy} r={noteR} fill={col.fill}
                stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)"}
                strokeWidth={1}
              />
              {/* 高光 */}
              <circle cx={cx - 3} cy={cy - 3} r={noteR * 0.35}
                fill="rgba(255,255,255,0.15)" />
              {/* 标签 */}
              {label && (
                <text x={cx} y={cy + 4} textAnchor="middle"
                  fontSize={11} fontWeight={700} fill={col.text}
                  style={{
                    letterSpacing: "-0.3px",
                    textShadow: isDark
                      ? "0 1px 2px rgba(0,0,0,0.3)"
                      : "0 1px 1px rgba(255,255,255,0.5)",
                  }}>
                  {label}
                </text>
              )}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// FretboardSurface — 容器封装
// ─────────────────────────────────────────────────────────────
export function FretboardSurface({
  settings,
  highlights,
  tuning,
  swipeHandlers,
  arcPair,
  containerStyle,
  viewportCenter = null,  // null = 全图模式；数字 = 动态5品视口模式
}) {
  const instrData = INSTRUMENTS[settings.instrument] ?? INSTRUMENTS["6-String Guitar"];
  const T         = useT();
  const isDark    = useContext(ThemeContext)?.dark ?? true;

  // 动态模式下的 effectiveMin/Max（用于 PositionStrip）
  const VIEWPORT_WIDTH = 5;
  const effectiveMin = viewportCenter !== null
    ? Math.max(0, Math.min(viewportCenter - 2, 12 - VIEWPORT_WIDTH))
    : settings.minFret;
  const effectiveMax = viewportCenter !== null
    ? effectiveMin + VIEWPORT_WIDTH
    : settings.maxFret;

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      ...containerStyle,
    }}>
      {/* 位置指示条（仅动态视口模式显示）*/}
      {viewportCenter !== null && (
        <PositionStrip
          minFret={settings.minFret}
          maxFret={settings.maxFret}
          effectiveMin={effectiveMin}
          effectiveMax={effectiveMax}
        />
      )}

      <GlassCard
        style={{
          flex: 1,
          minHeight: 0,
          padding: "8px 0 4px",
          overflow: "visible",       // 解决弧线裁切问题
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: isDark ? undefined : "rgba(245,243,238,1)",
          border: isDark ? undefined : "0.5px solid rgba(60,60,67,0.14)",
        }}
        {...(swipeHandlers || {})}
      >
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <Fretboard
            tuning={tuning}
            highlights={highlights}
            leftHanded={settings.leftHanded}
            minFret={settings.minFret}
            maxFret={settings.maxFret}
            stringNames={instrData.stringNames}
            arcPair={arcPair}
            viewportCenter={viewportCenter}
          />
        </div>
      </GlassCard>
    </div>
  );
}
