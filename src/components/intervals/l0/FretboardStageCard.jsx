// components/intervals/l0/FretboardStageCard.jsx — v8
//
// v8: 使用 T.glass 毛玻璃 token，消除纯白/纯黑背景
import React, { useContext } from 'react';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_MONO } from '../../../theme';
import { HEIGHT } from '../../../tokens/spacing';
import { FretboardViewport } from './FretboardViewport';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

export function FretboardStageCard({
  viewportMin = 0, viewportMax = 5,
  highlights  = [], onFretTap,
}) {
  const T      = useT();
  const isDark = T.themeDark ?? true;

  // v8: T.glass 毛玻璃
  const cardBg      = T.glass?.surface1  ?? (isDark ? 'rgba(14,10,38,0.65)' : 'rgba(255,255,255,0.65)');
  const cardBlur    = T.glass?.blur      ?? 'blur(20px) saturate(180%)';
  const cardBorder  = T.glass?.border    ?? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)');
  const cardBorderTop = T.glass?.borderTop ?? cardBorder;
  const cardShadow  = isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)';

  const labelColor  = T.textTertiary ?? (isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.30)');
  const subColor    = isDark ? 'rgba(235,235,245,0.12)' : 'rgba(0,0,0,0.18)';

  return (
    <div style={{
      height:              HEIGHT.fretboardMobile,
      margin:              '0 12px',
      borderRadius:        22,
      background:          cardBg,
      backdropFilter:      cardBlur,
      WebkitBackdropFilter: cardBlur,
      border:              `0.5px solid ${cardBorder}`,
      boxShadow:           `inset 0 0.5px 0 ${cardBorderTop}, ${cardShadow}`,
      overflow:            'hidden',
      flexShrink:          0,
      display:             'flex',
      flexDirection:       'column',
    }}>
      {/* 上下文标签条 */}
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

      {/* 指板主体 */}
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
