// components/intervals/l1/PracticeControlSheet.jsx  — v3 "grows from bottom bar"
//
// L1 = 轻量即时控制层
// 从 BottomQuickStatusBar 向上生长，不是独立 modal/设置页
//
// 视觉原则：
//   - 面板底边贴住 BottomQuickStatusBar 上方，视觉上是底部控制基座的延伸
//   - 不遮盖主舞台超过 50%（面板高度约 46–50vh）
//   - 无 title/header，无关闭按钮 → 下滑/点外部 dismiss
//   - 背景：L0 scale(0.96)+blur(4px)，面板区域 backdrop blur
//   - 内容紧凑：Mode 2颗 pill / Intervals mini chips / Space 4格 / Flow 4格
//
// 触发进入 L2：长按对应区域（由父 IntervalsTrainer 处理 onLongPress）

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext }        from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV }          from '../../../motion/springs';
import { INTERVAL_LABELS }     from '../../../constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');

// ── Shared token helpers ─────────────────────────────────────
const t = (isDark, a = 0.88) =>
  isDark ? `rgba(235,235,245,${a})` : `rgba(0,0,0,${a})`;

// ── Section label ────────────────────────────────────────────
function SectionLabel({ children, onLongPress, isDark }) {
  return (
    <div
      onContextMenu={e => { e.preventDefault(); onLongPress?.(); }}
      style={{
        fontSize: 8.5, fontWeight: 600,
        color: t(isDark, 0.30),
        fontFamily: FONT_TEXT,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        marginBottom: 6,
        cursor: onLongPress ? 'context-menu' : 'default',
      }}
    >
      {children}
    </div>
  );
}

