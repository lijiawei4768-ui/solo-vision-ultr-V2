// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FocusCard.jsx
//
// L0 cognitive centre. Shows the current question target.
// Layers: breathing base → content swap → answer glow overlay.
//
// answerState: 'idle' | 'correct' | 'wrong'
// activeMode:  'findRoot' | 'findInterval'
// question:    { rootNote, targetNote, intervalName } | null
//
// Motion: allowed / FocusCard content transition
// Motion: allowed / very light ambient alive sense (breathing)
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_DISPLAY, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { BLUR } from '../../../tokens/blur';
import { SHADOW } from '../../../tokens/elevation';
import { RADIUS } from '../../../tokens/radius';
import { HEIGHT } from '../../../tokens/spacing';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

/**
 * @param {{
 *   question: object|null,
 *   activeMode: 'findRoot'|'findInterval',
 *   answerState: 'idle'|'correct'|'wrong',
 * }} props
 */
export function FocusCard({ question, activeMode, answerState }) {
  const T = useT();

  // Motion: allowed / very light ambient alive sense
  const { animateProps } = useBreathing('focusCard', answerState === 'idle');

  // What to display based on mode
  const hint = activeMode === 'findRoot' ? 'FIND THE ROOT' : 'FIND THE INTERVAL';
  const mainDisplay = question
    ? (activeMode === 'findRoot' ? question.intervalName : question.rootNote)
    : '—';
  const subDisplay = question
    ? (activeMode === 'findRoot' ? '' : question.intervalName)
    : '';

  // Wrong answer shake keyframes
  const shakeX = answerState === 'wrong'
    ? [0, -5, 5, -5, 5, -3, 3, 0]
    : 0;

  return (
    <motion.div
      // Motion: allowed / FocusCard content transition (shake for wrong)
      animate={{
        x: shakeX,
        ...animateProps.animate,
      }}
      transition={
        answerState === 'wrong'
          ? { duration: 0.35, ease: 'easeInOut' }
          : animateProps.transition
      }
      style={{
        height:              HEIGHT.focusCardMobile, // clamp — initialSuggested
        margin:              '0 16px 4px',
        borderRadius:        RADIUS.focusCard,
        backdropFilter:      BLUR.focusCard,
        WebkitBackdropFilter: BLUR.focusCard,
        background:          'rgba(255,255,255,0.06)',
        boxShadow:           SHADOW.focusCard,
        position:            'relative',
        overflow:            'hidden',
        flexShrink:          0,
        display:             'flex',
        alignItems:          'center',
        justifyContent:      'center',
      }}
    >
      {/* ── Answer glow overlays ─────────────────────────── */}
      <AnimatePresence>
        {answerState === 'correct' && (
          <motion.div
            key="correct-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position:        'absolute',
              inset:           0,
              // Motion: allowed / FocusCard content transition (answer glow)
              background:      'radial-gradient(circle at 50% 50%, rgba(30,200,100,0.14) 0%, transparent 70%)',
              borderRadius:    'inherit',
              pointerEvents:   'none',
            }}
          />
        )}
        {answerState === 'wrong' && (
          <motion.div
            key="wrong-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position:        'absolute',
              inset:           0,
              background:      'radial-gradient(circle at 50% 50%, rgba(220,140,30,0.14) 0%, transparent 70%)',
              borderRadius:    'inherit',
              pointerEvents:   'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Content swap on question change ──────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mainDisplay + activeMode}
          // Motion: allowed / FocusCard content transition (blur+scale swap)
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
          exit={{    opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          transition={SPRINGS_IV.contentSwap}
          style={{
            display:         'flex',
            flexDirection:   'column',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             4,
            padding:         '0 16px',
            textAlign:       'center',
            willChange:      'transform, opacity, filter',
          }}
        >
          {/* Task hint */}
          <span style={{
            fontSize:      11,
            fontWeight:    400,
            color:         T.textTertiary ?? 'rgba(255,255,255,0.40)',
            fontFamily:    FONT_TEXT,
            letterSpacing: '0.08em',
          }}>
            {hint}
          </span>

          {/* Main target display */}
          <span style={{
            fontSize:      question ? 38 : 28, // initialSuggested
            fontWeight:    700,
            color:         T.textPrimary ?? 'rgba(255,255,255,0.95)',
            fontFamily:    FONT_DISPLAY,
            lineHeight:    1.1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {mainDisplay}
          </span>

          {/* Interval sub-label */}
          {subDisplay ? (
            <span style={{
              fontSize:   13,
              fontWeight: 400,
              color:      T.textSecondary ?? 'rgba(255,255,255,0.65)',
              fontFamily: FONT_TEXT,
            }}>
              {subDisplay}
            </span>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
