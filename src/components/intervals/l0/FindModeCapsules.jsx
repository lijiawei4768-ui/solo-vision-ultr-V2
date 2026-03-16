// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FindModeCapsules.jsx  — Visual Correction
//
// Changes vs Batch B:
//   • marginTop 0 → 8px — clear breathing room below TopUtilityRail border
//   • capsule height 36 → 34px — slightly more refined
//   • active pill gets stronger accent border opacity 0.30→0.45
//   • inactive label opacity: textSecondary → textTertiary for more contrast
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { RADIUS } from '../../../tokens/radius';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const MODES = [
  { id: 'findRoot',     label: 'Find Root'    },
  { id: 'findInterval', label: 'Find Interval' },
];

export function FindModeCapsules({ activeMode, onModeChange }) {
  const T = useT();

  return (
    <div style={{
      height:       34,
      marginTop:    8,    // ← FIX: breathing room below TopUtilityRail separator
      marginBottom: 6,
      marginLeft:   16,
      marginRight:  16,
      borderRadius: RADIUS.pill,
      background:   'rgba(255,255,255,0.04)',
      border:       '0.5px solid rgba(255,255,255,0.07)',
      display:      'flex',
      padding:      3,
      flexShrink:   0,
    }}>
      {MODES.map((mode) => {
        const active = activeMode === mode.id;
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            whileTap={{ scale: 0.94 }}
            transition={SPRINGS_IV.buttonPress}
            style={{
              flex:           1,
              position:       'relative',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              borderRadius:   RADIUS.pill - 3,
              cursor:         'pointer',
              border:         'none',
              background:     'transparent',
              zIndex:         1,
            }}
          >
            {active && (
              <motion.div
                layoutId="interval-mode-pill"
                transition={SPRINGS_IV.pillSlide}
                style={{
                  position:     'absolute',
                  inset:        0,
                  borderRadius: RADIUS.pill - 3,
                  background:   'rgba(26,108,245,0.22)',
                  border:       '0.5px solid rgba(26,108,245,0.45)', // ← stronger
                  zIndex:       -1,
                }}
              />
            )}
            <span style={{
              fontSize:      12,
              fontWeight:    active ? 600 : 400,
              color:         active
                ? (T.accent ?? '#1A6CF5')
                : (T.textTertiary ?? 'rgba(255,255,255,0.38)'), // ← more recessed
              fontFamily:    FONT_TEXT,
              whiteSpace:    'nowrap',
              letterSpacing: '0.01em',
              transition:    'color 0.2s',
            }}>
              {mode.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
