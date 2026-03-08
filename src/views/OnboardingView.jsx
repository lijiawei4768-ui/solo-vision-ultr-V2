// ─────────────────────────────────────────────────────────────
// src/views/OnboardingView.jsx — v5.0
// T8：4屏 → 8屏，全部 Emoji → SVG 图标，Stage 单色
// ─────────────────────────────────────────────────────────────
import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { ThemeContext }                 from "../contexts";
import { GlassCard }                   from "../components/ui";
import { TunerView }                   from "./TunerView";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? {};
}

// ── SVG Icons ─────────────────────────────────────────────────
const IconWave = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M2 18 Q6 10 10 18 Q14 26 18 18 Q22 10 26 18 Q30 26 34 18"
      stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
const IconTwoPoint = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="8"  cy="26" r="4" stroke={color} strokeWidth="2"/>
    <circle cx="28" cy="10" r="4" stroke={color} strokeWidth="2"/>
    <line x1="12" y1="22" x2="24" y2="14" stroke={color} strokeWidth="1.5" strokeDasharray="3 3"/>
  </svg>
);
const IconStages = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <rect x="3"  y="24" width="8" height="9" rx="2" stroke={color} strokeWidth="1.8"/>
    <rect x="14" y="16" width="8" height="17" rx="2" stroke={color} strokeWidth="1.8"/>
    <rect x="25" y="8"  width="8" height="25" rx="2" stroke={color} strokeWidth="1.8"/>
  </svg>
);
const IconData = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <polyline points="4,26 10,18 16,22 24,12 32,8"
      stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="10" cy="18" r="2.5" fill={color}/>
    <circle cx="24" cy="12" r="2.5" fill={color}/>
  </svg>
);
const IconDrill = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="13" stroke={color} strokeWidth="1.8"/>
    <circle cx="18" cy="18" r="6"  stroke={color} strokeWidth="1.5"/>
    <line x1="18" y1="5"  x2="18" y2="12" stroke={color} strokeWidth="1.5"/>
    <line x1="18" y1="24" x2="18" y2="31" stroke={color} strokeWidth="1.5"/>
    <line x1="5"  y1="18" x2="12" y2="18" stroke={color} strokeWidth="1.5"/>
    <line x1="24" y1="18" x2="31" y2="18" stroke={color} strokeWidth="1.5"/>
  </svg>
);
const IconTuner = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M6 28 A14 14 0 0 1 30 28" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <line x1="18" y1="28" x2="18" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="18" cy="28" r="2.5" fill={color}/>
    <line x1="10" y1="24" x2="12" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="26" y1="24" x2="24" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconCalib = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <rect x="6" y="10" width="24" height="16" rx="3" stroke={color} strokeWidth="1.8"/>
    <line x1="13" y1="10" x2="13" y2="26" stroke={color} strokeWidth="1.2"/>
    <line x1="23" y1="10" x2="23" y2="26" stroke={color} strokeWidth="1.2"/>
    <line x1="6"  y1="18" x2="30" y2="18" stroke={color} strokeWidth="1.2"/>
    <circle cx="18" cy="18" r="3" stroke={color} strokeWidth="1.5"/>
  </svg>
);
const IconReady = ({ size=36, color }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <polyline points="8,18 15,25 28,11"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// ── Bullet row ────────────────────────────────────────────────
function Bullet({ text, color, T }) {
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:color, marginTop:7, flexShrink:0 }}/>
      <span style={{ fontSize:14, color:T.textSecondary, fontFamily:FONT_TEXT, lineHeight:1.55 }}>{text}</span>
    </div>
  );
}

