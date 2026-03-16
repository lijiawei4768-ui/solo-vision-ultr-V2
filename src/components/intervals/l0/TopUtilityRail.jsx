// ─────────────────────────────────────────────────────────────
// components/intervals/l0/TopUtilityRail.jsx
//
// L0 top utility row. Left: App logo. Right: MicCapsule, Stats,
// ThemeToggle, Settings.
//
// MicCapsule replicates the Dynamic Island pattern from LEGACY
// using only framer-motion (UseAnimations not in package.json).
//
// All icons are hand-crafted SVG — no emoji.
// Motion: allowed / top button micro-interaction
// Motion: allowed / very light ambient alive sense (mic breathing)
// ─────────────────────────────────────────────────────────────
import React, { useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { SHADOW } from '../../../tokens/elevation';
import { SPACING } from '../../../tokens/spacing';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ── RMS bar amplitude weights ─────────────────────────────────
const RMS_WEIGHTS = [0.70, 0.50, 1.00, 0.60, 0.85];

/**
 * @param {{
 *   micActive:    boolean,
 *   rms:          number,
 *   answerState:  'idle'|'correct'|'wrong',
 *   onMicToggle:  () => void,
 *   onStats:      () => void,
 *   onTheme:      () => void,
 *   onSettings:   () => void,
 *   isDark:       boolean,
 * }} props
 */
export function TopUtilityRail({
  micActive    = false,
  rms          = 0,
  answerState  = 'idle',
  onMicToggle,
  onStats,
  onTheme,
  onSettings,
  isDark       = true,
}) {
  const T       = useT();
  const hasSignal = micActive && rms > 0.008;

  const rmsLevel  = rms ? Math.min(1, rms * 20) : 0;
  const rmsBars   = RMS_WEIGHTS.map(w => 2 + Math.round(rmsLevel * w * 13));

  const isCorrect = micActive && answerState === 'correct';
  const isWrong   = micActive && answerState === 'wrong';

  const micBg = micActive
    ? (isCorrect ? 'rgba(52,199,89,0.14)' : isWrong ? 'rgba(232,162,60,0.12)' : 'rgba(52,199,89,0.10)')
    : (T.surface2 ?? 'rgba(255,255,255,0.06)');
  const micBorder = micActive
    ? (isCorrect ? 'rgba(52,199,89,0.50)' : isWrong ? 'rgba(232,162,60,0.40)' : 'rgba(52,199,89,0.38)')
    : (T.border ?? 'rgba(255,255,255,0.10)');
  const micColor = micActive
    ? (isCorrect ? '#34C759' : isWrong ? '#E8A23C' : '#34C759')
    : (T.textTertiary ?? 'rgba(255,255,255,0.35)');

  // Motion: allowed / very light ambient alive sense (mic listening pulse)
  const { animateProps: micBreath } = useBreathing('micPill', micActive && !hasSignal);

  const iconStroke = T.textSecondary ?? 'rgba(255,255,255,0.55)';
  const btnStyle = {
    width:        30,
    height:       30,
    borderRadius: 10,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    cursor:       'pointer',
    border:       `0.5px solid ${T.border ?? 'rgba(255,255,255,0.10)'}`,
    background:   T.surface2 ?? 'rgba(255,255,255,0.06)',
    boxShadow:    SHADOW.iconButtonInset,
  };

  return (
    <div style={{
      height:      SPACING.topRailHeightMobile,
      paddingTop:  'max(12px, env(safe-area-inset-top, 12px))',
      paddingLeft: 16,
      paddingRight: 16,
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'space-between',
      flexShrink:  0,
    }}>
      {/* ── Left: App identifier ─────────────────────────── */}
      <span style={{
        fontSize:      15,
        fontWeight:    600,
        color:         T.textPrimary ?? 'rgba(255,255,255,0.95)',
        fontFamily:    FONT_TEXT,
        letterSpacing: '-0.02em',
      }}>
        I
      </span>

      {/* ── Right: Utility buttons ───────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* MicCapsule — Dynamic Island pattern */}
        <motion.button
          onClick={onMicToggle}
          // Motion: allowed / top button micro-interaction
          layout
          transition={{ layout: SPRINGS_IV.buttonPress }}
          whileTap={{ scale: 0.90 }}
          {...(micActive && !hasSignal ? micBreath : {})}
          style={{
            height:       30,
            borderRadius: 15,
            display:      'flex',
            alignItems:   'center',
            gap:          4,
            cursor:       'pointer',
            border:       `0.5px solid ${micBorder}`,
            background:   micBg,
            color:        micColor,
            paddingLeft:  9,
            paddingRight: hasSignal ? 10 : 9,
            overflow:     'hidden',
          }}
        >
          {/* Mic SVG icon */}
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke={micColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8"  y1="23" x2="16" y2="23"/>
          </svg>

          {/* RMS bars — only when signal present */}
          <AnimatePresence>
            {hasSignal && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 14, overflow: 'hidden' }}
              >
                {rmsBars.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: h }}
                    transition={{ duration: 0.07, ease: 'linear' }}
                    style={{
                      width:        2.5,
                      borderRadius: 1.5,
                      background:   micColor,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* State label */}
          <motion.span layout style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT_TEXT, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {!micActive ? 'MIC' : isCorrect ? '✓' : isWrong ? 'Again' : 'Listening'}
          </motion.span>
        </motion.button>

        {/* Stats button */}
        <motion.button onClick={onStats} whileTap={{ scale: 0.88 }}
          transition={SPRINGS_IV.buttonPress} style={btnStyle}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth={2} strokeLinecap="round">
            <line x1="6"  y1="20" x2="6"  y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="18" y1="20" x2="18" y2="14"/>
          </svg>
        </motion.button>

        {/* Theme toggle */}
        <motion.button onClick={onTheme} whileTap={{ scale: 0.88 }}
          transition={SPRINGS_IV.buttonPress} style={btnStyle}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {isDark ? (
              <>
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="2"  y1="12" x2="4"  y2="12"/>
                <line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            )}
          </svg>
        </motion.button>

        {/* Settings */}
        <motion.button onClick={onSettings} whileTap={{ scale: 0.88 }}
          transition={SPRINGS_IV.buttonPress} style={btnStyle}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
