// components/intervals/l0/FocusCard.jsx  — Visual Reset v7b
//
// Three zones separated by hairlines. No fill — border only.
// Content commands hierarchy; no material decorations.
// Dark: thin white border. Light: white card + quiet shadow.
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_DISPLAY, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { HEIGHT } from '../../../tokens/spacing';
import { useBreathing } from '../../../hooks/useBreathing';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }
function useAccent() { return (useContext(ThemeContext)?.tokens ?? DT)?.accent ?? '#0A84FF'; }

// INTERVAL_FULL keyed to project's b2/2/b3/3 notation
const INTERVAL_FULL = {
  'R':'Root','b2':'Minor 2nd','2':'Major 2nd','b3':'Minor 3rd','3':'Major 3rd',
  '4':'Perfect 4th','b5':'Tritone','5':'Perfect 5th','b6':'Minor 6th',
  '6':'Major 6th','b7':'Minor 7th','7':'Major 7th','P8':'Octave',
};

export function FocusCard({ question, activeMode, answerState, score, streak }) {
  const isDark   = useIsDark();
  const accent   = useAccent();
  const { animateProps } = useBreathing('focusCard', answerState === 'idle');

  const isRoot      = activeMode === 'findRoot';
  const mainDisplay = question ? (isRoot ? question.intervalName : question.rootNote) : '—';
  const mainIsNote  = !isRoot;
  const subLine     = question
    ? (isRoot ? (INTERVAL_FULL[question.intervalName] ?? question.intervalName) : question.intervalName)
    : null;
  const taskText    = isRoot ? 'Find the Root' : 'Find the Interval';
  const shakeX      = answerState === 'wrong' ? [0,-6,6,-6,6,-3,3,0] : 0;
  const showStreak  = (streak ?? 0) >= 3;
  const correct     = score?.correct ?? 0;
  const total       = score?.total   ?? 0;

  // Per-mode tokens
  const cardBg      = isDark ? 'transparent'              : '#fff';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.14)'   : 'rgba(0,0,0,0.08)';
  const cardShadow  = isDark ? 'none'                     : '0 1px 6px rgba(0,0,0,0.08)';
  const hairline    = isDark ? 'rgba(255,255,255,0.11)'   : 'rgba(0,0,0,0.07)';
  const footerBg    = isDark ? 'transparent'              : 'rgba(0,0,0,0.025)';
  const labelColor  = isDark ? 'rgba(235,235,245,0.42)'   : 'rgba(0,0,0,0.48)';
  const mainColor   = isDark ? 'rgba(235,235,245,0.93)'   : 'rgba(0,0,0,0.82)';
  const subColor    = isDark ? 'rgba(235,235,245,0.38)'   : 'rgba(0,0,0,0.40)';
  const footerColor = isDark ? 'rgba(235,235,245,0.24)'   : 'rgba(0,0,0,0.30)';
  const scoreHi     = isDark ? 'rgba(235,235,245,0.35)'   : 'rgba(0,0,0,0.42)';
  const scoreLo     = isDark ? 'rgba(235,235,245,0.20)'   : 'rgba(0,0,0,0.26)';

  return (
    <motion.div
      animate={{ x: shakeX, ...animateProps.animate }}
      transition={answerState === 'wrong'
        ? { duration: 0.35, ease: 'easeInOut' }
        : animateProps.transition}
      style={{
        height:        HEIGHT.focusCardMobile,
        margin:        '0 12px 0',
        borderRadius:  26,
        background:    cardBg,
        border:        `0.5px solid ${cardBorder}`,
        boxShadow:     cardShadow,
        overflow:      'hidden',
        flexShrink:    0,
        display:       'flex',
        flexDirection: 'column',
        position:      'relative',
      }}
    >
      {/* Answer feedback */}
      <AnimatePresence>
        {answerState === 'correct' && (
          <motion.div key="ok"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.4 }}
            style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
              background:'radial-gradient(ellipse at 50% 50%, rgba(48,209,88,0.10) 0%, transparent 65%)' }} />
        )}
        {answerState === 'wrong' && (
          <motion.div key="wrong"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }}
            style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
              background:'radial-gradient(ellipse at 50% 50%, rgba(255,69,58,0.09) 0%, transparent 65%)' }} />
        )}
      </AnimatePresence>

      {/* Zone 1 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:4, height:4, borderRadius:'50%', background:accent, opacity:0.65, flexShrink:0 }} />
          <span style={{ fontSize:10.5, fontWeight:500, color:labelColor, fontFamily:FONT_TEXT, letterSpacing:'0.005em' }}>
            {isRoot ? 'Find Root' : 'Find Interval'}
          </span>
        </div>
        <AnimatePresence mode="wait">
          {showStreak ? (
            <motion.div key="streak" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ display:'flex', alignItems:'center', gap:3 }}>
              <span style={{fontSize:11}}>🔥</span>
              <span style={{fontSize:12, fontWeight:600, color:scoreHi, fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums'}}>{streak}</span>
            </motion.div>
          ) : (
            <motion.div key="score" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ display:'flex', alignItems:'center', gap:2 }}>
              <span style={{fontSize:10.5, fontWeight:500, color:scoreHi, fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums'}}>{correct}</span>
              <span style={{fontSize:9.5, color: isDark ? 'rgba(235,235,245,0.14)' : 'rgba(0,0,0,0.18)', fontFamily:FONT_TEXT}}>/</span>
              <span style={{fontSize:10.5, color:scoreLo, fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums'}}>{total}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ margin:'0 16px', height:0.5, background:hairline }} />

      {/* Zone 2 */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:9, padding:'0 18px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mainDisplay + activeMode}
            initial={{ opacity:0, scale:0.92, filter:'blur(8px)' }}
            animate={{ opacity:1, scale:1,    filter:'blur(0px)' }}
            exit={{    opacity:0, scale:0.92, filter:'blur(8px)' }}
            transition={SPRINGS_IV.contentSwap}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:9, willChange:'transform,opacity,filter' }}
          >
            <span style={{
              fontSize:           mainIsNote ? 92 : 84,
              fontWeight:         700,
              color:              mainColor,
              fontFamily:         FONT_DISPLAY,
              lineHeight:         1,
              letterSpacing:      '-0.042em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {mainDisplay}
            </span>
            {subLine && subLine !== mainDisplay && (
              <span style={{ fontSize:16, fontWeight:400, color:subColor, fontFamily:FONT_TEXT, letterSpacing:'0.005em' }}>
                {subLine}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ margin:'0 16px', height:0.5, background:hairline }} />

      {/* Zone 3 */}
      <div style={{ padding:'10px 16px 11px', background:footerBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontSize:9.5, fontWeight:600, color:footerColor, fontFamily:FONT_TEXT, letterSpacing:'0.14em', textTransform:'uppercase' }}>
          {taskText}
        </span>
      </div>
    </motion.div>
  );
}
