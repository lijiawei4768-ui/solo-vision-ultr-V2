// components/intervals/l0/FindModeCapsules.jsx — v8
//
// v8: T.glass 毛玻璃容器替代纯色背景
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const MODES = [
  { id: 'findRoot',     label: 'Find Root'     },
  { id: 'findInterval', label: 'Find Interval' },
];

export function FindModeCapsules({ activeMode, onModeChange }) {
  const T      = useT();
  const isDark = T.themeDark ?? true;

  // v8: T.glass 毛玻璃
  const trackBg     = T.glass?.surface1 ?? (isDark ? 'rgba(14,10,38,0.55)' : 'rgba(255,255,255,0.55)');
  const trackBlur   = T.glass?.blur     ?? 'blur(20px) saturate(180%)';
  const trackBorder = T.glass?.border   ?? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)');
  const trackBorderTop = T.glass?.borderTop ?? trackBorder;
  const trackShadow = isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)';

  // 选中 pill 用 accent 颜色
  const activeBg     = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)';
  const activeBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const activeShadow = isDark
    ? 'inset 0 0.5px 0 rgba(255,255,255,0.18), 0 1px 6px rgba(0,0,0,0.20)'
    : 'inset 0 0.5px 0 rgba(255,255,255,0.90), 0 1px 4px rgba(0,0,0,0.08)';

  const activeText   = T.textPrimary  ?? (isDark ? 'rgba(235,235,245,0.92)' : 'rgba(0,0,0,0.85)');
  const inactiveText = T.textTertiary ?? (isDark ? 'rgba(235,235,245,0.40)' : 'rgba(0,0,0,0.40)');

  return (
    <div style={{
      display:             'flex',
      margin:              '9px 12px 8px',
      borderRadius:        18,
      padding:             4,
      background:          trackBg,
      backdropFilter:      trackBlur,
      WebkitBackdropFilter: trackBlur,
      border:              `0.5px solid ${trackBorder}`,
      boxShadow:           `inset 0 0.5px 0 ${trackBorderTop}, ${trackShadow}`,
      flexShrink:          0,
      position:            'relative',
    }}>
      {MODES.map(({ id, label }) => {
        const active = activeMode === id;
        return (
          <motion.button
            key={id}
            onClick={() => onModeChange(id)}
            whileTap={{ scale: 0.96 }}
            transition={SPRINGS_IV.buttonPress}
            style={{
              flex:            1,
              padding:         '9px 12px',
              borderRadius:    14,
              border:          active ? `0.5px solid ${activeBorder}` : 'none',
              background:      active ? activeBg : 'transparent',
              boxShadow:       active ? activeShadow : 'none',
              cursor:          'pointer',
              fontFamily:      FONT_TEXT,
              fontSize:        14,
              fontWeight:      active ? 600 : 400,
              color:           active ? activeText : inactiveText,
              letterSpacing:   '-0.01em',
              transition:      'color 0.15s ease',
            }}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
