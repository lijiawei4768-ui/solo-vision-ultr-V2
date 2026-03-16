// ─────────────────────────────────────────────────────────────
// components/intervals/l0/PositionStripPro.jsx
//
// Position navigator strip — sits between FocusCard and Fretboard.
// Read-only. Shows the 12-fret track, viewport highlight window,
// root dot (amber), target dot (accent), and position markers.
//
// NOT a slider. No drag interaction.
// Motion: allowed / PositionStrip spring tracking
// ─────────────────────────────────────────────────────────────
import React, { useContext, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { SPACING } from '../../../tokens/spacing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const TOTAL_FRETS   = 12;
const TRACK_HEIGHT  = 5;  // px — track bar height
const DOT_SIZE      = 7;  // px — root/target dot diameter
const MARKER_SIZE   = 3;  // px — position marker diameter
const POS_MARKERS   = [3, 5, 7, 9];

// Convert fret to percentage along the full track
const toPercent = (fret) => `${(fret / TOTAL_FRETS) * 100}%`;

/**
 * @param {{
 *   viewportMin: number,
 *   viewportMax: number,
 *   rootFret: number|null,
 *   targetFret: number|null,
 * }} props
 */
export function PositionStripPro({
  viewportMin   = 0,
  viewportMax   = 4,
  rootFret      = null,
  targetFret    = null,
}) {
  const T = useT();

  // Spring-animate viewport left position
  // Motion: allowed / PositionStrip spring tracking
  const vpLeft = useSpring(
    (viewportMin / TOTAL_FRETS) * 100,
    SPRINGS_IV.stripTrack,
  );
  useEffect(() => {
    vpLeft.set((viewportMin / TOTAL_FRETS) * 100);
  }, [viewportMin, vpLeft]);

  const vpWidth    = `${((viewportMax - viewportMin + 1) / TOTAL_FRETS) * 100}%`;
  const accent     = T.accent ?? '#1A6CF5';

  return (
    <div style={{
      height:      SPACING.positionStripHeightMobile,
      margin:      '2px 16px 6px',
      display:     'flex',
      alignItems:  'center',
      gap:         8,
      flexShrink:  0,
    }}>
      {/* ── Track area ─────────────────────────────────────── */}
      <div style={{
        flex:       1,
        height:     TRACK_HEIGHT,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.06)',
        position:   'relative',
      }}>
        {/* Viewport highlight — spring-animated left position */}
        <motion.div
          // Motion: allowed / PositionStrip spring tracking
          style={{
            position:     'absolute',
            top:          0,
            height:       '100%',
            width:        vpWidth,
            left:         vpLeft.get() + '%', // will be overridden by style prop
            borderRadius: 3,
            background:   accent,
            opacity:      0.25,
          }}
          // Use motion.div's style for the spring value
        />
        {/* Use a dedicated motion.div that reads the spring */}
        <ViewportHighlight vpLeft={vpLeft} vpWidth={vpWidth} accent={accent} />

        {/* Position dot markers (3/5/7/9) */}
        {POS_MARKERS.map((f) => (
          <div
            key={f}
            style={{
              position:    'absolute',
              bottom:      -(MARKER_SIZE + 2),
              left:        toPercent(f),
              transform:   'translateX(-50%)',
              width:       MARKER_SIZE,
              height:      MARKER_SIZE,
              borderRadius: '50%',
              background:  'rgba(255,255,255,0.20)',
            }}
          />
        ))}

        {/* Root dot — amber */}
        {rootFret !== null && (
          <div style={{
            position:    'absolute',
            top:         '50%',
            left:        toPercent(rootFret),
            transform:   'translate(-50%, -50%)',
            width:       DOT_SIZE,
            height:      DOT_SIZE,
            borderRadius: '50%',
            background:  '#E8A23C',
            zIndex:      2,
          }} />
        )}

        {/* Target dot — accent */}
        {targetFret !== null && (
          <div style={{
            position:    'absolute',
            top:         '50%',
            left:        toPercent(targetFret),
            transform:   'translate(-50%, -50%)',
            width:       DOT_SIZE,
            height:      DOT_SIZE,
            borderRadius: '50%',
            background:  accent,
            opacity:     0.9,
            zIndex:      2,
          }} />
        )}
      </div>

      {/* ── Viewport range text ─────────────────────────── */}
      <span style={{
        fontSize:            10,
        color:               T.textTertiary ?? 'rgba(255,255,255,0.35)',
        fontFamily:          FONT_MONO,
        fontVariantNumeric:  'tabular-nums',
        whiteSpace:          'nowrap',
        flexShrink:          0,
        minWidth:            28,
        textAlign:           'right',
      }}>
        {viewportMin}–{viewportMax}
      </span>
    </div>
  );
}

// Separate component to properly consume the spring MotionValue
function ViewportHighlight({ vpLeft, vpWidth, accent }) {
  return (
    <motion.div
      style={{
        position:     'absolute',
        top:          0,
        height:       '100%',
        width:        vpWidth,
        left:         vpLeft,  // MotionValue consumed here
        borderRadius: 3,
        background:   accent,
        opacity:      0.25,
      }}
    />
  );
}
