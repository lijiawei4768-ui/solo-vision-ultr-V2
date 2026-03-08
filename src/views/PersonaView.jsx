// ─────────────────────────────────────────────────────────────
// PersonaView.jsx — Solo Vision v4
// Redesigned: Personal training dashboard
// Shows progress, heatmaps, interval stats — NOT a settings dump
// Settings collapsed at the bottom
// Uses existing ThemeContext / DT tokens
// T15: Version Log 入口已添加
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";
import { CURRICULUM } from "../data/curriculum";

// 版本记录数据 (T15)
const VERSION_LOGS = [
  { code: "GLOB", version: "10.1", date: "2026-03-05", note: "Blueprint v10.1 COMPLETE" },
  { code: "HOME", version: "5.0", date: "2026-03-05", note: "模块化系统 + SVG 图标 (T6)" },
  { code: "INT", version: "3.2", date: "2026-03-05", note: "ModeIcon SVG + VocalizationPrompt 颜色 (T5,T7)" },
  { code: "PROF", version: "4.1", date: "2026-03-05", note: "版本记录入口 (T15)" },
  { code: "ONBD", version: "5.0", date: "2026-03-05", note: "8屏 + SVG 图标 (T8)" },
  { code: "CAL", version: "3.0", date: "2026-03-05", note: "Step 3/4/5 校准升级 (T4)" },
  { code: "GLOB", version: "4.1", date: "2026-03-05", note: "SPRINGS 补全 + 浅色玻璃修复 (T3,T10)" },
  { code: "TUNER", version: "1.0", date: "2026-03-05", note: "调音器系统 (T16)" },
  { code: "SCALE", version: "3.0", date: "2026-03-05", note: "Scale Blueprint 视图 + 全图标化" },
];

function useT()      { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark   ?? true; }

const STAGE_COLORS = {
  1: { primary: "#4A9EFF" },
  2: { primary: "#A78BFA" },
  3: { primary: "#F97316" },
};

