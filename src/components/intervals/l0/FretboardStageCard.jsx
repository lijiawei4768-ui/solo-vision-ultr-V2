// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FretboardStageCard.jsx
//
// Wrapper-only. Provides the stage shell around FretboardViewport.
// Layer structure (execution mother doc Part 4.1–4.2):
//   Stage Shell → Stage Context Band → Inner Training Deck → FretboardViewport
//   → Bottom Breathing Edge
//
// HEIGHT is locked to clamp (not flex:1).
// Motion: allowed / fretboard viewport tracking (via FretboardViewport child)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { HEIGHT, SPACING } from '../../../tokens/spacing';
import { RADIUS } from '../../../tokens/radius';
import { SHADOW } from '../../../tokens/elevation';
import { FretboardViewport } from './FretboardViewport';

/**
 * @param {{
 *   viewportMin:  number,
 *   viewportMax:  number,
 *   highlights:   array,
 *   onFretTap:    (string:number, fret:number) => void,
 * }} props
 */
export function FretboardStageCard({
  viewportMin = 0,
  viewportMax = 4,
  highlights  = [],
  onFretTap,
}) {
  return (
    // Stage Shell — LOCKED: r-14, bg rgba(14,14,20,1), inset vignette
    <div style={{
      height:       HEIGHT.fretboardMobile, // clamp — initialSuggested
      margin:       '0 16px',
      borderRadius: RADIUS.stageShell,
      background:   'rgba(14,14,20,1)',
      boxShadow:    SHADOW.stageShellInset,
      overflow:     'hidden',
      flexShrink:   0,
      display:      'flex',
      flexDirection: 'column',
    }}>
      {/* Stage Context Band — shows current fret window */}
      <div style={{
        height:          24,
        flexShrink:      0,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        paddingTop:      4,
      }}>
        <span style={{
          fontSize:      9,
          color:         'rgba(255,255,255,0.25)',
          letterSpacing: '0.06em',
          fontVariantNumeric: 'tabular-nums',
          fontFamily:    '-apple-system, sans-serif',
        }}>
          FRETS {viewportMin} – {viewportMax}
        </span>
      </div>

      {/* Inner Training Deck — LOCKED: padding 12/16/8/8px, bg rgba(18,18,26,1) */}
      <div style={{
        flex:         1,
        minHeight:    0,
        margin:       '0 8px 8px',
        borderRadius: RADIUS.innerDeck,
        background:   'rgba(18,18,26,1)',
        border:       '0.5px solid rgba(255,255,255,0.05)',
        padding:      `${SPACING.fretDeckPadTop}px ${SPACING.fretDeckPadRight}px ${SPACING.fretDeckPadBottom}px ${SPACING.fretDeckPadLeft}px`,
        overflow:     'hidden',
        display:      'flex',
        alignItems:   'stretch',
      }}>
        <FretboardViewport
          viewportMin={viewportMin}
          highlights={highlights}
          onFretTap={onFretTap}
        />
      </div>

      {/* Bottom Breathing Edge */}
      <div style={{
        height:     4,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.01)',
      }} />
    </div>
  );
}
