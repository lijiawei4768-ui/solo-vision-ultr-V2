// ─────────────────────────────────────────────────────────────
// src/views/TunerView.jsx — v1.0
//
// T16：调音器视图
//   • 标准调音（Chromatic Tuner）
//   • 八度准确性检测（Intonation Check）
//   • 物理弹簧指针表盘（无发光/无科技感）
//   • 6弦状态点（调准变绿）
// ─────────────────────────────────────────────────────────────
import React, { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence }    from "framer-motion";
import { ThemeContext }               from "../contexts";
import { FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { GlassCard }                 from "../components/ui";
import {
  useTuner, freqToNote, detectString, generateDiagnosis,
} from "../hooks/useTuner";

// ── Constants ─────────────────────────────────────────────────
const STRING_NAMES   = ["E2","A2","D3","G3","B3","e4"];
const CENTS_MAX      = 50;
const INTONATION_POINTS = ["open", "fret1", "fret12"];

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? {};
}

// ── Cents colour ──────────────────────────────────────────────
function centsColor(cents, T) {
  const a = Math.abs(cents ?? 100);
  if (a <= 5)  return T.positive  ?? "#30D158";
  if (a <= 15) return T.warning   ?? "#FF9F0A";
  return        T.negative ?? "#FF453A";
}