// ── Mode ─────────────────────────────────────────────────────
function ModeRow({ activeMode, onChange, isDark }) {
  const opts = [
    { id: 'findRoot',     label: 'Find Root' },
    { id: 'findInterval', label: 'Find Interval' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {opts.map(o => {
        const act = activeMode === o.id;
        return (
          <motion.button
            key={o.id}
            onClick={() => onChange(o.id)}
            whileTap={{ scale: 0.94 }}
            transition={SPRINGS_IV.buttonPress}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 11, cursor: 'pointer',
              background: act
                ? (isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)')
                : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: `0.5px solid ${act
                ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)')
                : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
            }}
          >
            <span style={{
              fontSize: 12, fontWeight: act ? 600 : 400,
              color: t(isDark, act ? 0.90 : 0.38),
              fontFamily: FONT_TEXT,
            }}>
              {o.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Intervals mini chips ─────────────────────────────────────
function IntervalsRow({ selectedIntervals, onToggle, onSelectAll, isDark }) {
  const allActive = selectedIntervals.length === 0;
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* All pill */}
      <motion.button
        onClick={onSelectAll}
        whileTap={{ scale: 0.90 }}
        style={{
          padding: '4px 9px', borderRadius: 8, cursor: 'pointer',
          background: allActive
            ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)')
            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
          border: `0.5px solid ${allActive
            ? (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)')
            : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: allActive ? 600 : 400, color: t(isDark, allActive ? 0.88 : 0.36), fontFamily: FONT_MONO }}>
          All
        </span>
      </motion.button>

      {/* 11 interval mini chips */}
      {ALL_INTERVALS.map(ivl => {
        const act = allActive || selectedIntervals.includes(ivl);
        return (
          <motion.button
            key={ivl}
            onClick={() => onToggle(ivl)}
            whileTap={{ scale: 0.88 }}
            style={{
              padding: '4px 6px', borderRadius: 7, cursor: 'pointer',
              background: act
                ? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)')
                : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
              border: `0.5px solid ${act
                ? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)')
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: act ? 600 : 400, color: t(isDark, act ? 0.85 : 0.32), fontFamily: FONT_MONO }}>
              {ivl}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Space / Flow 2×2 chips ────────────────────────────────────
function ChipGrid({ options, activeId, onChange, isDark }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {options.map(o => {
        const act = activeId === o.id;
        return (
          <motion.button
            key={o.id}
            onClick={() => onChange(o.id)}
            whileTap={{ scale: 0.92 }}
            style={{
              flex: 1, padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
              background: act
                ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)')
                : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
              border: `0.5px solid ${act
                ? (isDark ? 'rgba(255,255,255,0.19)' : 'rgba(0,0,0,0.14)')
                : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: act ? 600 : 400, color: t(isDark, act ? 0.90 : 0.40), fontFamily: FONT_MONO, lineHeight: 1 }}>
              {o.label}
            </span>
            {o.sub && (
              <span style={{ fontSize: 8, color: t(isDark, act ? 0.36 : 0.22), fontFamily: FONT_TEXT }}>
                {o.sub}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

const SPACE_OPTS = [
  { id: 'full', label: 'Full',  sub: '全指板' },
  { id: 'pos1', label: '1–5',   sub: '低把' },
  { id: 'pos5', label: '5–9',   sub: '中把' },
  { id: 'ead',  label: 'EAD',   sub: 'E·A·D' },
];
const FLOW_OPTS = [
  { id: 'free',     label: 'Free',  sub: '自由' },
  { id: 'low-high', label: '↑',     sub: '低→高' },
  { id: 'high-low', label: '↓',     sub: '高→低' },
  { id: 'custom',   label: '···',   sub: '自定义' },
];

// ── Main ──────────────────────────────────────────────────────
// bottomBarH: height of BottomQuickStatusBar + TabBar = offset from bottom
export function PracticeControlSheet({
  open, onClose,
  activeMode, onModeChange,
  selectedIntervals, onToggleInterval, onSelectAll,
  spacePresetId, onSpacePreset,
  flowPreset, onFlowPreset,
  // L2 triggers (long-press wired by parent)
  onOpenSpaceL2, onOpenFlowL2, onOpenIntervalsL2,
  // offset from page bottom so panel sits above tab+statusbar
  bottomOffset = 0,
}) {
  const isDark = useIsDark();

  const panelBg = isDark
    ? 'rgba(10,10,14,0.92)'
    : 'rgba(248,248,250,0.93)';
  const topBorder = isDark
    ? 'rgba(255,255,255,0.09)'
    : 'rgba(0,0,0,0.07)';
  const divider = isDark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-outside dismiss overlay — no visible background,
              L0 already blurred/scaled by IntervalsTrainer */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />

          {/* Panel — grows upward from bottom bar */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SPRINGS_IV.sheetOpen}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 300) onClose();
            }}
            style={{
              position: 'fixed',
              bottom: bottomOffset,
              left: 0, right: 0,
              zIndex: 50,
              background: panelBg,
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderTop: `0.5px solid ${topBorder}`,
              borderRadius: '20px 20px 0 0',
              // no bottom radius — panel visually merges with bar below
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 32, height: 3.5, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)' }} />
            </div>

            {/* Content — compact sections, no heavy padding */}
            <div style={{ padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Mode */}
              <div>
                <SectionLabel isDark={isDark}>Mode</SectionLabel>
                <ModeRow activeMode={activeMode} onChange={onModeChange} isDark={isDark} />
              </div>

              <div style={{ height: '0.5px', background: divider }} />

              {/* Intervals */}
              <div>
                <SectionLabel isDark={isDark} onLongPress={onOpenIntervalsL2}>
                  Intervals {onOpenIntervalsL2 && <span style={{ fontSize: 7.5, opacity: 0.45 }}>长按深调</span>}
                </SectionLabel>
                <IntervalsRow
                  selectedIntervals={selectedIntervals}
                  onToggle={onToggleInterval}
                  onSelectAll={onSelectAll}
                  isDark={isDark}
                />
              </div>

              <div style={{ height: '0.5px', background: divider }} />

              {/* Space + Flow side by side */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <SectionLabel isDark={isDark} onLongPress={onOpenSpaceL2}>
                    Space {onOpenSpaceL2 && <span style={{ fontSize: 7.5, opacity: 0.45 }}>长按深调</span>}
                  </SectionLabel>
                  <ChipGrid options={SPACE_OPTS} activeId={spacePresetId} onChange={onSpacePreset} isDark={isDark} />
                </div>
                <div style={{ width: '0.5px', background: divider, alignSelf: 'stretch' }} />
                <div style={{ flex: 1 }}>
                  <SectionLabel isDark={isDark} onLongPress={onOpenFlowL2}>
                    Flow {onOpenFlowL2 && <span style={{ fontSize: 7.5, opacity: 0.45 }}>长按深调</span>}
                  </SectionLabel>
                  <ChipGrid options={FLOW_OPTS} activeId={flowPreset} onChange={onFlowPreset} isDark={isDark} />
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
