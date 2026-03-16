// ─────────────────────────────────────────────────────────────
// components/shared/L2Shell.jsx — Shared L2 editor shell
//
// All three L2 editors (SpaceEditorL2, FlowEditorL2,
// IntervalsEditorL2) use this as their outer wrapper.
//
// Responsibilities:
//   1. Framer Motion layoutId — connects to the L1 source widget
//      so the expand animation originates from that element.
//   2. Header bar: title string + × close button.
//   3. Content slot (children).
//   4. Close gesture: downward swipe > 300px/s on mobile.
//   5. Backdrop overlay (mobile covers L1; iPad/PC uses popover).
//
// Platform rendering:
//   mobile  → covers L1 region, z-index from elevation.js
//   iPad    → Popover (caller wraps in shadcn Popover)
//   PC      → Floating Panel (caller wraps in Cult UI FloatingPanel)
//   On iPad and PC the shell still renders the header + content,
//   but the outer positioning is handled by the caller.
//
// Motion: allowed / shared-layout expand
// ─────────────────────────────────────────────────────────────
import React, { useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRINGS_IV } from '../../motion/springs';
import { RADIUS } from '../../tokens/radius';
import { BLUR } from '../../tokens/blur';
import { SHADOW } from '../../tokens/elevation';
import { Z } from '../../tokens/elevation';
import { ThemeContext } from '../../contexts';
import { DT } from '../../theme';

// Velocity threshold for swipe-down to close (px/s) — initialSuggested
const SWIPE_CLOSE_VELOCITY = 300;

/**
 * @param {object}   props
 * @param {string}   props.layoutId     — Framer Motion layoutId, must match L1 widget
 * @param {string}   props.title        — Header title e.g. "Space 音域"
 * @param {boolean}  props.isOpen       — Controls AnimatePresence
 * @param {Function} props.onClose      — Called to close the shell
 * @param {React.ReactNode} props.children
 * @param {'mobile'|'tablet'|'pc'} [props.platform] — defaults to 'mobile'
 * @param {React.CSSProperties} [props.style]  — extra styles for the panel
 */
export function L2Shell({
  layoutId,
  title,
  isOpen,
  onClose,
  children,
  platform = 'mobile',
  style,
}) {
  const ctx = useContext(ThemeContext);
  const T   = ctx?.tokens ?? DT;

  const isMobile = platform === 'mobile';

  // ── Swipe-down to close (mobile only) ───────────────────────
  const swipeStartY  = useRef(null);
  const swipeStartT  = useRef(null);

  const handleTouchStart = useCallback((e) => {
    swipeStartY.current = e.touches[0].clientY;
    swipeStartT.current = performance.now();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (swipeStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    const dt = performance.now() - swipeStartT.current;
    const velocity = (dy / dt) * 1000; // px/s

    if (dy > 30 && velocity > SWIPE_CLOSE_VELOCITY) {
      onClose?.();
    }
    swipeStartY.current = null;
  }, [onClose]);

  // ── Shared panel style ───────────────────────────────────────
  const panelStyle = {
    position:        isMobile ? 'absolute' : 'relative',
    ...(isMobile && {
      left: 0, right: 0, bottom: 0,
      zIndex: Z.l2,
    }),
    borderRadius:    isMobile
      ? `${RADIUS.l1Sheet}px ${RADIUS.l1Sheet}px 0 0`
      : RADIUS.l2Popover,
    background:      T.surface1
      ? `rgba(22,22,32,0.97)`
      : 'rgba(22,22,32,0.97)',
    backdropFilter:  BLUR.l2Panel,
    WebkitBackdropFilter: BLUR.l2Panel,
    border:          `0.5px solid ${T.border ?? 'rgba(255,255,255,0.08)'}`,
    boxShadow:       SHADOW.l2Panel,
    overflow:        'hidden',
    display:         'flex',
    flexDirection:   'column',
    ...style,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay — mobile only */}
          {isMobile && (
            <motion.div
              key="l2-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              style={{
                position:   'absolute',
                inset:      0,
                zIndex:     Z.l2 - 1,
                background: 'rgba(0,0,0,0)',
                // No visible background — just catches tap-outside
              }}
            />
          )}

          {/* Panel — shared layout expand */}
          <motion.div
            key="l2-panel"
            // Motion: allowed / shared-layout expand
            layoutId={layoutId}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={SPRINGS_IV.layerExpand}
            style={panelStyle}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            {/* ── Header bar ─────────────────────────────── */}
            <div
              style={{
                height:         22,
                flexShrink:     0,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '0 10px',
                borderBottom:   `0.5px solid ${T.border ?? 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span
                style={{
                  fontSize:   12,
                  fontWeight: 500,
                  color:      T.textSecondary ?? 'rgba(255,255,255,0.65)',
                  letterSpacing: '0.02em',
                }}
              >
                {title}
              </span>

              {/* × close button */}
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.86 }}
                // Motion: allowed / top button micro-interaction
                transition={SPRINGS_IV.buttonPress}
                style={{
                  background: 'transparent',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    '0 2px',
                  lineHeight: 1,
                  color:      T.textTertiary ?? 'rgba(255,255,255,0.40)',
                  fontSize:   16,
                  display:    'flex',
                  alignItems: 'center',
                }}
                aria-label="Close"
              >
                ×
              </motion.button>
            </div>

            {/* ── Content slot ───────────────────────────── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
