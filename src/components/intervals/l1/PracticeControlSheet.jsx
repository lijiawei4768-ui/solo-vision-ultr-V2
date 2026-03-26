// components/intervals/l1/PracticeControlSheet.jsx
// v2.1 — 원본 4-card 레이아웃 유지 + 크기 확대
// 상행 160px (Mode+Zone | Intervals), 하행 128px (Space | Flow)
// tab bar는 App 레벨에서 hidden 처리되므로 bottom padding은 safe-area만

import React, { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const MODE_CYCLE = [
  { id: 'learning',  label: 'Visual',     icon: 'eye'     },
  { id: 'blind',     label: 'Blind',      icon: 'eye-off' },
  { id: 'rootFirst', label: 'Root First', icon: 'root'    },
  { id: 'coreDrill', label: 'Core Drill', icon: 'target'  },
];
const INTERVAL_CYCLE = [
  { id: 'all',     label: 'All 11' },
  { id: 'triad',   label: 'Triad'  },
  { id: 'seventh', label: '7th'    },
  { id: 'guide',   label: 'Guide'  },
];
const ZONE_ITEMS = [
  { id: 'off',  label: 'Off'  },
  { id: 'low',  label: 'Low'  },
  { id: 'mid',  label: 'Mid'  },
  { id: 'high', label: 'High' },
];
const SPACE_CYCLE = ['full', 'pos1', 'pos5', 'ead'];
const SPACE_LABEL = { full: 'Full board', pos1: '1–5', pos5: '5–9', ead: 'EAD' };
const FLOW_CYCLE  = ['free', 'low-high', 'high-low'];
const FLOW_LABEL  = { free: 'Free', 'low-high': 'Low → High', 'high-low': 'High → Low' };

function Icon({ type, size = 16, color }) {
  const s = { width: size, height: size, display: 'block' };
  switch (type) {
    case 'eye':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="10" rx="8" ry="5" stroke={color} strokeWidth="1.3"/><circle cx="10" cy="10" r="2.2" fill={color}/></svg>;
    case 'eye-off':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M2 10 Q10 4 18 10 Q10 16 2 10" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><line x1="4" y1="4" x2="16" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>;
    case 'root':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><circle cx="6" cy="10" r="2.8" fill={color}/><path d="M10 9 Q13 5 16 9" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/><circle cx="16" cy="10.5" r="2.2" stroke={color} strokeWidth="1.3"/></svg>;
    case 'target':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.1"/><circle cx="10" cy="10" r="4" stroke={color} strokeWidth="1.1"/><circle cx="10" cy="10" r="1.2" fill={color}/></svg>;
    case 'music':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M8 15V6l8-1.5V13" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="15" r="2" stroke={color} strokeWidth="1.2"/><circle cx="14" cy="13" r="2" stroke={color} strokeWidth="1.2"/></svg>;
    case 'grid':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.2"/></svg>;
    case 'flow':
      return <svg style={s} viewBox="0 0 20 20" fill="none"><path d="M4 10 Q10 4 16 10" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/><path d="M4 10 Q10 16 16 10" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" strokeDasharray="2 2"/></svg>;
    default: return null;
  }
}

const cardStyle = (isDark, extra = {}) => ({
  background:     isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)',
  border:         `1px solid ${isDark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.07)'}`,
  borderRadius:   16,
  fontFamily:     FONT_TEXT,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  ...extra,
});

function SlideValue({ value }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.16, ease: [0.32, 0, 0.22, 1] }}
        style={{ fontSize: 12, opacity: 0.50, display: 'block', lineHeight: 1 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function PressCard({ title, value, icon, onTap, onLongPress, isDark, style = {} }) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);

  const down = useCallback(() => {
    firedRef.current = false;
    if (onLongPress) {
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, 480);
    }
  }, [onLongPress]);

  const up = useCallback(() => {
    clearTimeout(timerRef.current);
    if (!firedRef.current) onTap?.();
    firedRef.current = false;
  }, [onTap]);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    firedRef.current = false;
  }, []);

  const ctxMenu = useCallback((e) => {
    e.preventDefault();
    if (!onLongPress) return;
    clearTimeout(timerRef.current);
    firedRef.current = true;
    onLongPress();
  }, [onLongPress]);

  const fg = isDark ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.60)';

  return (
    <motion.div
      onMouseDown={down}  onMouseUp={up}  onMouseLeave={cancel}
      onTouchStart={down} onTouchEnd={up} onTouchCancel={cancel}
      onContextMenu={ctxMenu}
      whileTap={{ scale: 0.93, opacity: 0.72 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={cardStyle(isDark, {
        flexDirection: 'column',
        gap: 7,
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        ...style,
      })}
    >
      {icon && <Icon type={icon} size={20} color={fg} />}
      <span style={{ fontSize: 14, fontWeight: 600, color: fg, lineHeight: 1 }}>{title}</span>
      <SlideValue value={value} />
      {onLongPress && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          width: 4, height: 4, borderRadius: '50%',
          background: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)',
        }} />
      )}
    </motion.div>
  );
}