// ── Stage row (single accent, 3 opacity levels) ───────────────
function StageRow({ num, label, sub, T, accent }) {
  const alphas = ["28","44","70"];
  return (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start",
      padding:"12px 0", borderBottom:`0.5px solid ${T.border}` }}>
      <div style={{
        width:28, height:28, borderRadius:8, flexShrink:0,
        background: accent + alphas[num-1],
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, fontWeight:700, color:accent, fontFamily:FONT_DISPLAY,
      }}>{num}</div>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:T.textPrimary, fontFamily:FONT_DISPLAY }}>{label}</div>
        <div style={{ fontSize:13, color:T.textSecondary, fontFamily:FONT_TEXT, marginTop:2 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Steps data factory ────────────────────────────────────────
function buildSteps(T, accent) {
  return [
    {
      Icon: IconWave,
      title: "Solo Vision",
      sub:   "专业吉他认知训练",
      body:  "一套系统训练体系，核心理念是：你应该能在任何调、任何把位、任何和弦上自如游走——靠声音和功能，不靠形状记忆。",
    },
    {
      Icon: IconTwoPoint,
      title: "两点系统",
      sub:   "Two-Point System",
      body:  "每个音程都是两点间的空间关系：根音（Root）和目标音。你学的不是形状，而是视线——指板上的直线方向感。",
      extra: (
        <>
          <Bullet text="先弹根音 → 建立参考点" color={accent} T={T}/>
          <Bullet text="找目标音程 → 建立空间视觉感" color={accent} T={T}/>
          <Bullet text="大声说出来 → 激活大脑，非肌肉记忆" color={accent} T={T}/>
        </>
      ),
    },
    {
      Icon: IconStages,
      title: "三阶段训练",
      sub:   "每个阶段缺一不可",
      extra: (
        <>
          <StageRow num={1} label="指板识字"  sub="任意位置 0.5 秒识别音名"       T={T} accent={accent}/>
          <StageRow num={2} label="音程视觉"  sub="从任意根音立即看到所有音程形状" T={T} accent={accent}/>
          <StageRow num={3} label="和声导航"  sub="在任意和弦进行上用和弦音导航"  T={T} accent={accent}/>
        </>
      ),
    },
    {
      Icon: IconData,
      title: "数据驱动进步",
      sub:   "App 追踪你的每次练习",
      body:  "Solo Vision 追踪每次练习，建立热力图，显示你在哪里快、哪里犹豫。App 自动识别弱点并加入每日训练。",
      extra: (
        <>
          <Bullet text="反应时间热力图（快 / 慢 / 极慢）" color={accent} T={T}/>
          <Bullet text="每日弱点自动推送" color={accent} T={T}/>
          <Bullet text="48 种音程形状完成进度" color={accent} T={T}/>
        </>
      ),
    },
    {
      Icon: IconDrill,
      title: "如何练习",
      sub:   "Core Drill 方法",
      extra: (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
          <GlassCard style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:accent, fontFamily:FONT_DISPLAY, marginBottom:6 }}>
              Root First 原则
            </div>
            <div style={{ fontSize:13, color:T.textSecondary, fontFamily:FONT_TEXT, lineHeight:1.6 }}>
              每道题都先弹根音，确认位置后再找目标音程。这个顺序不能反。
            </div>
          </GlassCard>
          <GlassCard style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:accent, fontFamily:FONT_DISPLAY, marginBottom:6 }}>
              大声说出来
            </div>
            <div style={{ fontSize:13, color:T.textSecondary, fontFamily:FONT_TEXT, lineHeight:1.6 }}>
              找到音程后，大声说出音程名和形状方向。说出来能激活主动记忆，而不只是肌肉反应。
            </div>
          </GlassCard>
        </div>
      ),
    },
    {
      Icon: IconTuner,
      title: "先调准吉他",
      sub:   "调准才能准确训练",
      body:  "未调准的吉他会影响识别准确度。建议在开始校准之前先调音。",
      isTunerScreen: true,
    },
    {
      Icon: IconCalib,
      title: "设备校准",
      sub:   "让 App 适应你的设备",
      body:  "App 需要采集你的麦克风环境和各弦的音量特征，才能准确识别你的演奏。校准只需 2 分钟，完成一次即可。",
      extra: (
        <>
          <Bullet text="环境噪声采集（3 秒）"       color={accent} T={T}/>
          <Bullet text="6 根弦逐弦增益校准"         color={accent} T={T}/>
          <Bullet text="5 音验证（确保 100% 识别率）" color={accent} T={T}/>
        </>
      ),
    },
    {
      Icon: IconReady,
      title: "准备好了",
      sub:   "开始你的训练",
      body:  "所有准备工作已完成。接下来是设备校准，校准完成后即可开始训练。",
      isFinal: true,
    },
  ];
}

