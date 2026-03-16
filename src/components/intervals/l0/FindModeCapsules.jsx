// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FindModeCapsules.jsx
//
// L0 mode switcher — Find Root / Find Interval (LOCKED: 2 modes only)
// Shared-layout spring sliding pill via Framer Motion layoutId.
// Motion: allowed / top button micro-interaction
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { RADIUS } from '../../../tokens/radius';
import { SPACING } from '../../../tokens/spacing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// LOCKED: exactly these two modes, no others
const MODES = [
  { id: 'findRoot',     label: 'Find Root'     },
  { id: 'findInterval', label: 'Find Interval' },
];

export function FindModeCapsules({ activeMode, onModeChange }) {
  const T = useT();

  return (
    <div style={{
      height:       SPACING.modeCapsuleHeightMobile,
      margin:       '0 16px 6px',
      borderRadius: RADIUS.pill,
      background:   'rgba(255,255,255,0.05)',
      border:       '0.5px solid rgba(255,255,255,0.08)',
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
              // Motion: allowed / top button micro-interaction (layoutId pill)
              <motion.div
                layoutId="interval-mode-pill"
                transition={SPRINGS_IV.pillSlide}
                style={{
                  position:     'absolute',
                  inset:        0,
                  borderRadius: RADIUS.pill - 3,
                  background:   'rgba(26,108,245,0.18)',
                  border:       '0.5px solid rgba(26,108,245,0.30)',
                  zIndex:       -1,
                }}
              />
            )}
            <span style={{
              fontSize:      12,
              fontWeight:    active ? 600 : 400,
              color:         active
                ? (T.accent ?? '#1A6CF5')
                : (T.textSecondary ?? 'rgba(255,255,255,0.55)'),
              fontFamily:    FONT_TEXT,
              whiteSpace:    'nowrap',
              letterSpacing: '0.01em',
              // Motion: color interpolation 200ms (not spring — just CSS transition)
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
