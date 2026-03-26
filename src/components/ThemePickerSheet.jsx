import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts';
import {
  DT, FONT_TEXT, FONT_DISPLAY, THEMES, getTokensV2,
  BG_SCHEMES, DARK_BG_SCHEMES, LIGHT_BG_SCHEMES,
  RECOMMENDED_DARK_BG_SCHEMES, RECOMMENDED_LIGHT_BG_SCHEMES,
  ACCENT_SCHEMES, ACCENT_SCHEME_KEYS,
  SURFACE_SCHEMES, SURFACE_SCHEME_KEYS,
  PRESETS, PRESET_KEYS,
  CURATED_DARK_THEME_IDS, CURATED_LIGHT_THEME_IDS,
  LEGACY_TO_PRESET, PALETTE_REFERENCES,
} from '../theme';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

export function SectionLabel({ children, isDark, compact = false }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)',
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      fontFamily: FONT_TEXT,
      marginBottom: 12,
      marginTop: compact ? 0 : 24,
    }}>
      {children}
    </div>
  );
}

export function Divider({ isDark }) {
  return <div style={{ height: 0.5, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', margin: '4px 0 0' }} />;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapHue(value) {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function hexToHsl(hex) {
  const clean = String(hex).replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((char) => `${char}${char}`).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * (((g - b) / d) % 6);
        break;
      case g:
        h = 60 * ((b - r) / d + 2);
        break;
      default:
        h = 60 * ((r - g) / d + 4);
        break;
    }
  }

  return {
    h: wrapHue(h),
    s: s * 100,
    l: l * 100,
  };
}

