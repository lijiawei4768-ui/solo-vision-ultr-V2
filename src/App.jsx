// ─────────────────────────────────────────────────────────────
// SOLO VISION ULTRA — Root App Component
// Pre-flight gating → Main App with 5-tab navigation
//
// v2.3 修复:
//   • TAB_TITLES 完整 6-tab × 3-lang 映射（修复"我的训练"一刀切 bug）
//   • header 仅在 home/persona 渲染（修复 trainer 页面标题透出 bug）
//   • TabBar 始终渲染（删除 trainerCCOpen 条件，修复进入 interval 后无法切页 bug）
//   • trainer 内容区 paddingBottom 为 TabBar 留空间（修复 BottomBar 被遮挡 bug）
//   • 删除 trainerCCOpen / setTrainerCCOpen（不再需要）
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
  colorMode:        "dark",
  themeId:          "violet-deep",
};

// ── Tab 标题完整映射（6 tabs × 3 langs）────────────────────────
// lang: "en" | "zh" | "mixed"
const TAB_TITLES = {
  home:     { en: "Home",       zh: "首页",    mixed: "Home" },
  note:     { en: "Notes",      zh: "单音",    mixed: "单音" },
  interval: { en: "Intervals",  zh: "音程",    mixed: "音程" },
  changes:  { en: "Changes",    zh: "和弦进行", mixed: "Changes" },
  scale:    { en: "Scales",     zh: "音阶",    mixed: "Scales" },
  persona:  { en: "Me",         zh: "我",      mixed: "Me" },
};

// trainer tabs 不显示 App header，内容区也不需要侧边 padding
const TRAINER_TABS = new Set(["note", "interval", "changes", "scale"]);

function loadSettings() {
  try {
    const raw = localStorage.getItem("svultra_settings");
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
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
  const [startOnboardingWithTuner, setStartOnboardingWithTuner] = useState(false);
  const [mainPageIndex, setMainPageIndex] = useState(0);

  const verticalSwipe = { onTouchStart: () => {}, onTouchEnd: () => {}, onMouseDown: () => {}, onMouseUp: () => {} };

  const [lang, setLangState] = useState(loadLang);
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("svultra_lang", l); } catch {}
  }, []);
  const langCtxValue = { lang, setLang };

  const historyData    = usePracticeHistory();
  const progressSystem = useProgressSystem();

  const T      = getTokensForTheme(settings.themeId ?? "violet-deep");
  const isDark = T.themeDark;

  useEffect(() => {
    try { localStorage.setItem("svultra_settings", JSON.stringify(settings)); }
    catch {}
  }, [settings]);

  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) setAudioEnabled(false);
    setActiveTab(tab);
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
    setActiveTab("home");
  }, []);

  const handleSettings = useCallback((next) => setSettings(next), []);

  const swipe = useSwipe(() => setCcOpen(true), null);

  const themeCtxValue = {
    dark:   isDark,
    tokens: T,
    toggle: () => setSettings(s => ({
      ...s,
      themeId:   isDark ? "ios-light" : "violet-deep",
      colorMode: isDark ? "light"     : "dark",
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

  // ── 当前 tab 是否为训练器 ────────────────────────────────────
  const isTrainerTab = TRAINER_TABS.has(activeTab);

  // ── 当前 tab 标题（支持 en / zh / mixed）────────────────────
  const pageTitle = TAB_TITLES[activeTab]?.[lang] ?? TAB_TITLES[activeTab]?.en ?? activeTab;

  return (
    <LangContext.Provider value={langCtxValue}>
      <ThemeContext.Provider value={themeCtxValue}>
        <CalibContext.Provider value={calibCtxValue}>
          <ToastProvider>
            <div
              {...swipe}
              {...(!isTrainerTab && activeTab === "home" ? verticalSwipe : {})}
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

              {/* ── 内容层 ────────────────────────────────────────────
                  trainer tabs:
                    • 不要侧边 padding（指板需要贴边）
                    • paddingBottom 为 TabBar 留出空间（~72px）
                    • overflow: hidden
                  home/persona tabs:
                    • 保留 px-20 侧边 padding
                    • home: overflow auto（可滚动）
              ─────────────────────────────────────────────────────── */}
              <div style={isTrainerTab ? {
                maxWidth: 560, margin: "0 auto",
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
                paddingTop: "env(safe-area-inset-top, 0px)",
                // TabBar 约 68px 高 + safe area bottom
                paddingBottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
                position: "relative", zIndex: 1,
                overflow: "hidden",
              } : {
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

                {/* ── App Header — 仅在 home / persona 显示 ──────── */}
                {!isTrainerTab && (
                  <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: 72,
                    flexShrink: 0,
                  }}>
                    <motion.div
                      layoutId="app-title"
                      style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: T.textPrimary, fontFamily: FONT_DISPLAY }}
                    >
                      {pageTitle}
                    </motion.div>
                    <div style={{ display: "flex", gap: 8 }}>
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
                )}

                {/* ── 页面内容 ────────────────────────────────────── */}
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

              {/* ── TabBar — 始终渲染，z-index:40 高于所有内容层 ─── */}
              <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

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
// APP.2.3 — 2026-03-09
//
// Updated:
// - TAB_TITLES 完整 6-tab × 3-lang 映射（en/zh/mixed 全部正确）
// - App header 仅在 home/persona 渲染（trainer 页面不显示"我的训练"等标题）
// - TabBar 始终渲染（删除 trainerCCOpen 条件，进入任何 trainer 都能切换 tab）
// - trainer 内容区 paddingBottom 为 TabBar 留出空间，消除 BottomBar 被遮挡问题
// - 删除 trainerCCOpen / setTrainerCCOpen 状态（不再需要）
// - IntervalTrainer 删除 onCCChange prop（不再传递）
//
// Fixed:
// - bug: 进入 interval trainer 后 TabBar 消失，无法切换页面
// - bug: 所有非 home 页面都显示"我的训练"，忽略实际 tab
// - bug: "我的训练" + ☀️ + ⚙️ 从训练器页面透出来
//
// Pending:
// - trainer 内容区 paddingBottom 用了固定 68px，未来可改为 CSS var
// ---
