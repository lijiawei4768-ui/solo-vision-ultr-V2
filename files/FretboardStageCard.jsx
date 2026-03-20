// components/intervals/l0/FretboardStageCard.jsx  — Visual Reset v7b
//
// No nested inner card. One thin-bordered container; fretboard fills it directly.
// Dark: transparent bg, thin white border. Light: white card, quiet shadow.
import React, { useContext } from 'react';
import { ThemeContext } from '../../../contexts';
import { HEIGHT } from '../../../tokens/spacing';
import { FONT_MONO } from '../../../theme';
import { FretboardViewport } from './FretboardViewport';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function FretboardStageCard({
  viewportMin = 0, viewportMax = 4,
  highlights  = [], onFretTap,
}) {
  const isDark = useIsDark();

  const cardBg     = isDark ? 'transparent'            : '#fff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)';
  const cardShadow = isDark ? 'none'                   : '0 1px 4px rgba(0,0,0,0.06)';
  const labelColor = isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.30)';
  const subColor   = isDark ? 'rgba(235,235,245,0.12)' : 'rgba(0,0,0,0.18)';

  return (
    <div style={{
      height:        HEIGHT.fretboardMobile,
      margin:        '0 12px',
      borderRadius:  22,
      background:    cardBg,
      border:        `0.5px solid ${cardBorder}`,
      boxShadow:     cardShadow,
      overflow:      'hidden',
      flexShrink:    0,
      display:       'flex',
      flexDirection: 'column',
    }}>
      {/* Lean context strip */}
      <div style={{ padding:'6px 13px 4px', display:'flex', alignItems:'center', flexShrink:0 }}>
        <span style={{
          flex:1, fontSize:7.5, fontWeight:400, color:labelColor,
          letterSpacing:'0.07em', textTransform:'uppercase',
          fontVariantNumeric:'tabular-nums', fontFamily:FONT_MONO,
        }}>
          Frets {viewportMin}–{viewportMax}
        </span>
        <span style={{ fontSize:7.5, color:subColor, fontFamily:FONT_MONO }}>
          E2–e4
        </span>
      </div>

      {/* Fretboard fills remaining height directly */}
      <div style={{ flex:1, minHeight:0, paddingLeft:2, paddingRight:4, paddingBottom:7, overflow:'hidden', display:'flex', alignItems:'stretch' }}>
        <FretboardViewport
          viewportMin={viewportMin}
          highlights={highlights}
          onFretTap={onFretTap}
        />
      </div>
    </div>
  );
}
