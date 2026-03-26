
// ─────────────────────────────────────────────────────────────
// OnboardingView.jsx — Solo Vision Ultra v6.0
// HTML母本: Onboarding_v6.html
//
// 9屏: S1 Welcome → S2 TwoPoint → S3 Modules → S4 CoreDrill
//      → S5 Tuner → S6 CalibIntro → S7 CalibFlow → S8 Verify → Done
// ─────────────────────────────────────────────────────────────
import React, { useState, useContext, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FONT_DISPLAY, FONT_TEXT, SPRINGS, DT } from "../theme";
import { ThemeContext } from "../contexts";
import { TunerView } from "./TunerView";
import { PreFlightView } from "./PreFlightView";
import { CharReveal } from "../components/shared/design/CharReveal";
import { EyebrowBadge } from "../components/shared/design/EyebrowBadge";
import { PrimaryButton } from "../components/shared/design/PrimaryButton";
import { GhostButton } from "../components/shared/design/GhostButton";
import { AccordionItem } from "../components/shared/design/AccordionItem";

function useT()      { const ctx = useContext(ThemeContext); return ctx?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark ?? false; }

// ── Glass helper (light-biased for onboarding) ────────────────
// v6: T.glass.surface1 takes full priority — supports all theme surfaces
function gc(T, isDark, extra = {}) {
  const fallbackBg = isDark ? "rgba(20,22,50,0.72)" : "rgba(255,255,255,0.80)";
  return {
    background:          T.glass?.surface1 ?? fallbackBg,
    backdropFilter:      T.glass?.blur ?? "blur(28px) saturate(200%)",
    WebkitBackdropFilter:T.glass?.blur ?? "blur(28px) saturate(200%)",
    border:              `0.5px solid ${T.glass?.border ?? T.border ?? "rgba(110,120,180,0.13)"}`,
    boxShadow:           T.glass?.shadow ?? (isDark
      ? "0 2px 22px rgba(0,0,0,0.28)"
      : "0 2px 22px rgba(60,70,150,0.07), inset 0 1px 0 rgba(255,255,255,0.96)"),
    borderRadius:        18,
    ...extra,
  };
}

