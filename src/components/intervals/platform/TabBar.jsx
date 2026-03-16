// ─────────────────────────────────────────────────────────────
// components/intervals/platform/TabBar.jsx
//
// Replaces the old src/components/TabBar.jsx (emoji icons).
// Uses hand-crafted SVG icons + Direction-Aware spring pill.
//
// To activate: update App.jsx import from
//   ./components/TabBar  →  ./components/intervals/platform/TabBar
//
// Motion: allowed / top button micro-interaction (layoutId pill)
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { SPACING } from '../../../tokens/spacing';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// Tab definitions — matching existing TABS from old TabBar.jsx
export const TABS = [
  { id: 'home',     label: 'Home',      Icon: HomeIcon },
  { id: 'note',     label: 'Notes',     Icon: NoteIcon },
  { id: 'interval', label: 'Intervals', Icon: IntervalIcon },
  { id: 'changes',  label: 'Changes',   Icon: ChangesIcon },
  { id: 'scale',    label: 'Scales',    Icon: ScaleIcon },
  { id: 'persona',  label: 'Me',        Icon: PersonaIcon },
];

export function TabBar({ activeTab, onTabChange }) {
  const ctx    = useContext(ThemeContext);
  const isDark = ctx?.dark ?? true;
  const T      = useT();

  const navBg = isDark ? 'rgba(12,12,16,0.90)' : 'rgba(240,240,246,0.94)';

  return (
    <nav style={{
      position:   'fixed',
      bottom:     0,
      left:       0,
      right:      0,
      zIndex:     40,
      padding:    '0 8px env(safe-area-inset-bottom, 10px)',
      display:    'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width:               '100%',
        maxWidth:            560,
        background:          navBg,
        backdropFilter:      'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop:           isDark
          ? '0.5px solid rgba(255,255,255,0.07)'
          : `0.5px solid ${T.border ?? 'rgba(60,60,67,0.18)'}`,
        boxShadow:           isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 -2px 16px rgba(0,0,0,0.06)',
        borderRadius:        '22px 22px 0 0',
      }}>
        <div style={{ display: 'flex', padding: '0 4px' }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            const iconColor = active
              ? (T.accent ?? '#1A6CF5')
              : (T.textTertiary ?? 'rgba(255,255,255,0.35)');

            return (
              <motion.button
                key={id}
                onClick={() => onTabChange(id)}
                // Motion: allowed / top button micro-interaction
                whileTap={{ scale: 0.86 }}
                transition={SPRINGS_IV.buttonPress}
                style={{
                  flex:           1,
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  padding:        '10px 2px 8px',
                  borderRadius:   22,
                  position:       'relative',
                  border:         'none',
                  cursor:         'pointer',
                  background:     'transparent',
                }}
              >
                {/* Sliding active pill */}
                {active && (
                  <motion.div
                    // Motion: allowed / top button micro-interaction (layoutId pill)
                    layoutId="interval-tab-pill"
                    transition={SPRINGS_IV.tabSlide}
                    style={{
                      position:   'absolute',
                      inset:      '2px 0',
                      borderRadius: 20,
                      background: 'rgba(255,255,255,0.08)',
                      border:     '0.5px solid rgba(255,255,255,0.10)',
                      boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.07)',
                    }}
                  />
                )}

                {/* Icon */}
                <div style={{ position: 'relative', marginBottom: 2 }}>
                  <Icon size={20} color={iconColor} />
                </div>

                {/* Label */}
                <span style={{
                  fontSize:      9,
                  fontWeight:    active ? 600 : 400,
                  color:         iconColor,
                  fontFamily:    FONT_TEXT,
                  letterSpacing: '0.02em',
                  position:      'relative',
                  transition:    'color 0.2s',
                }}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ── SVG Icon components ──────────────────────────────────────
// All icons: viewBox 0 0 20 20, strokeWidth 1.5, fill none
// LOCKED spec: hand-crafted SVG, no emoji

function HomeIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5L10 2.5L17 8.5V18H13V13H7V18H3V8.5Z"/>
    </svg>
  );
}

function NoteIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16V6l9-2v10"/>
      <circle cx="6" cy="16" r="2"/>
      <circle cx="15" cy="14" r="2"/>
    </svg>
  );
}

function IntervalIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <circle cx="5.5"  cy="11" r="2.5"/>
      <circle cx="14.5" cy="11" r="2.5"/>
      <path d="M8 9Q10 4.5 12 9"/>
    </svg>
  );
}

function ChangesIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="6" width="6" height="9" rx="1.5"/>
      <rect x="12" y="6" width="6" height="9" rx="1.5"/>
      <line x1="8" y1="10.5" x2="12" y2="10.5"/>
    </svg>
  );
}

function ScaleIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,17 2,13 7,13 7,9 12,9 12,5 17,5"/>
      <circle cx="7"  cy="13" r="1.5" fill={color} stroke="none"/>
      <circle cx="12" cy="9"  r="1.5" fill={color} stroke="none"/>
    </svg>
  );
}

function PersonaIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M3.5 19c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/>
    </svg>
  );
}
