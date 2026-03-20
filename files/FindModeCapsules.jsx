// components/intervals/l0/FindModeCapsules.jsx  — Visual Reset v7b
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() {
  return (useContext(ThemeContext)?.dark) ?? true;
}

const MODES = [
  { id: 'findRoot',     label: 'Find Root'     },
  { id: 'findInterval', label: 'Find Interval' },
];

export function FindModeCapsules({ activeMode, onModeChange }) {
  const isDark = useIsDark();

  const trackBg     = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const trackBorder = isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(0,0,0,0.10)';
  const pillBg      = isDark ? 'rgba(255,255,255,0.13)'  : '#fff';
  const pillBorder  = isDark ? 'rgba(255,255,255,0.16)'  : 'rgba(0,0,0,0.10)';
  const pillShadow  = isDark ? '0 1px 3px rgba(0,0,0,0.28)' : '0 1px 4px rgba(0,0,0,0.12)';
  const activeColor = isDark ? 'rgba(235,235,245,0.92)'  : 'rgba(0,0,0,0.82)';
  const inactiveColor= isDark ? 'rgba(235,235,245,0.32)' : 'rgba(0,0,0,0.38)';

  return (
    <div style={{
      margin:       '10px 14px 10px',
      height:        36,
      borderRadius:  18,
      background:    trackBg,
      border:        `0.5px solid ${trackBorder}`,
      display:       'flex',
      padding:       3,
      flexShrink:    0,
    }}>
      {MODES.map((mode) => {
        const active = activeMode === mode.id;
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileTap={{ scale: 0.96 }}
            transition={SPRINGS_IV.buttonPress}
            style={{
              flex: 1, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 15,
              cursor: 'pointer', border: 'none', background: 'transparent', zIndex: 1,
            }}
          >
            {active && (
              <motion.div
                layoutId="interval-mode-pill"
                transition={SPRINGS_IV.pillSlide}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 15,
                  background:  pillBg,
                  border:      `0.5px solid ${pillBorder}`,
                  boxShadow:   pillShadow,
                  zIndex: -1,
                }}
              />
            )}
            <span style={{
              fontSize:   12.5,
              fontWeight: active ? 600 : 400,
              color:      active ? activeColor : inactiveColor,
              fontFamily: FONT_TEXT,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s',
            }}>
              {mode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
