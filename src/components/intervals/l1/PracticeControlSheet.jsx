// components/intervals/l1/PracticeControlSheet.jsx
//
// 修正三个问题：
//   1. 删掉 L1 里的假 TabBar（真 TabBar 在 App 层，L1 不管它）
//   2. 加高两排 row（top: 96px, bottom: 80px）
//   3. L2 入口用 onContextMenu（iOS 长按触发 contextmenu，最可靠）
//      + 同时保留 timer 长按（安卓 / 桌面）
//
// 布局对应 HTML：
//   handle
//   top row  → 左列 flex:.46 [Mode tall + Zone strip] | 右列 flex:.54 [Intervals tall]
//   bottom row → Space | Flow
//   （无 TabBar，由外层 App 负责）

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

// ── .l1-card 基础样式 ─────────────────────────────────────────
function cardStyle(isDark, extra = {}) {
  return {
    background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
    border:     `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_TEXT,
    ...extra,
  };
}

// ── 值滑动切换动画（React Bits 风格）─────────────────────────
function SlideValue({ value }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: 'block', fontSize: 11, opacity: 0.45, lineHeight: 1 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ── 循环切换卡：Mode / Intervals ─────────────────────────────
// 点击 → 下一项，值 y-slide
function CycleCard({ title, value, onTap, isDark, style = {} }) {
  return (
    <motion.div
      onClick={onTap}
      whileTap={{ scale: 0.94, opacity: 0.75 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={cardStyle(isDark, {
        flexDirection: 'column',
        gap: 5,
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,.62)' : 'rgba(0,0,0,.60)',
        ...style,
      })}
    >
      <span style={{ lineHeight: 1 }}>{title}</span>
      <SlideValue value={value} />
    </motion.div>
  );
}

// ── Zone 按钮条（blind 时出现）────────────────────────────────
function ZoneStrip({ zoneId, onChange, isDark }) {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 3 }}>
      {ZONE_ITEMS.map(z => {
        const active = zoneId === z.id;
        return (
          <motion.button
            key={z.id}
            onClick={() => onChange(z.id)}
            whileTap={{ scale: 0.90 }}
            style={{
              flex: 1, height: '100%',
              background: active
                ? (isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)')
                : (isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'),
              border: `1px solid ${active
                ? (isDark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.10)')
                : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)')}`,
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: isDark
                ? (active ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.30)')
                : (active ? 'rgba(0,0,0,.72)'       : 'rgba(0,0,0,.28)'),
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

// ── Space / Flow 卡 ───────────────────────────────────────────
// 点击 → 循环切换 preset
// 长按  → 进 L2
//
// 长按触发方式（原 repo 策略）：
//   onContextMenu → iOS Safari / Android Chrome 长按都会触发 contextmenu
//   timer 长按    → 桌面右键不触发时的 fallback
function SpaceFlowCard({ title, value, onTap, onOpenL2, isDark }) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);

  // 长按进 L2（timer 方案 — Android fallback）
  const startPress = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onOpenL2?.();
    }, 500);
  }, [onOpenL2]);

  const endPress = useCallback(() => {
    clearTimeout(timerRef.current);
    if (!firedRef.current) onTap?.();
    firedRef.current = false;
  }, [onTap]);

  const cancelPress = useCallback(() => {
    clearTimeout(timerRef.current);
    firedRef.current = false;
  }, []);

  // contextmenu = iOS/Android 长按（最可靠）
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    firedRef.current = true;
    onOpenL2?.();
  }, [onOpenL2]);

  return (
    <motion.div
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={cancelPress}
      onContextMenu={handleContextMenu}
      whileTap={{ scale: 0.94, opacity: 0.75 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={cardStyle(isDark, {
        flex: 1,
        flexDirection: 'column',
        gap: 5,
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,.62)' : 'rgba(0,0,0,.60)',
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
  const modeIdx   = MODE_CYCLE.findIndex(m => m.id === practiceMode);
  const modeLabel = MODE_CYCLE[modeIdx]?.label ?? 'Visual';
  const cycleMode = () =>
    onPracticeModeChange(MODE_CYCLE[(modeIdx + 1) % MODE_CYCLE.length].id);

  const ivIdx   = INTERVAL_CYCLE.findIndex(i => i.id === intervalsPreset);
  const ivLabel = INTERVAL_CYCLE[Math.max(0, ivIdx)]?.label ?? 'All 11';
  const cycleIv = () =>
    onIntervalsPreset(INTERVAL_CYCLE[(Math.max(0, ivIdx) + 1) % INTERVAL_CYCLE.length].id);

  const spIdx     = SPACE_CYCLE.indexOf(spacePresetId ?? 'full');
  const cycleSpace = () => onSpacePreset(SPACE_CYCLE[(spIdx + 1) % SPACE_CYCLE.length]);

  const flIdx    = FLOW_CYCLE.indexOf(flowPreset ?? 'free');
  const cycleFlow = () => onFlowPreset(FLOW_CYCLE[(flIdx + 1) % FLOW_CYCLE.length]);

  // ── 颜色 token（直接对应 HTML）────────────────────────────
  const sheetBg   = isDark ? 'rgba(18,18,30,.97)'    : 'rgba(255,255,255,.98)';
  const topBorder = isDark ? 'rgba(255,255,255,.10)'  : 'rgba(0,0,0,.10)';
  const handleCol = isDark ? 'rgba(255,255,255,.20)'  : 'rgba(0,0,0,.15)';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* tap-outside 关闭 */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />

          {/* ── L1 sheet ── */}
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
              margin: '8px auto 4px',
              flexShrink: 0,
            }} />

            {/* ── top row：Mode 左列 + Intervals 右列 ── */}
            {/* 高度加高至 96px（原 HTML 75px，增加可操作面积）*/}
            <div style={{
              display: 'flex', gap: 5,
              padding: '4px 10px',
              height: 96,
              flexShrink: 0,
            }}>
              {/* 左列 flex:.46 — Mode (flex:3) + Zone (flex:1) */}
              <div style={{ flex: 0.46, display: 'flex', flexDirection: 'column', gap: 4 }}>

                {/* Mode 卡 — flex:3 */}
                <CycleCard
                  title="Mode"
                  value={modeLabel}
                  onTap={cycleMode}
                  isDark={isDark}
                  style={{ flex: 3 }}
                />

                {/* Zone — flex:1, blind ↔ 占位 */}
                <div style={{ flex: 1, display: 'flex' }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isBlind ? (
                      <motion.div
                        key="zone-on"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.13 }}
                        style={{ flex: 1, display: 'flex' }}
                      >
                        <ZoneStrip zoneId={zoneId} onChange={onZoneChange} isDark={isDark} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="zone-off"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.13 }}
                        style={cardStyle(isDark, {
                          flex: 1,
                          fontSize: 10,
                          color: isDark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.26)',
                        })}
                      >
                        Zone
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 右列 flex:.54 — Intervals 全高 */}
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

            {/* ── bottom row：Space | Flow ── */}
            {/* 高度加高至 80px */}
            <div style={{
              display: 'flex', gap: 5,
              padding: '4px 10px 12px',
              height: 80,
              flexShrink: 0,
            }}>
              <SpaceFlowCard
                title="Space"
                value={SPACE_LABEL[spacePresetId] ?? 'Full board'}
                onTap={cycleSpace}
                onOpenL2={onOpenSpaceL2}
                isDark={isDark}
              />
              <SpaceFlowCard
                title="Flow"
                value={FLOW_LABEL[flowPreset] ?? 'Free'}
                onTap={cycleFlow}
                onOpenL2={onOpenFlowL2}
                isDark={isDark}
              />
            </div>

            {/* 注意：TabBar 不在 L1 里，由 App 层统一管理 */}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
