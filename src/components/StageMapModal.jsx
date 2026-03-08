// ─────────────────────────────────────────────────────────────
// StageMapModal.jsx — 3-stage x 5-level curriculum map
// Uses existing ThemeContext / DT tokens
// ─────────────────────────────────────────────────────────────
import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";
import { CURRICULUM } from "../data/curriculum";

function useT()      { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark   ?? true; }

const STAGE_COLORS = ["#4A9EFF", "#A78BFA", "#F97316"];

export function StageMapModal({ progress = {}, onClose, onStartLevel }) {
  const T          = useT();
  const isDark     = useIsDark();
  const { lang }   = useLang();
  const isZh       = lang !== "en";

  const levelStats     = progress.levelStats     || {};
  const unlockedLevels = progress.unlockedLevels || ["1-1"];
  const currentLevelId = progress.currentLevelId || "1-1";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 8000,
          background: isDark ? "rgba(0,0,0,0.75)" : "rgba(80,55,30,0.45)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: isDark ? "rgba(14,14,22,0.98)" : T.surface1,
            borderRadius: "24px 24px 0 0",
            maxHeight: "92vh", overflowY: "auto",
            paddingBottom: 48,
            border: "0.5px solid " + T.border,
          }}
        >
          {/* Handle */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, marginBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
          </div>

          {/* Header */}
          <div style={{ padding: "12px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textPrimary, margin: 0, letterSpacing: -0.3, fontFamily: FONT_DISPLAY }}>
                {isZh ? "训练路径" : "Training Path"}
              </h2>
              <p style={{ fontSize: 13, color: T.textTertiary, margin: "4px 0 0", fontFamily: FONT_TEXT }}>
                {isZh ? "3 个阶段 · 15 个等级" : "3 Stages · 15 Levels"}
              </p>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: 10,
              background: T.surface2, border: "0.5px solid " + T.border,
              color: T.textSecondary, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              ✕
            </button>
          </div>

          {/* Stages */}
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 28 }}>
            {CURRICULUM.stages.map((stage, si) => {
              const sc          = STAGE_COLORS[stage.id - 1];
              const passedCount = stage.levels.filter(l => levelStats[l.id]?.passed).length;
              return (
                <div key={stage.id}>
                  {/* Stage header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
                    padding: "12px 14px", borderRadius: 14,
                    background: sc + "12", border: "1px solid " + sc + "28",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: sc + "22", border: "1px solid " + sc + "35",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>
                      {stage.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: sc, letterSpacing: 1.2, textTransform: "uppercase" }}>
                        Stage {stage.id}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
                        {isZh ? stage.titleZh : stage.title}
                      </div>
                      <div style={{ fontSize: 12, color: T.textTertiary }}>
                        {isZh ? stage.subtitleZh : stage.subtitle}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: sc }}>{passedCount}/{stage.levels.length}</div>
                      <div style={{ fontSize: 10, color: T.textTertiary }}>{isZh ? "通过" : "passed"}</div>
                    </div>
                  </div>

                  {/* Levels */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stage.levels.map((level, li) => {
                      const isPassed   = levelStats[level.id]?.passed;
                      const isCurrent  = level.id === currentLevelId;
                      const isUnlocked = unlockedLevels.includes(level.id);
                      const stat       = levelStats[level.id];
                      return (
                        <motion.button
                          key={level.id}
                          initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: si * 0.06 + li * 0.04 }}
                          whileTap={!isUnlocked ? {} : { scale: 0.97 }}
                          onClick={() => isUnlocked && onStartLevel && onStartLevel(level)}
                          disabled={!isUnlocked}
                          style={{
                            textAlign: "left", border: "none",
                            cursor: isUnlocked ? "pointer" : "default",
                            padding: "14px 16px", borderRadius: 14,
                            background: isPassed
                              ? (isDark ? "rgba(52,199,89,0.10)" : "rgba(52,199,89,0.08)")
                              : isCurrent ? T.surface2 : T.surface1,
                            border: "0.5px solid " + (isPassed ? "rgba(52,199,89,0.28)" : isCurrent ? sc + "50" : T.border),
                            opacity: isUnlocked ? 1 : 0.4,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                              background: isPassed ? "rgba(52,199,89,0.18)" : isCurrent ? sc + "22" : T.surface2,
                              border: "0.5px solid " + (isPassed ? "rgba(52,199,89,0.30)" : isCurrent ? sc + "40" : "transparent"),
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 14, fontWeight: 900,
                              color: isPassed ? "#34C759" : isCurrent ? sc : T.textTertiary,
                            }}>
                              {isPassed ? "✓" : !isUnlocked ? "🔒" : level.level}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: isUnlocked ? T.textPrimary : T.textTertiary, fontFamily: FONT_TEXT }}>
                                  {isZh ? level.titleZh : level.title}
                                </span>
                                {isCurrent && (
                                  <span style={{ padding: "2px 7px", borderRadius: 6, background: sc + "22", color: sc, fontSize: 9, fontWeight: 800 }}>
                                    {isZh ? "当前" : "NOW"}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.4 }}>
                                {isZh ? level.descriptionZh : level.description}
                              </div>
                              {stat && (
                                <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                                  <span style={{ fontSize: 10, color: T.textTertiary }}>
                                    {isZh ? "准确率" : "Acc"}: <strong style={{ color: (stat.accuracy||0) >= 80 ? "#34C759" : T.textSecondary }}>{stat.accuracy || 0}%</strong>
                                  </span>
                                  <span style={{ fontSize: 10, color: T.textTertiary }}>
                                    {isZh ? "最佳连续" : "Best"}: <strong style={{ color: T.textSecondary }}>{stat.bestStreak || 0}</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                            {isUnlocked && !isPassed && (
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 10, color: T.textTertiary }}>{isZh ? "过关" : "Pass"}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary }}>{level.successCriteria.accuracy}%</div>
                                <div style={{ fontSize: 10, color: T.textTertiary }}>x{level.successCriteria.streak}</div>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