// ── S1 — Welcome ──────────────────────────────────────────────
function S1Welcome({ T, isDark, accent, onNext }) {
  return (
    <div style={{
      flex:           1,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      textAlign:      "center",
      padding:        "60px 26px 0",
    }}>
      {/* Logo ring — breathing */}
      <motion.div
        animate={{ scale: [1, 1.028, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width:        88, height: 88, borderRadius: 28,
          background:   `linear-gradient(148deg, ${accent}24 0%, rgba(160,95,255,0.07) 100%)`,
          border:       `0.5px solid ${accent}3e`,
          boxShadow:    `0 6px 32px ${accent}28, 0 0 0 9px ${accent}0a, inset 0 1px 0 rgba(255,255,255,0.96)`,
          display:      "flex", alignItems: "center", justifyContent: "center",
          margin:       "0 auto 20px",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke={accent} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="5" cy="17" r="3" />
          <circle cx="19" cy="7" r="3" />
          <line x1="8" y1="14.5" x2="16" y2="9.5" strokeDasharray="4 2.5" />
        </svg>
      </motion.div>

      <div style={{
        fontFamily:    FONT_DISPLAY, fontSize: 16, color: T.textPrimary,
        letterSpacing: "-0.3px", marginBottom: 5,
      }}>
        Solo Vision Ultra
      </div>
      <div style={{ fontSize: 12.5, color: T.textTertiary, marginBottom: 36, fontFamily: FONT_TEXT }}>
        专业吉他认知训练
      </div>

      <h1 style={{
        fontFamily:    FONT_DISPLAY,
        fontSize:      40, lineHeight: 1.07,
        letterSpacing: "-0.8px", color: T.textPrimary,
        marginBottom:  14,
      }}>
        <CharReveal text="真正理解" delay={0.1} charDelay={0.04} />
        <br />
        <CharReveal text="你在弹什么" delay={0.4} charDelay={0.04} />
      </h1>

      <p style={{
        fontSize:   14, color: T.textSecondary,
        lineHeight: 1.7, maxWidth: 288,
        fontFamily: FONT_TEXT,
      }}>
        不靠形状记忆，不靠肌肉反应。Solo Vision 训练你用声音和功能来导航整个指板。
      </p>
    </div>
  );
}

// ── S2 — Two-Point ────────────────────────────────────────────
function S2TwoPoint({ T, isDark, accent, revealed }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, flex: 1, padding: "14px 0 0" }}>

      {/* Fretboard card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
        transition={{ delay: 0.3, ...SPRINGS.cardAppear }}
        style={{ ...gc(T, isDark), padding: "18px 16px 14px" }}
      >
        <svg width="100%" height="116" viewBox="0 0 330 116">
          {/* Strings */}
          <g stroke={isDark ? "rgba(90,90,214,0.18)" : "rgba(90,90,214,0.13)"} strokeWidth="0.8">
            {[22, 40, 58, 76, 94].map(y => (
              <line key={y} x1="22" y1={y} x2="318" y2={y} />
            ))}
          </g>
          {/* Frets */}
          <g stroke={isDark ? "rgba(90,90,214,0.14)" : "rgba(90,90,214,0.09)"} strokeWidth="0.5">
            {[22, 87, 152, 217, 282].map(x => (
              <line key={x} x1={x} y1="14" x2={x} y2="102" />
            ))}
          </g>
          {/* Connection line */}
          <motion.line
            x1="54" y1="58" x2="184" y2="40"
            stroke={accent} strokeWidth="1.8" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: revealed ? 1 : 0, opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          />
          {/* Root dot */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0 }}
            transition={{ delay: 0.5, ...SPRINGS.jelly }}
            style={{ transformOrigin: "54px 58px" }}
          >
            <circle cx="54" cy="58" r="13"
              fill="rgba(192,120,48,0.14)" stroke={T.warning ?? "#c07830"} strokeWidth="2.2" />
            <text x="54" y="63" textAnchor="middle" fontSize="10" fontWeight="800"
              fill={T.warning ?? "#a06022"} fontFamily="sans-serif">R</text>
          </motion.g>
          {/* Target dot */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0 }}
            transition={{ delay: 0.7, ...SPRINGS.jelly }}
            style={{ transformOrigin: "184px 40px" }}
          >
            <circle cx="184" cy="40" r="13"
              fill={`${accent}20`} stroke={accent} strokeWidth="2.2" />
            <text x="184" y="45" textAnchor="middle" fontSize="10" fontWeight="800"
              fill={accent} fontFamily="sans-serif">b3</text>
          </motion.g>
          {/* Labels */}
          <motion.text
            x="54" y="113" textAnchor="middle" fontSize="9" fontWeight="700"
            fill={T.textTertiary ?? "#9898b8"} fontFamily="sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.8 }}
          >根音</motion.text>
          <motion.text
            x="184" y="113" textAnchor="middle" fontSize="9" fontWeight="800"
            fill={accent} fontFamily="sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.85 }}
          >目标音程</motion.text>
          <motion.text
            x="119" y="32" textAnchor="middle" fontSize="8.5" fontWeight="700"
            fill={accent} fontFamily="sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.9 }}
          >⟵ 两点形状 ⟶</motion.text>
        </svg>
      </motion.div>

      {/* Stat row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 16 }}
        transition={{ delay: 0.5, ...SPRINGS.cardAppear }}
        style={{
          display:    "flex", alignItems: "center", gap: 14,
          padding:    "15px 16px", borderRadius: 15,
          background: T.accentSub    ?? "rgba(90,90,214,0.10)",
          border:     `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.20)"}`,
        }}
      >
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 46, color: accent,
          letterSpacing: "-2px", lineHeight: 1, flexShrink: 0,
        }}>
          48
        </div>
        <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, fontFamily: FONT_TEXT }}>
          <strong style={{ color: accent, fontWeight: 700 }}>种音程形状</strong>，覆盖全指板所有位置。每一个都有可预测的视觉路径。
        </div>
      </motion.div>
    </div>
  );
}

// ── S3 — Modules ──────────────────────────────────────────────
const MODULES = [
  { name: "音符识别", eng: "Notes",     tag: "S1", tagVariant: "a", iconBg: "rgba(90,90,214,0.10)",  icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="16" r="2.5" fill={c} stroke="none"/><line x1="11.5" y1="16" x2="11.5" y2="5"/><line x1="11.5" y1="5" x2="17" y2="7"/></svg>, desc: "在指板任意位置 0.5 秒内识别音名。这是所有训练的基础。", feats: ["全 6 弦", "0–12 品", "速度计时"] },
  { name: "音程视觉", eng: "Intervals", tag: "核心", tagVariant: "a", iconBg: "rgba(90,90,214,0.10)", icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="6" cy="14" r="2.5" fill={c} stroke="none"/><circle cx="18" cy="14" r="2.5"/><path d="M8.5 12Q12 7 15.5 12"/></svg>, desc: "从任意根音立即看到所有音程的形状方向。两点系统的核心训练。", feats: ["48 形状", "Find Root", "全把位"] },
  { name: "和弦进行", eng: "Changes",   tag: "S2", tagVariant: "a", iconBg: "rgba(34,166,114,0.10)", icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="8" width="8" height="8" rx="2"/><rect x="14" y="8" width="8" height="8" rx="2"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, desc: "在和弦进行中用和弦音导航。Dm7–G7–Cmaj7 等典型进行。", feats: ["ii-V-I", "7th Chords", "导音感"] },
  { name: "音阶导航", eng: "Scales",    tag: "S2", tagVariant: "a", iconBg: "rgba(70,150,225,0.09)",  icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="4" cy="19" r="1.8" fill={c} stroke="none"/><circle cx="9" cy="16" r="1.8" fill={c} stroke="none"/><circle cx="14" cy="13" r="1.8" fill={c} stroke="none"/><circle cx="19" cy="10" r="1.8" fill={c} stroke="none"/></svg>, desc: "识别调式音阶的功能音位置，从任意根音快速定位。", feats: ["Major/Minor", "Modes", "功能音"] },
  { name: "调音器",   eng: "Tuner",    tag: "工具", tagVariant: "g", iconBg: "rgba(34,166,114,0.10)",  icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M5.5 20A8.5 8.5 0 0 1 18.5 20" fill="none"/><line x1="12" y1="20" x2="12" y2="11"/><circle cx="12" cy="20" r="2" fill={c} stroke="none"/></svg>, desc: "内置精准调音器，支持 A4 标准频率调节（默认 440 Hz）。", feats: ["440 Hz", "分音精准", "实时显示"] },
  { name: "数据分析", eng: "Profile",  tag: "工具", tagVariant: "g", iconBg: "rgba(165,110,245,0.10)", icon: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><polyline points="4,16 8,12 12,14 16,8 20,6"/><circle cx="8" cy="12" r="2" fill={c} stroke="none"/></svg>, desc: "热力图、五维能力图、弱点分析。每次训练都在积累。", feats: ["热力图", "五维图谱", "自动弱点"] },
];

function S3Modules({ T, isDark, accent, revealed }) {
  const [sel, setSel] = useState(1); // intervals by default

  const mod = MODULES[sel];
  const tagColor = mod.tagVariant === "g"
    ? (T.positive ?? "#22a672")
    : (T.accent    ?? "#5a5ad6");

  return (
    <div style={{
      display: "flex", flexDirection: "column", flex: 1,
      padding: "10px 0 0", gap: 10, minHeight: 0,
    }}>
      {/* 3×2 grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8, flexShrink: 0,
        }}
      >
        {MODULES.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{
              opacity: revealed ? (sel === i ? 1 : 0.55) : 0,
              scale:   revealed ? (sel === i ? 1 : 0.96) : 0.85,
              y:       revealed ? 0 : 12,
            }}
            transition={{ delay: 0.15 + i * 0.06, ...SPRINGS.jelly }}
            onClick={() => setSel(i)}
            style={{
              padding:       "11px 8px 10px",
              borderRadius:  16,
              background:    sel === i
                ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.94)")
                : (isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.78)"),
              backdropFilter: T.glass?.blur ?? "blur(28px)",
              WebkitBackdropFilter: T.glass?.blur ?? "blur(28px)",
              border:        `0.5px solid ${sel === i
                ? "rgba(90,90,214,0.30)"
                : (T.border ?? "rgba(110,120,180,0.13)")}`,
              boxShadow:     sel === i
                ? "0 4px 20px rgba(90,90,214,0.14), inset 0 1px 0 rgba(255,255,255,0.96)"
                : "0 2px 12px rgba(60,70,150,0.06), inset 0 1px 0 rgba(255,255,255,0.94)",
              display:       "flex", flexDirection: "column",
              alignItems:    "center", gap: 6, textAlign: "center",
              cursor:        "pointer",
            }}
          >
            <div style={{
              width:          36, height: 36, borderRadius: 11,
              background:     m.iconBg,
              display:        "flex", alignItems: "center", justifyContent: "center",
            }}>
              {m.icon(sel === i ? accent : (T.textTertiary ?? "#9898b8"))}
            </div>
            <div style={{
              fontSize:      11.5, fontWeight: 800, color: sel === i ? T.textPrimary : T.textSecondary,
              letterSpacing: "-0.1px", fontFamily: FONT_DISPLAY,
            }}>
              {m.name}
            </div>
            <span style={{
              fontSize:      7.5, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 6,
              background:    m.tagVariant === "g"
                ? (T.positive ?? "#22a672") + "18"
                : (T.accentSub ?? "rgba(90,90,214,0.10)"),
              color: m.tagVariant === "g"
                ? (T.positive ?? "#22a672")
                : (T.accent ?? "#5a5ad6"),
              fontFamily: FONT_TEXT,
            }}>
              {m.tag}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={SPRINGS.cardAppear}
          style={{
            ...gc(T, isDark, { borderRadius: 20 }),
            flex: 1, padding: "18px 18px 16px",
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: mod.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {mod.icon(tagColor)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 21,
                color: T.textPrimary, letterSpacing: "-0.3px", lineHeight: 1.1, marginBottom: 3,
              }}>
                {mod.name}
              </div>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: T.textTertiary, marginBottom: 5,
                fontFamily: FONT_TEXT,
              }}>
                {mod.eng}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 13, color: T.textSecondary,
            lineHeight: 1.65, flex: 1, fontFamily: FONT_TEXT,
          }}>
            {mod.desc}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {mod.feats.map((f, i) => (
              <span key={i} style={{
                fontSize:   10.5, color: T.textTertiary, padding: "4px 9px", borderRadius: 8,
                background: isDark ? "rgba(110,120,180,0.10)" : "rgba(110,120,180,0.07)",
                border:     `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
                fontFamily: FONT_TEXT,
              }}>
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flex: 1 }}>
          {MODULES.map((_, i) => (
            <motion.div
              key={i} onClick={() => setSel(i)}
              animate={{
                width:      i === sel ? 14 : 5,
                background: i === sel ? accent : (T.border ?? "rgba(110,120,180,0.22)"),
              }}
              style={{ height: 5, borderRadius: "50%", cursor: "pointer" }}
            />
          ))}
        </div>
        {[[-1, "←"], [1, "→"]].map(([d, lbl]) => (
          <div
            key={d}
            onClick={() => setSel(i => Math.max(0, Math.min(MODULES.length - 1, i + d)))}
            style={{
              width: 28, height: 28, borderRadius: 9,
              background: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.70)",
              border: `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 13, color: T.textSecondary,
            }}
          >
            {lbl}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── S4 — Core Drill ───────────────────────────────────────────
function S4CoreDrill({ T, isDark, accent, revealed }) {
  const steps = [
    { title: <>看到题目，<span style={{ color: accent }}>大声说出</span></>, sub: "激活大脑的主动识别，不是肌肉反应" },
    { title: "弹奏根音，确认位置", sub: "Root First 原则——先建立参考点" },
    { title: "弹奏目标音程",       sub: "从根音出发，沿视觉路径找到音程" },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", gap: 9, flex: 1,
    }}>
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : -18 }}
          transition={{ delay: 0.2 + i * 0.1, ...SPRINGS.cardAppear }}
          style={{
            display:    "flex", gap: 12, alignItems: "flex-start",
            padding:    14, borderRadius: 16,
            ...gc(T, isDark),
          }}
        >
          <div style={{
            width:          28, height: 28, borderRadius: 9,
            background:     accent,
            display:        "flex", alignItems: "center", justifyContent: "center",
            fontSize:       12, fontWeight: 800, color: "#fff",
            flexShrink:     0, marginTop: 1,
            boxShadow:      `0 2px 8px ${accent}4a`,
          }}>
            {i + 1}
          </div>
          <div>
            <div style={{
              fontSize:      13.5, fontWeight: 800, color: T.textPrimary,
              marginBottom:  3, letterSpacing: "-0.1px", fontFamily: FONT_DISPLAY,
            }}>
              {step.title}
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.55, fontFamily: FONT_TEXT }}>
              {step.sub}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Rule note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
        transition={{ delay: 0.55 }}
        style={{
          padding:    "13px 14px", borderRadius: 13,
          background: `${accent}0c`,
          border:     `0.5px solid ${accent}28`,
          display:    "flex", gap: 9, alignItems: "flex-start",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={accent} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" fill={accent} stroke="none" />
        </svg>
        <span style={{ fontSize: 12.5, color: T.textSecondary, lineHeight: 1.6, fontFamily: FONT_TEXT }}>
          三步缺一不可。顺序不能乱——<strong style={{ color: accent, fontWeight: 700 }}>根音永远在前</strong>，说出来才算完成。
        </span>
      </motion.div>
    </div>
  );
}

// ── S5 — Tuner Intro ──────────────────────────────────────────
function S5TunerIntro({ T, isDark, accent, revealed, onOpenTuner, onSkip }) {
  const green = T.positive ?? "#22a672";
  const warn  = T.warning  ?? "#c07830";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", gap: 12, flex: 1,
    }}>
      {/* Tuner preview card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
        transition={{ delay: 0.25, ...SPRINGS.cardAppear }}
        style={{
          ...gc(T, isDark, { borderRadius: 22 }),
          padding: "22px 22px 20px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 66,
          color: T.textPrimary, letterSpacing: "-4px", lineHeight: 1,
        }}>
          E2
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: green,
          margin: "4px 0 14px", fontFamily: FONT_TEXT,
        }}>
          ✓ 已调准  +0 ¢
        </div>

        {/* Arc */}
        <div style={{ position: "relative", height: 92, width: "100%", display: "flex", justifyContent: "center" }}>
          <svg width="250" height="92" viewBox="0 0 250 92" style={{ overflow: "visible" }}>
            <path d="M14 88 A102 102 0 0 1 236 88" fill="none"
              stroke={isDark ? "rgba(90,90,214,0.12)" : "rgba(90,90,214,0.09)"}
              strokeWidth="3" strokeLinecap="round" />
            <path d="M96 88 A102 102 0 0 1 154 88" fill="none"
              stroke={green + "48"} strokeWidth="8" strokeLinecap="round" />
            <line x1="125" y1="5" x2="125" y2="20"
              stroke={isDark ? "rgba(90,90,214,0.28)" : "rgba(90,90,214,0.22)"}
              strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {/* Needle */}
          <motion.div
            animate={{ rotate: ["-22deg", "0deg", "16deg", "0deg", "-22deg"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position:        "absolute", bottom: 0, left: "50%",
              width:           2, height: 76,
              background:      `linear-gradient(to top, ${accent}, ${accent}66)`,
              borderRadius:    1,
              transformOrigin: "bottom center", marginLeft: -1,
            }}
          />
          <div style={{
            position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
            width: 11, height: 11, borderRadius: "50%",
            background: accent, border: "2px solid rgba(255,255,255,0.85)",
          }} />
        </div>

        {/* String dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 13, marginTop: 12 }}>
          {["E2","A2","D3","G3","B3","e4"].map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: i === 0 ? green : (isDark ? "rgba(110,120,180,0.22)" : "rgba(110,120,180,0.16)"),
                transform: i === 0 ? "scale(1.3)" : undefined,
              }} />
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: FONT_TEXT,
                color: i === 0 ? green : T.textTertiary,
              }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Warning box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
        transition={{ delay: 0.45 }}
        style={{
          padding:    "12px 14px", borderRadius: 12,
          background: warn + "18",
          border:     `0.5px solid ${warn}38`,
          display:    "flex", gap: 9, alignItems: "flex-start",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={warn} strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <circle cx="12" cy="17" r="1" fill={warn} stroke="none" />
        </svg>
        <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.55, fontFamily: FONT_TEXT }}>
          未调准的吉他会影响音高识别准确度。建议在开始校准前先调音。
        </div>
      </motion.div>
    </div>
  );
}

// ── S6 — Calibration Intro ────────────────────────────────────
function S6CalibIntro({ T, isDark, accent, revealed }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const green = T.positive ?? "#22a672";
  const warn  = T.warning  ?? "#c07830";

  const items = [
    {
      title:   "每把吉他都不一样",
      sub:     "弦规 · 拾音器 · 音孔特征",
      iconBg:  T.accentSub  ?? "rgba(90,90,214,0.10)",
      iconBdr: T.accentBorder ?? "rgba(90,90,214,0.20)",
      icon:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="7" r="3"/><line x1="8" y1="14.5" x2="16" y2="9.5" strokeDasharray="3 2"/></svg>,
      body:    "弦规粗细、琴颈弧度、拾音器类型都会影响麦克风频谱。不校准时 App 使用通用默认值，可能导致误触发或漏检。",
    },
    {
      title:   "环境噪音导致误触发",
      sub:     "风扇 · 空调 · 电流底噪",
      iconBg:  warn + "18",
      iconBdr: warn + "38",
      icon:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={warn} strokeWidth="2" strokeLinecap="round"><path d="M1 9l2 2c3-3 7-3 10 0l2-2A12 12 0 001 9z"/><path d="M5 13l2 2c1.5-1.5 3.5-1.5 5 0l2-2A8 8 0 005 13z"/><circle cx="12" cy="18" r="2" fill={warn} stroke="none"/></svg>,
      body:    "风扇、空调、底噪会让 App 误触发——在你没弹弦时就\"听到\"音符。噪底采样能精确设定触发阈值，彻底消除误报。",
    },
    {
      title:   "识别精度提升约 40%",
      sub:     "校准 vs 默认参数",
      iconBg:  green + "18",
      iconBdr: green + "38",
      icon:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round"><polyline points="23,6 13,16 8,11 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
      body:    "校准后的识别准确率比默认状态高约 40%。训练中每次误触发都会打断节奏并污染统计，校准能从根本上杜绝。",
    },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", flex: 1,
      gap: 8, overflowY: "auto", scrollbarWidth: "none", padding: "8px 0 0",
    }}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
          transition={{ delay: 0.15 + i * 0.1 }}
        >
          <AccordionItem
            title={item.title}
            subtitle={item.sub}
            icon={item.icon}
            iconBg={item.iconBg}
            iconBorder={item.iconBdr}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          >
            {item.body}
          </AccordionItem>
        </motion.div>
      ))}

      {/* Steps summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
        transition={{ delay: 0.5 }}
        style={{
          ...gc(T, isDark),
          padding: "12px 14px",
        }}
      >
        <div style={{
          fontSize: 11, fontWeight: 800, color: accent,
          letterSpacing: "0.10em", textTransform: "uppercase",
          marginBottom: 10, fontFamily: FONT_TEXT,
        }}>
          两步快速完成
        </div>
        {[
          { title: "噪底采样",           sub: "保持安静片刻，麦克风采样环境底噪" },
          { title: "逐弦校准 + 八度检测", sub: "每根弦弹奏开放弦、第1品、第12品" },
        ].map((step, i) => (
          <div key={i} style={{
            display:       "flex", alignItems: "flex-start", gap: 12,
            padding:       "8px 0",
            borderBottom:  i === 0 ? `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}` : "none",
          }}>
            <div style={{
              width:          28, height: 28, borderRadius: 8,
              background:     T.accentSub    ?? "rgba(90,90,214,0.10)",
              border:         `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.20)"}`,
              display:        "flex", alignItems: "center", justifyContent: "center",
              fontSize:       12, fontWeight: 800, color: accent, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 2, fontFamily: FONT_DISPLAY }}>
                {step.title}
              </div>
              <div style={{ fontSize: 11.5, color: T.textTertiary, lineHeight: 1.5, fontFamily: FONT_TEXT }}>
                {step.sub}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── S7 — Calibration Flow (embed PreFlightView) ───────────────
function S7CalibFlow({ T, isDark, accent, onDone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <PreFlightView onComplete={onDone} />
    </div>
  );
}

// ── S8 — Verification ────────────────────────────────────────
function S8Verify({ T, isDark, accent, revealed, onDone }) {
  const [verified, setVerified] = useState(0);
  const notes = ["E2","A2","D3","G3","B3"];
  const pos   = ["第 6 弦 · 开放弦","第 5 弦 · 开放弦","第 4 弦 · 开放弦","第 3 弦 · 开放弦","第 2 弦 · 开放弦"];
  const green = T.positive ?? "#22a672";

  const simNext = () => {
    if (verified < 5) {
      setVerified(v => v + 1);
      if (verified === 4) setTimeout(onDone, 600);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, flex: 1 }}>
      {/* Top fraction + progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: "flex", gap: 16, alignItems: "center" }}
      >
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 58, color: T.textPrimary,
          letterSpacing: "-3px", lineHeight: 1,
        }}>
          {verified + 1}
          <span style={{ fontSize: 24, color: T.textTertiary }}> / 5</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                flex: 1, height: 5, borderRadius: 3,
                background: i < verified ? green
                  : i === verified ? accent
                  : (isDark ? "rgba(110,120,180,0.15)" : "rgba(110,120,180,0.12)"),
                animation: i === verified ? "svuVPFlash 1.2s ease-in-out infinite" : undefined,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: T.textTertiary, fontWeight: 700, fontFamily: FONT_TEXT }}>
            弹奏指定音符
          </div>
        </div>
      </motion.div>

      {/* Target card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
        transition={{ delay: 0.3, ...SPRINGS.cardAppear }}
        style={{
          ...gc(T, isDark, { borderRadius: 22 }),
          padding: "22px 20px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <div style={{
          fontSize: 9.5, fontWeight: 800, letterSpacing: "0.10em",
          textTransform: "uppercase", color: T.textTertiary, marginBottom: 8,
          fontFamily: FONT_TEXT,
        }}>
          请弹奏
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={verified}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRINGS.jelly}
            style={{
              fontFamily: FONT_DISPLAY, fontSize: 72, color: accent,
              letterSpacing: "-4px", lineHeight: 1,
            }}
          >
            {notes[Math.min(verified, 4)]}
          </motion.div>
        </AnimatePresence>
        <div style={{ fontSize: 12, color: T.textTertiary, fontWeight: 600, marginTop: 8, fontFamily: FONT_TEXT }}>
          {pos[Math.min(verified, 4)]}
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 30, height: 30, borderRadius: 10,
              background: i < verified
                ? (green + "18")
                : (isDark ? "rgba(110,120,180,0.10)" : "rgba(110,120,180,0.07)"),
              border: `0.5px solid ${i < verified ? green + "38" : (T.border ?? "rgba(110,120,180,0.13)")}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i < verified && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <polyline points="1,5 4,8 11,1" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Listening indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%", background: green,
          animation: "svuPulseDot 1s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 12.5, color: green, fontWeight: 700, fontFamily: FONT_TEXT }}>
          正在监听…
        </span>
      </div>
    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────
function SDone({ T, isDark, accent, onComplete }) {
  const green = T.positive ?? "#22a672";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", gap: 0, flex: 1, padding: "50px 26px 0",
    }}>
      {/* Ring animation */}
      <div style={{ width: 108, height: 108, margin: "0 auto 18px", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 10,
          background: `radial-gradient(circle, ${green}48 0%, transparent 70%)`,
          borderRadius: "50%",
        }} />
        <motion.svg
          viewBox="0 0 120 120" fill="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <motion.circle
            cx="60" cy="60" r="48"
            stroke={green} strokeWidth="4.5" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ rotate: -90, transformOrigin: "60px 60px" }}
          />
        </motion.svg>
        <motion.svg
          viewBox="0 0 120 120" fill="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.polyline
            points="36,62 52,78 86,44"
            stroke={green} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          />
        </motion.svg>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{
          fontFamily: FONT_DISPLAY, fontSize: 32,
          color: T.textPrimary, letterSpacing: "-0.6px", margin: "0 0 8px",
        }}
      >
        准备好了 ✓
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.65, maxWidth: 260, fontFamily: FONT_TEXT, margin: 0 }}
      >
        校准完成。开始你的 Solo Vision 训练之旅。
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}
      >
        {[
          { val: "48", label: "音程形状" },
          { val: "6弦", label: "全指板" },
          { val: "✓",  label: "已校准" },
        ].map((s, i) => (
          <div key={i} style={{
            padding:    "12px 14px", borderRadius: 14, minWidth: 80,
            textAlign:  "center",
            ...gc(T, isDark),
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 24,
              color: T.textPrimary, letterSpacing: "-1px", lineHeight: 1.1,
            }}>
              {s.val}
            </div>
            <div style={{
              fontSize: 9, color: T.textTertiary, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginTop: 3, fontFamily: FONT_TEXT,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN DEFINITIONS
// ─────────────────────────────────────────────────────────────
const SCREENS = [
  { id: "welcome",    eyebrow: null,        eyeVariant: "a", title: null,         skipable: false },
  { id: "twopoint",  eyebrow: "核心系统",  eyeVariant: "a", title: "两点系统",   skipable: true  },
  { id: "modules",   eyebrow: "训练系统",  eyeVariant: "a", title: "六大模块",   skipable: true  },
  { id: "coredrill", eyebrow: "训练方法",  eyeVariant: "a", title: "Core Drill", skipable: true  },
  { id: "tuner",     eyebrow: "调音器",    eyeVariant: "g", title: "先调准吉他", skipable: true  },
  { id: "calibintro",eyebrow: "为什么需要校准？", eyeVariant: "a", title: null,  skipable: true  },
  { id: "calibflow", eyebrow: "校准进行中", eyeVariant: "a", title: null,        skipable: false },
  { id: "verify",    eyebrow: "5音验证",   eyeVariant: "g", title: null,        skipable: false },
  { id: "done",      eyebrow: null,        eyeVariant: "g", title: null,        skipable: false },
];

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function OnboardingView({ onComplete, startWithTuner = false }) {
  const ctx    = useContext(ThemeContext);
  const T      = useT();
  const isDark = useIsDark();
  const accent = T.accent ?? "#5a5ad6";

  const [idx,       setIdx]       = useState(0);
  const [dir,       setDir]       = useState(1);
  const [showTuner, setShowTuner] = useState(false);
  const [revealed,  setRevealed]  = useState(false);

  const screen = SCREENS[idx];
  const isLast = screen.id === "done";
  const isCalibFlow = screen.id === "calibflow";

  useEffect(() => {
    if (startWithTuner) setShowTuner(true);
  }, [startWithTuner]);

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(t);
  }, [idx]);

  const go = useCallback((d) => {
    setDir(d);
    setIdx(i => Math.max(0, Math.min(SCREENS.length - 1, i + d)));
  }, []);

  const goTo = useCallback((n) => {
    setDir(n > idx ? 1 : -1);
    setIdx(n);
  }, [idx]);

  // Handle tuner overlay
  if (showTuner) {
    return (
      <TunerView onClose={() => {
        setShowTuner(false);
        go(1); // advance past tuner screen
      }} />
    );
  }

  return (
    <>
      <style>{`
        @keyframes svuVPFlash { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes svuPulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0.35} }
      `}</style>

      <div style={{
        position:      "fixed", inset: 0,
        background:    isDark
          ? (T.bg?.base ?? "#0f1020")
          : "linear-gradient(160deg, #eaedf9 0%, #e2e4f5 52%, #ede8f9 100%)",
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
      }}>

        {/* ── Top nav (dots + skip) ─────────────────────────── */}
        <div style={{
          position:        "absolute", top: 54, left: 0, right: 0, zIndex: 300,
          display:         "flex", alignItems: "center",
          justifyContent:  "space-between",
          padding:         "10px 22px 0",
        }}>
          {/* Skip button */}
          <motion.button
            animate={{ opacity: screen.skipable ? 1 : 0 }}
            onClick={screen.skipable ? onComplete : undefined}
            style={{
              fontSize:      12, fontWeight: 600, color: T.textTertiary,
              padding:       "6px 13px", borderRadius: 10,
              background:    isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.62)",
              backdropFilter: "blur(18px)",
              border:        `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
              cursor:        screen.skipable ? "pointer" : "default",
              fontFamily:    FONT_TEXT,
            }}
          >
            跳过介绍
          </motion.button>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {SCREENS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width:      i === idx ? 22 : 4,
                  background: i < idx
                    ? (accent + "58")
                    : i === idx
                      ? accent
                      : (isDark ? "rgba(110,120,180,0.18)" : "rgba(110,120,180,0.18)"),
                }}
                transition={SPRINGS.feather}
                style={{ height: 4, borderRadius: 2 }}
              />
            ))}
          </div>

          {/* Spacer to balance */}
          <div style={{ width: 80 }} />
        </div>

        {/* ── Main slide area ───────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 30 }}
              transition={SPRINGS.pageTransition}
              style={{
                position:      "absolute", inset: 0,
                display:       "flex",
                flexDirection: "column",
              }}
            >
              {/* S-head: eyebrow + title */}
              {(screen.eyebrow || screen.title) && screen.id !== "done" && !isCalibFlow && (
                <div style={{
                  flexShrink: 0,
                  padding:    screen.id === "calibintro"
                    ? "96px 26px 0"
                    : "100px 26px 0",
                }}>
                  {screen.eyebrow && (
                    <EyebrowBadge variant={screen.eyeVariant} animDelay={0.05}>
                      {screen.eyebrow}
                    </EyebrowBadge>
                  )}
                  {screen.title && (
                    <div style={{
                      fontFamily:    FONT_DISPLAY,
                      fontSize:      28, lineHeight: 1.16,
                      letterSpacing: "-0.45px",
                      color:         T.textPrimary,
                      marginTop:     8,
                    }}>
                      <CharReveal text={screen.title} delay={0.1} charDelay={0.035} />
                    </div>
                  )}
                </div>
              )}

              {/* S-body */}
              <div style={{
                flex:     1, minHeight: 0,
                padding:  isCalibFlow || screen.id === "done"
                  ? "0"
                  : screen.id === "welcome"
                    ? "0"
                    : "0 26px",
                display:  "flex", flexDirection: "column",
                overflowY: ["calibintro", "calibflow"].includes(screen.id) ? "auto" : "visible",
                scrollbarWidth: "none",
              }}>
                {screen.id === "welcome"    && <S1Welcome    T={T} isDark={isDark} accent={accent} onNext={() => go(1)} />}
                {screen.id === "twopoint"  && <S2TwoPoint   T={T} isDark={isDark} accent={accent} revealed={revealed} />}
                {screen.id === "modules"   && <S3Modules    T={T} isDark={isDark} accent={accent} revealed={revealed} />}
                {screen.id === "coredrill" && <S4CoreDrill  T={T} isDark={isDark} accent={accent} revealed={revealed} />}
                {screen.id === "tuner"     && <S5TunerIntro T={T} isDark={isDark} accent={accent} revealed={revealed} onOpenTuner={() => setShowTuner(true)} onSkip={() => go(1)} />}
                {screen.id === "calibintro"&& <S6CalibIntro T={T} isDark={isDark} accent={accent} revealed={revealed} />}
                {screen.id === "calibflow" && <S7CalibFlow  T={T} isDark={isDark} accent={accent} onDone={() => go(1)} />}
                {screen.id === "verify"    && <S8Verify     T={T} isDark={isDark} accent={accent} revealed={revealed} onDone={() => go(1)} />}
                {screen.id === "done"      && <SDone        T={T} isDark={isDark} accent={accent} onComplete={onComplete} />}
              </div>

              {/* S-foot: buttons */}
              {!isCalibFlow && screen.id !== "done" && (
                <div style={{
                  flexShrink: 0,
                  padding:    "14px 26px 48px",
                  display:    "flex", flexDirection: "column", gap: 9,
                }}>
                  {/* Tuner screen special */}
                  {screen.id === "tuner" ? (
                    <>
                      <PrimaryButton
                        color={T.positive ?? "#22a672"}
                        onClick={() => setShowTuner(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="2" strokeLinecap="round">
                          <path d="M5.5 20A8.5 8.5 0 0 1 18.5 20" fill="none" />
                          <line x1="12" y1="20" x2="12" y2="11" />
                          <circle cx="12" cy="20" r="2" fill="white" stroke="none" />
                        </svg>
                        进入调音器
                      </PrimaryButton>
                      <GhostButton onClick={() => go(1)}>跳过调音，直接校准</GhostButton>
                    </>
                  ) : screen.id === "calibintro" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <GhostButton fullWidth={false} style={{ flex: "none", padding: "15px 16px" }}
                        onClick={() => goTo(SCREENS.length - 1)}>
                        <span style={{ fontSize: 13, color: T.textTertiary }}>稍后再做</span>
                      </GhostButton>
                      <PrimaryButton onClick={() => go(1)} style={{ flex: 1 }}>
                        开始校准 →
                      </PrimaryButton>
                    </div>
                  ) : screen.id === "welcome" ? (
                    <PrimaryButton onClick={() => go(1)}>
                      开始了解
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12,5 19,12 12,19" />
                      </svg>
                    </PrimaryButton>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <GhostButton fullWidth={false} style={{ flex: "none", padding: "15px 20px" }}
                        onClick={() => go(-1)}>
                        ←
                      </GhostButton>
                      <PrimaryButton onClick={() => go(1)} style={{ flex: 1 }}>
                        {screen.id === "coredrill" ? "准备调音 →" : "下一步 →"}
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {/* Done screen footer */}
              {screen.id === "done" && (
                <div style={{ padding: "14px 26px 48px", flexShrink: 0 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <PrimaryButton color={T.positive ?? "#22a672"} onClick={onComplete}>
                      开始训练 →
                    </PrimaryButton>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