// ── Main ─────────────────────────────────────────────────────
export function OnboardingView({ onComplete, startWithTuner = false }) {
  const ctx    = useContext(ThemeContext);
  const T      = useT();
  const isDark = ctx?.dark ?? true;
  const accent = T.accent ?? "#A78BFA";

  const [idx,       setIdx]       = useState(0);
  const [dir,       setDir]       = useState(1);
  const [showTuner, setShowTuner] = useState(false);

  const steps  = buildSteps(T, accent);
  const step   = steps[idx];
  const isLast = idx === steps.length - 1;

  const go = (d) => { setDir(d); setIdx(i => Math.max(0, Math.min(steps.length - 1, i + d))); };

  useEffect(() => {
    if (startWithTuner) {
      // immediately open tuner within onboarding
      setShowTuner(true);
    }
  }, [startWithTuner]);

  if (showTuner) return <TunerView onClose={() => { setShowTuner(false); go(1); }} />;

  return (
    <div style={{
      position:"fixed", inset:0,
      background: isDark ? T.surface0 : "rgba(242,242,247,1)",
      display:"flex", flexDirection:"column",
    }}>
      {/* Progress */}
      <div style={{ display:"flex", gap:5, justifyContent:"center", paddingTop:56, paddingBottom:8, flexShrink:0 }}>
        {steps.map((_,i) => (
          <motion.div key={i}
            animate={{
              width: i === idx ? 20 : 6,
              background: i === idx ? accent : (T.surface3 ?? "rgba(120,120,120,0.2)"),
            }}
            transition={SPRINGS.feather}
            style={{ height:6, borderRadius:3 }}
          />
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"4px 24px 0" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx}
            initial={{ opacity:0, x: dir * 40 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x: -dir * 30 }}
            transition={SPRINGS.pageTransition}
          >
            {/* Icon badge */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18, marginTop:12 }}>
              <div style={{
                width:72, height:72, borderRadius:20,
                background: accent + "1A",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <step.Icon size={36} color={accent}/>
              </div>
            </div>

            {/* Heading */}
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <div style={{ fontSize:24, fontWeight:700, fontFamily:FONT_DISPLAY,
                color:T.textPrimary, letterSpacing:"-0.5px" }}>
                {step.title}
              </div>
              {step.sub && (
                <div style={{ fontSize:14, color:T.textSecondary, fontFamily:FONT_TEXT, marginTop:3 }}>
                  {step.sub}
                </div>
              )}
            </div>

            {/* Body */}
            {step.body && (
              <p style={{ fontSize:15, color:T.textSecondary, fontFamily:FONT_TEXT,
                lineHeight:1.65, textAlign:"center", margin:"10px 0 8px" }}>
                {step.body}
              </p>
            )}

            {/* Extra content */}
            {step.extra && <div style={{ marginTop:8 }}>{step.extra}</div>}

            {/* Tuner screen special buttons */}
            {step.isTunerScreen && (
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:20, marginBottom:8 }}>
                <motion.button whileTap={{ scale:0.97 }} transition={SPRINGS.tap}
                  onClick={() => setShowTuner(true)}
                  style={{
                    background:accent, border:"none", borderRadius:14,
                    padding:"14px", color:"#fff",
                    fontFamily:FONT_TEXT, fontSize:16, fontWeight:600, cursor:"pointer",
                  }}>
                  开始调音
                </motion.button>
                <motion.button whileTap={{ scale:0.97 }} transition={SPRINGS.tap}
                  onClick={() => go(1)}
                  style={{
                    background:"none", border:`0.5px solid ${T.border}`, borderRadius:14,
                    padding:"13px", color:T.textSecondary,
                    fontFamily:FONT_TEXT, fontSize:14, cursor:"pointer",
                  }}>
                  跳过调音，直接校准
                </motion.button>
                <div style={{ textAlign:"center", fontSize:12, color:T.textTertiary, fontFamily:FONT_TEXT }}>
                  未调准的吉他会影响识别准确度
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div style={{ padding:"16px 24px 44px", flexShrink:0, display:"flex", flexDirection:"column", gap:10 }}>
        {!step.isTunerScreen && (
          <motion.button whileTap={{ scale:0.97 }} transition={SPRINGS.tap}
            onClick={() => isLast ? onComplete?.() : go(1)}
            style={{
              background:accent, border:"none", borderRadius:14,
              padding:"15px", color:"#fff",
              fontFamily:FONT_TEXT, fontSize:16, fontWeight:600, cursor:"pointer",
            }}>
            {isLast ? "开始校准" : "继续"}
          </motion.button>
        )}
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <motion.button whileTap={{ scale:0.95 }} transition={SPRINGS.tap}
            onClick={() => go(-1)}
            disabled={idx === 0}
            style={{
              background:"none", border:"none", cursor: idx === 0 ? "default" : "pointer",
              color: idx === 0 ? "transparent" : T.textTertiary,
              fontFamily:FONT_TEXT, fontSize:14, padding:"8px 4px",
            }}>
            ← 返回
          </motion.button>
          {!isLast && (
            <motion.button whileTap={{ scale:0.95 }} transition={SPRINGS.tap}
              onClick={onComplete}
              style={{
                background:"none", border:"none", cursor:"pointer",
                color:T.textTertiary, fontFamily:FONT_TEXT, fontSize:13, padding:8,
              }}>
              跳过介绍
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---
// OB.5.0 — 2026-03-05
//
// Updated:
// - T8：4屏 → 8屏（Welcome/TwoPoint/Stages/Data/Drill/Tuner/Calib/Ready）
// - 全部 Emoji 替换为 SVG 组件（IconWave/IconTwoPoint/IconStages/IconData/IconDrill/IconTuner/IconCalib/IconReady）
// - Stage 颜色系统：多色（蓝/紫/橙）→ 单色透明度层级（accent+"28"/"44"/"70"）
// - 屏6 集成 TunerView 入口，关闭后自动前进
// - 进度点：active 宽度 20px pill，非 active 6px 圆点
// - 页面切换：direction 感知左右滑动动画
//
// Fixed:
// - Emoji 全局禁止项（🎸📐🗺📊 已全部移除）
// - STAGE_COLORS 多色违反单色规范（已改为单 accent 透明度）
//
// Pending:
// - language prop 双语系统尚未接入（en/zh 切换）
// - TunerView 关闭后自动进入下一屏（已实现：onClose 调用 go(1)）
// ---
