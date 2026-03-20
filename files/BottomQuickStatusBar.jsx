// components/intervals/l0/BottomQuickStatusBar.jsx  — Visual Reset v7b
//
// Outer rounded container (radius 20). Inner slot group (radius 13) with hairline dividers.
// Dark: translucent bg. Light: white card + shadow.
import React, { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { useBreathing } from '../../../hooks/useBreathing';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const SWIPE_UP_VELOCITY = 280;

function AnimatedSlotValue({ value }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={String(value)}
        initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
        transition={SPRINGS_IV.drumSnap}
        style={{ display:'block', lineHeight:1.2 }}
      >{value}</motion.span>
    </AnimatePresence>
  );
}

export function BottomQuickStatusBar({
  activeMode = 'findRoot', intervalsPreset = 'all',
  spacePresetLabel = 'Full', flowPresetLabel = 'Free',
  onOpen,
}) {
  const isDark = useIsDark();
  const { animateProps: handleBreath } = useBreathing('bottomHandle', true);

  const startY = useRef(null);
  const startT = useRef(null);
  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startT.current = performance.now();
  }, []);
  const onTouchEnd = useCallback((e) => {
    if (startY.current === null) return;
    const dy = startY.current - e.changedTouches[0].clientY;
    const vel = (dy / (performance.now() - startT.current)) * 1000;
    if (dy > 18 && vel > SWIPE_UP_VELOCITY) onOpen?.();
    startY.current = null;
  }, [onOpen]);

  const modeLabel = activeMode === 'findRoot' ? 'Root' : 'Ivl';
  const itvLabel  = intervalsPreset === 'all'  ? 'All 11' : intervalsPreset;

  const slots = [
    { key:'mode',      label:'Mode',      value:modeLabel          },
    { key:'intervals', label:'Intervals', value:itvLabel            },
    { key:'space',     label:'Space',     value:spacePresetLabel    },
    { key:'flow',      label:'Flow',      value:flowPresetLabel     },
  ];

  const outerBg      = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const outerBorder  = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const outerShadow  = isDark ? 'none'                   : '0 1px 4px rgba(0,0,0,0.08)';
  const handleColor  = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)';
  const groupBg      = isDark ? 'transparent'            : '#fff';
  const groupBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const groupShadow  = isDark ? 'none'                   : '0 1px 3px rgba(0,0,0,0.06)';
  const divider      = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const labelColor   = isDark ? 'rgba(235,235,245,0.26)' : 'rgba(0,0,0,0.32)';
  const valueColor   = isDark ? 'rgba(235,235,245,0.82)' : 'rgba(0,0,0,0.72)';

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onOpen}
      style={{
        margin:        '9px 10px 0',
        borderRadius:  20,
        background:    outerBg,
        border:        `0.5px solid ${outerBorder}`,
        boxShadow:     outerShadow,
        flexShrink:    0,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        cursor:        'pointer',
        userSelect:    'none',
        paddingBottom: 10,
      }}
    >
      {/* Handle */}
      <div style={{ height:19, display:'flex', alignItems:'center', justifyContent:'center', paddingTop:7 }}>
        <motion.div
          animate={handleBreath.animate}
          transition={handleBreath.transition}
          style={{ width:30, height:3.5, borderRadius:2, background:handleColor }}
        />
      </div>

      {/* Slot group */}
      <div style={{
        display:'flex', margin:'5px 9px 0',
        borderRadius:13, overflow:'hidden',
        background:groupBg, border:`0.5px solid ${groupBorder}`,
        boxShadow:groupShadow,
        width:'calc(100% - 18px)',
      }}>
        {slots.map(({ key, label, value }, i) => (
          <div key={key} style={{
            flex:1, padding:'8px 3px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3.5,
            borderRight: i < 3 ? `0.5px solid ${divider}` : 'none',
          }}>
            <span style={{ fontSize:7.5, fontWeight:500, color:labelColor, fontFamily:FONT_TEXT, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              {label}
            </span>
            <div style={{ fontSize:14, fontWeight:600, color:valueColor, fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em', overflow:'hidden', height:18, display:'flex', alignItems:'center' }}>
              <AnimatedSlotValue value={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
