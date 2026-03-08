
// ─────────────────────────────────────────────────────────────
// SOLO VISION ULTRA — Root App Component
// Pre-flight gating → Main App with 5-tab navigation
//
// v2.2 新增：引导界面（Onboarding）流程
// Batch 2 主题系统：
//   • T = getTokensForTheme(settings.themeId)
//   • isDark = T.themeDark  ← 唯一来源，与 T tokens 永远同步
//   • settings.colorMode 已弃用（保留字段向后兼容旧存档）
//   • 深/浅切换 → ControlCenter 修改 themeId（"ios-light" = 浅色）
// ─────────────────────────────────────────────────────────────
import React, {
  useState, useEffect, useCallback
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import { DT, FONT_DISPLAY, FONT_TEXT, getTokensForTheme } from "./theme";
import { ThemeContext, CalibContext } from "./contexts";
import { LangContext } from "./i18n";
import { INSTRUMENTS } from "./constants";
import { ToastProvider } from "./components/Toast";
import { TabBar } from "./components/TabBar";
import { MeshBackground } from "./components/MeshBackground";
import { SettingsSheet, TuningSheet, CalibrationSheet } from "./components/ControlCenter";
import { usePracticeHistory } from "./hooks/usePracticeHistory";
import { useProgressSystem } from "./hooks/useProgressSystem";
import { useSwipe } from "./hooks/useGestures";

import { HomeView }      from "./views/HomeView";
import { PersonaView }   from "./views/PersonaView";
import { PreFlightView } from "./views/PreFlightView";
import { OnboardingView } from "./views/OnboardingView";

import { NoteTrainer }     from "./trainers/NotesTrainer";
import { IntervalTrainer } from "./trainers/IntervalsTrainer";
import { ChangesTrainer }  from "./trainers/ChangesTrainer";
import { ScaleTrainer }    from "./trainers/ScalesTrainer";

export { ThemeContext, useTheme, CalibContext, useCalib } from "./contexts";

// ── Default settings ─────────────────────────────────────────
const DEFAULT_SETTINGS = {
  instrument:       "6-String Guitar",
  tuning:           INSTRUMENTS["6-String Guitar"].defaultTuning,
  minFret:          0,
  maxFret:          12,
  leftHanded:       false,
  showNoteNames:    true,
  showAllPositions: false,
  sensitivity:      0.01,
  colorMode:        "dark",      // 保留字段（向后兼容旧存档，不再驱动 UI）
  themeId:          "violet-deep", // 主题唯一来源
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("svultra_settings");
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);

    // ── 向后兼容迁移：旧存档没有 themeId 字段 ──────────────
    // 旧 colorMode: "light" → 迁移为 ios-light 主题
    // 旧 colorMode: "dark"  → 迁移为 violet-deep 主题（默认）
    if (!saved.themeId) {
      saved.themeId = (saved.colorMode === "light") ? "ios-light" : "violet-deep";
    }
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch { return DEFAULT_SETTINGS; }
}

