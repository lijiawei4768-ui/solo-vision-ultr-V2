// ─────────────────────────────────────────────────────────────
// components/intervals/l0/BottomQuickStatusBar.jsx
//
// Bottom of L0. Contains:
//   • Centre handle (with always-on idle breathing hint)
//   • Four quick-state slots: Mode / Intervals / Space / Flow
//   • Swipe-up handler → opens L1
//
// LOCKED: 4 slots are Mode / Intervals / Space / Flow (no others).
// Motion: allowed / very light ambient alive sense (handle breathing)
// ─────────────────────────────────────────────────────────────
import React, { useContext, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { SHADOW } from '../../../tokens/elevation';
import { BLUR } from '../../../tokens/blur';
import { SPACING } from '../../../tokens/spacing';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const SWIPE_UP_VELOCITY = 300; // px/s — initialSuggested

/**
 * @param {{
 *   activeMode:       string,
 *   intervalsPreset:  string,
 *   spacePresetLabel: string,
 *   flowPresetLabel:  string,
 *   onOpen:           () => void,
 * }} props
 */
export function BottomQuickStatusBar({
  activeMode       = 'findRoot',
  intervalsPreset  = 'all',
  spacePresetLabel = 'Full',
  flowPresetLabel  = 'Free',
  onOpen,
}) {
  const T = useT();

  // Motion: allowed / very light ambient alive sense (always-on handle hint)
  const { animateProps: handleBreath } = useBreathing('bottomHandle', true);

  // Swipe-up detection
  const startY  = useRef(null);
  const startT  = useRef(null);

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startT.current = performance.now();
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startY.current === null) return;
    const dy = startY.current - e.changedTouches[0].clientY; // positive = upward
    const dt = performance.now() - startT.current;
    const velocity = (dy / dt) * 1000;
    if (dy > 20 && velocity > SWIPE_UP_VELOCITY) {
      onOpen?.();
    }
    startY.current = null;
  }, [onOpen]);

  // Slot label helpers
  const modeLabel      = activeMode === 'findRoot' ? 'Root' : 'Ivl';
  const intervalsLabel = intervalsPreset === 'all' ? 'All 11' : intervalsPreset;

  const slots = [
    { key: 'mode',      label: 'Mode',      value: modeLabel },
    { key: 'intervals', label: 'Intervals',  value: intervalsLabel },
    { key: 'space',     label: 'Space',      value: spacePresetLabel },
    { key: 'flow',      label: 'Flow',       value: flowPresetLabel },
  ];

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onOpen}
      style={{
        height:              SPACING.bottomStatusHeightMobile,
        margin:              '0 16px',
        borderRadius:        '14px 14px 0 0',
        backdropFilter:      BLUR.bottomBar,
        WebkitBackdropFilter: BLUR.bottomBar,
        background:          'rgba(18,18,26,0.90)',
        boxShadow:           SHADOW.bottomBarInset,
        flexShrink:          0,
        display:             'flex',
        flexDirection:       'column',
        alignItems:          'center',
        justifyContent:      'center',
        gap:                 6,
        cursor:              'pointer',
        userSelect:          'none',
      }}
    >
      {/* ── Drag handle — always-on breathing ──────────── */}
      <motion.div
        // Motion: allowed / very light ambient alive sense (handle)
        animate={handleBreath.animate}
        transition={handleBreath.transition}
        style={{
          width:        SPACING.handleWidth,
          height:       SPACING.handleHeight,
          borderRadius: SPACING.handleRadius,
          background:   'rgba(255,255,255,0.30)',
        }}
      />

      {/* ── Four status slots (LOCKED order) ────────────── */}
      <div style={{
        display: 'flex',
        gap:     12,
        alignItems: 'center',
      }}>
        {slots.map(({ key, label, value }) => (
          <div key={key} style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            1,
          }}>
            <span style={{
              fontSize:   9,
              color:      T.textTertiary ?? 'rgba(255,255,255,0.35)',
              fontFamily: FONT_TEXT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
            <span style={{
              fontSize:           11,
              fontWeight:         500,
              color:              T.textSecondary ?? 'rgba(255,255,255,0.55)',
              fontFamily:         FONT_MONO,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing:      '0.02em',
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
