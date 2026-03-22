// components/intervals/l1/PracticeControlSheet.jsx
// Fix 2: Intervals CycleCard 加长按进入 L2
// Fix 3: Space/Flow onContextMenu 已有，保留

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
  background:     isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
  border:         `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
  borderRadius:   12,
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
        initial={{ y: 7, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -7, opacity: 0 }}
        transition={{ duration: 0.14 }}
        style={{ fontSize: 11, opacity: 0.45, display: 'block', lineHeight: 1 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ── 通用长按卡片 — Mode / Intervals / Space / Flow 都用这个 ──
// onTap = 短按（循环切换）
// onLongPress = 长按进入 L2（可选）
function PressCard({ title, value, icon, onTap, onLongPress, isDark, style = {} }) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);

  const down = useCallback((e) => {
    // 阻止默认（防止 iOS 触发系统长按菜单）
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

  // onContextMenu = iOS/Android 长按最可靠的触发方式
  const ctxMenu = useCallback((e) => {
    e.preventDefault();
    if (!onLongPress) return;
    clearTimeout(timerRef.current);
    firedRef.current = true;
    onLongPress();
  }, [onLongPress]);

  const fg = isDark ? 'rgba(255,255,255,.60)' : 'rgba(0,0,0,.58)';

  return (
    <motion.div
      onMouseDown={down}  onMouseUp={up}  onMouseLeave={cancel}
      onTouchStart={down} onTouchEnd={up} onTouchCancel={cancel}
      onContextMenu={ctxMenu}
      whileTap={{ scale: 0.94, opacity: 0.75 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={cardStyle(isDark, {
        flexDirection: 'column',
        gap: 5,
        cursor: 'pointer',
        userSelect: 'none',
        ...style,
      })}
    >
      {icon && <Icon type={icon} size={17} color={fg} />}
      <span style={{ fontSize: 12, fontWeight: 600, color: fg, lineHeight: 1 }}>{title}</span>
      <SlideValue value={value} />
      {/* 长按提示点 */}
      {onLongPress && (
        <div style={{
          position: 'absolute', bottom: 6, right: 6,
          width: 3, height: 3, borderRadius: '50%',
          background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
        }} />
      )}
    </motion.div>
  );
}

function ZoneStrip({ zoneId, onChange, isDark }) {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 4 }}>
      {ZONE_ITEMS.map(z => {
        const act = zoneId === z.id;
        return (
          <motion.button
            key={z.id}
            onClick={() => onChange(z.id)}
            whileTap={{ scale: 0.90 }}
            style={{
              flex: 1, height: '100%',
              background: act ? (isDark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.08)') : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'),
              border: `1px solid ${act ? (isDark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.10)') : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)')}`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: act ? 600 : 400,
              color: isDark ? (act ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.30)') : (act ? 'rgba(0,0,0,.75)' : 'rgba(0,0,0,.28)'),
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

  const modeIdx    = MODE_CYCLE.findIndex(m => m.id === practiceMode);
  const currentMode= MODE_CYCLE[modeIdx] ?? MODE_CYCLE[0];
  const cycleMode  = () => onPracticeModeChange(MODE_CYCLE[(modeIdx + 1) % MODE_CYCLE.length].id);

  const ivIdx   = INTERVAL_CYCLE.findIndex(i => i.id === intervalsPreset);
  const ivLabel = INTERVAL_CYCLE[Math.max(0, ivIdx)]?.label ?? 'All 11';
  const cycleIv = () => onIntervalsPreset(INTERVAL_CYCLE[(Math.max(0, ivIdx) + 1) % INTERVAL_CYCLE.length].id);

  const spIdx     = SPACE_CYCLE.indexOf(spacePresetId ?? 'full');
  const cycleSpace= () => onSpacePreset(SPACE_CYCLE[(spIdx + 1) % SPACE_CYCLE.length]);

  const flIdx    = FLOW_CYCLE.indexOf(flowPreset ?? 'free');
  const cycleFlow= () => onFlowPreset(FLOW_CYCLE[(flIdx + 1) % FLOW_CYCLE.length]);

  const sheetBg   = isDark ? 'rgba(18,18,30,.97)' : 'rgba(255,255,255,.98)';
  const topBorder = isDark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)';
  const handleCol = isDark ? 'rgba(255,255,255,.20)' : 'rgba(0,0,0,.15)';

  return (
    <AnimatePresence>
      {open && (
        <>
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />

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
              position: 'fixed',
              bottom: bottomOffset,
              left: 0, right: 0,
              zIndex: 50,
              background: sheetBg,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: `1px solid ${topBorder}`,
              borderRadius: '18px 18px 0 0',
              boxShadow: isDark ? 'none' : '0 -8px 32px rgba(0,0,0,.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* handle */}
            <div style={{
              width: 28, height: 3, borderRadius: 2,
              background: handleCol,
              margin: '10px auto 5px',
              flexShrink: 0,
            }} />

            {/* top row: Mode (左) + Intervals (右) */}
            <div style={{
              display: 'flex', gap: 6,
              padding: '0 12px',
              height: 110, flexShrink: 0,
            }}>
              {/* 左列: Mode flex:3 + Zone flex:1 */}
              <div style={{ flex: 0.46, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {/* Mode: 短按循环，无长按 */}
                <PressCard
                  title="Mode"
                  value={currentMode.label}
                  icon={currentMode.icon}
                  onTap={cycleMode}
                  isDark={isDark}
                  style={{ flex: 3, position: 'relative' }}
                />

                {/* Zone */}
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
                          flex: 1, fontSize: 10,
                          color: isDark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.24)',
                        })}
                      >
                        Zone
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 右列: Intervals — 短按循环，长按进 L2 */}
              <div style={{ flex: 0.54, position: 'relative' }}>
                <PressCard
                  title="Intervals"
                  value={ivLabel}
                  icon="music"
                  onTap={cycleIv}
                  onLongPress={onOpenIntervalsL2}   // ← Fix 2: 长按进 L2
                  isDark={isDark}
                  style={{ height: '100%', position: 'relative' }}
                />
              </div>
            </div>

            {/* bottom row: Space + Flow */}
            <div style={{
              display: 'flex', gap: 6,
              padding: '6px 12px 16px',
              height: 90, flexShrink: 0,
            }}>
              <PressCard
                title="Space"
                value={SPACE_LABEL[spacePresetId] ?? 'Full board'}
                icon="grid"
                onTap={cycleSpace}
                onLongPress={onOpenSpaceL2}
                isDark={isDark}
                style={{ flex: 1, position: 'relative' }}
              />
              <PressCard
                title="Flow"
                value={FLOW_LABEL[flowPreset] ?? 'Free'}
                icon="flow"
                onTap={cycleFlow}
                onLongPress={onOpenFlowL2}
                isDark={isDark}
                style={{ flex: 1, position: 'relative' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
