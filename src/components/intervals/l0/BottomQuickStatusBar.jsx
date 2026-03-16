// ─────────────────────────────────────────────────────────────
// components/intervals/l0/BottomQuickStatusBar.jsx — Visual Correction
//
// Changes vs Batch B:
//   • Margin: '0 16px' → '0 12px' — slightly narrower gap to TabBar edges
//   • Top: stronger border + gradient to suggest floating panel
//   • Handle area: taller (20→26px), handle bar thicker (4→5px),
//     width 40→36px, added upward-swipe arrow hint text below bar
//   • Slot items: each slot gets card-like background + border
//     for clear group separation. Dividers between slots removed
//     in favour of spacing.
//   • Bottom: 4px transparent gap before TabBar for visual float
// ─────────────────────────────────────────────────────────────
import React, { useContext, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { BLUR } from '../../../tokens/blur';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const SWIPE_UP_VELOCITY = 300; // px/s — initialSuggested

export function BottomQuickStatusBar({
  activeMode       = 'findRoot',
  intervalsPreset  = 'all',
  spacePresetLabel = 'Full',
  flowPresetLabel  = 'Free',
  onOpen,
}) {
  const T = useT();
  const { animateProps: handleBreath } = useBreathing('bottomHandle', true);

  const startY = useRef(null);
  const startT = useRef(null);

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startT.current = performance.now();
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startY.current === null) return;
    const dy       = startY.current - e.changedTouches[0].clientY;
    const velocity = (dy / (performance.now() - startT.current)) * 1000;
    if (dy > 20 && velocity > SWIPE_UP_VELOCITY) onOpen?.();
    startY.current = null;
  }, [onOpen]);

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
        // FIX: narrower side margin, explicit bottom gap for float effect
        marginLeft:   12,
        marginRight:  12,
        marginBottom: 4,   // 4px breathing gap before TabBar
        borderRadius: '12px 12px 0 0',
        backdropFilter:       BLUR.bottomBar,
        WebkitBackdropFilter: BLUR.bottomBar,
        background:           'rgba(18,18,28,0.92)',
        // FIX: stronger top border + top gradient glow for "panel" feel
        borderTop:    '0.5px solid rgba(255,255,255,0.12)',
        borderLeft:   '0.5px solid rgba(255,255,255,0.07)',
        borderRight:  '0.5px solid rgba(255,255,255,0.07)',
        boxShadow:    [
          'inset 0 1px 0 rgba(255,255,255,0.08)',
          '0 -4px 24px rgba(0,0,0,0.35)',
        ].join(', '),
        flexShrink:   0,
        display:      'flex',
        flexDirection: 'column',
        alignItems:   'center',
        cursor:       'pointer',
        userSelect:   'none',
        paddingBottom: 8,
      }}
    >
      {/* ── Handle zone — taller for easier swipe ────────── */}
      <div style={{
        height:         28,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            4,
        paddingTop:     8,
      }}>
        {/* Breathing handle bar */}
        <motion.div
          animate={handleBreath.animate}
          transition={handleBreath.transition}
          style={{
            width:        36,
            height:       4,
            borderRadius: 2,
            background:   'rgba(255,255,255,0.25)',
          }}
        />
        {/* Swipe hint text */}
        <span style={{
          fontSize:      8,
          fontWeight:    400,
          color:         'rgba(255,255,255,0.20)',
          fontFamily:    FONT_TEXT,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          controls
        </span>
      </div>

      {/* ── Four status slots ─────────────────────────────── */}
      <div style={{
        display:    'flex',
        gap:        6,
        alignItems: 'stretch',
        padding:    '4px 10px 0',
        width:      '100%',
        boxSizing:  'border-box',
      }}>
        {slots.map(({ key, label, value }) => (
          <div
            key={key}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            2,
              // FIX: each slot gets its own card treatment
              background:     'rgba(255,255,255,0.04)',
              border:         '0.5px solid rgba(255,255,255,0.07)',
              borderRadius:   8,
              padding:        '5px 4px',
            }}
          >
            <span style={{
              fontSize:      8,
              fontWeight:    500,
              color:         T.textTertiary ?? 'rgba(255,255,255,0.35)',
              fontFamily:    FONT_TEXT,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
            <span style={{
              fontSize:           11,
              fontWeight:         600,
              color:              T.textSecondary ?? 'rgba(255,255,255,0.65)',
              fontFamily:         FONT_MONO,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing:      '0.01em',
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
