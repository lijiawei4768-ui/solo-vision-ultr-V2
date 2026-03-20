// components/intervals/l0/TopUtilityRail.jsx  — Visual Reset v7b
//
// Layout: title left, single island right.
// Island contains: Mic sub-unit | divider | stats | theme | settings.
// Adapts to dark/light via `isDark` prop.
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UseAnimations from 'react-useanimations';
import activity from 'react-useanimations/lib/activity';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { useBreathing } from '../../../hooks/useBreathing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const RMS_WEIGHTS = [0.70, 0.50, 1.00, 0.60, 0.85];

export function TopUtilityRail({
  micActive = false, rms = 0, answerState = 'idle',
  onMicToggle, onStats, onTheme, onSettings, isDark = true,
}) {
  const hasSignal = micActive && rms > 0.008;
  const rmsLevel  = rms ? Math.min(1, rms * 20) : 0;
  const rmsBars   = RMS_WEIGHTS.map(w => 2 + Math.round(rmsLevel * w * 11));
  const isCorrect = micActive && answerState === 'correct';
  const isWrong   = micActive && answerState === 'wrong';

  const micColor = micActive
    ? (isCorrect ? '#30D158' : isWrong ? '#FF9F0A' : '#30D158')
    : (isDark ? 'rgba(235,235,245,0.48)' : 'rgba(0,0,0,0.45)');

  const { animateProps: micBreath } = useBreathing('micPill', micActive && !hasSignal);

  // Island background adapts per mode
  const islandBg     = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(255,255,255,0.85)';
  const islandBorder = isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(0,0,0,0.10)';
  const islandShadow = isDark ? 'none'                       : '0 1px 4px rgba(0,0,0,0.10)';
  const micSubBg     = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.05)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.12)'    : 'rgba(0,0,0,0.14)';
  const iconStroke   = isDark ? 'rgba(235,235,245,0.52)'    : 'rgba(0,0,0,0.45)';
  const titleColor   = isDark ? 'rgba(235,235,245,0.88)'    : 'rgba(0,0,0,0.85)';

  const iconBtn = {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', background: 'none', border: 'none',
    flexShrink: 0,
  };

  return (
    <div style={{
      paddingTop:    'max(20px, env(safe-area-inset-top, 20px))',
      paddingLeft:   18, paddingRight: 18, paddingBottom: 0,
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      flexShrink:    0,
    }}>
      {/* Title */}
      <span style={{
        fontSize: 17, fontWeight: 600,
        color: titleColor,
        fontFamily: FONT_TEXT,
        letterSpacing: '-0.025em',
      }}>Intervals</span>

      {/* Right island */}
      <div style={{
        display:      'flex', alignItems: 'center', gap: 2,
        background:   islandBg,
        border:       `0.5px solid ${islandBorder}`,
        borderRadius: 18,
        padding:      '3px 5px 3px 4px',
        boxShadow:    islandShadow,
      }}>
        {/* Mic sub-unit */}
        <motion.div
          onClick={onMicToggle}
          {...(micActive && !hasSignal ? micBreath : {})}
          whileTap={{ scale: 0.93 }}
          transition={SPRINGS_IV.buttonPress}
          style={{
            display:      'flex', alignItems: 'center', gap: 4,
            padding:      '4px 8px',
            borderRadius: 13,
            background:   micActive
              ? (isCorrect ? 'rgba(48,209,88,0.12)' : isWrong ? 'rgba(255,159,10,0.10)' : 'rgba(48,209,88,0.10)')
              : micSubBg,
            cursor:       'pointer',
            flexShrink:   0,
          }}
        >
          {micActive ? (
            <UseAnimations
              animation={activity}
              size={14}
              strokeColor={micColor}
              loop autoplay
              wrapperStyle={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
            />
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2.5" y="0.5" width="5" height="8.5" rx="2.5"
                stroke={micColor} strokeWidth="1.1"/>
              <path d="M0.5 7 C0.5 10.5 9.5 10.5 9.5 7"
                stroke={micColor} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
              <line x1="5" y1="10.5" x2="5"   y2="12.5" stroke={micColor} strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="3.5" y1="12.5" x2="6.5" y2="12.5" stroke={micColor} strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
          )}

          <AnimatePresence>
            {hasSignal && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ display:'flex', alignItems:'flex-end', gap:1.5, height:11, overflow:'hidden' }}
              >
                {rmsBars.map((h, i) => (
                  <motion.div key={i}
                    animate={{ height: h }}
                    transition={{ duration: 0.07, ease: 'linear' }}
                    style={{ width: 2, borderRadius: 1, background: micColor }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.span layout style={{
            fontSize: 10, fontWeight: 500, color: micColor,
            fontFamily: FONT_TEXT, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {!micActive ? 'MIC' : isCorrect ? '✓' : isWrong ? 'Try again' : 'On'}
          </motion.span>
        </motion.div>

        {/* Divider */}
        <div style={{ width: 0.5, height: 14, background: dividerColor, margin: '0 2px', flexShrink: 0 }} />

        {/* Stats */}
        <motion.button onClick={onStats} whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }} style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round">
            <line x1="6" y1="20" x2="6" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="18" y1="20" x2="18" y2="14"/>
          </svg>
        </motion.button>

        {/* Theme toggle: sun in dark, moon in light */}
        <motion.button onClick={onTheme} whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }} style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {isDark ? (
              <>
                <circle cx="12" cy="12" r="4"/>
                <line x1="12" y1="2"  x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="2"  y1="12" x2="4"  y2="12"/>
                <line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.22"  y1="4.22"   x2="5.64"  y2="5.64"/>
                <line x1="18.36" y1="18.36"  x2="19.78" y2="19.78"/>
                <line x1="4.22"  y1="19.78"  x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"   x2="19.78" y2="4.22"/>
              </>
            ) : (
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
            )}
          </svg>
        </motion.button>

        {/* Settings */}
        <motion.button onClick={onSettings} whileTap={{ opacity: 0.5 }}
          transition={{ duration: 0.1 }} style={iconBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={iconStroke} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