function ZoneStrip({ zoneId, onChange, isDark }) {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 5 }}>
      {ZONE_ITEMS.map(z => {
        const act = zoneId === z.id;
        return (
          <motion.button
            key={z.id}
            onClick={() => onChange(z.id)}
            whileTap={{ scale: 0.88 }}
            style={{
              flex: 1, height: '100%',
              background: act
                ? (isDark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.09)')
                : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'),
              border: `1px solid ${act
                ? (isDark ? 'rgba(255,255,255,.20)' : 'rgba(0,0,0,.12)')
                : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)')}`,
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 12, fontWeight: act ? 600 : 400,
              color: isDark
                ? (act ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.32)')
                : (act ? 'rgba(0,0,0,.78)'        : 'rgba(0,0,0,.30)'),
              fontFamily: FONT_TEXT,
            }}>
              {z.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function PracticeControlSheet({
  open, onClose,
  practiceMode, onPracticeModeChange,
  zoneId, onZoneChange,
  intervalsPreset, onIntervalsPreset,
  spacePresetId, onSpacePreset,
  flowPreset, onFlowPreset,
  onOpenSpaceL2, onOpenFlowL2, onOpenIntervalsL2,
  bottomOffset = 0,
}) {
  const isDark  = useIsDark();
  const isBlind = practiceMode === 'blind';

  const modeIdx     = MODE_CYCLE.findIndex(m => m.id === practiceMode);
  const currentMode = MODE_CYCLE[modeIdx] ?? MODE_CYCLE[0];
  const cycleMode   = () => onPracticeModeChange(MODE_CYCLE[(modeIdx + 1) % MODE_CYCLE.length].id);

  const ivIdx   = INTERVAL_CYCLE.findIndex(i => i.id === intervalsPreset);
  const ivLabel = INTERVAL_CYCLE[Math.max(0, ivIdx)]?.label ?? 'All 11';
  const cycleIv = () => onIntervalsPreset(INTERVAL_CYCLE[(Math.max(0, ivIdx) + 1) % INTERVAL_CYCLE.length].id);

  const spIdx      = SPACE_CYCLE.indexOf(spacePresetId ?? 'full');
  const cycleSpace = () => onSpacePreset(SPACE_CYCLE[(spIdx + 1) % SPACE_CYCLE.length]);

  const flIdx     = FLOW_CYCLE.indexOf(flowPreset ?? 'free');
  const cycleFlow = () => onFlowPreset(FLOW_CYCLE[(flIdx + 1) % FLOW_CYCLE.length]);

  const sheetBg   = isDark ? 'rgba(16,16,28,.97)' : 'rgba(248,248,252,.98)';
  const topBorder = isDark ? 'rgba(255,255,255,.11)' : 'rgba(0,0,0,.10)';
  const handleCol = isDark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.16)';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 48 }} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRINGS_IV.sheetOpen}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 280) onClose();
            }}
            style={{
              position:             'fixed',
              bottom:               bottomOffset,
              left: 0, right: 0,
              zIndex:               50,
              background:           sheetBg,
              backdropFilter:       'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              borderTop:            `1px solid ${topBorder}`,
              borderRadius:         '24px 24px 0 0',
              boxShadow:            isDark
                ? '0 -8px 40px rgba(0,0,0,0.55)'
                : '0 -4px 24px rgba(0,0,0,0.10)',
              display:              'flex',
              flexDirection:        'column',
            }}
          >
            {/* drag handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: handleCol,
              margin: '14px auto 8px',
              flexShrink: 0,
            }} />

            {/* ── 상행: Mode (왼쪽) + Intervals (오른쪽) — 160px ── */}
            <div style={{
              display: 'flex', gap: 9,
              padding: '0 14px',
              height: 160, flexShrink: 0,
            }}>
              {/* 左列: Mode 大卡 + Zone strip */}
              <div style={{ flex: 0.46, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <PressCard
                  title="Mode"
                  value={currentMode.label}
                  icon={currentMode.icon}
                  onTap={cycleMode}
                  isDark={isDark}
                  style={{ flex: 3 }}
                />
                <div style={{ flex: 1, display: 'flex' }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isBlind ? (
                      <motion.div
                        key="zone-on"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.13 }}
                        style={{ flex: 1, display: 'flex' }}
                      >
                        <ZoneStrip zoneId={zoneId} onChange={onZoneChange} isDark={isDark} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="zone-off"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.13 }}
                        style={cardStyle(isDark, {
                          flex: 1, fontSize: 12,
                          color: isDark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.24)',
                        })}
                      >
                        Zone
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 右列: Intervals 大卡 — 短按循环，长按进 L2 */}
              <div style={{ flex: 0.54 }}>
                <PressCard
                  title="Intervals"
                  value={ivLabel}
                  icon="music"
                  onTap={cycleIv}
                  onLongPress={onOpenIntervalsL2}
                  isDark={isDark}
                  style={{ height: '100%' }}
                />
              </div>
            </div>

            {/* ── 하행: Space + Flow — 128px ── */}
            <div style={{
              display: 'flex', gap: 9,
              padding: '9px 14px 0',
              height: 128, flexShrink: 0,
            }}>
              <PressCard
                title="Space"
                value={SPACE_LABEL[spacePresetId] ?? 'Full board'}
                icon="grid"
                onTap={cycleSpace}
                onLongPress={onOpenSpaceL2}
                isDark={isDark}
                style={{ flex: 1 }}
              />
              <PressCard
                title="Flow"
                value={FLOW_LABEL[flowPreset] ?? 'Free'}
                icon="flow"
                onTap={cycleFlow}
                onLongPress={onOpenFlowL2}
                isDark={isDark}
                style={{ flex: 1 }}
              />
            </div>

            {/* safe-area bottom 垫高 */}
            <div style={{
              height: 'max(env(safe-area-inset-bottom, 0px), 20px)',
              flexShrink: 0,
            }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