function hslToHex(h, s, l) {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function pickDifferent(list, current) {
  if (!Array.isArray(list) || list.length === 0) return current;
  if (list.length === 1) return list[0];
  const pool = current == null ? list : list.filter((item) => item !== current);
  const safePool = pool.length > 0 ? pool : list;
  return safePool[Math.floor(Math.random() * safePool.length)];
}

function buildGeneratedAccentIdeas(baseAccent, isDark, seed) {
  const { h, s, l } = hexToHsl(baseAccent);
  const baseLight = isDark ? 66 : 58;
  const baseSat = isDark ? 78 : 68;
  const hueNudge = seed * 11;
  const makeColor = (hueShift, satShift, lightShift) => (
    hslToHex(wrapHue(h + hueShift + hueNudge), baseSat + satShift, baseLight + lightShift)
  );
  const amberRoot = isDark ? '#FBBF24' : '#D97706';
  const negative = isDark ? '#F87171' : '#DC2626';

  return [
    {
      id: `soft-duo-${seed}`,
      label: 'Soft Duo',
      labelZh: '柔和双强调',
      accent: makeColor(0, 2, 0),
      accentAlt: makeColor(26, -8, 4),
      positive: makeColor(26, -6, -2),
      warning: amberRoot,
      negative,
      noteRoot: amberRoot,
      noteTarget: makeColor(0, 2, 0),
      noteScale: makeColor(26, -8, 4),
    },
    {
      id: `mint-split-${seed}`,
      label: 'Mint Split',
      labelZh: '薄荷分离',
      accent: makeColor(12, 6, 1),
      accentAlt: makeColor(142, -4, 2),
      positive: makeColor(142, -4, -6),
      warning: amberRoot,
      negative,
      noteRoot: amberRoot,
      noteTarget: makeColor(12, 6, 1),
      noteScale: makeColor(142, -4, 2),
    },
    {
      id: `iris-amber-${seed}`,
      label: 'Iris Amber',
      labelZh: '鸢尾琥珀',
      accent: makeColor(-10, 4, 2),
      accentAlt: makeColor(42, -2, 6),
      positive: makeColor(42, -2, -2),
      warning: amberRoot,
      negative,
      noteRoot: amberRoot,
      noteTarget: makeColor(-10, 4, 2),
      noteScale: makeColor(42, -2, 6),
    },
    {
      id: `ocean-pop-${seed}`,
      label: 'Ocean Pop',
      labelZh: '海蓝跳色',
      accent: makeColor(198, 2, 0),
      accentAlt: makeColor(-28, 6, 4),
      positive: makeColor(126, -6, -4),
      warning: amberRoot,
      negative,
      noteRoot: amberRoot,
      noteTarget: makeColor(198, 2, 0),
      noteScale: makeColor(-28, 6, 4),
    },
  ];
}

function buildReferenceAccentScheme(item, isDark, fallbackAccent) {
  const swatches = (item?.swatches || []).filter((swatch) => typeof swatch === 'string' && swatch.startsWith('#'));
  const accent = swatches[2] || swatches[0] || fallbackAccent;
  const accentAlt = swatches[3] || swatches[1] || accent;
  const warning = swatches[4] || (isDark ? '#FBBF24' : '#D97706');
  const negative = isDark ? '#F87171' : '#DC2626';
  return {
    id: `reference-${item?.id || 'custom'}`,
    label: item?.name || 'Reference Accent',
    labelZh: item?.nameZh || '参考配色',
    accent,
    accentAlt,
    positive: swatches[4] || accentAlt,
    warning,
    negative,
    noteRoot: warning,
    noteTarget: accent,
    noteScale: accentAlt,
  };
}

function MaterialSlider({ label, value, min, max, step, format, onChange, isDark }) {
  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: 14,
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(16,18,34,0.84)', fontFamily: FONT_TEXT }}>
          {label}
        </span>
        <span style={{ fontSize: 10.5, color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(16,18,34,0.42)', fontFamily: FONT_TEXT }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function LockChip({ label, hint, locked, onClick, isDark }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        padding: '11px 12px',
        borderRadius: 16,
        border: `1px solid ${locked ? (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.20)') : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)')}`,
        background: locked ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)'),
        color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(16,18,34,0.84)',
        cursor: 'pointer',
        fontFamily: FONT_TEXT,
        fontSize: 10.5,
        fontWeight: 700,
        textAlign: 'left',
        minHeight: 74,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>{label}</span>
        <span style={{ fontSize: 10, color: locked ? (isDark ? 'rgba(255,255,255,0.92)' : 'rgba(16,18,34,0.90)') : (isDark ? 'rgba(255,255,255,0.48)' : 'rgba(16,18,34,0.46)') }}>
          {locked ? '已锁定' : '参与随机'}
        </span>
      </div>
      <span style={{ fontSize: 10, lineHeight: 1.45, fontWeight: 500, color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(16,18,34,0.48)' }}>
        {hint}
      </span>
    </motion.button>
  );
}

function BentoPanel({ title, subtitle, isDark, children, action, tone = 'neutral', prominence = 'secondary' }) {
  const backgrounds = {
    hero: isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,246,255,0.90))',
    contrast: isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))'
      : 'linear-gradient(180deg, rgba(252,253,255,0.95), rgba(239,242,252,0.82))',
    subtle: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.70)',
    neutral: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
  };
  const borders = {
    hero: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(122,132,184,0.16)',
    contrast: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(122,132,184,0.12)',
    subtle: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    neutral: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };
  const shadows = {
    primary: isDark ? '0 18px 34px rgba(0,0,0,0.22)' : '0 20px 34px rgba(76,92,140,0.12)',
    secondary: isDark ? '0 10px 22px rgba(0,0,0,0.16)' : '0 12px 22px rgba(40,48,90,0.08)',
    tertiary: 'none',
  };
  return (
    <div
      style={{
        borderRadius: 22,
        padding: prominence === 'primary' ? 18 : 16,
        background: backgrounds[tone] ?? backgrounds.neutral,
        border: `1px solid ${borders[tone] ?? borders.neutral}`,
        boxShadow: shadows[prominence] ?? shadows.secondary,
      }}
    >
      {(title || subtitle || action) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            {title && (
              <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(16,18,34,0.90)', fontFamily: FONT_TEXT }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.5, color: isDark ? 'rgba(255,255,255,0.48)' : 'rgba(16,18,34,0.50)', fontFamily: FONT_TEXT }}>
                {subtitle}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function GeneratedAccentCard({ idea, isDark, isActive, onApply }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onApply?.(idea)}
      style={{
        textAlign: 'left',
        padding: 12,
        borderRadius: 18,
        border: `1px solid ${isActive ? idea.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 44, borderRadius: 12, background: idea.accent }} />
        <div style={{ flex: 1, height: 44, borderRadius: 12, background: idea.accentAlt }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(16,18,34,0.86)', fontFamily: FONT_TEXT }}>
        {idea.labelZh}
      </div>
      <div style={{ marginTop: 4, fontSize: 10.5, color: isDark ? 'rgba(255,255,255,0.46)' : 'rgba(16,18,34,0.44)', fontFamily: FONT_TEXT }}>
        {idea.accent} · {idea.accentAlt}
      </div>
    </motion.button>
  );
}

function LiveThemePreview({ bgScheme, accentId, surfaceId, materialTuning }) {
  const preview = getTokensV2({ bgScheme, accentId, surfaceId, materialTuning });
  const bg = preview.bg ?? {};
  return (
    <div style={{
      position: 'relative',
      minHeight: 560,
      borderRadius: 24,
      overflow: 'hidden',
      background: bg.base,
      border: `1px solid ${preview.borderHi}`,
      boxShadow: preview.glass?.shadow,
    }}>
      <div style={{ position: 'absolute', width: '62%', height: '72%', top: '-12%', left: '-10%', borderRadius: '50%', background: `radial-gradient(circle, ${bg.blobA} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', width: '54%', height: '62%', bottom: '-10%', right: '-6%', borderRadius: '50%', background: `radial-gradient(circle, ${bg.blobB} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', width: '40%', height: '44%', top: '34%', left: '34%', borderRadius: '50%', background: `radial-gradient(circle, ${bg.blobC} 0%, transparent 70%)` }} />

      <div style={{ position: 'relative', zIndex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: preview.textSecondary, fontFamily: FONT_TEXT }}>
              Good Practice.
            </div>
            <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: preview.textPrimary, fontFamily: FONT_DISPLAY }}>
              {preview.themeName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[preview.noteRoot, preview.noteTarget, preview.noteScale].map((color, index) => (
              <div key={index} style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
            ))}
          </div>
        </div>

        <div style={{
          padding: 18,
          borderRadius: 24,
          background: preview.surface1,
          border: `1px solid ${preview.accentBorder}`,
          backdropFilter: preview.glass?.blur,
          WebkitBackdropFilter: preview.glass?.blur,
          boxShadow: preview.glass?.shadow,
          display: 'grid',
          gap: 16,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.12fr) minmax(120px, 0.88fr)',
            gap: 14,
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 999,
                background: preview.accentSub,
                border: `1px solid ${preview.accentBorder}`,
                color: preview.accent,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: FONT_TEXT,
              }}>
                今日推荐
              </div>
              <div style={{ marginTop: 12, fontSize: 30, fontWeight: 700, color: preview.textPrimary, fontFamily: FONT_DISPLAY, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                音程训练器
              </div>
              <div style={{ marginTop: 4, fontSize: 18, color: preview.accent, fontStyle: 'italic', fontFamily: FONT_DISPLAY }}>
                Find Root · All 11
              </div>
              <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6, color: preview.textSecondary, fontFamily: FONT_TEXT }}>
                更接近真实首页的 Hero 结构，用来观察背景、材质、强调色和信息优先级。
              </div>
              <div style={{ marginTop: 14, fontSize: 10.5, color: preview.textSecondary, fontFamily: FONT_TEXT }}>今日目标进度</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                <div style={{ fontSize: 52, lineHeight: 1, fontWeight: 700, color: preview.accent, fontFamily: FONT_DISPLAY }}>68</div>
                <div style={{ fontSize: 13, color: preview.textSecondary, fontFamily: FONT_TEXT }}>% done</div>
              </div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: preview.surface2 }}>
                <div style={{ width: '68%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${preview.accent}, ${preview.noteTarget})` }} />
              </div>
            </div>
            <div style={{
              padding: 16,
              borderRadius: 20,
              background: preview.surface2,
              border: `1px solid ${preview.border}`,
              display: 'grid',
              gap: 14,
            }}>
              <div>
                <div style={{ fontSize: 10.5, color: preview.textSecondary, fontFamily: FONT_TEXT }}>Focus Practice</div>
                <div style={{ marginTop: 8, fontSize: 24, lineHeight: 1, fontWeight: 700, color: preview.textPrimary, fontFamily: FONT_DISPLAY }}>b3</div>
                <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.55, color: preview.textSecondary, fontFamily: FONT_TEXT }}>
                  你的 b3 准确率偏低，今天花 12 分钟只练这一个音程形状。
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: preview.textSecondary, fontFamily: FONT_TEXT }}>b3 accuracy</div>
                <div style={{ marginTop: 8, fontSize: 34, lineHeight: 1, fontWeight: 700, color: preview.noteTarget, fontFamily: FONT_DISPLAY }}>41%</div>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: 14,
                background: preview.noteTarget,
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: FONT_TEXT,
                boxShadow: `0 10px 20px ${preview.noteTargetGlow}`,
              }}>
                Start
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr 0.95fr', gap: 10 }}>
            <div style={{
              padding: 16,
              borderRadius: 20,
              background: preview.surface2,
              border: `1px solid ${preview.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -10,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${preview.accentSub} 0%, transparent 70%)`,
              }} />
              <div style={{ fontSize: 10.5, color: preview.textSecondary, fontFamily: FONT_TEXT }}>今日训练组合</div>
              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700, color: preview.textPrimary, fontFamily: FONT_DISPLAY }}>Intervals + Changes</div>
              <div style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.55, color: preview.textSecondary, fontFamily: FONT_TEXT }}>
                b3 / 5 / b7 重点练习 · Changes Dm7–G7 · 约 25 分钟
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                {['b3', '5', 'b7', 'Find Root'].map((chip, index) => (
                  <span key={chip} style={{
                    padding: '4px 9px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: FONT_TEXT,
                    background: index === 3 ? `${preview.noteScale}20` : preview.accentSub,
                    color: index === 3 ? preview.noteScale : preview.accent,
                    border: `1px solid ${index === 3 ? preview.noteScale : preview.accentBorder}`,
                  }}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 14, borderRadius: 18, background: preview.surface2, border: `1px solid ${preview.border}` }}>
                <div style={{ fontSize: 10, color: preview.textSecondary, fontFamily: FONT_TEXT }}>Today</div>
                <div style={{ marginTop: 8, fontSize: 36, lineHeight: 1, fontWeight: 700, color: preview.accent, fontFamily: FONT_DISPLAY }}>22</div>
                <div style={{ marginTop: 4, fontSize: 11, color: preview.textSecondary, fontFamily: FONT_TEXT }}>min</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 10 }}>
                  {[12, 20, 28, 22, 30, 16, 24].map((h, i) => (
                    <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: h >= 28 ? preview.accent : `${preview.accent}66` }} />
                  ))}
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: preview.surface2, border: `1px solid ${preview.border}` }}>
                <div style={{ fontSize: 10, color: preview.textSecondary, fontFamily: FONT_TEXT }}>Streak</div>
                <div style={{ marginTop: 8, fontSize: 36, lineHeight: 1, fontWeight: 700, color: preview.noteScale, fontFamily: FONT_DISPLAY }}>12</div>
                <div style={{ marginTop: 4, fontSize: 11, color: preview.textSecondary, fontFamily: FONT_TEXT }}>days</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 14, borderRadius: 18, background: preview.surface2, border: `1px solid ${preview.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: preview.textPrimary, fontFamily: FONT_DISPLAY }}>This Week</div>
                  <div style={{ fontSize: 10, color: preview.textSecondary, fontFamily: FONT_TEXT }}>5 / 7</div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => {
                    const active = index === 4;
                    const done = index < 4 && index > 0;
                    return (
                      <div key={day} style={{ flex: 1, display: 'grid', gap: 5, justifyItems: 'center' }}>
                        <div style={{
                          width: '100%',
                          height: 28,
                          borderRadius: 9,
                          background: active ? preview.accentSub : done ? preview.accent : preview.surface1,
                          color: active ? preview.accent : done ? '#ffffff' : preview.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: FONT_TEXT,
                          border: active ? `1px solid ${preview.accentBorder}` : `1px solid ${preview.border}`,
                        }}>
                          {active ? 'Now' : done ? '•' : ''}
                        </div>
                        <span style={{ fontSize: 8.5, color: preview.textSecondary, fontFamily: FONT_TEXT }}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  'Track A — Beginner',
                  'Track B — Advanced',
                  'Track C — Harmony',
                ].map((track, index) => (
                  <div key={track} style={{
                    padding: '10px 12px',
                    borderRadius: 16,
                    background: index === 1 ? preview.accentSub : preview.surface2,
                    color: index === 1 ? preview.accent : preview.textSecondary,
                    border: `1px solid ${index === 1 ? preview.accentBorder : preview.border}`,
                    fontSize: 10.5,
                    fontWeight: 700,
                    fontFamily: FONT_TEXT,
                  }}>
                    {track}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PresetRow({ presets, currentBg, currentAccent, currentSurface, onSelect, isDark, T }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -22px', padding: '0 22px 4px' }}>
      {presets.map((p) => {
        const isActive = currentBg === p.bgScheme && currentAccent === p.accentId && currentSurface === p.surfaceId;
        return (
          <motion.div
            key={p.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect?.(p.id)}
            style={{
              flexShrink: 0,
              padding: '10px 14px',
              borderRadius: 14,
              cursor: 'pointer',
              background: isActive
                ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)')
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)'),
              border: `1.5px solid ${isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)')}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 7 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, background: p.previewBg, border: '0.5px solid rgba(0,0,0,0.10)', flexShrink: 0 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.previewAccent, flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 11.5, fontWeight: isActive ? 700 : 500, color: isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'), fontFamily: FONT_TEXT, whiteSpace: 'nowrap' }}>
              {p.nameZh || p.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function BgCard({ scheme, isActive, onSelect, isDark, T }) {
  return (
    <motion.div whileTap={{ scale: 0.92 }} onClick={() => onSelect?.(scheme.id)} style={{ cursor: 'pointer' }}>
      <div style={{
        width: '100%',
        height: 64,
        borderRadius: 12,
        background: scheme.base,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 8,
        border: isActive ? `2px solid ${T.accent}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <div style={{ position: 'absolute', width: '70%', height: '70%', top: '-10%', left: '-10%', borderRadius: '50%', background: `radial-gradient(circle, ${scheme.blobA} 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', width: '55%', height: '55%', bottom: '-10%', right: '-5%', borderRadius: '50%', background: `radial-gradient(circle, ${scheme.blobB} 0%, transparent 70%)` }} />
        <div style={{
          position: 'absolute',
          bottom: 5,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)',
          fontFamily: FONT_TEXT,
          textTransform: 'uppercase',
        }}>
          {scheme.animType}
        </div>
        {isActive && (
          <div style={{ position: 'absolute', top: 5, right: 5, width: 14, height: 14, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={8} height={6} viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'), fontFamily: FONT_TEXT, textAlign: 'center', lineHeight: 1.3 }}>
        {scheme.nameZh || scheme.name}
      </div>
    </motion.div>
  );
}

export function AccentRing({ scheme, isActive, onSelect, isDark, T }) {
  const accentColor = scheme.accent.startsWith('rgba') ? 'rgba(180,180,180,0.8)' : scheme.accent;
  return (
    <motion.div
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect?.(scheme.id)}
      animate={{ scale: isActive ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 440, damping: 28 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: accentColor,
        border: isActive
          ? `2.5px solid ${isDark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.80)'}`
          : `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)'}`,
        boxShadow: isActive ? `0 0 0 3px ${accentColor}38` : 'none',
      }} />
      <span style={{
        fontSize: 9.5,
        fontFamily: FONT_TEXT,
        textAlign: 'center',
        color: isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'),
        fontWeight: isActive ? 700 : 400,
        lineHeight: 1.2,
        maxWidth: 44,
      }}>
        {scheme.nameZh || scheme.name}
      </span>
    </motion.div>
  );
}

export function SurfaceCard({ scheme, isActive, onSelect, isDark, T }) {
  return (
    <motion.div
      whileTap={{ scale: 0.94 }}
      onClick={() => onSelect?.(scheme.id)}
      style={{
        padding: '12px 10px',
        borderRadius: 14,
        border: `1.5px solid ${isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)')}`,
        background: isActive
          ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.92)')
          : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)'),
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{ height: 6, borderRadius: 3, marginBottom: 8, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: 3,
          background: isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.25)'),
          width: scheme.id === 'glass-hi' ? '90%' : scheme.id === 'glass-mid' ? '72%' : scheme.id === 'glass-lo' ? '52%' : scheme.id === 'frosted-vivid' ? '80%' : scheme.id === 'solid' ? '30%' : '58%',
        }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? T.accent : (isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)'), fontFamily: FONT_TEXT, lineHeight: 1.3 }}>
        {scheme.nameZh || scheme.name}
      </div>
    </motion.div>
  );
}

function PaletteReferenceCard({ item, isDark, onApply }) {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: isDark ? 'none' : '0 8px 20px rgba(40,48,90,0.08)',
      }}
    >
      <div style={{ display: 'flex', minHeight: 76 }}>
        {item.swatches.map((swatch, index) => (
          <div
            key={`${item.id}-${index}`}
            style={{
              flex: 1,
              background: swatch.startsWith('rgba') || swatch.startsWith('#') ? swatch : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(226,232,240,0.75))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8,
            }}
          >
            {!item.isMeta && (
              <span style={{
                fontSize: 8,
                fontFamily: FONT_TEXT,
                color: index < 2 ? 'rgba(255,255,255,0.88)' : 'rgba(10,10,18,0.66)',
                mixBlendMode: index < 2 ? 'screen' : 'normal',
              }}>
                {swatch}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 13px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(12,16,32,0.90)', fontFamily: FONT_TEXT }}>
            {item.nameZh}
          </div>
          <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.34)' : 'rgba(0,0,0,0.38)', fontFamily: FONT_TEXT }}>
            {item.source}
          </div>
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: isDark ? 'rgba(255,255,255,0.56)' : 'rgba(40,44,66,0.62)', fontFamily: FONT_TEXT }}>
          {item.desc}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {item.tags.map((tag) => (
            <span
              key={`${item.id}-${tag}`}
              style={{
                fontSize: 9.5,
                padding: '4px 7px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(12,16,32,0.06)',
                color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(12,16,32,0.54)',
                fontFamily: FONT_TEXT,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onApply?.(item)}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: '9px 10px',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(16,18,34,0.08)',
              color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(16,18,34,0.84)',
              fontFamily: FONT_TEXT,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {item.isMeta ? '套用到材质' : '应用到主题'}
          </motion.button>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              padding: '9px 10px',
              minWidth: 72,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,18,34,0.05)',
              color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(16,18,34,0.58)',
              textDecoration: 'none',
              fontFamily: FONT_TEXT,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            来源
          </a>
        </div>
      </div>
    </div>
  );
}

function ThemeBlobPreview({ theme, size = 52 }) {
  const bg = theme.bg;
  const blobA = bg?.blobA ?? 'rgba(120,80,220,0.4)';
  const blobB = bg?.blobB ?? 'rgba(60,140,220,0.3)';
  const blobC = bg?.blobC ?? 'rgba(140,60,220,0.2)';
  const base = bg?.base ?? (theme.themeDark ? '#07080f' : '#eef2ff');
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: base, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: '80%', height: '80%', top: '-20%', left: '-10%', borderRadius: '50%', background: `radial-gradient(circle, ${blobA} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', width: '70%', height: '70%', bottom: '-15%', right: '-5%', borderRadius: '50%', background: `radial-gradient(circle, ${blobB} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', width: '50%', height: '50%', top: '35%', left: '30%', borderRadius: '50%', background: `radial-gradient(circle, ${blobC} 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: theme.accent ?? '#a78bfa', boxShadow: `0 0 6px ${theme.accent ?? '#a78bfa'}` }} />
    </div>
  );
}

function ThemeCard({ theme, isActive, onSelect, isDark }) {
  const ringColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  const labelActive = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)';
  const labelIdle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  return (
    <motion.div
      onClick={() => onSelect(theme.themeId)}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: isActive ? 1.01 : 1 }}
      transition={{ type: 'spring', stiffness: 440, damping: 28 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        padding: 10,
        borderRadius: 18,
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
        border: isActive ? `1.5px solid ${ringColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <ThemeBlobPreview theme={theme} size={54} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? labelActive : labelIdle, fontFamily: FONT_TEXT, lineHeight: 1.2 }}>
          {theme.themeName}
        </div>
        <div style={{ marginTop: 4, fontSize: 10, color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.36)', fontFamily: FONT_TEXT }}>
          {theme.themeDark ? 'Dark' : 'Light'}
        </div>
      </div>
    </motion.div>
  );
}

export function ThreeAxisSections({
  T,
  isDark,
  bgScheme,
  accentId,
  surfaceId,
  onSelectBg,
  onSelectAccent,
  onSelectSurface,
  onSelectPreset,
  materialTuning,
  onMaterialTuningChange,
  customAccentScheme,
  onApplyCustomAccentScheme,
  includePresets = true,
  compact = false,
  showAccentGenerator = true,
  showPaletteReferences = true,
  showMaterialLab = true,
  showSurfaceSection = true,
}) {
  const activeBg = bgScheme ?? 'frost-light';
  const activeAccent = accentId ?? 'indigo';
  const activeSurface = surfaceId ?? 'glass-mid';
  const presetList = PRESET_KEYS.map((k) => PRESETS[k]);
  const curatedDarkThemes = CURATED_DARK_THEME_IDS.map((themeId) => THEMES[themeId]).filter(Boolean);
  const curatedLightThemes = CURATED_LIGHT_THEME_IDS.map((themeId) => THEMES[themeId]).filter(Boolean);
  const darkBgList = RECOMMENDED_DARK_BG_SCHEMES.map((k) => BG_SCHEMES[k]).filter(Boolean);
  const lightBgList = RECOMMENDED_LIGHT_BG_SCHEMES.map((k) => BG_SCHEMES[k]).filter(Boolean);
  const extraDarkBgList = DARK_BG_SCHEMES.filter((k) => !RECOMMENDED_DARK_BG_SCHEMES.includes(k)).map((k) => BG_SCHEMES[k]);
  const extraLightBgList = LIGHT_BG_SCHEMES.filter((k) => !RECOMMENDED_LIGHT_BG_SCHEMES.includes(k)).map((k) => BG_SCHEMES[k]);
  const accentList = ACCENT_SCHEME_KEYS.map((k) => ACCENT_SCHEMES[k]);
  const surfaceList = SURFACE_SCHEME_KEYS.map((k) => SURFACE_SCHEMES[k]);
  const baseAccent = accentId === 'custom'
    ? (customAccentScheme?.accent ?? T.accent)
    : (ACCENT_SCHEMES[activeAccent]?.accent ?? T.accent);
  const generatedAccentIdeas = buildGeneratedAccentIdeas(baseAccent, isDark, 1);
  const handleSelectCuratedTheme = (themeId) => {
    const mapped = LEGACY_TO_PRESET?.[themeId];
    if (!mapped) return;
    onSelectBg?.(mapped.bgScheme);
    onSelectAccent?.(mapped.accentId);
    onSelectSurface?.(mapped.surfaceId);
  };
  const isCuratedThemeActive = (themeId) => {
    const mapped = LEGACY_TO_PRESET?.[themeId];
    return Boolean(
      mapped
      && mapped.bgScheme === activeBg
      && mapped.accentId === activeAccent
      && mapped.surfaceId === activeSurface
    );
  };

  return (
    <>
      <SectionLabel isDark={isDark} compact={compact}>主题 Theme</SectionLabel>
      <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        深色 Dark · 5
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
        {curatedDarkThemes.map((theme) => (
          <ThemeCard
            key={theme.themeId}
            theme={theme}
            isActive={isCuratedThemeActive(theme.themeId)}
            onSelect={handleSelectCuratedTheme}
            isDark={isDark}
          />
        ))}
      </div>

      <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        浅色 Light · 5
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
        {curatedLightThemes.map((theme) => (
          <ThemeCard
            key={theme.themeId}
            theme={theme}
            isActive={isCuratedThemeActive(theme.themeId)}
            onSelect={handleSelectCuratedTheme}
            isDark={isDark}
          />
        ))}
      </div>

      <Divider isDark={isDark} />
      {includePresets && (
        <>
          <SectionLabel isDark={isDark} compact={compact}>扩展预设 Extended</SectionLabel>
          <PresetRow
            presets={presetList}
            currentBg={activeBg}
            currentAccent={activeAccent}
            currentSurface={activeSurface}
            onSelect={onSelectPreset}
            isDark={isDark}
            T={T}
          />
          <Divider isDark={isDark} />
        </>
      )}

      <SectionLabel isDark={isDark} compact={compact && !includePresets}>背景 Background</SectionLabel>
      <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        深色 Dark · 推荐 5
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))', gap: '10px 8px', marginBottom: 14 }}>
        {darkBgList.map((scheme) => (
          <BgCard key={scheme.id} scheme={scheme} isActive={activeBg === scheme.id} onSelect={onSelectBg} isDark={isDark} T={T} />
        ))}
      </div>

      <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        浅色 Light · 推荐 5
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))', gap: '10px 8px', marginBottom: 10 }}>
        {lightBgList.map((scheme) => (
          <BgCard key={scheme.id} scheme={scheme} isActive={activeBg === scheme.id} onSelect={onSelectBg} isDark={isDark} T={T} />
        ))}
      </div>

      {(extraDarkBgList.length > 0 || extraLightBgList.length > 0) && (
        <>
          <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            扩展 Extra
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))', gap: '10px 8px', marginBottom: 4 }}>
            {[...extraDarkBgList, ...extraLightBgList].map((scheme) => (
              <BgCard key={scheme.id} scheme={scheme} isActive={activeBg === scheme.id} onSelect={onSelectBg} isDark={isDark} T={T} />
            ))}
          </div>
        </>
      )}

      <Divider isDark={isDark} />
      <SectionLabel isDark={isDark}>主题颜色 Accent</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px 8px', marginBottom: 4 }}>
        {accentList.map((scheme) => (
          <AccentRing key={scheme.id} scheme={scheme} isActive={activeAccent === scheme.id} onSelect={onSelectAccent} isDark={isDark} T={T} />
        ))}
      </div>

      {showAccentGenerator && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 4 }}>
          {generatedAccentIdeas.map((idea) => (
            <GeneratedAccentCard
              key={idea.id}
              idea={idea}
              isDark={isDark}
              isActive={activeAccent === 'custom' && customAccentScheme?.accent === idea.accent && customAccentScheme?.accentAlt === idea.accentAlt}
              onApply={onApplyCustomAccentScheme}
            />
          ))}
        </div>
      )}

      {showSurfaceSection && (
        <>
          <Divider isDark={isDark} />
          <SectionLabel isDark={isDark}>卡片材质 Surface</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
            {surfaceList.map((scheme) => (
              <SurfaceCard key={scheme.id} scheme={scheme} isActive={activeSurface === scheme.id} onSelect={onSelectSurface} isDark={isDark} T={T} />
            ))}
          </div>
        </>
      )}

      {showPaletteReferences && (
        <>
          <Divider isDark={isDark} />
          <SectionLabel isDark={isDark}>配色参考 Reference</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 10 }}>
            {PALETTE_REFERENCES.map((item) => (
              <PaletteReferenceCard key={item.id} item={item} isDark={isDark} />
            ))}
          </div>
        </>
      )}

      {showMaterialLab && (
        <>
          <Divider isDark={isDark} />
          <SectionLabel isDark={isDark}>材质实验室 Material Lab</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
            <MaterialSlider
              label="Blur"
              min={-10}
              max={12}
              step={1}
              value={materialTuning?.blurOffset ?? 0}
              format={(value) => `${value >= 0 ? '+' : ''}${value}px`}
              isDark={isDark}
              onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, blurOffset: value }))}
            />
            <MaterialSlider
              label="Saturate"
              min={-60}
              max={100}
              step={5}
              value={materialTuning?.saturateBoost ?? 0}
              format={(value) => `${value >= 0 ? '+' : ''}${value}`}
              isDark={isDark}
              onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, saturateBoost: value }))}
            />
            <MaterialSlider
              label="Opacity"
              min={-0.18}
              max={0.12}
              step={0.01}
              value={materialTuning?.alphaShift ?? 0}
              format={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`}
              isDark={isDark}
              onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, alphaShift: value }))}
            />
            <MaterialSlider
              label="Border"
              min={0.7}
              max={1.8}
              step={0.05}
              value={materialTuning?.borderBoost ?? 1}
              format={(value) => `${value.toFixed(2)}x`}
              isDark={isDark}
              onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, borderBoost: value }))}
            />
            <MaterialSlider
              label="Shadow"
              min={0.5}
              max={1.8}
              step={0.05}
              value={materialTuning?.shadowBoost ?? 1}
              format={(value) => `${value.toFixed(2)}x`}
              isDark={isDark}
              onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, shadowBoost: value }))}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onMaterialTuningChange?.({
                blurOffset: 0,
                saturateBoost: 0,
                alphaShift: 0,
                borderBoost: 1,
                shadowBoost: 1,
              })}
              style={{
                borderRadius: 14,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
                color: isDark ? 'rgba(255,255,255,0.78)' : 'rgba(16,18,34,0.80)',
                fontFamily: FONT_TEXT,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Material
            </motion.button>
          </div>
        </>
      )}
    </>
  );
}