// ── Arc Gauge (the tuner needle) ─────────────────────────────
function ArcGauge({ cents, T }) {
  const angle  = Math.max(-CENTS_MAX, Math.min(CENTS_MAX, cents ?? 0));
  const rotate = (angle / CENTS_MAX) * 75; // ±75° sweep
  const color  = centsColor(cents, T);
  const tuned  = Math.abs(angle) <= 5;

  return (
    <div style={{ position: "relative", width: 260, height: 140, margin: "0 auto" }}>
      {/* SVG arc gauge */}
      <svg width="260" height="140" viewBox="0 0 260 140">
        {/* Track arc */}
        <path
          d="M 20 130 A 110 110 0 0 1 240 130"
          fill="none"
          stroke={T.surface3 ?? "rgba(120,120,120,0.2)"}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Green centre zone ±10c */}
        <path
          d="M 100 130 A 110 110 0 0 1 160 130"
          fill="none"
          stroke={(T.positive ?? "#30D158") + "40"}
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Centre tick */}
        <line x1="130" y1="28" x2="130" y2="48"
          stroke={T.border ?? "rgba(120,120,120,0.3)"} strokeWidth="1.5" />
        {/* Scale ticks */}
        {[-40,-20,0,20,40].map(c => {
          const a  = (c / CENTS_MAX) * 75;
          const r  = Math.PI / 180 * (180 - a);
          const x1 = 130 + 100 * Math.cos(r);
          const y1 = 130 - 100 * Math.sin(r);
          const x2 = 130 + 113 * Math.cos(r);
          const y2 = 130 - 113 * Math.sin(r);
          const lx = 130 + 88 * Math.cos(r);
          const ly = 130 - 88 * Math.sin(r);
          return (
            <g key={c}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={T.textTertiary ?? "rgba(120,120,120,0.4)"} strokeWidth={c === 0 ? 2 : 1} />
              <text x={lx} y={ly + 4} textAnchor="middle"
                fontSize="10" fill={T.textTertiary ?? "rgba(120,120,120,0.5)"}
                fontFamily={FONT_TEXT}>
                {c === 0 ? "0" : (c > 0 ? `+${c}` : `${c}`)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Needle — spring-animated */}
      <motion.div
        animate={{ rotate }}
        transition={SPRINGS.correct}
        style={{
          position:        "absolute",
          bottom:          0,
          left:            "50%",
          width:           2,
          height:          108,
          marginLeft:      -1,
          transformOrigin: "bottom center",
          background:      tuned
            ? (T.positive ?? "#30D158")
            : (T.textSecondary ?? "rgba(120,120,120,0.8)"),
          borderRadius:    1,
        }}
      />

      {/* Centre pivot */}
      <div style={{
        position:  "absolute", bottom: -5, left: "50%",
        transform: "translateX(-50%)",
        width: 12, height: 12, borderRadius: "50%",
        background: tuned ? (T.positive ?? "#30D158") : (T.textTertiary ?? "rgba(120,120,120,0.5)"),
        transition: "background 0.2s",
      }} />
    </div>
  );
}

// ── String Dots (6-string status) ────────────────────────────
function StringDots({ tuningStatus, T }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
      {STRING_NAMES.map(s => {
        const st = tuningStatus?.[s];
        const tuned = st?.tuned;
        return (
          <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <motion.div
              animate={{ background: tuned ? (T.positive ?? "#30D158") : (T.surface3 ?? "rgba(120,120,120,0.2)") }}
              transition={{ duration: 0.3 }}
              style={{ width: 10, height: 10, borderRadius: "50%" }}
            />
            <span style={{
              fontSize: 10, fontFamily: FONT_TEXT,
              color: tuned ? (T.positive ?? "#30D158") : (T.textTertiary ?? "rgba(120,120,120,0.4)"),
            }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Standard Tuner Tab ────────────────────────────────────────
function StandardTuner({ T, isDark }) {
  const [refA4, setRefA4] = useState(440);
  const { current, profile, listening, error } = useTuner({ enabled: true, referenceA4: refA4 });
  const cents = current?.cents ?? 0;
  const color = centsColor(current ? cents : null, T);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 16 }}>
      {/* Main note display */}
      <GlassCard style={{ padding: "24px 20px", textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.div key={current?.noteStr ?? "—"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={SPRINGS.feather}
          >
            <div style={{
              fontSize: 58, fontWeight: 700,
              fontFamily: FONT_DISPLAY,
              color: current ? color : (T.textTertiary ?? "rgba(120,120,120,0.3)"),
              letterSpacing: "-2px", lineHeight: 1,
            }}>
              {current?.name ?? "—"}
            </div>
            {current && (
              <div style={{
                fontSize: 18, fontFamily: FONT_TEXT, fontWeight: 400,
                color: T.textSecondary ?? "rgba(120,120,120,0.7)",
                marginTop: 4,
              }}>
                {current.noteStr}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cents value */}
        <motion.div
          animate={{ color }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 22, fontWeight: 500, fontFamily: FONT_DISPLAY,
            marginTop: 8, minHeight: 30,
          }}
        >
          {current
            ? (cents === 0 ? "✓" : cents > 0 ? `+${cents}` : `${cents}`)
            : ""}
        </motion.div>

        {/* Arc gauge */}
        <div style={{ marginTop: 12 }}>
          <ArcGauge cents={current ? cents : 0} T={T} />
        </div>

        {/* Cents scale labels */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "0 20px", marginTop: 4,
        }}>
          {["-50", "-25", "0", "+25", "+50"].map(l => (
            <span key={l} style={{ fontSize: 10, color: T.textTertiary, fontFamily: FONT_TEXT }}>{l}</span>
          ))}
        </div>
      </GlassCard>

      {/* 6-string status */}
      <GlassCard style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: FONT_TEXT, marginBottom: 8, textAlign: "center" }}>
          {profile.allTuned ? "全部调准" : "弦状态"}
        </div>
        <StringDots tuningStatus={profile.tuningStatus} T={T} />
      </GlassCard>

      {/* A4 reference */}
      <GlassCard style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: T.textSecondary, fontFamily: FONT_TEXT }}>参考音高 A4</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button whileTap={{ scale: 0.9 }} transition={SPRINGS.tap}
              onClick={() => setRefA4(v => Math.max(435, v - 1))}
              style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", color: T.textPrimary, fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</motion.button>
            <span style={{ fontSize: 16, fontWeight: 600, fontFamily: FONT_DISPLAY, color: T.textPrimary, minWidth: 40, textAlign: "center" }}>
              {refA4}
            </span>
            <motion.button whileTap={{ scale: 0.9 }} transition={SPRINGS.tap}
              onClick={() => setRefA4(v => Math.min(445, v + 1))}
              style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", color: T.textPrimary, fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</motion.button>
          </div>
        </div>
      </GlassCard>

      {error && (
        <div style={{ textAlign: "center", color: T.negative, fontFamily: FONT_TEXT, fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Intonation Check Tab ──────────────────────────────────────
function IntonationCheck({ T, savedProfile, onSave }) {
  const [step, setStep]         = useState(0);   // 0=intro, 1=testing, 2=results
  const [strIdx, setStrIdx]     = useState(0);   // current string index
  const [pointIdx, setPointIdx] = useState(0);   // 0=open,1=fret1,2=fret12
  const [results, setResults]   = useState({});
  const [waiting, setWaiting]   = useState(false);

  const { current } = useTuner({ enabled: step === 1 });

  // Auto-capture when stable
  useEffect(() => {
    if (step !== 1 || !current) return;
    const strName = STRING_NAMES[strIdx];
    const detected = detectString(current.freq, 440);
    if (detected !== strName) return;
    if (Math.abs(current.cents) > 80) return; // too far off

    const key = INTONATION_POINTS[pointIdx];
    setResults(prev => ({
      ...prev,
      [strName]: { ...(prev[strName] ?? {}), [key]: current.cents },
    }));
    setWaiting(true);

    setTimeout(() => {
      setWaiting(false);
      const nextPoint = pointIdx + 1;
      if (nextPoint < INTONATION_POINTS.length) {
        setPointIdx(nextPoint);
      } else {
        const nextStr = strIdx + 1;
        if (nextStr < STRING_NAMES.length) {
          setStrIdx(nextStr);
          setPointIdx(0);
        } else {
          setStep(2);
          onSave(results);
        }
      }
    }, 800);
  // eslint-disable-next-line
  }, [current]);

  const POINT_LABELS = { open: "空弦", fret1: "1品", fret12: "12品" };

  if (step === 0) return (
    <GlassCard style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginBottom: 12 }}>
        八度准确性检测
      </div>
      <div style={{ fontSize: 14, color: T.textSecondary, fontFamily: FONT_TEXT, lineHeight: 1.6, marginBottom: 20 }}>
        检测每根弦的空弦、1品和12品是否在同一八度内准确一致。
        这可以帮助你了解吉他的状态。
      </div>
      <motion.button whileTap={{ scale: 0.96 }} transition={SPRINGS.tap}
        onClick={() => setStep(1)}
        style={{
          background: T.accent, border: "none", borderRadius: 12, padding: "12px 32px",
          color: "#fff", fontFamily: FONT_TEXT, fontSize: 15, fontWeight: 600, cursor: "pointer",
        }}>
        开始检测
      </motion.button>
    </GlassCard>
  );

  if (step === 1) {
    const strName = STRING_NAMES[strIdx];
    const key     = INTONATION_POINTS[pointIdx];
    return (
      <GlassCard style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: FONT_TEXT, marginBottom: 8 }}>
          {strIdx + 1} / {STRING_NAMES.length}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: FONT_DISPLAY, color: T.accent, marginBottom: 4 }}>
          {strName}
        </div>
        <div style={{ fontSize: 15, color: T.textSecondary, fontFamily: FONT_TEXT, marginBottom: 20 }}>
          弹奏 {POINT_LABELS[key]}
        </div>

        {waiting ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={SPRINGS.correct}
            style={{ fontSize: 28, color: T.positive }}>
            ✓
          </motion.div>
        ) : (
          <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: FONT_TEXT }}>
            检测到 {strName} 后自动记录
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20 }}>
          {INTONATION_POINTS.map((p, i) => (
            <div key={p} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i < pointIdx ? T.positive : i === pointIdx ? T.accent : T.surface3,
              transition: "background 0.2s",
            }} />
          ))}
        </div>
      </GlassCard>
    );
  }

  // step === 2 — results
  const diagnosis = generateDiagnosis(results);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <GlassCard style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginBottom: 12 }}>
          检测结果
        </div>
        {STRING_NAMES.map(s => {
          const r = results[s] ?? {};
          return (
            <div key={s} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: `0.5px solid ${T.border}`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY, minWidth: 28 }}>{s}</span>
              {INTONATION_POINTS.map(p => {
                const c = r[p] ?? null;
                const col = c !== null ? centsColor(c, T) : T.textTertiary;
                return (
                  <div key={p} style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 10, color: T.textTertiary, fontFamily: FONT_TEXT, marginBottom: 2 }}>
                      {p === "open" ? "空弦" : p === "fret1" ? "1品" : "12品"}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: col, fontFamily: FONT_DISPLAY }}>
                      {c !== null ? (c === 0 ? "✓" : c > 0 ? `+${c}` : `${c}`) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </GlassCard>

      <GlassCard style={{ padding: 16 }}>
        <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: FONT_TEXT, lineHeight: 1.6 }}>
          {diagnosis}
        </div>
      </GlassCard>

      <motion.button whileTap={{ scale: 0.96 }} transition={SPRINGS.tap}
        onClick={() => { setStep(0); setStrIdx(0); setPointIdx(0); setResults({}); }}
        style={{
          background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: 12,
          padding: "12px", color: T.textSecondary, fontFamily: FONT_TEXT, fontSize: 14,
          cursor: "pointer",
        }}>
        重新检测
      </motion.button>
    </div>
  );
}

