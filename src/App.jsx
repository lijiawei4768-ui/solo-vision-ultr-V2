
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { DT, FONT_DISPLAY, FONT_TEXT, getTokensForTheme, getTokensV2, PRESETS, LEGACY_TO_PRESET } from "./theme";
import { ThemeContext, CalibContext } from "./contexts";
import { LangContext } from "./i18n";
import { INSTRUMENTS } from "./constants";
import { ToastProvider } from "./components/Toast";
import { TabBar } from "./components/TabBar";
import { MeshBackground } from "./components/MeshBackground";
import { SettingsSheet, TuningSheet, CalibrationSheet } from "./components/ControlCenter";
import { ThemePickerSheet } from "./components/ThemePickerSheet";
import { FullSettingsSheet } from "./components/FullSettingsSheet";
import { usePracticeHistory } from "./hooks/usePracticeHistory";
import { useProgressSystem } from "./hooks/useProgressSystem";

import { HomeView } from "./views/HomeView";
import { PersonaView } from "./views/PersonaView";
import { PreFlightView } from "./views/PreFlightView";
import { OnboardingView } from "./views/OnboardingView";
import { TunerView } from "./views/TunerView";

import { NoteTrainer } from "./trainers/NotesTrainer";
import { IntervalTrainer } from "./trainers/IntervalsTrainer";
import { ChangesTrainer } from "./trainers/ChangesTrainer";
import { ScaleTrainer } from "./trainers/ScalesTrainer";

export { ThemeContext, useTheme, CalibContext, useCalib } from "./contexts";

const DEFAULT_SETTINGS = {
  instrument: "6-String Guitar",
  tuning: INSTRUMENTS["6-String Guitar"].defaultTuning,
  minFret: 0,
  maxFret: 12,
  leftHanded: false,
  showNoteNames: true,
  showAllPositions: false,
  sensitivity: 0.01,
  colorMode: "light",
  themeId: "svu-light",
};

const TAB_TITLES = {
  home: { en: "Home", zh: "首页", mixed: "Home" },
  note: { en: "Notes", zh: "单音", mixed: "单音" },
  interval: { en: "Intervals", zh: "音程", mixed: "音程" },
  changes: { en: "Changes", zh: "和弦进行", mixed: "Changes" },
  scale: { en: "Scales", zh: "音阶", mixed: "Scales" },
  persona: { en: "Me", zh: "我", mixed: "Me" },
};

const TRAINER_TABS = new Set(["note", "interval", "changes", "scale"]);

