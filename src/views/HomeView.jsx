
// ─────────────────────────────────────────────────────────────
// HomeView.jsx — Solo Vision Ultra v5.0
//
// 全新设计：开放模块系统
// New design: Open Module System
//
// • 时间问候语 (Good Morning / Afternoon / Evening)
// • 3个训练模块组，全部可直接进入
// • 今日推荐练习 (基于弱项分析)
// • 推荐路径 Track A/B/C
// • 练习技巧轮播
// • 没有等级锁定
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";
import { MODULE_GROUPS, PRACTICE_TRACKS, getTodayAssignment } from "../data/curriculum";

function useT()      { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark   ?? true; }

// ── Greeting helper ───────────────────────────────────────────
function getGreeting(lang) {
  const h = new Date().getHours();
  if (lang === "en") {
    if (h < 12) return "Good Morning.";
    if (h < 18) return "Good Afternoon.";
    return "Good Evening.";
  }
  if (lang === "zh") {
    if (h < 12) return "早上好。";
    if (h < 18) return "下午好。";
    return "晚上好。";
  }
  // mixed
  if (h < 12) return "早上好。";
  if (h < 18) return "下午好。";
  return "晚上好。";
}

// ── Practice Tips ─────────────────────────────────────────────
const TIPS = [
  {
    title:   "Vocalize Before You Play",
    titleZh: "弹之前先出声",
    body:    "Before playing any interval, say its name aloud. This forces your brain to engage instead of letting your fingers run on autopilot.",
    bodyZh:  "弹奏任何音程前，大声说出名字。迫使大脑主动参与，而不是让手指靠肌肉记忆走。",
    color:   "#A78BFA",
  },
  {
    title:   "3-String Zone First",
    titleZh: "先练三弦区域",
    body:    "Always start a new interval on just 3 adjacent strings. Master that zone before expanding to the full neck.",
    bodyZh:  "练习新音程时，先限制在 3 条相邻弦上，掌握后再扩展。",
    color:   "#4A9EFF",
  },
  {
    title:   "Root Is Your Anchor",
    titleZh: "根音是你的锚点",
    body:    "Never lose sight of the root. Every interval, scale, chord tone — you always navigate FROM the nearest root.",
    bodyZh:  "永远不要忘记根音。每个音程、音阶、和弦音——始终从最近的根音出发。",
    color:   "#F97316",
  },
  {
    title:   "5-Fret Block Practice",
    titleZh: "五品块练习",
    body:    "Restrict yourself to frets 1–5, then 5–9, then 9–12. Master each block before connecting them.",
    bodyZh:  "先限制在 1–5 品，再 5–9 品，再 9–12 品。掌握每个品块再连接。",
    color:   "#32D2BB",
  },
  {
    title:   "Slow Down to Speed Up",
    titleZh: "慢下来才能快",
    body:    "If you make 2 errors in a row, drop the timer by 1 second. Accuracy builds speed — not the other way around.",
    bodyZh:  "连续错 2 次就把计时器增加 1 秒。准确率才是速度的基础。",
    color:   "#E8A23C",
  },
];

// ── Trainer icon+label map ────────────────────────────────────
// TrainerIcon — T6：SVG 替换 Emoji/Unicode 功能图标
export function TrainerIcon({ id, size = 28, color = "currentColor" }) {
  switch (id) {
    case "note":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="9" cy="16" r="3" fill={color} stroke="none" />
          <line x1="12" y1="16" x2="12" y2="5" strokeLinecap="round" />
          <line x1="12" y1="5" x2="18" y2="7" strokeLinecap="round" />
        </svg>
      );
    case "interval":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="6" cy="14" r="2.5" fill={color} stroke="none" />
          <circle cx="18" cy="14" r="2.5" />
          <path d="M8.5 12 Q12 7 15.5 12" strokeLinecap="round" />
        </svg>
      );
    case "changes":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <rect x="2" y="8" width="8" height="8" rx="2" />
          <rect x="14" y="8" width="8" height="8" rx="2" />
          <line x1="10" y1="12" x2="14" y2="12" strokeLinecap="round" />
          <polyline points="12.5,10 14,12 12.5,14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="4"  cy="19" r="1.8" fill={color} stroke="none" />
          <circle cx="9"  cy="16" r="1.8" fill={color} stroke="none" />
          <circle cx="14" cy="13" r="1.8" fill={color} stroke="none" />
          <circle cx="19" cy="10" r="1.8" fill={color} stroke="none" />
          <path d="M5.5 19 L9 16 L14 13 L19 10" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
        </svg>
      );
    default:
      return null;
  }
}

