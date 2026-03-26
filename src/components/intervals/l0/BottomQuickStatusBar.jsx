// components/intervals/l0/BottomQuickStatusBar.jsx — v8
//
// v8: 使用 T.glass 毛玻璃 token，消除纯白/纯黑底色
//   - 外层容器、内层 slot group 全部改用 T.glass
//   - slot 设计升级：图标 + 标签 + 值，三层信息更清晰
//   - 间距更宽松，视觉档次提升

import React, { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const SWIPE_UP_VELOCITY = 280;

// 每个 slot 的语义图标 (SVG inline)
function SlotIcon({ type, color, size = 10 }) {
  const s = { width: size, height: size, display:'block', flexShrink:0 };
  switch (type) {
    case 'mode':
      return (
        <svg style={s} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="4.5" stroke={color} strokeWidth="1.2"/>
          <circle cx="8" cy="8" r="1.5" fill={color}/>
        </svg>
      );
    case 'intervals':
      return (
        <svg style={s} viewBox="0 0 16 16" fill="none">
          <path d="M3 12V9M6 12V6M9 12V8M12 12V4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      );
    case 'space':
      return (
        <svg style={s} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.1"/>
          <rect x="9" y="2" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.1"/>
          <rect x="2" y="9" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.1"/>
          <rect x="9" y="9" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.1"/>
        </svg>
      );
    case 'flow':
      return (
        <svg style={s} viewBox="0 0 16 16" fill="none">
          <path d="M2 8 Q8 3 14 8 Q8 13 2 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        </svg>
      );
    default: return null;
  }
}

function AnimatedSlotValue({ value }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={String(value)}
        initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
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
  const T      = useT();
  const isDark = T.themeDark ?? true;
  const { animateProps: handleBreath } = useBreathing('bottomHandle', true);

  const startY = useRef(null);
  const startT = useRef(null);
  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startT.current = performance.now();
  }, []);
  const onTouchEnd = useCallback((e) => {
    if (startY.current === null) return;
    const dy  = startY.current - e.changedTouches[0].clientY;
    const vel = (dy / (performance.now() - startT.current)) * 1000;
    if (dy > 18 && vel > SWIPE_UP_VELOCITY) onOpen?.();
    startY.current = null;
  }, [onOpen]);

  const modeLabel = activeMode === 'findRoot' ? 'Root' : 'Ivl';
  const itvLabel  = intervalsPreset === 'all'  ? 'All 11' : intervalsPreset;

  const slots = [
    { key:'mode',      type:'mode',      label:'Mode',      value:modeLabel       },
    { key:'intervals', type:'intervals', label:'Intervals', value:itvLabel        },
    { key:'space',     type:'space',     label:'Space',     value:spacePresetLabel},
    { key:'flow',      type:'flow',      label:'Flow',      value:flowPresetLabel },
  ];

  // v8: T.glass 毛玻璃
  const outerBg      = T.glass?.surface1 ?? (isDark ? 'rgba(14,10,38,0.65)'  : 'rgba(255,255,255,0.65)');
  const outerBlur    = T.glass?.blur     ?? 'blur(20px) saturate(180%)';
  const outerBorder  = T.glass?.border   ?? (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)');
  const outerBorderTop = T.glass?.borderTop ?? outerBorder;
  const outerShadow  = isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)';

  const handleColor  = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)';

  // slot 内部用稍深一层玻璃
  const groupBg     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.45)';
  const groupBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const groupShadow = isDark ? 'none'                   : '0 1px 3px rgba(0,0,0,0.05)';

  const divider     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const iconColor   = T.textTertiary ?? (isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)');
  const labelColor  = T.textTertiary ?? (isDark ? 'rgba(235,235,245,0.26)' : 'rgba(0,0,0,0.32)');
  const valueColor  = T.textPrimary  ?? (isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.75)');

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onOpen}
      style={{
        margin:              '9px 10px 0',
        borderRadius:        22,
        background:          outerBg,
        backdropFilter:      outerBlur,
        WebkitBackdropFilter: outerBlur,
        border:              `0.5px solid ${outerBorder}`,
        boxShadow:           `inset 0 0.5px 0 ${outerBorderTop}, ${outerShadow}`,
        flexShrink:          0,
        display:             'flex',
        flexDirection:       'column',
        alignItems:          'center',
        cursor:              'pointer',
        userSelect:          'none',
        paddingBottom:       10,
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
        borderRadius:14, overflow:'hidden',
        background:groupBg, border:`0.5px solid ${groupBorder}`,
        boxShadow:groupShadow,
        width:'calc(100% - 18px)',
      }}>
        {slots.map(({ key, type, label, value }, i) => (
          <div key={key} style={{
            flex:1, padding:'9px 3px 8px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            borderRight: i < 3 ? `0.5px solid ${divider}` : 'none',
          }}>
            {/* 图标 */}
            <SlotIcon type={type} color={iconColor} size={9} />
            {/* 标签 */}
            <span style={{
              fontSize:7, fontWeight:500, color:labelColor,
              fontFamily:FONT_TEXT, letterSpacing:'0.06em', textTransform:'uppercase',
              lineHeight:1,
            }}>
              {label}
            </span>
            {/* 值 */}
            <div style={{
              fontSize:13, fontWeight:700, color:valueColor,
              fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums',
              letterSpacing:'-0.01em', overflow:'hidden', height:17,
              display:'flex', alignItems:'center',
            }}>
              <AnimatedSlotValue value={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