// ── TunerView (main export) ───────────────────────────────────
export function TunerView({ onClose }) {
  const ctx    = useContext(ThemeContext);
  const T      = ctx?.tokens ?? {};
  const isDark = ctx?.dark ?? true;
  const [tab, setTab] = useState(0); // 0 = standard, 1 = intonation

  const TAB_LABELS = ["标准调音", "八度检测"];

  return (
    <div style={{
      position:   "fixed", inset: 0,
      background: isDark ? T.surface0 : "rgba(242,242,247,1)",
      zIndex:     200,
      display:    "flex", flexDirection: "column",
    }}>
      {/* Nav bar */}
      <div style={{
        display:         "flex", alignItems: "center",
        justifyContent:  "space-between",
        padding:         "56px 20px 12px",
      }}>
        <span style={{
          fontSize: 17, fontWeight: 600, fontFamily: FONT_DISPLAY,
          color: T.textPrimary,
        }}>
          调音器
        </span>
        <motion.button whileTap={{ scale: 0.88 }} transition={SPRINGS.tap}
          onClick={onClose}
          style={{
            background: T.surface2, border: `0.5px solid ${T.border}`,
            borderRadius: 22, width: 34, height: 34,
            cursor: "pointer", color: T.textSecondary,
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          ✕
        </motion.button>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 8, padding: "0 20px 16px",
      }}>
        {TAB_LABELS.map((label, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }} transition={SPRINGS.tap}
            onClick={() => setTab(i)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10,
              border: `0.5px solid ${tab === i ? T.accentBorder ?? T.border : T.border}`,
              background: tab === i ? (T.accentSub ?? T.surface2) : T.surface1,
              color: tab === i ? T.accent : T.textSecondary,
              fontFamily: FONT_TEXT, fontSize: 14,
              fontWeight: tab === i ? 600 : 400, cursor: "pointer",
            }}>
            {label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", WebkitOverflowScrolling: "touch" }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRINGS.pageTransition}
          >
            {tab === 0
              ? <StandardTuner T={T} isDark={isDark} />
              : <IntonationCheck T={T}
                  savedProfile={null}
                  onSave={() => {}} />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---
// TUNER.1.0 — 2026-03-05
//
// Added:
// - TunerView 完整实现：标准调音 + 八度检测两个 Tab
// - ArcGauge：物理弹簧指针，±75° 扫描范围，中心 ±10c 绿区
// - StringDots：6弦调准状态点，调准变绿（motion.div animate）
// - IntonationCheck：逐弦空弦/1品/12品自动捕捉 + 结果报告
// - Cents 颜色：±5c 绿 / ±6-15c 橙 / ±16c+ 红
// - A4 参考频率调节（435–445 Hz）
//
// Fixed:
// - N/A（新文件）
//
// Pending:
// - TunerView 从 PersonaView Settings 的入口（待 ControlCenter 接入）
// - TunerProfile.allTuned 与 PreFlightView 警告联动
// - A4 设置持久化（当前仅局部 state）
// ---
