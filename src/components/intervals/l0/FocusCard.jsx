// components/intervals/l0/FocusCard.jsx — v8
//
// v8: 全面使用 T.glass 毛玻璃 token 替代硬编码 isDark 颜色
//   - cardBg     → T.glass.surface1（带主题色倾向的毛玻璃）
//   - cardBorder → T.glass.border
//   - 背景加 backdropFilter T.glass.blur，让 MeshBackground blob 透出
//   - 文字颜色统一用 T.textPrimary / T.textSecondary / T.textTertiary

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_DISPLAY, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { HEIGHT } from '../../../tokens/spacing';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const INTERVAL_FULL = {
  'R':'Root','b2':'Minor 2nd','2':'Major 2nd','b3':'Minor 3rd','3':'Major 3rd',
  '4':'Perfect 4th','b5':'Tritone','5':'Perfect 5th','b6':'Minor 6th',
  '6':'Major 6th','b7':'Minor 7th','7':'Major 7th','P8':'Octave',
};

export function FocusCard({ question, activeMode, answerState, score, streak }) {
  const T      = useT();
  const isDark = T.themeDark ?? true;
  const { animateProps } = useBreathing('focusCard', answerState === 'idle');

  const isRoot      = activeMode === 'findRoot';
  const mainDisplay = question ? (isRoot ? question.intervalName : question.rootNote) : '—';
  const mainIsNote  = !isRoot;
  const subLine     = question
    ? (isRoot ? (INTERVAL_FULL[question.intervalName] ?? question.intervalName) : question.intervalName)
    : null;
  const taskText = isRoot ? 'Find the Root' : 'Find the Interval';
  const shakeX   = answerState === 'wrong' ? [0,-6,6,-6,6,-3,3,0] : 0;
  const showStreak = (streak ?? 0) >= 3;
  const correct    = score?.correct ?? 0;
  const total      = score?.total   ?? 0;

  // ── v8: 从 T.glass 读取，而不是 isDark 三元 ────────────────
  const cardBg      = T.glass?.surface1  ?? (isDark ? 'rgba(14,10,38,0.65)' : 'rgba(255,255,255,0.65)');
  const cardBlur    = T.glass?.blur      ?? 'blur(20px) saturate(180%)';
  const cardBorder  = T.glass?.border    ?? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)');
  const cardBorderTop = T.glass?.borderTop ?? T.glass?.border ?? cardBorder;
  const cardShadow  = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)';

  // hairline 用 border 稍暗
  const hairline    = isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)';

  const footerBg    = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const labelColor  = T.textTertiary  ?? (isDark ? 'rgba(235,235,245,0.42)' : 'rgba(0,0,0,0.48)');
  const mainColor   = T.textPrimary   ?? (isDark ? 'rgba(235,235,245,0.93)' : 'rgba(0,0,0,0.82)');
  const subColor    = T.textSecondary ?? (isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.40)');
  const footerColor = T.textTertiary  ?? (isDark ? 'rgba(235,235,245,0.24)' : 'rgba(0,0,0,0.30)');
  const scoreHi     = T.textSecondary ?? (isDark ? 'rgba(235,235,245,0.35)' : 'rgba(0,0,0,0.42)');
  const scoreLo     = T.textTertiary  ?? (isDark ? 'rgba(235,235,245,0.20)' : 'rgba(0,0,0,0.26)');
  const accent      = T.accent ?? '#a78bfa';

  return (
    <motion.div
      animate={{ x: shakeX, ...animateProps.animate }}
      transition={answerState === 'wrong'
        ? { duration: 0.35, ease: 'easeInOut' }
        : animateProps.transition}
      style={{
        height:              HEIGHT.focusCardMobile,
        margin:              '0 12px 0',
        borderRadius:        26,
        // v8: 真正的毛玻璃 — 带色倾向 + backdropFilter
        background:          cardBg,
        backdropFilter:      cardBlur,
        WebkitBackdropFilter: cardBlur,
        border:              `0.5px solid ${cardBorder}`,
        // 顶部高光线模拟玻璃折射
        boxShadow:           `inset 0 0.5px 0 ${cardBorderTop}, ${cardShadow}`,
        overflow:            'hidden',
        flexShrink:          0,
        display:             'flex',
        flexDirection:       'column',
        position:            'relative',
      }}
    >
      {/* 答题反馈 overlay */}
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

      {/* Zone 1 — 标题行 */}
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
              <span style={{fontSize:9.5, color:hairline, fontFamily:FONT_TEXT}}>/</span>
              <span style={{fontSize:10.5, color:scoreLo, fontFamily:FONT_MONO, fontVariantNumeric:'tabular-nums'}}>{total}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ margin:'0 16px', height:0.5, background:hairline }} />

      {/* Zone 2 — 主内容 */}
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

      {/* Zone 3 — footer */}
      <div style={{ padding:'10px 16px 11px', background:footerBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontSize:9.5, fontWeight:600, color:footerColor, fontFamily:FONT_TEXT, letterSpacing:'0.14em', textTransform:'uppercase' }}>
          {taskText}
        </span>
      </div>
    </motion.div>
  );
}
