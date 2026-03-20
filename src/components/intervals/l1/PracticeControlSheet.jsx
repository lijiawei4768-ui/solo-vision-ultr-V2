// components/intervals/l1/PracticeControlSheet.jsx  — Batch C v1
//
// L1 控制中心 Bottom Sheet.
// 上划 BottomQuickStatusBar 或点击触发，展开高度约 60% 屏高。
// 使用项目现有的 BottomSheet 组件作为外壳。
//
// 内容结构（上→下）：
//   1. Mode        — Find Root / Find Interval 两个大按钮
//   2. Intervals   — 11 个音程 chip 多选
//   3. Space       — 4 个预设 chip + "Custom →" 入口（L2 预留）
//   4. Flow        — 4 个预设 chip + "Custom →" 入口（L2 预留）
//
// 视觉语言延续 V7b：
//   dark:  border 0.5px rgba(255,255,255,0.xx)，文字 rgba(235,235,245,...)
//   light: 白底卡片，文字 rgba(0,0,0,...)
//
// L2 hooks 预留：onOpenSpaceL2 / onOpenFlowL2 / onOpenIntervalsL2
// Batch C 交付只做 L1，L2 仅显示 "→ 深度设置" 文字按钮，点击暂无动作。

import React, { useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO, FONT_DISPLAY } from '../../../theme';
import { INTERVAL_LABELS } from '../../../constants';
import { BottomSheet } from '../../ui';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// 11 个可训练音程（跳过 R）
const INTERVAL_ITEMS = INTERVAL_LABELS.filter(l => l !== 'R');

// 音程中文注释（显示在 chip 下方，tiny label）
const INTERVAL_SUBLABELS = {
  'b2': '小2', '2': '大2', 'b3': '小3', '3': '大3',
  '4':  '纯4', 'b5': '减5', '5': '纯5',
  'b6': '小6', '6': '大6', 'b7': '小7', '7': '大7',
};

const SPACE_PRESETS = [
  { id: 'full',  label: 'Full',   sublabel: '全部品位' },
  { id: 'open',  label: 'Open',   sublabel: '0–4 品'  },
  { id: 'low',   label: 'Low',    sublabel: '3–7 品'  },
  { id: 'mid',   label: 'Mid',    sublabel: '5–9 品'  },
];

const FLOW_PRESETS = [
  { id: 'free',   label: 'Free',   sublabel: '自由节奏'  },
  { id: 'slow',   label: 'Slow',   sublabel: '慢练模式'  },
  { id: 'burst',  label: 'Burst',  sublabel: '连续闯关'  },
  { id: 'random', label: 'Random', sublabel: '随机顺序'  },
];