function loadSettings() {
  try {
    const raw = localStorage.getItem("svultra_settings");
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    if (!saved.themeId) {
      saved.themeId = saved.colorMode === "light" ? "svu-light" : "indigo-night";
    }
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
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

function loadAxis(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function saveAxis(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function loadMaterialTuning() {
  try {
    const raw = localStorage.getItem("svultra_material_tuning");
    if (!raw) {
      return {
        blurOffset: 0,
        saturateBoost: 0,
        alphaShift: 0,
        borderBoost: 1,
        shadowBoost: 1,
      };
    }
    return {
      blurOffset: 0,
      saturateBoost: 0,
      alphaShift: 0,
      borderBoost: 1,
      shadowBoost: 1,
      ...JSON.parse(raw),
    };
  } catch {
    return {
      blurOffset: 0,
      saturateBoost: 0,
      alphaShift: 0,
      borderBoost: 1,
      shadowBoost: 1,
    };
  }
}

function loadCustomAccentScheme() {
  try {
    const raw = localStorage.getItem("svultra_custom_accent_scheme");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function migrateSettings() {
  try {
    if (localStorage.getItem("svultra_bg")) return;
    const settings = JSON.parse(localStorage.getItem("svultra_settings") || "{}");
    const themeId = settings.themeId || "svu-light";
    const preset = LEGACY_TO_PRESET[themeId] ?? LEGACY_TO_PRESET["svu-light"];
    if (!preset) return;
    localStorage.setItem("svultra_bg", preset.bgScheme);
    localStorage.setItem("svultra_accent", preset.accentId);
    localStorage.setItem("svultra_surface", preset.surfaceId);
  } catch {}
}

migrateSettings();

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [calibData, setCalibData] = useState(loadCalib);
  const [activeTab, setActiveTab] = useState("home");
  const [ccOpen, setCcOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tuningOpen, setTuningOpen] = useState(false);
  const [trainerTunerOpen, setTrainerTunerOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(loadHasSeenOnboarding);
  const [startOnboardingWithTuner, setStartOnboardingWithTuner] = useState(false);
  const [mainPageIndex, setMainPageIndex] = useState(0);

  const [bgScheme, setBgScheme] = useState(() => loadAxis("svultra_bg", "frost-light"));
  const [accentId, setAccentId] = useState(() => loadAxis("svultra_accent", "indigo"));
  const [surfaceId, setSurfaceId] = useState(() => loadAxis("svultra_surface", "glass-mid"));
  const [materialTuning, setMaterialTuning] = useState(loadMaterialTuning);
  const [customAccentScheme, setCustomAccentScheme] = useState(loadCustomAccentScheme);

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [fullSettingsOpen, setFullSettingsOpen] = useState(false);

  const [lang, setLangState] = useState(loadLang);
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("svultra_lang", l); } catch {}
  }, []);
  const langCtxValue = { lang, setLang };

  const historyData = usePracticeHistory();
  const progressSystem = useProgressSystem();

  const T = (bgScheme && accentId && surfaceId)
    ? getTokensV2({
        bgScheme,
        accentId,
        surfaceId,
        materialTuning,
        accentOverride: accentId === "custom" ? customAccentScheme : null,
      })
    : getTokensForTheme(settings.themeId ?? "svu-light");
  const isDark = T.themeDark;

  const handleSelectBg = (id) => { setBgScheme(id); saveAxis("svultra_bg", id); };
  const handleSelectAccent = (id) => { setAccentId(id); saveAxis("svultra_accent", id); };
  const handleSelectSurface = (id) => { setSurfaceId(id); saveAxis("svultra_surface", id); };
  const handleSelectPreset = (presetId) => {
    const preset = PRESETS[presetId];
    if (!preset) return;
    handleSelectBg(preset.bgScheme);
    handleSelectAccent(preset.accentId);
    handleSelectSurface(preset.surfaceId);
  };
  const handleMaterialTuning = useCallback((next) => {
    setMaterialTuning((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem("svultra_material_tuning", JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  }, []);
  const handleApplyCustomAccentScheme = useCallback((scheme) => {
    setCustomAccentScheme(scheme);
    try { localStorage.setItem("svultra_custom_accent_scheme", JSON.stringify(scheme)); } catch {}
    setAccentId("custom");
    saveAxis("svultra_accent", "custom");
  }, []);

  useEffect(() => {
    try { localStorage.setItem("svultra_settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) setAudioEnabled(false);
    setActiveTab(tab);
    if (tab === "home") setMainPageIndex(0);
    else if (tab === "persona") setMainPageIndex(1);
  }, [activeTab]);

  const handleCalibComplete = useCallback((data) => {
    setCalibData(data);
    try { localStorage.setItem("svultra_calib", JSON.stringify(data)); } catch {}
  }, []);

  const handleRecalibrate = useCallback(() => {
    setCalibData(null);
    try { localStorage.removeItem("svultra_calib"); } catch {}
    setSettingsOpen(false);
    setCcOpen(false);
    setTrainerTunerOpen(false);
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
    setTrainerTunerOpen(false);
    setActiveTab("home");
  }, []);

  const handleSettings = useCallback((next) => setSettings(next), []);

  const themeCtxValue = {
    dark: isDark,
    tokens: T,
    toggle: () => {
      if (isDark) {
        handleSelectBg("frost-light");
        handleSelectAccent("indigo");
      } else {
        handleSelectBg("mesh-indigo");
        handleSelectAccent("violet");
      }
    },
  };

  const calibCtxValue = {
    pitchOffset: calibData?.pitchOffset ?? 1.0,
    minRms: calibData?.noiseFloor ?? calibData?.minRms ?? (settings.sensitivity ?? 0.01),
  };

  const commonWrapper = (children) => (
    <LangContext.Provider value={langCtxValue}>
      <ThemeContext.Provider value={themeCtxValue}>
        <CalibContext.Provider value={calibCtxValue}>
          <div style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            background: T.surface0,
            color: T.textPrimary,
            fontFamily: FONT_TEXT,
            position: "relative",
            overflow: "hidden",
          }}>
            <MeshBackground />
            <ToastProvider>
              <div style={{
                maxWidth: 560,
                margin: "0 auto",
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingLeft: 20,
                paddingRight: 20,
                position: "relative",
                zIndex: 1,
                width: "100%",
                overflow: "hidden",
              }}>
                {children}
              </div>
            </ToastProvider>
          </div>
        </CalibContext.Provider>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );

  if (!hasSeenOnboarding) {
    return commonWrapper(
      <OnboardingView
        onComplete={() => { handleOnboardingComplete(); setStartOnboardingWithTuner(false); }}
        startWithTuner={startOnboardingWithTuner}
      />
    );
  }

  if (!calibData) {
    return commonWrapper(<PreFlightView onComplete={handleCalibComplete} settings={settings} />);
  }

  const isTrainerTab = TRAINER_TABS.has(activeTab);
  const pageTitle = TAB_TITLES[activeTab]?.[lang] ?? TAB_TITLES[activeTab]?.en ?? activeTab;

  return (
    <LangContext.Provider value={langCtxValue}>
      <ThemeContext.Provider value={themeCtxValue}>
        <CalibContext.Provider value={calibCtxValue}>
          <ToastProvider>
            <div style={{
              height: "100dvh",
              display: "flex",
              flexDirection: "column",
              background: T.surface0,
              color: T.textPrimary,
              fontFamily: FONT_TEXT,
              position: "relative",
              overflow: "hidden",
            }}>
              <MeshBackground />
              <style>{`
                .svu-hide-scrollbar {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .svu-hide-scrollbar::-webkit-scrollbar {
                  width: 0;
                  height: 0;
                  display: none;
                }
              `}</style>

              <div className={!isTrainerTab && (activeTab === "home" || activeTab === "persona") ? "svu-hide-scrollbar" : undefined} style={isTrainerTab ? {
                maxWidth: 560, margin: "0 auto",
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 20,
                paddingRight: 20,
                position: "relative", zIndex: 1,
                overflow: "hidden",
              } : {
                maxWidth: 560, margin: "0 auto",
                flex: 1,
                minHeight: 0,
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: (activeTab === "home" || activeTab === "persona")
                  ? "calc(env(safe-area-inset-bottom, 0px) + 104px)"
                  : "env(safe-area-inset-bottom, 0px)",
                paddingLeft: 20, paddingRight: 20,
                position: "relative", zIndex: 1,
                overflow: (activeTab === "home" || activeTab === "persona") ? "auto" : "hidden",
                WebkitOverflowScrolling: "touch",
              }}>
                {!isTrainerTab && (
                  <header style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: 72, flexShrink: 0,
                  }}>
                    <motion.div
                      layoutId="app-title"
                      style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: T.textPrimary, fontFamily: FONT_DISPLAY }}
                    >
                      {pageTitle}
                    </motion.div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        transition={DT.springSnap}
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
                        whileTap={{ scale: 0.88 }}
                        transition={DT.springSnap}
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

                <AnimatePresence mode="wait">
                  {activeTab === "home" && (
                    <HomeView key="home" settings={settings} historyData={historyData} onTabChange={handleTabChange} progress={progressSystem.progress} />
                  )}
                  {activeTab === "note" && (
                    <NoteTrainer
                      key="note"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                      onOpenTuner={() => setTrainerTunerOpen(true)}
                      onRecalibrate={handleRecalibrate}
                      onOpenSettings={() => setCcOpen(true)}
                    />
                  )}
                  {activeTab === "interval" && (
                    <IntervalTrainer
                      key="interval"
                      settings={settings}
                      onSettings={handleSettings}
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
                      onOpenTuner={() => setTrainerTunerOpen(true)}
                      onRecalibrate={handleRecalibrate}
                      onOpenSettings={() => setCcOpen(true)}
                    />
                  )}
                  {activeTab === "scale" && (
                    <ScaleTrainer
                      key="scale"
                      settings={settings}
                      audioEnabled={audioEnabled}
                      setAudioEnabled={setAudioEnabled}
                      onOpenTuner={() => setTrainerTunerOpen(true)}
                      onRecalibrate={handleRecalibrate}
                      onOpenSettings={() => setCcOpen(true)}
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

              <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

              <AnimatePresence>
                {trainerTunerOpen && (
                  <TunerView onClose={() => setTrainerTunerOpen(false)} />
                )}
              </AnimatePresence>

              <SettingsSheet
                open={ccOpen}
                onClose={() => setCcOpen(false)}
                settings={settings}
                onSettings={handleSettings}
                onOpenSettings={() => { setCcOpen(false); setSettingsOpen(true); }}
                onOpenTuning={() => { setCcOpen(false); setTuningOpen(true); }}
                onStartOnboarding={(withTuner) => { startOnboarding(Boolean(withTuner)); }}
                bgScheme={bgScheme}
                accentId={accentId}
                surfaceId={surfaceId}
                onOpenThemePicker={() => setThemePickerOpen(true)}
                onOpenFullSettings={() => setFullSettingsOpen(true)}
              />
              <CalibrationSheet
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                settings={settings}
                onSettings={handleSettings}
                onCalibrated={(offset) => handleCalibComplete({ pitchOffset: offset, minRms: settings.sensitivity ?? 0.01 })}
              />
              <TuningSheet
                open={tuningOpen}
                onClose={() => setTuningOpen(false)}
                settings={settings}
                onSettings={handleSettings}
              />
              <ThemePickerSheet
                isOpen={themePickerOpen}
                onClose={() => setThemePickerOpen(false)}
                bgScheme={bgScheme}
                accentId={accentId}
                surfaceId={surfaceId}
                onSelectBg={handleSelectBg}
                onSelectAccent={handleSelectAccent}
                onSelectSurface={handleSelectSurface}
                onSelectPreset={handleSelectPreset}
                materialTuning={materialTuning}
                onMaterialTuningChange={handleMaterialTuning}
                customAccentScheme={customAccentScheme}
                onApplyCustomAccentScheme={handleApplyCustomAccentScheme}
              />
              <FullSettingsSheet
                open={fullSettingsOpen}
                onClose={() => setFullSettingsOpen(false)}
                settings={settings}
                onSettings={handleSettings}
                bgScheme={bgScheme}
                accentId={accentId}
                surfaceId={surfaceId}
                onSelectBg={handleSelectBg}
                onSelectAccent={handleSelectAccent}
                onSelectSurface={handleSelectSurface}
                onSelectPreset={handleSelectPreset}
                materialTuning={materialTuning}
                onMaterialTuningChange={handleMaterialTuning}
                customAccentScheme={customAccentScheme}
                onApplyCustomAccentScheme={handleApplyCustomAccentScheme}
                onOpenTuning={() => { setFullSettingsOpen(false); setTuningOpen(true); }}
                onOpenSettings={() => { setFullSettingsOpen(false); setSettingsOpen(true); }}
                onStartOnboarding={startOnboarding}
                onResetProgress={progressSystem.resetProgress}
              />
            </div>
          </ToastProvider>
        </CalibContext.Provider>
      </ThemeContext.Provider>
    </LangContext.Provider>
  );
}