export function ThemePickerSheet({
  isOpen,
  onClose,
  bgScheme,
  accentId,
  surfaceId,
  onSelectBg,
  onSelectAccent,
  onSelectSurface,
  onSelectPreset,
  materialTuning,
  onMaterialTuningChange,
  customAccentScheme,
  onApplyCustomAccentScheme,
}) {
  const T = useT();
  const isDark = T.themeDark ?? true;
  const [shuffleLocks, setShuffleLocks] = useState({ bg: false, accent: false, material: false });
  const [generatorSeed, setGeneratorSeed] = useState(1);
  const [shuffleFeedback, setShuffleFeedback] = useState('先锁住你想保留的维度，再点随机。未锁定的背景、颜色、材质会一起换。');
  const backdropBg = isDark ? 'rgba(6,8,18,0.75)' : 'rgba(220,224,240,0.70)';
  const sheetBg = isDark
    ? (T.glass?.surface1?.replace(/[\d.]+\)$/, '0.90)') ?? 'rgba(10,12,28,0.90)')
    : 'rgba(255,255,255,0.92)';
  const handleColor = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)';
  const titleColor = T.textPrimary ?? '#ffffff';
  const activeBg = bgScheme ?? (isDark ? 'indigo-night-bg' : 'sky-mist-light');
  const activeAccent = accentId ?? (isDark ? 'violet' : 'sky');
  const activeSurface = surfaceId ?? 'glass-mid';
  const handleShuffleTheme = () => {
    const darkBgPool = ['indigo-night-bg', 'slate-ocean-bg', 'jade-whisper-bg', 'mauve-void-bg', 'warm-noir-bg'];
    const lightBgPool = ['sky-mist-light', 'petal-breeze-light', 'sage-cloud-light', 'linen-dusk-light', 'frost-iris-light'];
    const bgPool = isDark ? darkBgPool : lightBgPool;
    const accentPool = isDark
      ? ['violet', 'ocean', 'jade', 'mauve', 'amber']
      : ['sky', 'rose', 'sage', 'amber', 'violet'];
    const materialPool = ['glass-hi', 'glass-mid', 'glass-lo', 'frosted-vivid', 'grain-surface', 'solid'];
    const changedLabels = [];

    if (!shuffleLocks.bg) {
      const nextBg = pickDifferent(bgPool, activeBg);
      if (nextBg !== activeBg) {
        onSelectBg?.(nextBg);
        changedLabels.push(`背景切到 ${BG_SCHEMES[nextBg]?.nameZh || nextBg}`);
      }
    }

    if (!shuffleLocks.accent) {
      const nextAccent = pickDifferent(accentPool, activeAccent);
      if (nextAccent !== activeAccent) {
        onSelectAccent?.(nextAccent);
        changedLabels.push(`颜色切到 ${ACCENT_SCHEMES[nextAccent]?.nameZh || nextAccent}`);
      }
    }

    if (!shuffleLocks.material) {
      const nextSurface = pickDifferent(materialPool, activeSurface);
      if (nextSurface !== activeSurface) {
        onSelectSurface?.(nextSurface);
        changedLabels.push(`材质切到 ${SURFACE_SCHEMES[nextSurface]?.nameZh || nextSurface}`);
      }
    }

    if (changedLabels.length === 0) {
      setShuffleFeedback('三个维度都锁住了。先解锁一个，再点随机才会变。');
      return;
    }

    setGeneratorSeed((prev) => prev + 1);
    setShuffleFeedback(`已重新组合：${changedLabels.join(' · ')}`);
  };
  const handleGenerateAccentIdeas = () => {
    setGeneratorSeed((prev) => prev + 1);
    setShuffleFeedback('已生成一组新的 2-Accent 提案，你可以直接点卡片应用。');
  };
  const activeAccentBase = accentId === 'custom'
    ? (customAccentScheme?.accent ?? T.accent)
    : (ACCENT_SCHEMES[accentId]?.accent ?? T.accent);
  const generatedAccentIdeas = buildGeneratedAccentIdeas(activeAccentBase, isDark, generatorSeed);
  const currentSummary = [
    { label: '背景', value: BG_SCHEMES[activeBg]?.nameZh || activeBg },
    { label: '颜色', value: activeAccent === 'custom' ? '自定义双强调' : (ACCENT_SCHEMES[activeAccent]?.nameZh || activeAccent) },
    { label: '材质', value: SURFACE_SCHEMES[activeSurface]?.nameZh || activeSurface },
  ];
  const presetList = PRESET_KEYS.map((k) => PRESETS[k]);
  const curatedDarkThemes = CURATED_DARK_THEME_IDS.map((themeId) => THEMES[themeId]).filter(Boolean);
  const curatedLightThemes = CURATED_LIGHT_THEME_IDS.map((themeId) => THEMES[themeId]).filter(Boolean);
  const darkBgList = RECOMMENDED_DARK_BG_SCHEMES.map((k) => BG_SCHEMES[k]).filter(Boolean);
  const lightBgList = RECOMMENDED_LIGHT_BG_SCHEMES.map((k) => BG_SCHEMES[k]).filter(Boolean);
  const accentList = ACCENT_SCHEME_KEYS.map((k) => ACCENT_SCHEMES[k]);
  const handleSelectCuratedTheme = (themeId) => {
    const mapped = LEGACY_TO_PRESET?.[themeId];
    if (!mapped) return;
    onSelectBg?.(mapped.bgScheme);
    onSelectAccent?.(mapped.accentId);
    onSelectSurface?.(mapped.surfaceId);
    setShuffleFeedback(`已切到 ${THEMES[themeId]?.themeName || '所选主题'}，接下来可以继续微调背景、颜色和材质。`);
  };
  const isCuratedThemeActive = (themeId) => {
    const mapped = LEGACY_TO_PRESET?.[themeId];
    return Boolean(
      mapped
      && mapped.bgScheme === activeBg
      && mapped.accentId === activeAccent
      && mapped.surfaceId === activeSurface
    );
  };
  const handleApplyGeneratedAccent = (scheme) => {
    onApplyCustomAccentScheme?.(scheme);
    setShuffleFeedback(`已把 ${scheme.labelZh || '这组双强调'} 应用到当前主题颜色。`);
  };
  const handleApplyPaletteReference = (item) => {
    if (!item) return;

    if (item.id === 'glass-recipe') {
      onSelectSurface?.('glass-hi');
      onMaterialTuningChange?.({
        blurOffset: 4,
        saturateBoost: 24,
        alphaShift: 0.03,
        borderBoost: 1.22,
        shadowBoost: 1.12,
      });
      setShuffleFeedback('已套用 Glassmorphism 参数，并切到高透玻璃材质。');
      return;
    }

    const referenceAccent = buildReferenceAccentScheme(item, isDark, T.accent);
    onApplyCustomAccentScheme?.(referenceAccent);

    if (item.id === 'soft-tech') {
      onSelectBg?.(isDark ? 'indigo-night-bg' : 'sky-mist-light');
      onSelectSurface?.('glass-mid');
    }
    if (item.id === 'sage-website') {
      onSelectBg?.('sage-cloud-light');
      onSelectSurface?.('glass-lo');
    }
    if (item.id === 'warm-paper') {
      onSelectBg?.('linen-dusk-light');
      onSelectSurface?.('grain-surface');
    }
    if (item.id === 'pastel-mint') {
      onSelectBg?.('frost-iris-light');
      onSelectSurface?.('glass-lo');
    }

    setShuffleFeedback(`已把 ${item.nameZh} 套到当前主题，接下来可以继续微调材质。`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="tp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 70, background: backdropBg, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
          />

          <motion.div
            key="tp-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 1 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.06}
            onDragEnd={(_, info) => { if (info.offset.y > 80 || info.velocity.y > 300) onClose?.(); }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 71,
              background: sheetBg,
              backdropFilter: T.glass?.blur ?? 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: T.glass?.blur ?? 'blur(28px) saturate(180%)',
              borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '28px 28px 0 0',
              boxShadow: isDark ? '0 -20px 60px rgba(0,0,0,0.45)' : '0 -12px 40px rgba(0,0,0,0.12)',
              maxHeight: '88dvh',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
            }}
          >
            <style>
              {`
                .svu-theme-workspace {
                  display: grid;
                  grid-template-columns: minmax(380px, 0.8fr) minmax(0, 1.2fr);
                  gap: 16px;
                  align-items: start;
                }
                .svu-theme-preview-stack {
                  position: sticky;
                  top: 12px;
                  display: grid;
                  gap: 12px;
                }
                .svu-theme-editor-grid {
                  display: grid;
                  grid-template-columns: repeat(12, minmax(0, 1fr));
                  gap: 14px;
                }
                .svu-theme-material-tools {
                  display: grid;
                  gap: 12px;
                }
                .svu-theme-material-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 10px;
                }
                .svu-theme-locks {
                  display: grid;
                  grid-template-columns: repeat(3, minmax(0, 1fr));
                  gap: 8px;
                }
                .svu-theme-accent-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 10px;
                }
                .svu-theme-surface-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 8px;
                }
                .svu-theme-palette-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 10px;
                }
                @media (max-width: 1080px) {
                  .svu-theme-workspace,
                  .svu-theme-material-grid,
                  .svu-theme-material-tools {
                    grid-template-columns: 1fr;
                  }
                  .svu-theme-preview-stack {
                    position: static;
                  }
                  .svu-theme-editor-grid {
                    grid-template-columns: repeat(6, minmax(0, 1fr));
                  }
                }
                @media (max-width: 720px) {
                  .svu-theme-locks,
                  .svu-theme-accent-grid,
                  .svu-theme-palette-grid,
                  .svu-theme-surface-grid,
                  .svu-theme-editor-grid {
                    grid-template-columns: 1fr;
                  }
                }
              `}
            </style>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, marginBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: handleColor }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 0' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: titleColor, fontFamily: FONT_DISPLAY, letterSpacing: '-0.025em' }}>
                外观 Appearance
              </span>
              <motion.div onClick={onClose} whileTap={{ scale: 0.85 }} style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)', border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke={isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.40)'} strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </motion.div>
            </div>

            <div style={{ padding: '0 22px' }}>
              <div className="svu-theme-workspace" style={{ padding: '12px 0 14px' }}>
                <div className="svu-theme-preview-stack">
                  <BentoPanel
                    title="首页预览"
                    subtitle="这里改成更接近真实首页的信息结构，不再是通用演示页。你调背景、颜色、材质时，看的是首页层级和内容密度。"
                    isDark={isDark}
                    tone="hero"
                    prominence="primary"
                  >
                    <LiveThemePreview
                      bgScheme={bgScheme}
                      accentId={accentId}
                      surfaceId={surfaceId}
                      materialTuning={materialTuning}
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {currentSummary.map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: '7px 10px',
                            borderRadius: 999,
                            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(16,18,34,0.05)',
                            color: isDark ? 'rgba(255,255,255,0.74)' : 'rgba(16,18,34,0.78)',
                            fontSize: 10.5,
                            fontFamily: FONT_TEXT,
                          }}
                        >
                          {item.label} · {item.value}
                        </div>
                      ))}
                    </div>
                  </BentoPanel>
                </div>

                <div className="svu-theme-editor-grid">
                  <div style={{ gridColumn: 'span 5' }}>
                    <BentoPanel
                      title="探索工具"
                      subtitle="把随机、锁定和反馈压缩到一个密集工作区，避免空白大盒子。"
                      isDark={isDark}
                      tone="hero"
                      prominence="primary"
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleShuffleTheme}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 14,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
                            background: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(16,18,34,0.06)',
                            color: titleColor,
                            cursor: 'pointer',
                            fontFamily: FONT_TEXT,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Shuffle
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGenerateAccentIdeas}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 14,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,18,34,0.05)',
                            color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(16,18,34,0.82)',
                            cursor: 'pointer',
                            fontFamily: FONT_TEXT,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          换一组提案
                        </motion.button>
                      </div>
                      <div className="svu-theme-locks">
                        <LockChip
                          label="锁定背景"
                          hint="保留当前背景，只随机颜色和材质。"
                          locked={shuffleLocks.bg}
                          isDark={isDark}
                          onClick={() => setShuffleLocks((prev) => ({ ...prev, bg: !prev.bg }))}
                        />
                        <LockChip
                          label="锁定颜色"
                          hint="保留当前 accent，只随机背景和材质。"
                          locked={shuffleLocks.accent}
                          isDark={isDark}
                          onClick={() => setShuffleLocks((prev) => ({ ...prev, accent: !prev.accent }))}
                        />
                        <LockChip
                          label="锁定材质"
                          hint="保留当前卡片质感，只随机背景和颜色。"
                          locked={shuffleLocks.material}
                          isDark={isDark}
                          onClick={() => setShuffleLocks((prev) => ({ ...prev, material: !prev.material }))}
                        />
                      </div>
                      <div style={{
                        marginTop: 12,
                        padding: '12px 13px',
                        borderRadius: 16,
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,18,34,0.04)',
                        color: isDark ? 'rgba(255,255,255,0.64)' : 'rgba(16,18,34,0.58)',
                        fontSize: 11,
                        lineHeight: 1.6,
                        fontFamily: FONT_TEXT,
                      }}>
                        {shuffleFeedback}
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 4' }}>
                    <BentoPanel
                      title="双强调提案"
                      subtitle="点卡片就会真正应用，不只是展示。"
                      isDark={isDark}
                      tone="contrast"
                      prominence="primary"
                    >
                      <div className="svu-theme-accent-grid">
                        {generatedAccentIdeas.map((idea) => (
                          <GeneratedAccentCard
                            key={idea.id}
                            idea={idea}
                            isDark={isDark}
                            isActive={accentId === 'custom' && customAccentScheme?.accent === idea.accent && customAccentScheme?.accentAlt === idea.accentAlt}
                            onApply={handleApplyGeneratedAccent}
                          />
                        ))}
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 3' }}>
                    <BentoPanel
                      title="扩展预设"
                      subtitle="保留快速回到熟悉方案的入口。"
                      isDark={isDark}
                      tone="subtle"
                      prominence="tertiary"
                    >
                      <PresetRow
                        presets={presetList}
                        currentBg={activeBg}
                        currentAccent={activeAccent}
                        currentSurface={activeSurface}
                        onSelect={onSelectPreset}
                        isDark={isDark}
                        T={T}
                      />
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 3' }}>
                    <BentoPanel
                      title="深色主题"
                      subtitle="先定深色方向。"
                      isDark={isDark}
                      tone="contrast"
                      prominence="secondary"
                    >
                      <div style={{ display: 'grid', gap: 10 }}>
                        {curatedDarkThemes.map((theme) => (
                          <ThemeCard
                            key={theme.themeId}
                            theme={theme}
                            isActive={isCuratedThemeActive(theme.themeId)}
                            onSelect={handleSelectCuratedTheme}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 3' }}>
                    <BentoPanel
                      title="浅色主题"
                      subtitle="浅色区单独成列，识别成本更低。"
                      isDark={isDark}
                      tone="subtle"
                      prominence="secondary"
                    >
                      <div style={{ display: 'grid', gap: 10 }}>
                        {curatedLightThemes.map((theme) => (
                          <ThemeCard
                            key={theme.themeId}
                            theme={theme}
                            isActive={isCuratedThemeActive(theme.themeId)}
                            onSelect={handleSelectCuratedTheme}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 6' }}>
                    <BentoPanel
                      title="颜色"
                      subtitle="Accent 决策集中在一列。"
                      isDark={isDark}
                      tone="neutral"
                      prominence="secondary"
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px 8px' }}>
                        {accentList.map((scheme) => (
                          <AccentRing key={scheme.id} scheme={scheme} isActive={activeAccent === scheme.id} onSelect={onSelectAccent} isDark={isDark} T={T} />
                        ))}
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 12' }}>
                    <BentoPanel
                      title="背景"
                      subtitle="背景区域拉宽，能一次看清推荐的深浅 10 套。"
                      isDark={isDark}
                      tone="contrast"
                      prominence="primary"
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            深色 Dark · 推荐 5
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px 8px' }}>
                            {darkBgList.map((scheme) => (
                              <BgCard key={scheme.id} scheme={scheme} isActive={activeBg === scheme.id} onSelect={onSelectBg} isDark={isDark} T={T} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            浅色 Light · 推荐 5
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px 8px' }}>
                            {lightBgList.map((scheme) => (
                              <BgCard key={scheme.id} scheme={scheme} isActive={activeBg === scheme.id} onSelect={onSelectBg} isDark={isDark} T={T} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 5' }}>
                    <BentoPanel
                      title="材质"
                      subtitle="Surface 和参数压成高密度矩阵，减少空白。"
                      isDark={isDark}
                      tone="neutral"
                      prominence="primary"
                    >
                      <div className="svu-theme-material-tools">
                        <div className="svu-theme-surface-grid">
                          {SURFACE_SCHEME_KEYS.map((schemeId) => (
                            <SurfaceCard
                              key={schemeId}
                              scheme={SURFACE_SCHEMES[schemeId]}
                              isActive={activeSurface === schemeId}
                              onSelect={onSelectSurface}
                              isDark={isDark}
                              T={T}
                            />
                          ))}
                        </div>
                        <div className="svu-theme-material-grid">
                          <MaterialSlider
                            label="Blur"
                            min={-10}
                            max={12}
                            step={1}
                            value={materialTuning?.blurOffset ?? 0}
                            format={(value) => `${value >= 0 ? '+' : ''}${value}px`}
                            isDark={isDark}
                            onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, blurOffset: value }))}
                          />
                          <MaterialSlider
                            label="Saturate"
                            min={-60}
                            max={100}
                            step={5}
                            value={materialTuning?.saturateBoost ?? 0}
                            format={(value) => `${value >= 0 ? '+' : ''}${value}`}
                            isDark={isDark}
                            onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, saturateBoost: value }))}
                          />
                          <MaterialSlider
                            label="Opacity"
                            min={-0.18}
                            max={0.12}
                            step={0.01}
                            value={materialTuning?.alphaShift ?? 0}
                            format={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`}
                            isDark={isDark}
                            onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, alphaShift: value }))}
                          />
                          <MaterialSlider
                            label="Border"
                            min={0.7}
                            max={1.8}
                            step={0.05}
                            value={materialTuning?.borderBoost ?? 1}
                            format={(value) => `${value.toFixed(2)}x`}
                            isDark={isDark}
                            onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, borderBoost: value }))}
                          />
                          <MaterialSlider
                            label="Shadow"
                            min={0.5}
                            max={1.8}
                            step={0.05}
                            value={materialTuning?.shadowBoost ?? 1}
                            format={(value) => `${value.toFixed(2)}x`}
                            isDark={isDark}
                            onChange={(value) => onMaterialTuningChange?.((prev) => ({ ...prev, shadowBoost: value }))}
                          />
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onMaterialTuningChange?.({
                              blurOffset: 0,
                              saturateBoost: 0,
                              alphaShift: 0,
                              borderBoost: 1,
                              shadowBoost: 1,
                            })}
                            style={{
                              borderRadius: 14,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.82)',
                              color: isDark ? 'rgba(255,255,255,0.78)' : 'rgba(16,18,34,0.80)',
                              fontFamily: FONT_TEXT,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Reset
                          </motion.button>
                        </div>
                      </div>
                    </BentoPanel>
                  </div>

                  <div style={{ gridColumn: 'span 7' }}>
                    <BentoPanel
                      title="参考配方"
                      subtitle="来源还在，但主任务已经变成直接落地到当前主题。"
                      isDark={isDark}
                      tone="contrast"
                      prominence="secondary"
                    >
                      <div className="svu-theme-palette-grid">
                        {PALETTE_REFERENCES.map((item) => (
                          <PaletteReferenceCard key={item.id} item={item} isDark={isDark} onApply={handleApplyPaletteReference} />
                        ))}
                      </div>
                    </BentoPanel>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
