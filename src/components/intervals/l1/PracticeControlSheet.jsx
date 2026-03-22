// components/intervals/l1/PracticeControlSheet.jsx
//
// 完全按 intervals_remaining_screens.html 像素级还原
//
// CSS 来源（直接从 HTML 抄）：
//   .l1-sheet  → background:rgba(18,18,30,.97), border-radius:18px 18px 0 0
//   .l1-row    → display:flex; gap:5px; padding:4px 8px; flex-shrink:0
//   .l1-card   → background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
//                border-radius:10px; display:flex; align-items:center; justify-content:center;
//                font-size:10px; color:rgba(255,255,255,.6)
//
// 布局（height:200px）：
//   handle (6px auto margin)
//   top row  h:75px → 左列 flex:.46 [Mode flex:3 + Zone flex:1] | 右列 flex:.54 [Intervals h:100%]
//   bot row  h:60px → Space flex:1 | Flow flex:1
//   tabbar   h:36px → border-top, space-around
//
// 交互（React Bits Scroll Stack 灵感）：
//   Mode / Intervals card → 点击下一项，值用 y-slide AnimatePresence 切换
//   Zone → 仅 blind 时替换 Zone 占位卡（AnimatePresence）
//   Space / Flow → 点击循环切换；长按 480ms → 关 L1 → 开 L2

