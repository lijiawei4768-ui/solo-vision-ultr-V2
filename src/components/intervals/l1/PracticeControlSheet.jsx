// components/intervals/l1/PracticeControlSheet.jsx
//
// 布局完全照 intervals_remaining_screens.html 还原
//
// ┌─────────────────────────────────────────────────┐
// │  handle                                         │
// ├───────────────────────┬─────────────────────────┤  ← l1-row h:75px
// │  [Mode stack]  flex.46│  [Intervals stack] .54  │
// │  [Zone bar  ]         │                         │
// ├───────────────────────┴─────────────────────────┤  ← l1-row h:60px
// │  [Space]              │  [Flow]                 │
// ├─────────────────────────────────────────────────┤
// │  TabBar                                         │
// └─────────────────────────────────────────────────┘
//
// Mode / Intervals → React Bits "Stack" pattern
//   来源：https://reactbits.dev/components/stack
//   逻辑：cards 叠放，随机微旋转；点击最上卡 → sendToBack → 循环到下一张
//
// Space / Flow → Aceternity 风格 tap-card
//   点击循环切换 preset；长按进 L2

import React, { useContext, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// ─── ink helper ──────────────────────────────────────────────
const ink = (isDark, a) =>
  isDark ? `rgba(235,235,245,${a})` : `rgba(0,0,0,${a})`;

// ─── Data ────────────────────────────────────────────────────
const MODE_CARDS = [
  { id: 'learning',  label: 'Visual',     sub: '指板可见' },
  { id: 'blind',     label: 'Blind',      sub: '指板隐藏' },
  { id: 'rootFirst', label: 'Root First', sub: '根音优先' },
  { id: 'coreDrill', label: 'Core Drill', sub: '核心训练' },
];

const INTERVAL_CARDS = [
  { id: 'all',     label: 'All',    sub: '11 ivls'   },
  { id: 'triad',   label: 'Triad',  sub: '3rd + 5th' },
  { id: 'seventh', label: '7th',    sub: '3+5+b7'    },
  { id: 'guide',   label: 'Guide',  sub: '3rd + 7th' },
];

const ZONE_OPTS = [
  { id: 'off',  label: 'Off'        },
  { id: 'low',  label: 'Low',  sub: '1–5'  },
  { id: 'mid',  label: 'Mid',  sub: '5–9'  },
  { id: 'high', label: 'High', sub: '9–12' },
];

const SPACE_CYCLE = ['full', 'pos1', 'pos5', 'ead'];
const SPACE_META  = { full: 'Full board', pos1: '1–5', pos5: '5–9', ead: 'EAD strings' };

const FLOW_CYCLE = ['free', 'low-high', 'high-low'];
const FLOW_META  = { free: 'Free', 'low-high': 'Low → High', 'high-low': 'High → Low' };

// ─── React Bits Stack ─────────────────────────────────────────
// 核心逻辑：
//   cards 数组，最后一项 = 视觉最上层
//   点击最上层卡 → sendToBack → 该卡移到数组头部（最底层）
//   外部 onSelect 接收新的当前选中 id（新的最上层）
//
// 旋转：每张非顶层卡有一个固定的微旋转（±1.5°），紧凑空间内几乎看不出叠层
//        但点击瞬间有弹簧动画 —— 这就是 Stack 的质感
function ReactBitsStack({ items, selectedId, onSelect, renderTopCard, isDark }) {
  // 维护内部 cards 顺序（最后一项 = 当前顶层）
  const [order, setOrder] = useState(() => {
    const idx = items.findIndex(i => i.id === selectedId);
    if (idx <= 0) return [...items];
    return [...items.slice(0, idx), ...items.slice(idx + 1), items[idx]];
  });

  // 当外部 selectedId 变化时同步顺序
  React.useEffect(() => {
    setOrder(prev => {
      const top = prev[prev.length - 1];
      if (top?.id === selectedId) return prev;
      const idx = prev.findIndex(i => i.id === selectedId);
      if (idx < 0) return prev;
      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1), prev[idx]];
      return next;
    });
  }, [selectedId]);

  const sendToBack = () => {
    setOrder(prev => {
      if (prev.length < 2) return prev;
      const top = prev[prev.length - 1];
      const next = [top, ...prev.slice(0, -1)];
      onSelect(next[next.length - 1].id); // 新的顶层
      return next;
    });
  };

  const total = order.length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {order.map((card, idx) => {
        const isTop   = idx === total - 1;
        const depth   = total - 1 - idx; // 0=top，越大越底层
        // 微旋转：底层卡轻微倾斜，顶层正 0
        const rotateZ = isTop ? 0 : (idx % 2 === 0 ? -1.8 : 1.8);
        // 底层卡微微下移
        const translateY = depth * 2;

        return (
          <motion.div
            key={card.id}
            onClick={isTop ? sendToBack : undefined}
            animate={{
              rotateZ,
              y: translateY,
              scale: 1 - depth * 0.015,
              zIndex: idx,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 10,
              background: isDark
                ? `rgba(255,255,255,${isTop ? 0.08 : 0.04})`
                : `rgba(0,0,0,${isTop ? 0.06 : 0.03})`,
              border: `1px solid ${isDark
                ? `rgba(255,255,255,${isTop ? 0.10 : 0.06})`
                : `rgba(0,0,0,${isTop ? 0.08 : 0.04})`}`,
              cursor: isTop ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 3,
              overflow: 'hidden',
            }}
          >
            {/* 只渲染顶层卡的内容 */}
            {isTop && renderTopCard(card)}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Zone strip ───────────────────────────────────────────────
function ZoneStrip({ zoneId, onChange, isDark }) {
  return (
    <div style={{ display: 'flex', gap: 3, height: '100%' }}>
      {ZONE_OPTS.map(z => {
        const active = zoneId === z.id;
        return (
          <motion.button
            key={z.id}
            onClick={() => onChange(z.id)}
            whileTap={{ scale: 0.9 }}
            style={{
              flex: 1,
              height: '100%',
              borderRadius: 6,
              cursor: 'pointer',
              background: active
                ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)')
                : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: `1px solid ${active
                ? (isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)')
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontSize: 9,
              fontWeight: active ? 600 : 400,
              color: ink(isDark, active ? 0.75 : 0.28),
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

// ─── Simple tap card (Space / Flow) ──────────────────────────
// Aceternity 风格：点击循环切换，长按进 L2
function TapCard({ title, value, onClick, onLongPress, isDark }) {
  const timerRef    = useRef(null);
  const firedRef    = useRef(false);

  const down = () => {
    firedRef.current = false;
    if (onLongPress) {
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, 480);
    }
  };
  const up = () => {
    clearTimeout(timerRef.current);
    if (!firedRef.current) onClick?.();
    firedRef.current = false;
  };
  const cancel = () => {
    clearTimeout(timerRef.current);
    firedRef.current = false;
  };

  return (
    <motion.div
      onMouseDown={down} onMouseUp={up} onMouseLeave={cancel}
      onTouchStart={down} onTouchEnd={up} onTouchCancel={cancel}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        flex: 1,
        height: '100%',
        borderRadius: 10,
        cursor: 'pointer',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        userSelect: 'none',
      }}
    >
      <span style={{
        fontSize: 10,
        fontWeight: 500,
        color: ink(isDark, 0.65),
        fontFamily: FONT_TEXT,
        lineHeight: 1,
      }}>
        {title}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.1 }}
          style={{
            fontSize: 9,
            color: ink(isDark, 0.38),
            fontFamily: FONT_TEXT,
            lineHeight: 1,
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export function PracticeControlSheet({
  open, onClose,
  // L1 content mode
  practiceMode, onPracticeModeChange,
  // Zone (blind only)
  zoneId, onZoneChange,
  // Intervals
  intervalsPreset, onIntervalsPreset,
  // Space
  spacePresetId, onSpacePreset,
  // Flow
  flowPreset, onFlowPreset,
  // L2 gates
  onOpenSpaceL2, onOpenFlowL2, onOpenIntervalsL2,
  // offset for TabBar (already inside sheet here)
  bottomOffset = 0,
}) {
  const isDark = useIsDark();
  const isBlind = practiceMode === 'blind';

  // colour tokens matching HTML exactly
  const sheetBg   = isDark ? 'rgba(18,18,30,0.97)' : 'rgba(255,255,255,0.98)';
  const topBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const handleCol = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)';
  const rowBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // Space cycle
  const spaceIdx  = SPACE_CYCLE.indexOf(spacePresetId ?? 'full');
  const cycleSpace = () => onSpacePreset(SPACE_CYCLE[(spaceIdx + 1) % SPACE_CYCLE.length]);

  // Flow cycle
  const flowIdx   = FLOW_CYCLE.indexOf(flowPreset ?? 'free');
  const cycleFlow = () => onFlowPreset(FLOW_CYCLE[(flowIdx + 1) % FLOW_CYCLE.length]);

  // Intervals: if custom hits → go L2
  const handleIvSelect = (id) => {
    if (id === 'custom') {
      onClose();
      setTimeout(() => onOpenIntervalsL2?.(), 80);
      return;
    }
    onIntervalsPreset(id);
  };

  // Top-card renderers for Stack
  const renderModeTop = (card) => (
    <>
      <span style={{ fontSize: 10, fontWeight: 500, color: ink(isDark, 0.60), fontFamily: FONT_TEXT, lineHeight: 1 }}>
        Mode
      </span>
      <span style={{ fontSize: 8, color: ink(isDark, 0.38), fontFamily: FONT_TEXT, lineHeight: 1 }}>
        {card.label}
      </span>
    </>
  );

  const renderIvTop = (card) => (
    <>
      <span style={{ fontSize: 10, fontWeight: 500, color: ink(isDark, 0.60), fontFamily: FONT_TEXT, lineHeight: 1 }}>
        Intervals
      </span>
      <span style={{ fontSize: 8, color: ink(isDark, 0.38), fontFamily: FONT_TEXT, lineHeight: 1 }}>
        {card.label}
      </span>
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* tap-outside to close */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />

          {/* ── L1 bottom sheet ── */}
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
              position: 'fixed',
              bottom: bottomOffset,
              left: 0, right: 0,
              zIndex: 50,
              background: sheetBg,
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderTop: `1px solid ${topBorder}`,
              borderRadius: '18px 18px 0 0',
              boxShadow: isDark ? 'none' : '0 -8px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ── handle ── */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
              <div style={{ width: 28, height: 3, borderRadius: 2, background: handleCol }} />
            </div>

            {/* ── top row: Mode (left) + Intervals (right) ── */}
            {/* HTML: l1-row h:75px, padding 4px 8px, gap 5px */}
            <div style={{
              display: 'flex',
              gap: 5,
              padding: '4px 8px',
              height: 75,
              flexShrink: 0,
            }}>
              {/* LEFT: flex 0.46 — Mode stack (flex:3) + Zone (flex:1, blind only) */}
              <div style={{
                flex: 0.46,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                {/* Mode Stack — flex:3 */}
                <div style={{ flex: 3 }}>
                  <ReactBitsStack
                    items={MODE_CARDS}
                    selectedId={practiceMode}
                    onSelect={onPracticeModeChange}
                    renderTopCard={renderModeTop}
                    isDark={isDark}
                  />
                </div>

                {/* Zone — flex:1, 仅 blind */}
                <AnimatePresence initial={false}>
                  {isBlind ? (
                    <motion.div
                      key="zone-on"
                      initial={{ flex: 0, opacity: 0 }}
                      animate={{ flex: 1, opacity: 1 }}
                      exit={{ flex: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      style={{ overflow: 'hidden', minHeight: 0 }}
                    >
                      <ZoneStrip zoneId={zoneId} onChange={onZoneChange} isDark={isDark} />
                    </motion.div>
                  ) : (
                    // 非 blind 时占位空间保持列高（但不显示内容）
                    <motion.div
                      key="zone-off"
                      initial={{ flex: 1, opacity: 0 }}
                      animate={{ flex: 1, opacity: 0 }}
                      exit={{ flex: 0 }}
                      style={{ flex: 1, borderRadius: 6,
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 9, color: ink(isDark, 0.22), fontFamily: FONT_TEXT }}>Zone</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: flex 0.54 — Intervals Stack full height */}
              <div style={{ flex: 0.54 }}>
                <ReactBitsStack
                  items={INTERVAL_CARDS}
                  selectedId={intervalsPreset === 'custom' ? 'all' : (intervalsPreset ?? 'all')}
                  onSelect={handleIvSelect}
                  renderTopCard={renderIvTop}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* ── bottom row: Space + Flow ── */}
            {/* HTML: l1-row h:60px */}
            <div style={{
              display: 'flex',
              gap: 5,
              padding: '4px 8px',
              height: 60,
              flexShrink: 0,
            }}>
              <TapCard
                title="Space"
                value={SPACE_META[spacePresetId] ?? 'Full board'}
                onClick={cycleSpace}
                onLongPress={() => { onClose(); setTimeout(() => onOpenSpaceL2?.(), 80); }}
                isDark={isDark}
              />
              <TapCard
                title="Flow"
                value={FLOW_META[flowPreset] ?? 'Free'}
                onClick={cycleFlow}
                onLongPress={() => { onClose(); setTimeout(() => onOpenFlowL2?.(), 80); }}
                isDark={isDark}
              />
            </div>

            {/* ── TabBar ── */}
            {/* HTML: h:36px, border-top, space-around */}
            <div style={{
              height: 36,
              borderTop: `1px solid ${rowBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 10px',
              flexShrink: 0,
            }}>
              {['Home', 'Notes', 'Intervals', 'Changes', 'Scales', 'Me'].map(t => (
                <span key={t} style={{
                  fontSize: 9,
                  fontWeight: t === 'Intervals' ? 700 : 400,
                  color: t === 'Intervals'
                    ? (isDark ? 'rgba(100,150,255,0.9)' : '#1a6cf5')
                    : ink(isDark, 0.25),
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
