// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FretboardStageCard.jsx — Visual Correction
//
// Changes vs Batch B:
//   • Shell gets visible border: 0.5px rgba(255,255,255,0.08)
//   • Stage Context Band: left-aligned, with accent dot indicator,
//     not just centred invisible text
//   • Inner Training Deck: margin tighter, stronger contrast,
//     border opacity 0.05 → 0.08
//   • Bottom Breathing Edge: 4→6px, slightly more visible
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { HEIGHT, SPACING } from '../../../tokens/spacing';
import { RADIUS } from '../../../tokens/radius';
import { SHADOW } from '../../../tokens/elevation';
import { FretboardViewport } from './FretboardViewport';

export function FretboardStageCard({
  viewportMin = 0,
  viewportMax = 4,
  highlights  = [],
  onFretTap,
}) {
  return (
    <div style={{
      height:        HEIGHT.fretboardMobile,
      marginLeft:    16,
      marginRight:   16,
      borderRadius:  RADIUS.stageShell,
      background:    'rgba(14,14,20,1)',
      boxShadow:     SHADOW.stageShellInset,
      // ← FIX: visible shell border for "contained stage" feel
      border:        '0.5px solid rgba(255,255,255,0.08)',
      overflow:      'hidden',
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
    }}>

      {/* ── Stage Context Band ───────────────────────────── */}
      {/* FIX: left-aligned with accent dot — not invisible centred text */}
      <div style={{
        height:          22,
        flexShrink:      0,
        display:         'flex',
        alignItems:      'center',
        paddingLeft:     12,
        paddingRight:    12,
        gap:             6,
        borderBottom:    '0.5px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width:        3,
          height:       3,
          borderRadius: '50%',
          background:   'rgba(255,255,255,0.25)',
          flexShrink:   0,
        }} />
        <span style={{
          fontSize:           9,
          fontWeight:         400,
          color:              'rgba(255,255,255,0.30)',
          letterSpacing:      '0.08em',
          textTransform:      'uppercase',
          fontVariantNumeric: 'tabular-nums',
          fontFamily:         '-apple-system, sans-serif',
          flex:               1,
        }}>
          Frets {viewportMin} – {viewportMax}
        </span>
        {/* Right label: string range */}
        <span style={{
          fontSize:      9,
          color:         'rgba(255,255,255,0.18)',
          fontFamily:    '-apple-system, sans-serif',
          letterSpacing: '0.04em',
        }}>
          E2 – e4
        </span>
      </div>

      {/* ── Inner Training Deck ──────────────────────────── */}
      <div style={{
        flex:         1,
        minHeight:    0,
        margin:       '6px 7px 7px',
        borderRadius: RADIUS.innerDeck,
        background:   'rgba(16,16,24,1)',   // slightly stronger contrast
        border:       '0.5px solid rgba(255,255,255,0.08)', // ← more visible
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

      {/* ── Bottom breathing edge ────────────────────────── */}
      <div style={{
        height:     6,
        flexShrink: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
      }} />
    </div>
  );
}
