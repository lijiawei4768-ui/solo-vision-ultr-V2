// components/intervals/l0/PositionStripPro.jsx  — Visual Reset v7b
//
// Bare track, no container. Root = systemYellow, Target = systemTeal.
// Dark/light viewport highlight adapts.
import React, { useContext, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const TOTAL_FRETS = 12;
const DOT         = 8;
const toPercent   = (f) => `${(f / TOTAL_FRETS) * 100}%`;

export function PositionStripPro({
  viewportMin = 0, viewportMax = 4,
  rootFret = null, targetFret = null,
}) {
  const isDark = useIsDark();

  const vpLeft = useSpring((viewportMin / TOTAL_FRETS) * 100, SPRINGS_IV.stripTrack);
  useEffect(() => { vpLeft.set((viewportMin / TOTAL_FRETS) * 100); }, [viewportMin, vpLeft]);

  const vpWidth    = `${((viewportMax - viewportMin + 1) / TOTAL_FRETS) * 100}%`;
  const trackBg    = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.10)';
  const viewportBg = isDark ? 'rgba(255,255,255,0.13)'  : 'rgba(0,0,0,0.15)';
  // systemYellow (dark #FFD60A, light #FFCC00), systemTeal (dark #64D2FF, light #5AC8FA)
  const rootColor   = isDark ? '#FFD60A' : '#FFCC00';
  const targetColor = isDark ? '#64D2FF' : '#5AC8FA';

  return (
    <div style={{ margin:'9px 20px 8px', height:13, display:'flex', alignItems:'center', flexShrink:0 }}>
      <div style={{ flex:1, height:3, borderRadius:1.5, background:trackBg, position:'relative' }}>
        <motion.div style={{
          position:'absolute', top:0, height:'100%',
          width:vpWidth, left:vpLeft, borderRadius:1.5,
          background:viewportBg,
        }} />
        {rootFret !== null && (
          <div style={{
            position:'absolute', top:'50%', left:toPercent(rootFret),
            transform:'translate(-50%,-50%)',
            width:DOT, height:DOT, borderRadius:'50%',
            background:rootColor, zIndex:2,
          }} />
        )}
        {targetFret !== null && (
          <div style={{
            position:'absolute', top:'50%', left:toPercent(targetFret),
            transform:'translate(-50%,-50%)',
            width:DOT, height:DOT, borderRadius:'50%',
            background:targetColor, zIndex:2,
          }} />
        )}
      </div>
    </div>
  );
}