import React, { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// ── 数据 ─────────────────────────────────────────────────────
const MODE_CYCLE = [
  { id: 'learning',  label: 'Visual'     },
  { id: 'blind',     label: 'Blind'      },
  { id: 'rootFirst', label: 'Root First' },
  { id: 'coreDrill', label: 'Core Drill' },
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

// ── l1-card 基础样式工厂 ─────────────────────────────────────
// 直接映射 HTML 的 .l1-card CSS
function cardStyle(isDark, extra = {}) {
  return {
    background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: isDark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)',
    fontFamily: FONT_TEXT,
    ...extra,
  };
}

// ── React Bits Scroll Stack 灵感：值滑动切换动画 ──────────────
// 点击时旧值向上飞出，新值从下滑入
function SlideValue({ value, color }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          fontSize: 8,
          opacity: 0.5,
          color: color ?? 'inherit',
          fontFamily: FONT_TEXT,
          lineHeight: 1,
          display: 'block',
        }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ── 循环切换卡（Mode / Intervals）────────────────────────────
// HTML: flex card，居中，title + 当前 value（小字）
// 点击 → 下一项（值 y-slide）
function CycleCard({ title, value, onTap, isDark, style = {} }) {
  return (
    <motion.div
      onClick={onTap}
      whileTap={{ scale: 0.95, opacity: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        ...cardStyle(isDark, {
          flexDirection: 'column',
          gap: 3,
          cursor: 'pointer',
          userSelect: 'none',
          ...style,
        }),
      }}
    >
      <span style={{ lineHeight: 1 }}>{title}</span>
      <SlideValue value={value} />
    </motion.div>
  );
}

// ── Zone 卡（blind 时替换占位卡）────────────────────────────
// HTML: flex:1, font-size:9px, rgba(255,255,255,.3)
// blind 时变成 4 个小按钮横排
function ZoneCard({ zoneId, onChange, isDark }) {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 3 }}>
      {ZONE_ITEMS.map(z => {
        const active = zoneId === z.id;
        return (
          <motion.button
            key={z.id}
            onClick={() => onChange(z.id)}
            whileTap={{ scale: 0.9 }}
            style={{
              flex: 1,
              background: active
                ? (isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)')
                : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'),
              border: `1px solid ${active
                ? (isDark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.10)')
                : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)')}`,
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 9,
              fontWeight: active ? 600 : 400,
              color: isDark
                ? (active ? 'rgba(255,255,255,.80)' : 'rgba(255,255,255,.30)')
                : (active ? 'rgba(0,0,0,.70)'       : 'rgba(0,0,0,.28)'),
              fontFamily: FONT_TEXT,
              lineHeight: 1,
            }}>
              {z.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Space / Flow 卡────────────────────────────────────────────
// HTML: flex:1, flexDirection:column, gap:2px, title + 小字 value
// 点击循环；长按 → L2
function SpaceFlowCard({ title, value, onTap, onLongPress, isDark }) {
  const timerRef  = useRef(null);
  const firedRef  = useRef(false);

  const down = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress?.();
    }, 480);
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

  return (
    <motion.div
      onMouseDown={down} onMouseUp={up} onMouseLeave={cancel}
      onTouchStart={down} onTouchEnd={up} onTouchCancel={cancel}
      whileTap={{ scale: 0.95, opacity: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={cardStyle(isDark, {
        flex: 1,
        flexDirection: 'column',
        gap: 2,
        cursor: 'pointer',
        userSelect: 'none',
      })}
    >
      <span style={{ lineHeight: 1 }}>{title}</span>
      <SlideValue value={value} />
    </motion.div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
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

  // ── 循环逻辑 ───────────────────────────────────────────────
  const modeIdx  = MODE_CYCLE.findIndex(m => m.id === practiceMode);
  const modeLabel = MODE_CYCLE[modeIdx]?.label ?? 'Visual';
  const cycleMode = () =>
    onPracticeModeChange(MODE_CYCLE[(modeIdx + 1) % MODE_CYCLE.length].id);

  const ivIdx   = INTERVAL_CYCLE.findIndex(i => i.id === intervalsPreset);
  const ivLabel = INTERVAL_CYCLE[Math.max(0, ivIdx)]?.label ?? 'All 11';
  const cycleIv = () => {
    const next = INTERVAL_CYCLE[(Math.max(0, ivIdx) + 1) % INTERVAL_CYCLE.length];
    onIntervalsPreset(next.id);
  };

  const spIdx  = SPACE_CYCLE.indexOf(spacePresetId ?? 'full');
  const cycleSpace = () => onSpacePreset(SPACE_CYCLE[(spIdx + 1) % SPACE_CYCLE.length]);

  const flIdx  = FLOW_CYCLE.indexOf(flowPreset ?? 'free');
  const cycleFlow = () => onFlowPreset(FLOW_CYCLE[(flIdx + 1) % FLOW_CYCLE.length]);

  // ── 颜色 token（直接从 HTML）──────────────────────────────
  const sheetBg   = isDark ? 'rgba(18,18,30,.97)'      : 'rgba(255,255,255,.98)';
  const topBorder = isDark ? 'rgba(255,255,255,.10)'   : 'rgba(0,0,0,.10)';
  const handleBg  = isDark ? 'rgba(255,255,255,.20)'   : 'rgba(0,0,0,.15)';
  const tabBorder = isDark ? 'rgba(255,255,255,.06)'   : 'rgba(0,0,0,.06)';
  const tabActive = isDark ? 'rgba(100,150,255,.9)'    : '#1a6cf5';
  const tabMuted  = isDark ? 'rgba(255,255,255,.25)'   : 'rgba(0,0,0,.25)';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* tap-outside 关闭 */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />

          {/* ── l1-sheet ── */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRINGS_IV.sheetOpen}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
              if (info.offset.y > 55 || info.velocity.y > 280) onClose();
            }}
            style={{
              // .l1-sheet
              position: 'fixed',
              bottom: bottomOffset,
              left: 0, right: 0,
              zIndex: 50,
              background: sheetBg,
              borderRadius: '18px 18px 0 0',
              borderTop: `1px solid ${topBorder}`,
              boxShadow: isDark ? 'none' : '0 -8px 32px rgba(0,0,0,.12)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ── handle ── */}
            {/* .bbar-handle: width:28px height:3px margin:6px auto 4px */}
            <div style={{
              width: 28, height: 3, borderRadius: 2,
              background: handleBg,
              margin: '6px auto 4px',
              flexShrink: 0,
            }} />

            {/* ── top row — h:75px ── */}
            {/* .l1-row: display:flex gap:5px padding:4px 8px */}
            <div style={{
              display: 'flex', gap: 5, padding: '4px 8px',
              height: 75, flexShrink: 0,
            }}>

              {/* 左列 flex:.46 — Mode (flex:3) + Zone (flex:1) */}
              <div style={{
                flex: 0.46,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {/* Mode card — flex:3 */}
                <CycleCard
                  title="Mode"
                  value={modeLabel}
                  onTap={cycleMode}
                  isDark={isDark}
                  style={{ flex: 3 }}
                />

                {/* Zone — flex:1 */}
                {/* blind → Zone 按钮条；其余 → 占位卡 */}
                <div style={{ flex: 1, display: 'flex' }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isBlind ? (
                      <motion.div
                        key="zone-active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.14 }}
                        style={{ flex: 1, display: 'flex' }}
                      >
                        <ZoneCard
                          zoneId={zoneId}
                          onChange={onZoneChange}
                          isDark={isDark}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="zone-placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.14 }}
                        style={{
                          flex: 1,
                          ...cardStyle(isDark, {
                            fontSize: 9,
                            color: isDark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.28)',
                          }),
                        }}
                      >
                        Zone
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 右列 flex:.54 — Intervals full height */}
              <div style={{ flex: 0.54 }}>
                <CycleCard
                  title="Intervals"
                  value={ivLabel}
                  onTap={cycleIv}
                  isDark={isDark}
                  style={{ height: '100%' }}
                />
              </div>
            </div>

            {/* ── bottom row — h:60px ── */}
            <div style={{
              display: 'flex', gap: 5, padding: '4px 8px',
              height: 60, flexShrink: 0,
            }}>
              <SpaceFlowCard
                title="Space"
                value={SPACE_LABEL[spacePresetId] ?? 'Full board'}
                onTap={cycleSpace}
                onLongPress={() => {
                  onClose();
                  setTimeout(() => onOpenSpaceL2?.(), 80);
                }}
                isDark={isDark}
              />
              <SpaceFlowCard
                title="Flow"
                value={FLOW_LABEL[flowPreset] ?? 'Free'}
                onTap={cycleFlow}
                onLongPress={() => {
                  onClose();
                  setTimeout(() => onOpenFlowL2?.(), 80);
                }}
                isDark={isDark}
              />
            </div>

            {/* ── TabBar — h:36px ── */}
            <div style={{
              height: 36, flexShrink: 0,
              borderTop: `1px solid ${tabBorder}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-around', padding: '0 10px',
            }}>
              {['Home', 'Notes', 'Intervals', 'Changes', 'Scales', 'Me'].map(t => (
                <span key={t} style={{
                  fontSize: 9,
                  fontWeight: t === 'Intervals' ? 700 : 400,
                  color: t === 'Intervals' ? tabActive : tabMuted,
                  fontFamily: FONT_TEXT,
                }}>
                  {t}
                </span>
              ))}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
