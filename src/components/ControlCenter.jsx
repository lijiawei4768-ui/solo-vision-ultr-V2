import React, { useState, useCallback, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_TEXT, FONT_DISPLAY, FONT_MONO, BG_SCHEMES, ACCENT_SCHEMES, SURFACE_SCHEMES } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";
import { INSTRUMENTS, INTERVAL_LABELS } from "../constants";
import { BottomSheet, GlassCard, GlassToggle, GlassSlider, AccentChip } from "./ui";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { freqToCents, midiToNote, freqToMidi } from "../musicUtils";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const LANG_LABELS = { mixed: "中英混合", zh: "中文", en: "English" };
const LANG_KEYS = ["mixed", "zh", "en"];

function CurrentThemeRow({ T, isDark, bgScheme, accentId, surfaceId, onClick }) {
  const bg = BG_SCHEMES?.[bgScheme];
  const accent = ACCENT_SCHEMES?.[accentId];
  const surface = SURFACE_SCHEMES?.[surfaceId];
  const bgBase = bg?.base ?? T.surface0;
  const blobA = bg?.blobA ?? T.bg?.blobA ?? 'rgba(100,80,200,0.3)';
  const accentColor = accent?.accent ?? T.accent ?? '#5a5ad6';
  const surfaceName = surface?.nameZh ?? surface?.name ?? '标准玻璃';
  const bgName = bg?.nameZh ?? bg?.name ?? '背景';
  const accentName = accentId === 'custom' ? '自定义颜色' : (accent?.nameZh ?? accent?.name ?? '颜色');

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        borderRadius: 16,
        background: T.surface1,
        border: `0.5px solid ${T.border ?? 'rgba(110,120,180,0.14)'}`,
        backdropFilter: T.glass?.blur ?? 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: T.glass?.blur ?? 'blur(14px) saturate(160%)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: bgBase, position: 'relative', overflow: 'hidden',
        border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <div style={{ position: 'absolute', width: '90%', height: '90%', top: '-15%', left: '-15%', borderRadius: '50%', background: `radial-gradient(circle, ${blobA} 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: 5, right: 5, width: 9, height: 9, borderRadius: '50%', background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginBottom: 2 }}>
          {bgName} · {accentName}
        </div>
        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>
          {surfaceName} · 点击更换
        </div>
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textTertiary} strokeWidth="2" strokeLinecap="round">
        <polyline points="9,18 15,12 9,6" />
      </svg>
    </motion.div>
  );
}

function NavRow({ label, sub, onClick, T, icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "13px 16px", borderRadius: 14, textAlign: "left",
        cursor: "pointer", border: `0.5px solid ${T.border}`,
        background: T.surface1, fontFamily: FONT_TEXT, width: "100%",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      <span style={{ fontSize: 16, color: T.textTertiary }}>›</span>
    </motion.button>
  );
}

function Section({ label, T, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontFamily: FONT_TEXT }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

export function SettingsSheet({
  open, onClose,
  settings, onSettings,
  onOpenSettings,
  onOpenTuning,
  onStartOnboarding,
  bgScheme, accentId, surfaceId,
  onOpenThemePicker,
  onOpenFullSettings,
}) {
  const T = useT();
  const themeCtx = useContext(ThemeContext);
  const { lang, setLang } = useLang();
  const isDark = themeCtx?.dark ?? true;

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
              position: 'fixed', inset: 0, zIndex: 60,
              background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={DT.spring}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
              width: 'calc(100% - 16px)', maxWidth: 560, margin: '0 auto 8px',
              background: isDark ? 'rgba(18,18,22,0.97)' : '#F2F2F7',
              backdropFilter: isDark ? DT.blur3 : 'none',
              WebkitBackdropFilter: isDark ? DT.blur3 : 'none',
              borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(60,60,67,0.12)'}`,
              borderLeft: `0.5px solid ${T.border}`,
              borderRight: `0.5px solid ${T.border}`,
              borderRadius: '24px 24px 16px 16px',
              boxShadow: isDark ? '0 -24px 80px rgba(0,0,0,0.50)' : '0 -8px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 16px 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(60,60,67,0.22)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 12px', borderBottom: `0.5px solid ${T.border}` }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>控制中心</span>
              <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface2, border: `0.5px solid ${T.border}`, cursor: 'pointer' }}>
                <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'} strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '16px 20px', maxHeight: '70vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <Section label="外观 Appearance" T={T}>
                  {onOpenThemePicker ? (
                    <CurrentThemeRow
                      T={T} isDark={isDark}
                      bgScheme={bgScheme ?? 'frost-light'}
                      accentId={accentId ?? 'indigo'}
                      surfaceId={surfaceId ?? 'glass-mid'}
                      onClick={() => { onClose?.(); setTimeout(() => onOpenThemePicker?.(), 180); }}
                    />
                  ) : (
                    <NavRow label="主题 Theme" sub="背景 · 颜色 · 材质" onClick={() => {}} T={T} />
                  )}
                </Section>

                <Section label="语言 Language" T={T}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {LANG_KEYS.map((key) => (
                      <AccentChip key={key} active={lang === key} onClick={() => setLang(key)}>
                        {LANG_LABELS[key]}
                      </AccentChip>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT, lineHeight: 1.4 }}>
                    {lang === "mixed" && "操作中文，音乐术语保留英文（推荐）"}
                    {lang === "zh" && "全部使用中文，包括音乐术语"}
                    {lang === "en" && "All content in English"}
                  </div>
                </Section>

                <Section label="快速入口" T={T}>
                  {onOpenTuning && (
                    <NavRow label="调音 Tuning" sub="更改吉他调音" onClick={() => { onClose?.(); setTimeout(() => onOpenTuning(), 180); }} T={T} icon="🎸" />
                  )}
                  {onOpenSettings && (
                    <NavRow label="重新校准 Calibrate" sub="重新运行麦克风校准" onClick={() => { onClose?.(); setTimeout(() => onOpenSettings(), 180); }} T={T} icon="🎛" />
                  )}
                  {onOpenFullSettings && (
                    <NavRow label="全部设置 All Settings" sub="乐器 · 显示 · 音频 · 关于" onClick={() => { onClose?.(); setTimeout(() => onOpenFullSettings(), 180); }} T={T} icon="⚙️" />
                  )}
                </Section>

                <Section label="Onboarding" T={T}>
                  {onStartOnboarding && (
                    <NavRow label="重新开始引导" sub="引导 → 调音器 → 校准" onClick={() => { onClose?.(); onStartOnboarding(true); }} T={T} icon="🎯" />
                  )}
                </Section>

                <div style={{ paddingTop: 8, paddingBottom: 4, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>Solo Vision Ultra · Two-Point Method</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TuningSheet({ open, onClose, settings, onSettings }) {
  const T = useT();
  const instrData = INSTRUMENTS[settings.instrument] ?? INSTRUMENTS["6-String Guitar"];

  return (
    <BottomSheet open={open} onClose={onClose} title="调音 Tuning">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(instrData.tunings).map(([name, arr]) => {
          const act = JSON.stringify(settings.tuning) === JSON.stringify(arr);
          return (
            <motion.button
              key={name}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onSettings({ ...settings, tuning: arr }); onClose(); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px", borderRadius: 14, textAlign: "left",
                cursor: "pointer", border: "none",
                background: act ? T.accentSub : T.surface1,
                outline: act ? `1px solid ${T.accentBorder}` : "none",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: act ? 600 : 400, color: act ? T.accent : T.textSecondary, fontFamily: FONT_TEXT }}>
                {name}
              </span>
              <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_MONO }}>
                {arr.map((m) => midiToNote(m)).join("·")}
              </span>
            </motion.button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export function CalibrationSheet({ open, onClose, onCalibrated }) {
  const T = useT();
  const [active, setActive] = useState(false);
  const [freq, setFreq] = useState(0);
  const [dn, setDn] = useState("—");
  const [df, setDf] = useState(0);
  const [liveRms, setLiveRms] = useState(0);
  const [cents, setCents] = useState(0);
  const [done, setDone] = useState(false);

  const onPitch = useCallback((f) => {
    setDf(Math.round(f));
    setDn(midiToNote(freqToMidi(f)));
    setCents(freqToCents(f));
    setFreq(f);
  }, []);

  const { rms, error } = useAudioEngine({ onPitchDetected: onPitch, enabled: active });
  useEffect(() => setLiveRms(rms), [rms]);

  const rmsDb = liveRms > 0 ? Math.max(-60, 20 * Math.log10(liveRms)) : -60;
  const rmsP = Math.max(0, Math.min(100, ((rmsDb + 60) / 60) * 100));
  const centsAbs = Math.abs(cents);
  const centsColor = centsAbs < 5 ? "#34C759" : centsAbs < 15 ? T.accent : "#FF3B30";

  const handleDone = () => {
    const offset = freq > 0
      ? 440 / (freq * Math.pow(2, -(freqToMidi(freq) - 69) / 12))
      : 1;
    onCalibrated?.(offset);
    setDone(true);
    setActive(false);
    setTimeout(onClose, 800);
  };

  return (
    <BottomSheet open={open} onClose={() => { setActive(false); onClose(); }} title="校准 Calibration">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && <GlassCard style={{ padding: 14 }}><div style={{ color: "#FF3B30", fontSize: 13 }}>⚠ {error}</div></GlassCard>}

        <GlassCard style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" }}>环境噪声</div>
          <div style={{ height: 4, borderRadius: 2, background: T.surface2, overflow: "hidden" }}>
            <motion.div animate={{ width: `${rmsP}%` }} transition={{ duration: 0.1 }} style={{ height: "100%", borderRadius: 2, background: rmsP > 40 ? "#FF3B30" : "#34C759" }} />
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 6 }}>
            {rmsP > 40 ? "⚠ 环境太嘈杂，请寻找安静场所" : "✓ 环境足够安静，可以校准"}
          </div>
        </GlassCard>

        <GlassCard elevated style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>拨低 E 弦</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: T.textPrimary, fontFamily: FONT_DISPLAY, letterSpacing: "-3px" }}>{dn}</div>
          <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: FONT_MONO, marginTop: 4 }}>{df}Hz</div>
          {active && df > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <div style={{ width: 120, height: 4, borderRadius: 2, background: T.surface2, position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", width: 1, height: "100%", background: "rgba(128,128,128,0.4)" }} />
                  <motion.div animate={{ left: `${50 + cents * 1.5}%` }} transition={{ duration: 0.1 }} style={{ position: "absolute", width: 6, height: 6, borderRadius: 3, background: centsColor, top: -1, transform: "translateX(-50%)" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: centsColor, fontFamily: FONT_MONO }}>{cents > 0 ? "+" : ""}{cents}¢</span>
              </div>
            </div>
          )}
          {done && <div style={{ fontSize: 13, color: "#34C759", marginTop: 12, fontWeight: 600 }}>✓ 校准已保存</div>}
        </GlassCard>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button onClick={() => setActive((a) => !a)} whileTap={{ scale: 0.95 }}
            style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer", background: active ? "rgba(52,199,89,0.18)" : T.accentSub, color: active ? "#34C759" : T.accent, fontSize: 14, fontWeight: 600, fontFamily: FONT_TEXT }}>
            {active ? "● 聆听中..." : "开始校准 Start"}
          </motion.button>
          {active && df > 0 && (
            <motion.button onClick={handleDone} whileTap={{ scale: 0.95 }}
              style={{ padding: "13px 20px", borderRadius: 14, border: "none", cursor: "pointer", background: "rgba(52,199,89,0.18)", color: "#34C759", fontSize: 14, fontWeight: 600, fontFamily: FONT_TEXT }}>
              保存
            </motion.button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

export function StatsSheet({ open, onClose, statsRef }) {
  const T = useT();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!open) return;
    const all = Object.entries(statsRef.current).map(([k, v]) => {
      const [iv, str, fret] = k.split("-");
      return { interval: +iv, string: +str, fret: +fret, ...v };
    });
    all.sort((a, b) => b.avgMs - a.avgMs);
    setEntries(all.slice(0, 8));
  }, [open, statsRef]);

  return (
    <BottomSheet open={open} onClose={onClose} title="本次统计 Session Stats">
      {!entries.length ? (
        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: T.textTertiary }}>打几组题后这里会显示统计数据。</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 4 }}>反应最慢的音程 — 重点练习：</div>
          {entries.map((e, i) => {
            const bars = Math.min(100, (e.avgMs / 4000) * 100);
            const isWeak = e.avgMs > 2000;
            return (
              <GlassCard key={i} elevated={isWeak} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isWeak ? T.accent : T.textSecondary }}>
                    {INTERVAL_LABELS[e.interval]} — 弦 {e.string + 1} 品 {e.fret}
                  </span>
                  <span style={{ fontSize: 11, color: T.textTertiary }}>{(e.avgMs / 1000).toFixed(1)}s · {e.count}次</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: T.surface2, overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", borderRadius: 2, background: isWeak ? `linear-gradient(90deg,${T.accent},#FF3B30)` : "#34C759" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${bars}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                  />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}
