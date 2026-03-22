// components/intervals/l2/IntervalsEditorL2.jsx  — v3
//
// 使用 React Bits InfiniteMenu 做 interval 选择
// 11个 interval 映射成 InfiniteMenu 的 items
// 点击某个 interval → 触发选中 / 切换

import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { INTERVAL_PRESETS } from '../../../trainers/intervals/constants';
import { INTERVAL_LABELS } from '../../../constants';
import { L2Overlay } from './L2Overlay';
import InfiniteMenu from '../../shared/InfiniteMenu';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');

// 把 11 个 interval 转成 InfiniteMenu items
const INTERVAL_ITEMS = ALL_INTERVALS.map(ivl => ({
  id:          ivl,
  title:       ivl,
  description: ({
    'b2':'小2度','2':'大2度','b3':'小3度','3':'大3度',
    '4':'纯4度','b5':'减5度','5':'纯5度','b6':'小6度',
    '6':'大6度','b7':'小7度','7':'大7度',
  })[ivl] ?? '',
}));

export function IntervalsEditorL2({
  isOpen, onClose,
  intervalsPreset, selectedIntervals,
  onPresetChange, onToggleInterval,
  onOpenL3,
}) {
  const isDark  = useIsDark();
  const titleC  = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const mutedC  = isDark ? 'rgba(235,235,245,0.34)' : 'rgba(0,0,0,0.32)';
  const selBg   = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)';
  const selBord = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';
  const defBg   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const defBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  // 当前选中的 interval 集合（空 = All）
  const activeSet = selectedIntervals?.length > 0
    ? new Set(selectedIntervals)
    : new Set(ALL_INTERVALS);

  const handleMenuSelect = (item) => {
    onToggleInterval?.(item.id);
    onPresetChange?.('custom');
  };

  return (
    <L2Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Intervals"
      onDeepDive={onOpenL3}
    >
      {/* Preset capsules */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {INTERVAL_PRESETS.map(p => {
          const act = intervalsPreset === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => onPresetChange?.(p.id)}
              whileTap={{ scale: 0.90 }}
              transition={SPRINGS_IV.capsuleSelect}
              style={{
                padding: '5px 13px', borderRadius: 18, cursor: 'pointer',
                background: act ? selBg : defBg,
                border: `0.5px solid ${act ? selBord : defBord}`,
              }}
            >
              <span style={{
                fontSize: 12, fontWeight: act ? 600 : 400,
                color: act ? titleC : mutedC, fontFamily: FONT_TEXT,
              }}>
                {p.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* InfiniteMenu — 拖动旋转选 interval */}
      <div style={{ height: 340, position: 'relative' }}>
        <InfiniteMenu
          items={INTERVAL_ITEMS.map(item => ({
            ...item,
            // 已选中的 interval 加亮色标记
            color: activeSet.has(item.id) ? '#ffffff' : 'rgba(255,255,255,0.28)',
          }))}
          onSelect={handleMenuSelect}
          scale={0.7}
        />
      </div>

      {/* 当前选中摘要 */}
      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        fontSize: 11, color: mutedC, fontFamily: FONT_TEXT,
        textAlign: 'center',
      }}>
        {selectedIntervals?.length > 0
          ? `已选：${selectedIntervals.join(' · ')}`
          : '全部 11 个音程'}
      </div>
    </L2Overlay>
  );
}