// ─────────────────────────────────────────────────────────────
export function PersonaView({
  settings,
  onSettingsChange,
  historyData,
  calibData,
  onRecalibrate,
  isDark: _isDark,
  onToggleTheme,
  progress,            // injected from App
  onResetProgress,     // injected from App
}) {
  const T      = useT();
  const isDark = useIsDark();
  const { lang, setLang } = useLang();
  const isZh   = lang !== "en";

  const [activeSection, setActiveSection] = useState("overview");
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [versionLogOpen, setVersionLogOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // T15: 监听版本记录事件
  useEffect(() => {
    const handler = () => setVersionLogOpen(true);
    window.addEventListener("openVersionLog", handler);
    return () => window.removeEventListener("openVersionLog", handler);
  }, []);

  const p              = progress || {};
  const streakDays     = p.streakDays     || 0;
  const todayMinutes   = p.todayMinutes   || 0;
  const overallPct     = p.overallProgressPct || 0;
  const currentStageId = p.currentStageId || 1;
  const currentLevelId = p.currentLevelId || "1-1";
  const sc             = STAGE_COLORS[currentStageId] || STAGE_COLORS[1];
  const stage          = CURRICULUM.stages.find(s => s.id === currentStageId);
  const levelInfo      = stage?.levels.find(l => l.id === currentLevelId);
  const levelStats     = p.levelStats     || {};
  const weakIntervals  = p.weakIntervals  || [];
  const weakNotes      = p.weakNotes      || [];

  // Interval stats sorted weakest-first
  const intervalStats = useMemo(() => {
    const hm = p.intervalHeatmap || {};
    return Object.entries(hm)
      .filter(([, v]) => v.attempts > 0)
      .map(([interval, v]) => ({
        interval,
        accuracy: v.attempts > 0 ? v.correct / v.attempts : 0,
        attempts: v.attempts,
        avgMs:    v.avgReactionMs || 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [p.intervalHeatmap]);

  const tabs = [
    { id: "overview",  label: isZh ? "概览"  : "Overview",  icon: "◉" },
    { id: "heatmap",   label: isZh ? "热力图" : "Heatmap",   icon: "⬛" },
    { id: "intervals", label: isZh ? "音程"  : "Intervals", icon: "◎" },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: T.textPrimary, margin: 0, letterSpacing: -0.5, fontFamily: FONT_DISPLAY }}>
              {isZh ? "我的训练" : "My Training"}
            </h1>
            <p style={{ fontSize: 13, color: T.textTertiary, margin: "4px 0 0" }}>
              {isZh ? "你的专属训练地图" : "Your personal training map"}
            </p>
          </div>
          <button onClick={() => setSettingsOpen(v => !v)} style={{
            width: 36, height: 36, borderRadius: 12,
            background: T.surface2, border: `0.5px solid ${T.border}`,
            cursor: "pointer", fontSize: 15, color: T.textSecondary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            ⚙
          </button>
        </div>
      </div>

      {/* Current Stage Badge */}
      <motion.div
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 }}
        style={{
          padding: "16px 18px", borderRadius: 18, marginBottom: 16,
          background: `${sc.primary}12`, border: `0.5px solid ${sc.primary}30`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: sc.primary, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {isZh ? `第 ${currentStageId} 阶段` : `Stage ${currentStageId}`}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginTop: 2, fontFamily: FONT_DISPLAY }}>
              {isZh ? stage?.titleZh : stage?.title}
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 2 }}>
              Level {levelInfo?.level || 1} · {isZh ? levelInfo?.titleZh : levelInfo?.title}
            </div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `${sc.primary}20`, border: `1.5px solid ${sc.primary}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>
            {stage?.icon}
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: `${sc.primary}20`, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: sc.primary, borderRadius: 2 }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ fontSize: 10, color: T.textTertiary }}>{isZh ? "整体进度" : "Overall Progress"}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: sc.primary }}>{overallPct}%</div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}
      >
        {[
          { label: isZh ? "连续天数" : "Streak",     value: `${streakDays}d`, icon: "🔥", color: T.accent },
          { label: isZh ? "今日练习" : "Today",      value: `${todayMinutes}m`, icon: "⏱", color: "#4A9EFF" },
          { label: isZh ? "弱点数" : "Weak Spots", value: weakIntervals.length, icon: "⚠", color: "#FF453A" },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "14px 10px", borderRadius: 14, textAlign: "center",
            background: T.surface1, border: `0.5px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: T.textTertiary, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{
            padding: "8px 16px", borderRadius: 20, border: "none",
            background: activeSection === tab.id ? T.accent : T.surface1,
            color: activeSection === tab.id ? "#fff" : T.textSecondary,
            fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: `0.5px solid ${activeSection === tab.id ? "transparent" : T.border}`,
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === "overview" && (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <OverviewSection T={T} isDark={isDark} isZh={isZh} progress={p} sc={sc} levelStats={levelStats} currentStageId={currentStageId} currentLevelId={currentLevelId} weakIntervals={weakIntervals} weakNotes={weakNotes} />
          </motion.div>
        )}
        {activeSection === "heatmap" && (
          <motion.div key="heatmap"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <NoteHeatmapSection T={T} isDark={isDark} isZh={isZh} progress={p} />
          </motion.div>
        )}
        {activeSection === "intervals" && (
          <motion.div key="intervals"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <IntervalStatsSection T={T} isDark={isDark} isZh={isZh} stats={intervalStats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recalibrate button */}
      <div style={{ marginTop: 16 }}>
        <button onClick={onRecalibrate} style={{
          width: "100%", padding: 14, borderRadius: 14,
          background: T.surface1, border: `0.5px solid ${T.border}`,
          color: T.textSecondary, fontSize: 14, fontWeight: 600,
          cursor: "pointer", textAlign: "left",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>🎛 {isZh ? "重新校准音高检测" : "Recalibrate pitch detection"}</span>
          <span style={{ fontSize: 12, color: T.textTertiary }}>→</span>
        </button>
      </div>

      {/* Settings panel (collapsible) */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden", marginTop: 12 }}
          >
            <SettingsPanel
              T={T} isDark={isDark} isZh={isZh} lang={lang}
              settings={settings}
              onChangeLang={setLang}
              onToggleTheme={onToggleTheme}
              onResetProgress={() => setShowResetConfirm(true)}
              onSettingsChange={onSettingsChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirm */}
      <AnimatePresence>
        {showResetConfirm && (
          <ResetConfirmModal
            T={T} isDark={isDark} isZh={isZh}
            onConfirm={() => { onResetProgress && onResetProgress(); setShowResetConfirm(false); }}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Version Log (T15) */}
      <AnimatePresence>
        {versionLogOpen && (
          <VersionLogModal
            T={T} isDark={isDark} isZh={isZh}
            onClose={() => setVersionLogOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────
function OverviewSection({ T, isDark, isZh, progress, sc, levelStats, currentStageId, currentLevelId, weakIntervals, weakNotes }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Curriculum path */}
      <div style={{
        padding: "14px 16px", borderRadius: 16,
        background: T.surface1, border: `0.5px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {isZh ? "训练路径" : "TRAINING PATH"}
        </div>
        {CURRICULUM.stages.map((stage, si) => {
          const scc         = STAGE_COLORS[stage.id];
          const isCurrentStg = stage.id === currentStageId;
          const passedLevels = stage.levels.filter(l => levelStats[l.id]?.passed).length;
          return (
            <div key={stage.id} style={{ marginBottom: si < 2 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{stage.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: isCurrentStg ? 700 : 500, color: isCurrentStg ? scc.primary : T.textSecondary }}>
                    {isZh ? `Stage ${stage.id} — ${stage.titleZh}` : `Stage ${stage.id} — ${stage.title}`}
                  </span>
                  {isCurrentStg && (
                    <span style={{ padding: "1px 6px", borderRadius: 5, background: `${scc.primary}20`, color: scc.primary, fontSize: 8, fontWeight: 800 }}>
                      {isZh ? "当前" : "NOW"}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: T.textTertiary }}>{passedLevels}/{stage.levels.length}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {stage.levels.map(level => {
                  const isPassed   = levelStats[level.id]?.passed;
                  const isCurrent  = level.id === currentLevelId;
                  const isUnlocked = (progress.unlockedLevels || ["1-1"]).includes(level.id);
                  return (
                    <div key={level.id} style={{
                      flex: 1, height: 6, borderRadius: 3,
                      background: isPassed ? scc.primary
                        : isCurrent ? `${scc.primary}60`
                        : isUnlocked ? `${scc.primary}25`
                        : T.surface3,
                    }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weak spots */}
      {(weakIntervals.length > 0 || weakNotes.length > 0) ? (
        <div style={{
          padding: "14px 16px", borderRadius: 16,
          background: "rgba(255,69,58,0.08)", border: "0.5px solid rgba(255,69,58,0.22)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FF453A", marginBottom: 10 }}>
            ⚠ {isZh ? "需要重点练习" : "Needs Work"}
          </div>
          {weakIntervals.length > 0 && (
            <div style={{ marginBottom: weakNotes.length > 0 ? 10 : 0 }}>
              <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 6 }}>
                {isZh ? "音程弱点" : "Interval weaknesses"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {weakIntervals.map(iv => (
                  <span key={iv} style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: "rgba(255,69,58,0.14)", border: "0.5px solid rgba(255,69,58,0.25)",
                    fontSize: 12, fontWeight: 700, color: "#FF453A",
                  }}>
                    {iv}
                  </span>
                ))}
              </div>
            </div>
          )}
          {weakNotes.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 6 }}>
                {isZh ? "音符弱点" : "Note weaknesses"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {weakNotes.slice(0, 8).map(key => {
                  const parts     = key.split("-");
                  const strIdx    = parseInt(parts[0].slice(1));
                  const fret      = parseInt(parts[1].slice(1));
                  const strNames  = ["E", "A", "D", "G", "B", "e"];
                  return (
                    <span key={key} style={{
                      padding: "4px 10px", borderRadius: 8,
                      background: "rgba(255,69,58,0.14)", border: "0.5px solid rgba(255,69,58,0.25)",
                      fontSize: 12, fontWeight: 700, color: "#FF453A",
                    }}>
                      {strNames[strIdx]}{fret}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: 16, borderRadius: 16, textAlign: "center",
          background: "rgba(52,199,89,0.08)", border: "0.5px solid rgba(52,199,89,0.22)",
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#34C759" }}>
            {isZh ? "暂无弱点数据" : "No weakness data yet"}
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 4 }}>
            {isZh ? "开始练习后，这里会显示专项改进点" : "Start practicing to see personalized improvement areas"}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Note Heatmap Section ──────────────────────────────────────
function NoteHeatmapSection({ T, isDark, isZh, progress }) {
  const grid      = progress.noteHeatmapGrid;
  const strNames  = ["E", "A", "D", "G", "B", "e"];
  const hasData   = grid && grid.some(row => row.some(cell => cell !== null));

  const getColor = (cell) => {
    if (!cell) return isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const v = cell.accuracy;
    if (v >= 0.8) return `rgba(52,199,89,${0.25 + v * 0.45})`;
    if (v >= 0.6) return `rgba(255,159,10,${0.30 + v * 0.40})`;
    return `rgba(255,69,58,${0.30 + (1 - v) * 0.45})`;
  };

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 16,
      background: T.surface1, border: `0.5px solid ${T.border}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 12, textTransform: "uppercase" }}>
        {isZh ? "音符准确率热力图" : "NOTE ACCURACY HEATMAP"}
      </div>
      {hasData ? (
        <>
          <div style={{ display: "flex", paddingLeft: 22, gap: 2, marginBottom: 4 }}>
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: T.textTertiary }}>{i}</div>
            ))}
          </div>
          {(grid || []).map((row, si) => (
            <div key={si} style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
              <div style={{ width: 18, fontSize: 9, color: T.textTertiary, textAlign: "center" }}>{strNames[si]}</div>
              {row.map((cell, fi) => (
                <div key={fi}
                  title={cell ? `${Math.round(cell.accuracy * 100)}% (${cell.attempts} tries)` : "No data"}
                  style={{ flex: 1, height: 18, borderRadius: 3, background: getColor(cell) }}
                />
              ))}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingLeft: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,69,58,0.6)" }} />
              <span style={{ fontSize: 9, color: T.textTertiary }}>{isZh ? "弱" : "Weak"} &lt;60%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,159,10,0.6)" }} />
              <span style={{ fontSize: 9, color: T.textTertiary }}>60–80%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(52,199,89,0.7)" }} />
              <span style={{ fontSize: 9, color: T.textTertiary }}>{isZh ? "强" : "Strong"} &gt;80%</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 13, color: T.textTertiary }}>
            {isZh ? "练习 Notes 后，这里会显示你的音符掌握情况" : "Practice Notes to see your note mastery map"}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Interval Stats Section ────────────────────────────────────
function IntervalStatsSection({ T, isDark, isZh, stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div style={{
        padding: "32px 16px", textAlign: "center",
        background: T.surface1, border: `0.5px solid ${T.border}`, borderRadius: 16,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
        <div style={{ fontSize: 13, color: T.textTertiary }}>
          {isZh ? "练习 Intervals 后查看反应速度和准确率分析" : "Practice Intervals to see reaction time & accuracy analysis"}
        </div>
      </div>
    );
  }

  const maxMs = Math.max(...stats.map(s => s.avgMs || 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 4, textTransform: "uppercase" }}>
        {isZh ? "音程反应速度" : "INTERVAL REACTION SPEED"}
      </div>
      {stats.map((s, i) => {
        const accColor = s.accuracy >= 0.8 ? "#34C759" : s.accuracy >= 0.6 ? "#FF9F0A" : "#FF453A";
        return (
          <motion.div key={s.interval}
            initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            style={{
              padding: "12px 14px", borderRadius: 12,
              background: T.surface1, border: `0.5px solid ${T.border}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, minWidth: 32 }}>{s.interval}</span>
                <span style={{ fontSize: 11, color: T.textTertiary }}>{s.attempts} {isZh ? "次" : "tries"}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: accColor }}>{Math.round(s.accuracy * 100)}%</span>
                {s.avgMs > 0 && (
                  <span style={{ fontSize: 10, color: T.textTertiary }}>{Math.round(s.avgMs)}ms</span>
                )}
              </div>
            </div>
            {s.avgMs > 0 && (
              <div style={{ height: 3, borderRadius: 2, background: T.surface3, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.avgMs / maxMs) * 100}%` }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%", borderRadius: 2,
                    background: s.avgMs < 1500 ? "#34C759" : s.avgMs < 3000 ? "#FF9F0A" : "#FF453A",
                  }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────
function SettingsPanel({ T, isDark, isZh, lang, settings, onChangeLang, onToggleTheme, onResetProgress, onSettingsChange }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 16, marginBottom: 4,
      background: T.surface1, border: `0.5px solid ${T.border}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {isZh ? "设置" : "SETTINGS"}
      </div>

      {/* Language */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 8 }}>
          {isZh ? "语言 / Language" : "Language / 语言"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "zh", label: "中文" }, { id: "en", label: "English" }, { id: "mixed", label: "中英" }].map(opt => (
            <button key={opt.id} onClick={() => onChangeLang && onChangeLang(opt.id)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
              background: lang === opt.id ? T.accent : T.surface2,
              color: lang === opt.id ? "#fff" : T.textSecondary,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 8 }}>
          {isZh ? "主题" : "Theme"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ dark: true, label: isZh ? "深色" : "Dark", icon: "🌙" }, { dark: false, label: isZh ? "浅色" : "Light", icon: "☀️" }].map(opt => (
            <button key={String(opt.dark)} onClick={onToggleTheme} style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
              background: isDark === opt.dark ? T.accent : T.surface2,
              color: isDark === opt.dark ? "#fff" : T.textSecondary,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: T.border, marginBottom: 12 }} />

      {/* Developer - Version Log (T15) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {isZh ? "开发者" : "Developer"}
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("openVersionLog"))} style={{
          width: "100%", padding: 10, borderRadius: 10, border: "none",
          background: T.surface2, color: T.textSecondary,
          fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>{isZh ? "版本记录" : "Version Log"}</span>
          <span style={{ opacity: 0.5 }}>›</span>
        </button>
      </div>

      <button onClick={onResetProgress} style={{
        width: "100%", padding: 10, borderRadius: 10, border: "none",
        background: "rgba(255,69,58,0.10)", color: "#FF453A",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
      }}>
        {isZh ? "重置所有训练数据" : "Reset all training data"}
      </button>
    </div>
  );
}

// ── Reset Confirm Modal ───────────────────────────────────────
function ResetConfirmModal({ T, isDark, isZh, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surface1, borderRadius: 20, padding: 24,
          width: "100%", maxWidth: 320, border: `0.5px solid ${T.borderHi}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, textAlign: "center", margin: "0 0 10px", fontFamily: FONT_DISPLAY }}>
          {isZh ? "确认重置？" : "Reset everything?"}
        </h3>
        <p style={{ fontSize: 13, color: T.textSecondary, textAlign: "center", margin: "0 0 20px", lineHeight: 1.55 }}>
          {isZh ? "所有训练数据、进度和热力图将被清空，无法恢复。" : "All training data, progress, and heatmaps will be permanently erased."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 12, border: `0.5px solid ${T.border}`,
            background: T.surface2, color: T.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            {isZh ? "取消" : "Cancel"}
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 12, border: "none",
            background: "#FF453A", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            {isZh ? "重置" : "Reset"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Version Log Modal (T15) ─────────────────────────────────────
function VersionLogModal({ T, isDark, isZh, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surface1, borderRadius: 20, padding: 24,
          width: "100%", maxWidth: 380, border: `0.5px solid ${T.borderHi}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "80vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, margin: 0, fontFamily: FONT_DISPLAY }}>
            {isZh ? "版本记录" : "Version Log"}
          </h3>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 14,
            background: T.surface2, border: `0.5px solid ${T.border}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke={T.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: `${T.accent}12`, border: `0.5px solid ${T.accent}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
            Blueprint
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
            v10.1 COMPLETE
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>
            2026-03-05
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {isZh ? "代码版本" : "Code Versions"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {VERSION_LOGS.map((log, i) => (
            <div key={i} style={{
              padding: "10px 12px", borderRadius: 10,
              background: T.surface2, border: `0.5px solid ${T.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    padding: "2px 6px", borderRadius: 4,
                    background: T.accent, color: "#fff",
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {log.code}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                    v{log.version}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: T.textTertiary }}>
                  {log.date}
                </span>
              </div>
              <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 6 }}>
                {log.note}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: "100%", marginTop: 20, padding: 12, borderRadius: 12, border: "none",
          background: T.accent, color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
          {isZh ? "关闭" : "Close"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---
// PROF.4.1 — 2026-03-05
//
// Updated:
// - T15: 新增版本记录入口 (Settings → Developer → Version Log)
// - VERSION_LOGS 数据已包含所有模块版本
// - 通过 CustomEvent "openVersionLog" 触发
//
// Fixed:
// - 版本记录弹窗 UI 符合 Blueprint 规范
//
// Pending:
// - T9: PersonaView STAGE_COLORS 三色修复（蓝/紫/橙 → 单色透明度）
// - T13: PersonaView 五维图线框化
// ---