// ── Section wrapper ──────────────────────────────────────────
function Section({ label, isDark, children, onDeepDive }) {
  const labelColor  = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.38)';
  const deepColor   = isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.30)';

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: labelColor,
          fontFamily: FONT_TEXT, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {label}
        </span>
        {onDeepDive && (
          <span
            onClick={onDeepDive}
            style={{
              fontSize: 11, fontWeight: 500, color: deepColor,
              fontFamily: FONT_TEXT, cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            深度设置 →
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Generic chip ─────────────────────────────────────────────
function Chip({ label, sublabel, active, onClick, isDark, wide = false }) {
  const activeBg    = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const inactiveBg  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const activeBorder= isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)';
  const idleBorder  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textActive  = isDark ? 'rgba(235,235,245,0.92)' : 'rgba(0,0,0,0.82)';
  const textIdle    = isDark ? 'rgba(235,235,245,0.44)' : 'rgba(0,0,0,0.44)';
  const subActive   = isDark ? 'rgba(235,235,245,0.42)' : 'rgba(0,0,0,0.38)';
  const subIdle     = isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.24)';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={SPRINGS_IV.buttonPress}
      style={{
        flex: wide ? 1 : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
        padding: sublabel ? '8px 6px' : '9px 12px',
        borderRadius: 12,
        background: active ? activeBg : inactiveBg,
        border: `0.5px solid ${active ? activeBorder : idleBorder}`,
        cursor: 'pointer',
        boxShadow: active
          ? (isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : '0 1px 3px rgba(0,0,0,0.07)')
          : 'none',
        minWidth: 52,
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? textActive : textIdle,
        fontFamily: FONT_MONO,
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}>
        {label}
      </span>
      {sublabel && (
        <span style={{
          fontSize: 9, fontWeight: 400,
          color: active ? subActive : subIdle,
          fontFamily: FONT_TEXT,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}>
          {sublabel}
        </span>
      )}
    </motion.button>
  );
}

// ── Mode toggle: two large buttons ───────────────────────────
function ModeSection({ activeMode, onModeChange, isDark }) {
  const activeBg    = isDark ? 'rgba(255,255,255,0.12)' : '#fff';
  const inactiveBg  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const activeBorder= isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.12)';
  const idleBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textActive  = isDark ? 'rgba(235,235,245,0.92)' : 'rgba(0,0,0,0.82)';
  const textIdle    = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.38)';

  const modes = [
    { id: 'findRoot',     label: 'Find Root',     desc: '听音程，找根音' },
    { id: 'findInterval', label: 'Find Interval',  desc: '听根音，找音程' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {modes.map(m => {
        const active = activeMode === m.id;
        return (
          <motion.button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            whileTap={{ scale: 0.96 }}
            transition={SPRINGS_IV.buttonPress}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '12px 14px',
              borderRadius: 14,
              background: active ? activeBg : inactiveBg,
              border: `0.5px solid ${active ? activeBorder : idleBorder}`,
              cursor: 'pointer',
              boxShadow: active
                ? (isDark ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.22)' : '0 1px 4px rgba(0,0,0,0.09)')
                : 'none',
              gap: 4,
            }}
          >
            <span style={{
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? textActive : textIdle,
              fontFamily: FONT_TEXT, letterSpacing: '-0.01em',
            }}>
              {m.label}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 400,
              color: isDark
                ? (active ? 'rgba(235,235,245,0.42)' : 'rgba(235,235,245,0.20)')
                : (active ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0.22)'),
              fontFamily: FONT_TEXT,
            }}>
              {m.desc}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Intervals multi-select ────────────────────────────────────
function IntervalsSection({ selectedIntervals, onToggleInterval, onSelectAll, isDark }) {
  const allSelected = selectedIntervals.length === 0 || selectedIntervals.length === INTERVAL_ITEMS.length;

  const allBtnBg  = isDark
    ? (allSelected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)')
    : (allSelected ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.03)');
  const allBtnBorder = isDark
    ? (allSelected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)')
    : (allSelected ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.07)');
  const allBtnText = isDark
    ? (allSelected ? 'rgba(235,235,245,0.88)' : 'rgba(235,235,245,0.36)')
    : (allSelected ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0.36)');

  return (
    <div>
      {/* All 11 shortcut */}
      <motion.button
        onClick={onSelectAll}
        whileTap={{ scale: 0.96 }}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 12, marginBottom: 10,
          background: allBtnBg, border: `0.5px solid ${allBtnBorder}`,
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: allSelected ? 600 : 400, color: allBtnText, fontFamily: FONT_TEXT }}>
          All 11
        </span>
        <span style={{ fontSize: 10, color: isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.30)', fontFamily: FONT_TEXT }}>
          全部音程
        </span>
      </motion.button>

      {/* 11 interval chips: 4 per row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
      }}>
        {INTERVAL_ITEMS.map(ivl => {
          const active = selectedIntervals.length === 0 || selectedIntervals.includes(ivl);
          return (
            <Chip
              key={ivl}
              label={ivl}
              sublabel={INTERVAL_SUBLABELS[ivl]}
              active={active}
              onClick={() => onToggleInterval(ivl)}
              isDark={isDark}
              wide
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function PracticeControlSheet({
  open, onClose,
  // Mode
  activeMode, onModeChange,
  // Intervals
  intervalsPreset, selectedIntervals, onToggleInterval, onSelectAll,
  // Space
  spacePresetId, onSpacePreset,
  // Flow
  flowPreset, onFlowPreset,
  // L2 entry points (Batch D)
  onOpenSpaceL2, onOpenFlowL2, onOpenIntervalsL2,
}) {
  const isDark = useIsDark();

  const handleModeChange = useCallback((id) => {
    onModeChange(id);
  }, [onModeChange]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Practice Settings"
    >
      {/* ── Mode ─────────────────────────────────────────── */}
      <Section label="Mode" isDark={isDark}>
        <ModeSection
          activeMode={activeMode}
          onModeChange={handleModeChange}
          isDark={isDark}
        />
      </Section>

      {/* ── Intervals ────────────────────────────────────── */}
      <Section label="Intervals" isDark={isDark} onDeepDive={onOpenIntervalsL2}>
        <IntervalsSection
          selectedIntervals={selectedIntervals}
          onToggleInterval={onToggleInterval}
          onSelectAll={onSelectAll}
          isDark={isDark}
        />
      </Section>

      {/* ── Space ────────────────────────────────────────── */}
      <Section label="Space 音域" isDark={isDark} onDeepDive={onOpenSpaceL2}>
        <div style={{ display: 'flex', gap: 6 }}>
          {SPACE_PRESETS.map(p => (
            <Chip
              key={p.id}
              label={p.label}
              sublabel={p.sublabel}
              active={spacePresetId === p.id}
              onClick={() => onSpacePreset(p.id)}
              isDark={isDark}
              wide
            />
          ))}
        </div>
      </Section>

      {/* ── Flow ─────────────────────────────────────────── */}
      <Section label="Flow 节奏" isDark={isDark} onDeepDive={onOpenFlowL2}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FLOW_PRESETS.map(p => (
            <Chip
              key={p.id}
              label={p.label}
              sublabel={p.sublabel}
              active={flowPreset === p.id}
              onClick={() => onFlowPreset(p.id)}
              isDark={isDark}
              wide
            />
          ))}
        </div>
      </Section>

      {/* Bottom spacer for safe area */}
      <div style={{ height: 8 }} />
    </BottomSheet>
  );
}
