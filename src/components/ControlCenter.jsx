// ─────────────────────────────────────────────────────────────
// CONTROL CENTER v5.1 — Settings, Tuning, Calibration
//
// Bug 修复 v5.1（Batch 2 主题系统配套）：
//   • handleTheme()   写 settings.themeId（修复：旧版写 settings.palette，无效）
//   • handleColorMode() 同步 themeId（深色→violet-deep, 浅色→ios-light）
//   • 主题选中状态用 settings.themeId 判断（修复：旧版用 settings.palette）
//   • 显示当前主题名用 T.themeName（修复：旧版显示 settings.palette，可能为空）
//   • import 增加 THEMES（读取 theme.name 用于 title）
// ─────────────────────────────────────────────────────────────
import React, { useState, useCallback, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { DT, FONT_TEXT, FONT_DISPLAY, FONT_MONO, PALETTE_DEFS, PALETTE_KEYS, THEMES } from "../theme";
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
const LANG_KEYS   = ["mixed", "zh", "en"];

// ── Settings Sheet ───────────────────────────────────────────
export function SettingsSheet({
  open, onClose,
  settings, onSettings,
  onOpenSettings,
  onOpenTuning,
  onStartOnboarding,
}) {
  const T               = useT();
  const themeCtx        = useContext(ThemeContext);
  const { lang, setLang } = useLang();
  const isDark          = themeCtx?.dark ?? true;

  // AI changes state (fetch from public/memory-bank)
  const [aiEntries, setAiEntries] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);

  // When SettingsSheet opens, fetch AI records and auto-open if there are new items
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    fetch('/memory-bank/ai_changes.json')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data.reverse() : [];
        setAiEntries(list);
        try {
          const lastSeen = localStorage.getItem('svultra_ai_last_seen');
          const latestTs = list.length ? list[0].timestamp : null;
          if (latestTs && (!lastSeen || latestTs > lastSeen)) {
            setAiOpen(true);
            localStorage.setItem('svultra_ai_last_seen', latestTs);
          }
        } catch {}
      })
      .catch(() => { if (mounted) setAiEntries([]); });
    return () => { mounted = false; };
  }, [open]);

  // ── BUG FIX：写 themeId 而不是 palette ───────────────────
  // 同时同步 colorMode（保持向后兼容字段一致）
  const handleTheme = (themeId) => {
    const theme = THEMES[themeId];
    onSettings({
      ...settings,
      themeId,
      colorMode: theme?.dark ? "dark" : "light",
    });
  };

  // ── BUG FIX：切换深/浅色同步修改 themeId ─────────────────
  // 浅色 → ios-light（目前唯一 dark:false 主题）
  // 深色 → 当前 themeId 如果已是深色主题保留，否则回到 violet-deep
  const handleColorMode = (mode) => {
    if (mode === "light") {
      onSettings({ ...settings, colorMode: "light", themeId: "ios-light" });
    } else {
      const currentIsDark = THEMES[settings.themeId]?.dark ?? true;
      const nextThemeId   = currentIsDark ? settings.themeId : "violet-deep";
      onSettings({ ...settings, colorMode: "dark", themeId: nextThemeId });
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="设置 Settings">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* ── SECTION: Language ─────────────────────────────── */}
        <Section label="语言 Language" T={T}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {LANG_KEYS.map(key => (
              <AccentChip
                key={key}
                active={lang === key}
                onClick={() => setLang(key)}
              >
                {LANG_LABELS[key]}
              </AccentChip>
            ))}
          </div>
          <div style={{
            fontSize: 11, color: T.textTertiary, marginTop: 8,
            fontFamily: FONT_TEXT, lineHeight: 1.4,
          }}>
            {lang === "mixed" && "操作用中文，音乐理论术语保留英文（推荐）"}
            {lang === "zh"    && "全部使用中文，包括音乐术语"}
            {lang === "en"    && "All content in English"}
          </div>
        </Section>

        {/* ── SECTION: Appearance ──────────────────────────── */}
        <Section label="外观 Appearance" T={T}>

          {/* 深色 / 浅色切换 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {["dark", "light"].map(mode => (
              <AccentChip
                key={mode}
                active={!isDark === (mode === "light")}
                onClick={() => handleColorMode(mode)}
              >
                {mode === "dark" ? "🌙 深色" : "☀️ 浅色"}
              </AccentChip>
            ))}
          </div>

          {/* 主题色选择 */}
          <div style={{
            fontSize: 11, color: T.textTertiary,
            marginBottom: 8, fontFamily: FONT_TEXT,
          }}>
            主题 Theme
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALETTE_KEYS.map(key => {
              // BUG FIX：从 THEMES 直接读 accent 和 name，不依赖 PALETTE_DEFS
              const theme = THEMES[key];
              if (!theme) return null;
              const col = theme.accent;
              // BUG FIX：选中判断用 settings.themeId（旧版用 settings.palette）
              const act = settings.themeId === key;
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.86 }}
                  onClick={() => handleTheme(key)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    // 渐变主题（aurora/sunset）用双色展示
                    background: col.startsWith("linear") ? "#888" : col,
                    border: act ? `3px solid ${T.textPrimary}` : "3px solid transparent",
                    cursor: "pointer",
                    boxShadow: act ? `0 0 0 2px ${T.surface0}, 0 0 0 4px ${col.startsWith("linear") ? T.accent : col}` : "none",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                    // 浅色主题加描边防止白色按钮消失
                    outline: !theme.dark ? `1px solid ${T.border}` : "none",
                  }}
                  title={theme.name}
                />
              );
            })}
          </div>

          {/* BUG FIX：显示 T.themeName（旧版显示 settings.palette，可能是 undefined）*/}
          <div style={{
            fontSize: 11, color: T.textTertiary,
            marginTop: 6, fontFamily: FONT_TEXT,
          }}>
            {T.themeName ?? settings.themeId ?? "Violet Deep"}
          </div>
        </Section>

        {/* ── SECTION: Instrument ──────────────────────────── */}
        <Section label="乐器 Instrument" T={T}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.keys(INSTRUMENTS).map(name => {
              const act = settings.instrument === name;
              return (
                <AccentChip
                  key={name}
                  active={act}
                  onClick={() => onSettings({
                    ...settings,
                    instrument: name,
                    tuning: INSTRUMENTS[name].defaultTuning,
                  })}
                >
                  {name}
                </AccentChip>
              );
            })}
          </div>
        </Section>

        {/* ── SECTION: Display ─────────────────────────────── */}
        <Section label="显示 Display" T={T}>
          <GlassToggle
            value={settings.leftHanded}
            onChange={v => onSettings({ ...settings, leftHanded: v })}
            label="左手模式 Left-Handed"
          />
          <GlassToggle
            value={settings.showNoteNames}
            onChange={v => onSettings({ ...settings, showNoteNames: v })}
            label="显示音名 Show Note Names"
          />
          <GlassToggle
            value={settings.showAllPositions}
            onChange={v => onSettings({ ...settings, showAllPositions: v })}
            label="显示全部位置 Show All Positions"
          />
        </Section>

        {/* ── SECTION: Fret Range ──────────────────────────── */}
        <Section label="品格范围 Fret Range" T={T}>
          <GlassSlider
            min={0} max={12}
            value={settings.minFret}
            label="Min Fret"
            onChange={v => onSettings({ ...settings, minFret: Math.min(v, settings.maxFret - 1) })}
          />
          <GlassSlider
            min={1} max={15}
            value={settings.maxFret}
            label="Max Fret"
            onChange={v => onSettings({ ...settings, maxFret: Math.max(v, settings.minFret + 1) })}
          />
        </Section>

        {/* ── SECTION: Audio ───────────────────────────────── */}
        <Section label="音频 Audio" T={T}>
          <GlassSlider
            min={0.001} max={0.05} step={0.001}
            value={settings.sensitivity ?? 0.01}
            label="拾音灵敏度 Sensitivity"
            onChange={v => onSettings({ ...settings, sensitivity: v })}
          />

          {onOpenTuning && (
            <NavRow
              label="调音 Tuning"
              sub="更改吉他调音 Change guitar tuning"
              onClick={onOpenTuning}
              T={T}
            />
          )}
          {onOpenSettings && (
            <NavRow
              label="重新校准 Re-calibrate"
              sub="重新运行麦克风校准 Re-run mic setup"
              onClick={onOpenSettings}
              T={T}
            />
          )}
          {onStartOnboarding && (
            <NavRow
              label="开始引导 Onboarding"
              sub="按顺序：引导 → 调音器 → 校准"
              onClick={() => onStartOnboarding(true)}
              T={T}
            />
          )}
        </Section>

        {/* ── SECTION: AI 修改记录 ───────────────── */}
        <Section label="AI 修改记录" T={T}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>
              AI 修改记录
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAiOpen(o => !o)} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8, border: `0.5px solid ${T.border}`, background: T.surface1, cursor: 'pointer' }}>
                {aiOpen ? '收起' : '查看'}
              </button>
              <button onClick={() => window.open('/memory-bank/ai_guide.md','_blank')} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8, border: `0.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer' }}>
                查看引导
              </button>
            </div>
          </div>

          {aiOpen && (
            <div style={{ marginTop: 10, borderRadius: 12, padding: 10, background: T.surface2, border: `0.5px solid ${T.border}` }}>
              {Array.isArray(aiEntries) && aiEntries.length > 0 ? (
                aiEntries.slice(0,6).map(e => (
                  <div key={e.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</div>
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
          )}
        </Section>

        {/* ── Footer ───────────────────────────────────────── */}
        <div style={{ paddingTop: 20, paddingBottom: 8, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>
            Solo Vision Ultra v5.1
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2, fontFamily: FONT_TEXT }}>
            Two-Point Intervallic Functions Method
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ label, T, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, color: T.textTertiary,
        letterSpacing: 1, textTransform: "uppercase",
        marginBottom: 10, fontFamily: FONT_TEXT,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

// ── NavRow ────────────────────────────────────────────────────
function NavRow({ label, sub, onClick, T }) {
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
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
          {sub}
        </div>
      </div>
      <span style={{ fontSize: 16, color: T.textTertiary }}>›</span>
    </motion.button>
  );
}

// ── Tuning Sheet ─────────────────────────────────────────────
export function TuningSheet({ open, onClose, settings, onSettings }) {
  const T         = useT();
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
                background: act ? `${T.accentSub}` : T.surface1,
                outline: act ? `1px solid ${T.accentBorder}` : "none",
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: act ? 600 : 400,
                color: act ? T.accent : T.textSecondary,
                fontFamily: FONT_TEXT,
              }}>
                {name}
              </span>
              <span style={{
                fontSize: 11,
                color: T.textTertiary,
                fontFamily: FONT_MONO,
              }}>
                {arr.map(m => midiToNote(m)).join("·")}
              </span>
            </motion.button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// ── Calibration Sheet ────────────────────────────────────────
export function CalibrationSheet({ open, onClose, onCalibrated }) {
  const T             = useT();
  const [active, setActive]   = useState(false);
  const [note, setNote]       = useState("—");
  const [freq, setFreq]       = useState(0);
  const [dn,   setDn]         = useState("—");
  const [df,   setDf]         = useState(0);
  const [liveRms, setLiveRms] = useState(0);
  const [cents, setCents]     = useState(0);
  const [done,  setDone]      = useState(false);

  const onPitch = useCallback(f => {
    setDf(Math.round(f));
    setDn(midiToNote(freqToMidi(f)));
    setCents(freqToCents(f));
    setFreq(f);
  }, []);

  const { rms, error } = useAudioEngine({ onPitchDetected: onPitch, enabled: active });
  useEffect(() => setLiveRms(rms), [rms]);

  const rmsDb    = liveRms > 0 ? Math.max(-60, 20 * Math.log10(liveRms)) : -60;
  const rmsP     = Math.max(0, Math.min(100, ((rmsDb + 60) / 60) * 100));
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
        {error && (
          <GlassCard style={{ padding: 14 }}>
            <div style={{ color: "#FF3B30", fontSize: 13 }}>⚠ {error}</div>
          </GlassCard>
        )}

        <GlassCard style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" }}>
            环境噪声 Background Noise
          </div>
          <div style={{ height: 4, borderRadius: 2, background: T.surface2, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${rmsP}%` }}
              transition={{ duration: 0.1 }}
              style={{ height: "100%", borderRadius: 2, background: rmsP > 40 ? "#FF3B30" : "#34C759" }}
            />
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 6 }}>
            {rmsP > 40 ? "⚠ 环境太嘈杂，请寻找安静场所" : "✓ 环境足够安静，可以校准"}
          </div>
        </GlassCard>

        <GlassCard elevated style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
            拨低 E 弦 Pluck your low E string
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: T.textPrimary, fontFamily: FONT_DISPLAY, letterSpacing: "-3px" }}>
            {dn}
          </div>
          <div style={{ fontSize: 13, color: T.textTertiary, fontFamily: FONT_MONO, marginTop: 4 }}>{df}Hz</div>
          {active && df > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <div style={{ width: 120, height: 4, borderRadius: 2, background: T.surface2, position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", width: 1, height: "100%", background: "rgba(128,128,128,0.4)" }} />
                  <motion.div
                    animate={{ left: `${50 + cents * 1.5}%` }}
                    transition={{ duration: 0.1 }}
                    style={{ position: "absolute", width: 6, height: 6, borderRadius: 3, background: centsColor, top: -1, transform: "translateX(-50%)" }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: centsColor, fontFamily: FONT_MONO }}>
                  {cents > 0 ? "+" : ""}{cents}¢
                </span>
              </div>
            </div>
          )}
          {done && <div style={{ fontSize: 13, color: "#34C759", marginTop: 12, fontWeight: 600 }}>✓ 校准已保存</div>}
        </GlassCard>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            onClick={() => setActive(a => !a)}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer",
              background: active ? "rgba(52,199,89,0.18)" : T.accentSub,
              color: active ? "#34C759" : T.accent,
              fontSize: 14, fontWeight: 600, fontFamily: FONT_TEXT,
            }}
          >
            {active ? "● 聆听中..." : "开始校准 Start"}
          </motion.button>
          {active && df > 0 && (
            <motion.button
              onClick={handleDone}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "13px 20px", borderRadius: 14, border: "none",
                cursor: "pointer", background: "rgba(52,199,89,0.18)",
                color: "#34C759", fontSize: 14, fontWeight: 600, fontFamily: FONT_TEXT,
              }}
            >
              保存
            </motion.button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

// ── Stats Sheet ──────────────────────────────────────────────
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
      {!entries.length
        ? (
          <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: T.textTertiary }}>
            打几组题后这里会显示统计数据。
          </div>
        )
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 4 }}>
              反应最慢的音程 — 重点练习：
            </div>
            {entries.map((e, i) => {
              const bars   = Math.min(100, (e.avgMs / 4000) * 100);
              const isWeak = e.avgMs > 2000;
              return (
                <GlassCard key={i} elevated={isWeak} style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isWeak ? T.accent : T.textSecondary }}>
                      {INTERVAL_LABELS[e.interval]} — 弦 {e.string + 1} 品 {e.fret}
                    </span>
                    <span style={{ fontSize: 11, color: T.textTertiary }}>
                      {(e.avgMs / 1000).toFixed(1)}s · {e.count}次
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: T.surface2, overflow: "hidden" }}>
                    <motion.div
                      style={{
                        height: "100%", borderRadius: 2,
                        background: isWeak ? `linear-gradient(90deg,${T.accent},#FF3B30)` : "#34C759",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bars}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )
      }
    </BottomSheet>
  );
}