// QuickStat icon SVG — T6：替换 emoji 状态图标
function StatIcon({ id, size = 18, color = "currentColor" }) {
  switch (id) {
    case "streak":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.4">
          <path d="M10 2 Q14 6 14 10 Q14 15 10 18 Q6 15 6 10 Q6 6 10 2Z" strokeLinecap="round" />
          <path d="M10 9 Q11.5 11 10 13" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      );
    case "today":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.4">
          <circle cx="10" cy="10" r="7.5" />
          <line x1="10" y1="5" x2="10" y2="10.5" strokeLinecap="round" />
          <line x1="10" y1="10.5" x2="13" y2="13" strokeLinecap="round" />
        </svg>
      );
    case "weak":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke={color} strokeWidth="1.4">
          <circle cx="10" cy="9" r="5.5" />
          <line x1="10" y1="7" x2="10" y2="10" strokeLinecap="round" strokeWidth="1.8" stroke={color} />
          <circle cx="10" cy="12" r="0.8" fill={color} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

const TRAINER_META = {
  note:     { icon: "note",     label: "Notes",     labelZh: "音符训练器"   },
  interval: { icon: "interval", label: "Intervals", labelZh: "音程训练器"   },
  changes:  { icon: "changes",  label: "Changes",   labelZh: "和弦进行训练" },
  scale:    { icon: "scale",    label: "Scales",    labelZh: "音阶训练器"   },
};

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function HomeView({
  settings,
  onTabChange,
  historyData,
  T: _T,
  isDark: _isDark,
  progress,
  onOpenStageMap,
}) {
  const T      = useT();
  const isDark = useIsDark();
  const { lang } = useLang();
  const isZh   = lang !== "en";

  const [tipIdx, setTipIdx] = useState(0);
  const [activeTrack, setActiveTrack] = useState(null);

  const greeting   = getGreeting(lang);
  const assignment = getTodayAssignment(progress || {});

  const trainerTabMap = {
    note:     "note",
    interval: "interval",
    changes:  "changes",
    scale:    "scale",
  };

  const goToTrainer = useCallback((trainerId) => {
    onTabChange?.(trainerTabMap[trainerId] || trainerId);
  }, [onTabChange]);

  const nextTip  = () => setTipIdx(i => (i + 1) % TIPS.length);
  const tip = TIPS[tipIdx];

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* ── Greeting ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 28, marginTop: 4 }}
      >
        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: T.textPrimary,
          fontFamily: FONT_DISPLAY,
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
        }}>
          {greeting}
        </div>
        <div style={{
          fontSize: 13,
          color: T.textTertiary,
          marginTop: 6,
          fontFamily: FONT_TEXT,
        }}>
          {isZh ? "选择训练模块开始练习。" : "Choose a training module to begin."}
        </div>
      </motion.div>

      {/* ── Today's Suggestion ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{
          fontSize: 10,
          color: T.textTertiary,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: FONT_TEXT,
        }}>
          {isZh ? "今日推荐" : "Suggested Today"}
        </div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => goToTrainer(assignment.trainer)}
          style={{
            padding: "16px 18px",
            borderRadius: 18,
            background: isDark
              ? `linear-gradient(135deg, ${assignment.color}22, ${assignment.color}10)`
              : `${assignment.color}12`,
            border: `1px solid ${assignment.color}35`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `${assignment.color}22`,
            border: `1px solid ${assignment.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>
            {assignment.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: T.textPrimary,
              fontFamily: FONT_DISPLAY,
              marginBottom: 3,
            }}>
              {isZh ? (assignment.titleZh || assignment.title) : assignment.title}
            </div>
            <div style={{
              fontSize: 12,
              color: T.textSecondary,
              fontFamily: FONT_TEXT,
              lineHeight: 1.4,
            }}>
              {isZh ? (assignment.reason || assignment.reasonEn) : assignment.reasonEn}
            </div>
          </div>
          <div style={{ fontSize: 18, color: assignment.color, opacity: 0.8 }}>›</div>
        </motion.div>
      </motion.div>

      {/* ── Training Modules ─────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 10,
          color: T.textTertiary,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: FONT_TEXT,
        }}>
          {isZh ? "训练模块" : "Training Modules"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MODULE_GROUPS.map((group, gi) => (
            <ModuleGroupCard
              key={group.id}
              group={group}
              isZh={isZh}
              isDark={isDark}
              T={T}
              onGo={() => goToTrainer(group.trainer)}
              delay={gi * 0.06}
            />
          ))}
        </div>
      </div>

      {/* ── Practice Tracks ───────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{
            fontSize: 10,
            color: T.textTertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            fontFamily: FONT_TEXT,
          }}>
            {isZh ? "推荐路径（可选）" : "Suggested Tracks (Optional)"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {PRACTICE_TRACKS.map(track => {
            const isActive = activeTrack === track.id;
            return (
              <motion.div
                key={track.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTrack(isActive ? null : track.id)}
                style={{
                  flexShrink: 0,
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: isActive ? `${track.color}20` : T.surface1,
                  border: `1px solid ${isActive ? track.color + "50" : T.border}`,
                  cursor: "pointer",
                  minWidth: 110,
                }}
              >
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? track.color : T.textSecondary,
                  fontFamily: FONT_DISPLAY,
                  letterSpacing: 0.5,
                }}>
                  {isZh ? track.labelZh : track.label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: T.textTertiary,
                  marginTop: 2,
                  fontFamily: FONT_TEXT,
                }}>
                  {isZh ? track.nameZh : track.name}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Track detail */}
        <AnimatePresence>
          {activeTrack && (() => {
            const track = PRACTICE_TRACKS.find(t => t.id === activeTrack);
            if (!track) return null;
            return (
              <motion.div
                key={activeTrack}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  marginTop: 10,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: `${track.color}10`,
                  border: `1px solid ${track.color}30`,
                }}>
                  <div style={{
                    fontSize: 12,
                    color: T.textSecondary,
                    marginBottom: 10,
                    fontFamily: FONT_TEXT,
                    lineHeight: 1.5,
                  }}>
                    {isZh ? track.descZh : track.desc}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {track.steps.map((step, i) => {
                      const g = MODULE_GROUPS.find(m => m.id === step.groupId);
                      const m = g?.modules.find(mod => mod.id === step.moduleId);
                      if (!g || !m) return null;
                      return (
                        <motion.div
                          key={i}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => goToTrainer(g.trainer)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 10,
                            background: T.surface2,
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontSize: 14, color: g.color }}>{g.icon}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: T.textPrimary,
                              fontFamily: FONT_TEXT,
                            }}>
                              {isZh ? m.titleZh : m.title}
                            </span>
                            <span style={{
                              fontSize: 10,
                              color: T.textTertiary,
                              marginLeft: 6,
                            }}>
                              {isZh
                                ? m.presets[step.preset]?.label
                                : m.presets[step.preset]?.labelEn
                              }
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: T.textTertiary }}>›</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: T.textTertiary,
                    fontFamily: FONT_TEXT,
                  }}>
                    {isZh ? "这是建议顺序，不强制。" : "Suggested order — not forced."}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ── Practice Tips ─────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{
            fontSize: 10,
            color: T.textTertiary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            fontFamily: FONT_TEXT,
          }}>
            {isZh ? "练习技巧" : "Practice Tips"}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextTip}
            style={{
              fontSize: 11, color: T.accent, background: "none",
              border: "none", cursor: "pointer", fontFamily: FONT_TEXT,
              padding: "2px 6px",
            }}
          >
            {isZh ? "下一条 →" : "Next →"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tipIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              padding: "16px 18px",
              borderRadius: 18,
              background: isDark
                ? `linear-gradient(135deg, ${tip.color}15, ${tip.color}08)`
                : `${tip.color}0e`,
              border: `1px solid ${tip.color}28`,
            }}
          >
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: T.textPrimary,
              fontFamily: FONT_DISPLAY,
              marginBottom: 6,
            }}>
              {isZh ? tip.titleZh : tip.title}
            </div>
            <div style={{
              fontSize: 13,
              color: T.textSecondary,
              fontFamily: FONT_TEXT,
              lineHeight: 1.55,
            }}>
              {isZh ? tip.bodyZh : tip.body}
            </div>
            <div style={{
              display: "flex",
              gap: 4,
              marginTop: 12,
            }}>
              {TIPS.map((_, i) => (
                <motion.div
                  key={i}
                  onClick={() => setTipIdx(i)}
                  style={{
                    height: 3, borderRadius: 2,
                    width: i === tipIdx ? 18 : 6,
                    background: i === tipIdx ? tip.color : T.surface3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Quick Stats row ───────────────────────────────────── */}
      {progress && (
        <QuickStats progress={progress} isZh={isZh} T={T} isDark={isDark} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODULE GROUP CARD
// ─────────────────────────────────────────────────────────────
function ModuleGroupCard({ group, isZh, isDark, T, onGo, delay }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 360, damping: 30 }}
      style={{
        borderRadius: 20,
        background: isDark ? T.surface1 : "rgba(255,253,248,0.9)",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
          cursor: "pointer",
          gap: 14,
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `${group.color}20`,
          border: `1px solid ${group.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
        }}>
          {group.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: FONT_DISPLAY,
            letterSpacing: "-0.2px",
          }}>
            {isZh ? group.titleZh : group.title}
          </div>
          <div style={{
            fontSize: 11,
            color: T.textTertiary,
            marginTop: 2,
            fontFamily: FONT_TEXT,
          }}>
            {isZh ? group.subtitleZh : group.subtitle}
          </div>
        </div>

        {/* Expand + Go */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {/* Quick enter */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={e => { e.stopPropagation(); onGo(); }}
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              background: `${group.color}20`,
              border: `1px solid ${group.color}40`,
              color: group.color,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_TEXT,
            }}
          >
            {isZh ? "进入" : "Enter"}
          </motion.button>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            style={{ fontSize: 14, color: T.textTertiary }}
          >
            ›
          </motion.div>
        </div>
      </div>

      {/* Expanded modules list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: `1px solid ${T.border}`,
              padding: "8px 12px 12px",
            }}>
              {/* Description */}
              <div style={{
                fontSize: 12,
                color: T.textSecondary,
                fontFamily: FONT_TEXT,
                lineHeight: 1.5,
                padding: "8px 4px 10px",
              }}>
                {isZh ? group.descriptionZh : group.description}
              </div>

              {/* Module list */}
              {group.modules.map(mod => (
                <motion.div
                  key={mod.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={onGo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 12,
                    marginBottom: 6,
                    background: T.surface2,
                    cursor: "pointer",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textPrimary,
                      fontFamily: FONT_DISPLAY,
                    }}>
                      {isZh ? mod.titleZh : mod.title}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: T.textTertiary,
                      marginTop: 2,
                      fontFamily: FONT_TEXT,
                    }}>
                      {isZh ? mod.descZh : mod.desc}
                    </div>
                  </div>

                  {/* Preset chips */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {Object.entries(mod.presets).map(([key, preset]) => (
                      <span
                        key={key}
                        style={{
                          fontSize: 9,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: `${group.color}18`,
                          color: group.color,
                          fontWeight: 600,
                          fontFamily: FONT_TEXT,
                          letterSpacing: 0.3,
                        }}
                      >
                        {isZh ? preset.label : preset.labelEn}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK STATS
// ─────────────────────────────────────────────────────────────
function QuickStats({ progress, isZh, T, isDark }) {
  const stats = [
    {
      label: isZh ? "连续天数" : "Streak",
      value: `${progress.streakDays || 0}${isZh ? "天" : "d"}`,
      iconId: "streak",
    },
    {
      label: isZh ? "今日练习" : "Today",
      value: `${progress.todayMinutes || 0}${isZh ? "分钟" : "m"}`,
      iconId: "today",
    },
    {
      label: isZh ? "弱项音程" : "Weak Spots",
      value: `${(progress.weakIntervals || []).length}`,
      iconId: "weak",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        marginBottom: 20,
      }}
    >
      {stats.map(s => (
        <div key={s.label} style={{
          padding: "12px 10px",
          borderRadius: 14,
          background: isDark ? T.surface1 : "rgba(255,253,248,0.9)",
          border: `1px solid ${T.border}`,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><StatIcon id={s.iconId} size={20} color={T.textSecondary} /></div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: FONT_DISPLAY,
            lineHeight: 1,
          }}>
            {s.value}
          </div>
          <div style={{
            fontSize: 10,
            color: T.textTertiary,
            marginTop: 3,
            fontFamily: FONT_TEXT,
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}