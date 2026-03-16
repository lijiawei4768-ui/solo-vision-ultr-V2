// ─────────────────────────────────────────────────────────────
// components/shared/DrumWheel.jsx — Reusable drum-wheel picker
//
// Renders a vertically scrollable, snap-to-card picker.
// Visual style is intentionally minimal — callers (ModeStack,
// IntervalsStack) override className/style to apply their own
// card skin.
//
// Visual spec (execution mother doc Part 2.1 / INT_SPEC §2.2):
//   Visible: current card (scale 1.0, opacity 1.0)
//          + upper adjacent (scale 0.9, opacity 0.55)
//          + lower adjacent (scale 0.9, opacity 0.55)
//   Far items: not rendered.
//   Snap: uses useDrumWheel hook (velocity + snap logic).
//
// Motion: allowed / Scroll Stack
// ─────────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useDrumWheel } from '../../hooks/useDrumWheel';
import { SPRINGS_IV } from '../../motion/springs';
import { RADIUS } from '../../tokens/radius';
import { ThemeContext } from '../../contexts';
import { DT } from '../../theme';

// ── Visual constants ─────────────────────────────────────────
const CARD_HEIGHT     = 54;  // px — current card height
const ADJACENT_HEIGHT = 28;  // px — adjacent card visible strip
const WHEEL_HEIGHT    = CARD_HEIGHT + (ADJACENT_HEIGHT * 2); // px — total container height

const ITEM_STATES = {
  current:  { scale: 1.0, opacity: 1.0,  y: 0 },
  adjacent: { scale: 0.9, opacity: 0.55, y: 0 },
  hidden:   { scale: 0.8, opacity: 0,    y: 0 },
};

/**
 * @param {object} props
 * @param {Array<{id: string, label: string, sublabel?: string}>} props.items
 * @param {string}   props.selectedId    — currently selected item id
 * @param {Function} props.onSelect      — (id: string) => void
 * @param {Function} [props.renderCard]  — optional custom card renderer
 *   (item, state: 'current'|'adjacent') => ReactNode
 *   If omitted, a default label card is rendered.
 * @param {React.CSSProperties} [props.style]  — outer container style overrides
 * @param {string} [props.className]
 */
export function DrumWheel({
  items,
  selectedId,
  onSelect,
  renderCard,
  style,
  className,
}) {
  const ctx = useContext(ThemeContext);
  const T   = ctx?.tokens ?? DT;

  const {
    dragY,
    gestureHandlers,
    getItemState,
    currentIndex,
  } = useDrumWheel(items, selectedId, onSelect);

  // Compute which indices to render: current ±1, with wrap
  const n = items.length;
  const indicesToRender = [-1, 0, 1].map(offset => {
    const raw = currentIndex + offset;
    return ((raw % n) + n) % n;
  });

  return (
    <motion.div
      {...gestureHandlers}
      style={{
        position:   'relative',
        height:     WHEEL_HEIGHT,
        overflow:   'hidden',
        cursor:     'grab',
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
      className={className}
    >
      {/* Drag container — translateY follows the drag gesture */}
      <motion.div
        style={{
          display:        'flex',
          flexDirection:  'column',
          gap:            0,
          y:              dragY,
          willChange:     'transform',
          // Centre the current card vertically in the container
          paddingTop:     ADJACENT_HEIGHT,
        }}
      >
        {indicesToRender.map((itemIndex) => {
          const item  = items[itemIndex];
          const state = getItemState(item.id);

          return (
            <motion.div
              key={item.id}
              // Motion: allowed / Scroll Stack
              animate={ITEM_STATES[state]}
              transition={SPRINGS_IV.drumSnap}
              style={{
                flexShrink: 0,
                height: state === 'current' ? CARD_HEIGHT : ADJACENT_HEIGHT,
                overflow: 'hidden',
              }}
            >
              {renderCard ? (
                renderCard(item, state)
              ) : (
                <DefaultCard item={item} state={state} T={T} />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top + bottom fade masks for the adjacent slots */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top: 0, left: 0, right: 0,
          height:     ADJACENT_HEIGHT,
          background: `linear-gradient(to bottom, ${T.surface0 ?? 'rgba(14,14,16,1)'}, transparent)`,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom: 0, left: 0, right: 0,
          height:     ADJACENT_HEIGHT,
          background: `linear-gradient(to top, ${T.surface0 ?? 'rgba(14,14,16,1)'}, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

// ── Default card renderer ────────────────────────────────────
// Callers (ModeStack, IntervalsStack) will pass their own
// renderCard to apply the correct icon, EN+CN labels, and
// accent/selected styling. This default exists only so
// DrumWheel renders something visible in isolation.
function DefaultCard({ item, state, T }) {
  const isCurrent = state === 'current';
  return (
    <div
      style={{
        height:          isCurrent ? CARD_HEIGHT : ADJACENT_HEIGHT,
        borderRadius:    RADIUS.drumCard,
        background:      isCurrent
          ? (T.accentSub ?? 'rgba(136,117,255,0.16)')
          : 'transparent',
        border:          isCurrent
          ? `0.5px solid ${T.accentBorder ?? 'rgba(136,117,255,0.35)'}`
          : 'none',
        display:         'flex',
        alignItems:      'center',
        paddingLeft:     12,
        gap:             8,
        overflow:        'hidden',
      }}
    >
      {isCurrent && (
        <>
          <span style={{
            fontSize:   13,
            fontWeight: 500,
            color:      T.textPrimary ?? 'rgba(255,255,255,0.95)',
          }}>
            {item.label}
          </span>
          {item.sublabel && (
            <span style={{
              fontSize: 11,
              color:    T.textTertiary ?? 'rgba(255,255,255,0.40)',
            }}>
              {item.sublabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}