function loadCalib() {
  try {
    const raw = localStorage.getItem("svultra_calib");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function loadLang() {
  try {
    const raw = localStorage.getItem("svultra_lang");
    if (raw && ["mixed", "zh", "en"].includes(raw)) return raw;
  } catch {}
  return "mixed";
}

function loadHasSeenOnboarding() {
  try {
    return localStorage.getItem("svultra_onboarding_done") === "true";
  } catch {}
  return false;
}

// ─────────────────────────────────────────────────────────────
// MAIN APP SHELL
// ─────────────────────────────────────────────────────────────
export default function App() {



  const [settings,     setSettings]     = useState(loadSettings);
  const [calibData,    setCalibData]    = useState(loadCalib);
  const [activeTab,    setActiveTab]    = useState("home");
  const [ccOpen,       setCcOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tuningOpen,   setTuningOpen]   = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(loadHasSeenOnboarding);
  const [trainerCCOpen, setTrainerCCOpen] = useState(false);
  const [startOnboardingWithTuner, setStartOnboardingWithTuner] = useState(false);

  // Page index state for UI indicators only (no swipe navigation)
  const [mainPageIndex, setMainPageIndex] = useState(0);

  // Vertical swipe disabled - page navigation now via tabs/buttons only
  const verticalSwipe = { onTouchStart: () => {}, onTouchEnd: () => {}, onMouseDown: () => {}, onMouseUp: () => {} };

  const [lang, setLangState] = useState(loadLang);
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("svultra_lang", l); } catch {}
  }, []);
  const langCtxValue = { lang, setLang };

  const historyData    = usePracticeHistory();
  const progressSystem = useProgressSystem();

  // ── BUG FIX：T 是主题唯一来源，isDark 从 T 读取 ─────────────
  // 旧代码：isDark = settings.colorMode !== "light"  ← 与 T 断联
  // 新代码：isDark = T.themeDark                     ← 永远与 T 一致
  const T      = getTokensForTheme(settings.themeId ?? "violet-deep");
  const isDark = T.themeDark;

  // Persist settings
  useEffect(() => {
    try { localStorage.setItem("svultra_settings", JSON.stringify(settings)); }
    catch {}
  }, [settings]);

  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) setAudioEnabled(false);
    setActiveTab(tab);
    // Sync mainPageIndex for UI indicators when tab changes
    if (tab === "home") setMainPageIndex(0);
    else if (tab === "persona") setMainPageIndex(1);
  }, [activeTab]);

  const handleCalibComplete = useCallback((data) => {
    setCalibData(data);
    try { localStorage.setItem("svultra_calib", JSON.stringify(data)); }
    catch {}
  }, []);

  const handleRecalibrate = useCallback(() => {
    setCalibData(null);
    try { localStorage.removeItem("svultra_calib"); } catch {}
    setSettingsOpen(false);
    setCcOpen(false);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    try { localStorage.setItem("svultra_onboarding_done", "true"); } catch {}
  }, []);

  const startOnboarding = useCallback((withTuner = false) => {
    setStartOnboardingWithTuner(Boolean(withTuner));
    setHasSeenOnboarding(false);
    setCcOpen(false);
    setSettingsOpen(false);
    setTuningOpen(false);
    setTrainerCCOpen(false);
    setActiveTab("home");
  }, []);

  const handleSettings = useCallback((next) => setSettings(next), []);

  // Simple swipe handler for control center
  const swipe = useSwipe(() => setCcOpen(true), null);

  // ── ThemeContext：dark 与 tokens 来自同一个 T，永远同步 ────
  const themeCtxValue = {
    dark:   isDark,   // ← 来自 T.themeDark，与 tokens 同源
    tokens: T,
    // toggle：深色 ↔ 浅色（浅色 = ios-light，深色 = 回到 violet-deep）
    toggle: () => setSettings(s => ({
      ...s,
      themeId:   isDark ? "ios-light" : "violet-deep",
      colorMode: isDark ? "light"     : "dark",   // 保持 colorMode 字段同步
    })),
  };

  const calibCtxValue = {
    pitchOffset: calibData?.pitchOffset ?? 1.0,
    minRms:      calibData?.noiseFloor
               ?? calibData?.minRms
               ?? (settings.sensitivity ?? 0.01),
  };

  const commonWrapper = (children) => (
    <LangContext.Provider value={langCtxValue}>
      <ThemeContext.Provider value={themeCtxValue}>
        <CalibContext.Provider value={calibCtxValue}>
          <div style={{
            minHeight: "100dvh",
            background: T.surface0,
            color: T.textPrimary,
            fontFamily: FONT_TEXT,
            position: "relative",
            overflow: "hidden",
          }}>
            <MeshBackground />
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </CalibContext.Provider>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );

  if (!hasSeenOnboarding) {
    return commonWrapper(
      <OnboardingView onComplete={() => { handleOnboardingComplete(); setStartOnboardingWithTuner(false); }} startWithTuner={startOnboardingWithTuner} />
    );
  }

  if (!calibData) {
    return commonWrapper(
      <PreFlightView onComplete={handleCalibComplete} settings={settings} />
    );
  }

  return (
    <LangContext.Provider value={langCtxValue}>
      <ThemeContext.Provider value={themeCtxValue}>
        <CalibContext.Provider value={calibCtxValue}>
          <ToastProvider>
            <div
              {...swipe}
              {...(activeTab === "home" || activeTab === "persona" ? verticalSwipe : {})}
              style={{
                height: "100dvh",
                background: T.surface0,
                color: T.textPrimary,
                fontFamily: FONT_TEXT,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <MeshBackground dark={isDark} />

              {/* 内容层 - 根据页面类型决定是否可滚动 */}
              {/* 训练器页面 (interval/note/changes/scale) 禁止滚动，内容页面 (home/persona) 可滚动 */}
              <div style={{
                maxWidth: 560, margin: "0 auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingLeft: 20, paddingRight: 20,
                position: "relative", zIndex: 1,
                overflow: (activeTab === "home" || activeTab === "persona") ? "auto" : "hidden",
              }}>
                <header style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  height: 72,
                  flexShrink: 0,
                }}>
                  <motion.div
                    layoutId="app-title"
                    style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: T.textPrimary, fontFamily: FONT_DISPLAY }}
                  >
                    {activeTab === "home" ? (lang === "en" ? "Home" : "首页") : (lang === "en" ? "My Training" : "我的训练")}
                  </motion.div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* 深/浅切换：改 themeId，不改 colorMode */}
                    <motion.button
                      whileTap={{ scale: 0.88 }} transition={DT.springSnap}
                      onClick={themeCtxValue.toggle}
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: T.surface2, border: `0.5px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, cursor: "pointer",
                      }}
                    >
                      {isDark ? "☀️" : "🌙"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.88 }} transition={DT.springSnap}
                      onClick={() => setCcOpen(true)}
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: T.surface2, border: `0.5px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, cursor: "pointer",
                      }}
                    >
                      ⚙️
                    </motion.button>
                  </div>
                </header>

                {/* Page indicator dots for current tab */}
                <div style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 30,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  pointerEvents: "none",
                }}>
                  {[0, 1].map(idx => (
                    <div
                      key={idx}
                      style={{
                        width: mainPageIndex === idx ? 6 : 4,
                        height: mainPageIndex === idx ? 18 : 4,
                        borderRadius: 3,
                        background: mainPageIndex === idx
                          ? isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                          : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "home" && (
                    <HomeView
                      key="home"
                      settings={settings}
                      historyData={historyData}
                      onTabChange={handleTabChange}
                      progress={progressSystem.progress}
                    />
                  )}
                  {activeTab === "note" && (
                    <NoteTrainer
                      key="note"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                    />
                  )}
                  {activeTab === "interval" && (
                    <IntervalTrainer
                      key="interval"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                      onCCChange={setTrainerCCOpen}
                    />
                  )}
                  {activeTab === "changes" && (
                    <ChangesTrainer
                      key="changes"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                    />
                  )}
                  {activeTab === "scale" && (
                    <ScaleTrainer
                      key="scale"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                    />
                  )}
                  {activeTab === "persona" && (
                    <PersonaView
                      key="persona"
                      settings={settings}
                      onSettingsChange={handleSettings}
                      historyData={historyData}
                      calibData={calibData}
                      onRecalibrate={handleRecalibrate}
                      isDark={isDark}
                      onToggleTheme={themeCtxValue.toggle}
                      progress={progressSystem.progress}
                      onResetProgress={progressSystem.resetProgress}
                    />
                  )}
                </AnimatePresence>
              </div>

              {!trainerCCOpen && <TabBar activeTab={activeTab} onTabChange={handleTabChange} />}

              <SettingsSheet
                open={ccOpen} onClose={() => setCcOpen(false)}
                settings={settings} onSettings={handleSettings}
                onOpenSettings={() => { setCcOpen(false); setSettingsOpen(true); }}
                onOpenTuning={() => { setCcOpen(false); setTuningOpen(true); }}
                onStartOnboarding={(withTuner) => { startOnboarding(Boolean(withTuner)); }}
              />
              <CalibrationSheet
                open={settingsOpen} onClose={() => setSettingsOpen(false)}
                settings={settings} onSettings={handleSettings}
                onCalibrated={(offset) =>
                  handleCalibComplete({ pitchOffset: offset, minRms: settings.sensitivity ?? 0.01 })
                }
              />
              <TuningSheet
                open={tuningOpen} onClose={() => setTuningOpen(false)}
                settings={settings} onSettings={handleSettings}
              />
            </div>
          </ToastProvider>
        </CalibContext.Provider>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );
}



// ---
// APP.2.3 — 2026-03-05
//
// Updated:
// - 移除 import Showcase 和 return <Showcase /> 临时预览代码
// - App 恢复正常流程：Onboarding → PreFlight → Main
//
// Fixed:
// - App 被 Showcase 接管，无法看到实际 UI
//
// Pending:
// - onStartTuner 回调接入 TunerView 入口（T16 配合）
// ---
