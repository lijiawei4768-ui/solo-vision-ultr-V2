// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FocusCard.jsx  — Visual Correction
//
// Changes vs Batch B:
//   • Internal layout fully restructured — 3 clear zones:
//     TOP:    mode chip + streak counter (left-right)
//     CENTRE: main target display — larger, weightier
//     BOTTOM: task instruction strip + sub info
//   • Top inset accent line made visible (was implied, now rendered)
//   • Main font enlarged: 38 → 48px for notes, 40px for intervals
//   • Score accepts score/streak props for contextual display
//   • Background slightly warmer: 0.06 → 0.07 opacity
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_DISPLAY, FONT_TEXT, FONT_MONO } from '../../../theme';
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

export function FocusCard({ question, activeMode, answerState, score, streak }) {
  const T = useT();
  const { animateProps } = useBreathing('focusCard', answerState === 'idle');

  // Content logic
  const isRoot      = activeMode === 'findRoot';
  const mainDisplay = question
    ? (isRoot ? question.intervalName : question.rootNote)
    : '—';
  const mainIsNote  = !isRoot; // root notes are single letters, bigger font
  const subDisplay  = question && !isRoot ? question.intervalName : null;
  const taskText    = isRoot ? 'FIND THE ROOT' : 'FIND THE INTERVAL';

  const shakeX = answerState === 'wrong' ? [0, -6, 6, -6, 6, -3, 3, 0] : 0;

  // Streak badge shows after 3+ correct
  const showStreak  = streak >= 3;

  return (
    <motion.div
      animate={{ x: shakeX, ...animateProps.animate }}
      transition={
        answerState === 'wrong'
          ? { duration: 0.35, ease: 'easeInOut' }
          : animateProps.transition
      }
      style={{
        height:               HEIGHT.focusCardMobile,
        marginLeft:           16,
        marginRight:          16,
        marginBottom:         4,
        borderRadius:         RADIUS.focusCard,
        backdropFilter:       BLUR.focusCard,
        WebkitBackdropFilter: BLUR.focusCard,
        background:           'rgba(255,255,255,0.07)',
        boxShadow:            SHADOW.focusCard,
        position:             'relative',
        overflow:             'hidden',
        flexShrink:           0,
        display:              'flex',
        flexDirection:        'column',
      }}
    >
      {/* ── Top inset accent line ─────────────────────────── */}
      <div style={{
        position:     'absolute',
        top:          0,
        left:         0,
        right:        0,
        height:       1,
        background:   'rgba(255,255,255,0.14)',
        borderRadius: `${RADIUS.focusCard}px ${RADIUS.focusCard}px 0 0`,
      }} />

      {/* ── Answer glow overlays ─────────────────────────── */}
      <AnimatePresence>
        {answerState === 'correct' && (
          <motion.div key="g-ok"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 60%, rgba(30,200,100,0.16) 0%, transparent 65%)',
              borderRadius: 'inherit',
            }} />
        )}
        {answerState === 'wrong' && (
          <motion.div key="g-wrong"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 60%, rgba(220,140,30,0.15) 0%, transparent 65%)',
              borderRadius: 'inherit',
            }} />
        )}
      </AnimatePresence>

      {/* ── Zone 1: Top row — mode chip + streak ─────────── */}
      <div style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '10px 14px 0',
        flexShrink:      0,
      }}>
        {/* Mode indicator chip */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          5,
          background:   'rgba(255,255,255,0.05)',
          border:       '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding:      '3px 9px',
        }}>
          <div style={{
            width:        5,
            height:       5,
            borderRadius: '50%',
            background:   T.accent ?? '#1A6CF5',
            opacity:      0.8,
          }} />
          <span style={{
            fontSize:      10,
            fontWeight:    500,
            color:         T.textTertiary ?? 'rgba(255,255,255,0.40)',
            fontFamily:    FONT_TEXT,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {isRoot ? 'Find Root' : 'Find Interval'}
          </span>
        </div>

        {/* Streak badge */}
        <AnimatePresence>
          {showStreak && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SPRINGS_IV.capsuleSelect}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          4,
                background:   'rgba(255,213,0,0.10)',
                border:       '0.5px solid rgba(255,213,0,0.25)',
                borderRadius: 20,
                padding:      '3px 9px',
              }}
            >
              <span style={{ fontSize: 11 }}>🔥</span>
              <span style={{
                fontSize:           11,
                fontWeight:         600,
                color:              '#FFD600',
                fontFamily:         FONT_MONO,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {streak}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Zone 2: Centre — main target display ─────────── */}
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '0 20px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mainDisplay + activeMode}
            initial={{ opacity: 0, scale: 0.90, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
            exit={{    opacity: 0, scale: 0.90, filter: 'blur(8px)' }}
            transition={SPRINGS_IV.contentSwap}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            2,
              willChange:     'transform, opacity, filter',
            }}
          >
            <span style={{
              // Notes (single letter) get larger size; interval names (M3 etc) slightly smaller
              fontSize:           mainIsNote ? 54 : 44, // initialSuggested
              fontWeight:         700,
              color:              T.textPrimary ?? 'rgba(255,255,255,0.95)',
              fontFamily:         FONT_DISPLAY,
              lineHeight:         1.0,
              letterSpacing:      mainIsNote ? '-0.03em' : '-0.01em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {mainDisplay}
            </span>
            {subDisplay && (
              <span style={{
                fontSize:      15,
                fontWeight:    400,
                color:         T.textSecondary ?? 'rgba(255,255,255,0.55)',
                fontFamily:    FONT_TEXT,
                letterSpacing: '0.02em',
              }}>
                {subDisplay}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Zone 3: Bottom strip — task instruction ───────── */}
      <div style={{
        borderTop:      '0.5px solid rgba(255,255,255,0.06)',
        padding:        '8px 14px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <span style={{
          fontSize:      10,
          fontWeight:    400,
          color:         T.textTertiary ?? 'rgba(255,255,255,0.35)',
          fontFamily:    FONT_TEXT,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}>
          {taskText}
        </span>
      </div>
    </motion.div>
  );
}
