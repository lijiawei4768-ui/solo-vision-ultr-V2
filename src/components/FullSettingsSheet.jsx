import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DT, FONT_TEXT, FONT_DISPLAY, FONT_MONO,
} from "../theme";
import { ThemeContext } from "../contexts";
import { INSTRUMENTS } from "../constants";
import { GlassToggle, GlassSlider, AccentChip } from "./ui";
import { ThreeAxisSections } from "./ThemePickerSheet";

function useT() { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark ?? false; }

function Section({ label, T, children, noBorder }) {
  return (
    <div style={{ marginBottom: noBorder ? 12 : 20 }}>
      {label && (
        <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontFamily: FONT_TEXT }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function NavRow({ label, sub, onClick, T, icon, danger }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "13px 16px", borderRadius: 14, textAlign: "left", cursor: "pointer",
        border: `0.5px solid ${danger ? (T.negative + '40') : T.border}`,
        background: danger ? (T.negative + '10') : T.surface1,
        fontFamily: FONT_TEXT, width: "100%",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: danger ? T.negative : T.textPrimary }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      <span style={{ fontSize: 16, color: danger ? T.negative : T.textTertiary }}>›</span>
    </motion.button>
  );
}

function AppearanceTab({
  T, isDark,
  bgScheme, accentId, surfaceId,
  onSelectBg, onSelectAccent, onSelectSurface, onSelectPreset,
  materialTuning, onMaterialTuningChange,
  customAccentScheme, onApplyCustomAccentScheme,
}) {
  return (
    <div>
      <ThreeAxisSections
        T={T}
        isDark={isDark}
        bgScheme={bgScheme}
        accentId={accentId}
        surfaceId={surfaceId}
        onSelectBg={onSelectBg}
        onSelectAccent={onSelectAccent}
        onSelectSurface={onSelectSurface}
        onSelectPreset={onSelectPreset}
        materialTuning={materialTuning}
        onMaterialTuningChange={onMaterialTuningChange}
        customAccentScheme={customAccentScheme}
        onApplyCustomAccentScheme={onApplyCustomAccentScheme}
        includePresets={false}
        compact
      />
    </div>
  );
}

function GuitarTab({ T, settings, onSettings, onOpenTuning }) {
  return (
    <div>
      <Section label="乐器 Instrument" T={T}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {Object.keys(INSTRUMENTS).map((name) => (
            <AccentChip key={name} active={settings.instrument === name}
              onClick={() => onSettings({ ...settings, instrument: name, tuning: INSTRUMENTS[name].defaultTuning })}>
              {name}
            </AccentChip>
          ))}
        </div>
      </Section>

      <Section label="调音 Tuning" T={T}>
        {onOpenTuning && (
          <NavRow label="调音方案" sub="更改吉他调音" onClick={onOpenTuning} T={T} icon="🎸" />
        )}
      </Section>

      <Section label="显示 Display" T={T}>
        <GlassToggle value={settings.leftHanded} onChange={(v) => onSettings({ ...settings, leftHanded: v })} label="左手模式 Left-Handed" />
        <GlassToggle value={settings.showNoteNames} onChange={(v) => onSettings({ ...settings, showNoteNames: v })} label="显示音名 Show Note Names" />
        <GlassToggle value={settings.showAllPositions} onChange={(v) => onSettings({ ...settings, showAllPositions: v })} label="显示全部位置 Show All Positions" />
      </Section>

      <Section label="品格范围 Fret Range" T={T}>
        <GlassSlider min={0} max={12} value={settings.minFret} label="Min Fret"
          onChange={(v) => onSettings({ ...settings, minFret: Math.min(v, settings.maxFret - 1) })} />
        <GlassSlider min={1} max={15} value={settings.maxFret} label="Max Fret"
          onChange={(v) => onSettings({ ...settings, maxFret: Math.max(v, settings.minFret + 1) })} />
      </Section>
    </div>
  );
}

function AudioTab({ T, settings, onSettings, onOpenCalib, onStartOnboarding }) {
  return (
    <div>
      <Section label="拾音 Detection" T={T}>
        <GlassSlider min={0.001} max={0.05} step={0.001} value={settings.sensitivity ?? 0.01} label="灵敏度 Sensitivity"
          onChange={(v) => onSettings({ ...settings, sensitivity: v })} />
      </Section>

      <Section label="维护 Maintenance" T={T}>
        <NavRow label="重新校准" sub="重新运行麦克风校准" onClick={onOpenCalib} T={T} icon="🎛" />
        <NavRow label="重新开始引导" sub="引导 → 调音器 → 校准" onClick={() => onStartOnboarding?.(true)} T={T} icon="🎯" />
      </Section>
    </div>
  );
}

function AboutTab({ T, onResetProgress }) {
  const [aiEntries, setAiEntries] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/memory-bank/ai_changes.json')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setAiEntries(Array.isArray(data) ? data.reverse() : []);
      })
      .catch(() => { if (mounted) setAiEntries([]); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <Section label="版本 Version" T={T}>
        <div style={{ padding: '14px 16px', borderRadius: 14, background: T.surface1, border: `0.5px solid ${T.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginBottom: 4 }}>Solo Vision Ultra</div>
          <div style={{ fontSize: 12, color: T.textTertiary, fontFamily: FONT_TEXT }}>Two-Point Intervallic Functions Method</div>
          <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_MONO, marginTop: 6 }}>v6.0 · Theme System v2.0</div>
        </div>
      </Section>

      <Section label="开发者 Developer" T={T}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setAiOpen((o) => !o)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderRadius: 14, border: `0.5px solid ${T.border}`, background: T.surface1, cursor: 'pointer', width: '100%' }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary, fontFamily: FONT_TEXT }}>AI 修改记录</div>
            <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>查看所有 AI 代码变更</div>
          </div>
          <span style={{ fontSize: 12, color: T.accent, fontFamily: FONT_TEXT }}>{aiOpen ? '收起' : '展开'}</span>
        </motion.button>

        <AnimatePresence>
          {aiOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '10px 14px', borderRadius: 12, background: T.surface2, border: `0.5px solid ${T.border}`, marginTop: 4 }}>
                {Array.isArray(aiEntries) && aiEntries.length > 0 ? (
                  aiEntries.slice(0, 6).map((e, i) => (
                    <div key={e.id ?? i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: T.textTertiary }}>{new Date(e.timestamp).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 6, whiteSpace: 'pre-wrap' }}>{e.summary}</div>
                      {e.details && (
                        <details style={{ marginTop: 6 }}>
                          <summary style={{ fontSize: 12, color: T.accent, cursor: 'pointer' }}>阅读全文</summary>
                          <div style={{ marginTop: 8, fontSize: 12, color: T.textSecondary, whiteSpace: 'pre-wrap' }}>{e.details}</div>
                        </details>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: T.textTertiary }}>暂无记录</div>
                )}
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <a href="/memory-bank/ai_changes.json" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.accent }}>打开完整记录</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section label="危险操作 Danger Zone" T={T}>
        {!confirmReset ? (
          <NavRow label="重置所有训练数据" sub="所有进度、热力图将被清空" onClick={() => setConfirmReset(true)} T={T} danger icon="⚠️" />
        ) : (
          <div style={{ padding: '14px 16px', borderRadius: 14, background: T.negative + '12', border: `0.5px solid ${T.negative}40` }}>
            <div style={{ fontSize: 13, color: T.textPrimary, fontFamily: FONT_TEXT, marginBottom: 12 }}>确认重置所有训练数据？此操作不可撤销。</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setConfirmReset(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: `0.5px solid ${T.border}`, background: T.surface2, color: T.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_TEXT }}>
                取消
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { onResetProgress?.(); setConfirmReset(false); }}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: T.negative, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_TEXT }}>
                确认重置
              </motion.button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

const TABS = [
  { id: 'appearance', label: '外观' },
  { id: 'guitar', label: '吉他' },
  { id: 'audio', label: '音频' },
  { id: 'about', label: '关于' },
];

export function FullSettingsSheet({
  open, onClose,
  settings, onSettings,
  bgScheme, accentId, surfaceId,
  onSelectBg, onSelectAccent, onSelectSurface, onSelectPreset,
  materialTuning, onMaterialTuningChange,
  customAccentScheme, onApplyCustomAccentScheme,
  onOpenTuning,
  onOpenSettings,
  onStartOnboarding,
  onResetProgress,
}) {
  const T = useT();
  const isDark = useIsDark();
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    if (!open) setActiveTab('appearance');
  }, [open]);

  const backdropBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)';
  const sheetBg = isDark ? 'rgba(14,14,22,0.97)' : '#F2F2F7';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              background: backdropBg, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 1.1 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81,
              width: '100%', maxWidth: 560, margin: '0 auto',
              background: sheetBg,
              backdropFilter: isDark ? 'blur(56px)' : 'none',
              WebkitBackdropFilter: isDark ? 'blur(56px)' : 'none',
              borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(60,60,67,0.12)'}`,
              borderRadius: '24px 24px 0 0',
              boxShadow: isDark ? '0 -24px 80px rgba(0,0,0,0.55)' : '0 -8px 40px rgba(0,0,0,0.12)',
              maxHeight: '100dvh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, paddingBottom: 4, flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,67,0.22)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 12px', borderBottom: `0.5px solid ${T.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>全部设置</span>
              <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface2, border: `0.5px solid ${T.border}`, cursor: 'pointer' }}>
                <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'} strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div style={{
              display: 'flex', gap: 4, padding: '10px 20px 8px',
              borderBottom: `0.5px solid ${T.border}`, flexShrink: 0,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}>
              {TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '7px 16px', borderRadius: 20, border: 'none',
                    background: activeTab === tab.id ? T.accent : 'transparent',
                    color: activeTab === tab.id ? '#fff' : T.textSecondary,
                    fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT_TEXT,
                  }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 20px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: [0.32, 0, 0.22, 1] }}
                >
                  {activeTab === 'appearance' && (
                    <AppearanceTab T={T} isDark={isDark}
                      bgScheme={bgScheme} accentId={accentId} surfaceId={surfaceId}
                      onSelectBg={onSelectBg} onSelectAccent={onSelectAccent}
                      onSelectSurface={onSelectSurface} onSelectPreset={onSelectPreset}
                      materialTuning={materialTuning}
                      onMaterialTuningChange={onMaterialTuningChange}
                      customAccentScheme={customAccentScheme}
                      onApplyCustomAccentScheme={onApplyCustomAccentScheme}
                    />
                  )}
                  {activeTab === 'guitar' && (
                    <GuitarTab T={T} settings={settings} onSettings={onSettings} onOpenTuning={onOpenTuning} />
                  )}
                  {activeTab === 'audio' && (
                    <AudioTab T={T} settings={settings} onSettings={onSettings} onOpenCalib={onOpenSettings} onStartOnboarding={onStartOnboarding} />
                  )}
                  {activeTab === 'about' && (
                    <AboutTab T={T} onResetProgress={onResetProgress} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
