// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FretboardViewport.jsx
//
// Pure SVG fretboard training stage.
// Shows 12 frets of data; only the current viewport window is
// visible through a clip rect. The motion.g translates to reveal
// the correct window with spring inertia.
//
// LOCKED rules (execution mother doc Part 4):
//   • String names appear ONLY at the 0-fret left column (micro capsule)
//   • NO string names at the top
//   • NOT a real guitar photo — no wood grain, no nut metal, no guitar body
//   • FretboardStageCard provides the stage shell; this is only the SVG content
//   • String weights: e4=0.4px → E2=1.3px (locked values)
//
// Motion: allowed / fretboard viewport tracking
// ─────────────────────────────────────────────────────────────
import React, { useContext, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

// ── SVG coordinate constants ──────────────────────────────────
const LEFT_PAD    = 30;   // px — space for 0-fret string name capsules
const FRET_PX     = 46;   // px per fret in SVG coord space
const STRING_TOP  = 14;   // px — y of top string (e4)
const STRING_PX   = 16;   // px — spacing between strings
const TOTAL_FRETS = 12;
const VIEW_W      = LEFT_PAD + 5 * FRET_PX + 4; // 5 visible frets + right pad
const VIEW_H      = STRING_TOP + 5 * STRING_PX + 18; // 6 strings + bottom space

// String definitions — s=0 is E2 (low, bottom), s=5 is e4 (high, top)
// LOCKED string weights from execution mother doc Part 2.5
const STRINGS = [
  { idx: 0, name: 'E2', sw: 1.30, op: 0.34 }, // E2 — thickest
  { idx: 1, name: 'A2', sw: 1.05, op: 0.30 },
  { idx: 2, name: 'D3', sw: 0.85, op: 0.27 },
  { idx: 3, name: 'G3', sw: 0.70, op: 0.24 },
  { idx: 4, name: 'B3', sw: 0.55, op: 0.22 },
  { idx: 5, name: 'e4', sw: 0.40, op: 0.20 }, // e4 — thinnest
];

// y position for string index (s=5 e4 at top, s=0 E2 at bottom)
const sy = (s) => STRING_TOP + (5 - s) * STRING_PX;

// x position for a fret number within the motion.g
// Fret lines are at x = fret * FRET_PX; note positions are between lines
const fretLineX = (f) => f * FRET_PX;                     // fret bar position
const noteX     = (f) => f === 0 ? 0 : (f - 0.5) * FRET_PX; // note dot x

// Position dot markers (3, 5, 7, 9 frets)
const POS_FRETS = [3, 5, 7, 9];

/**
 * @param {{
 *   viewportMin:  number,
 *   highlights:   Array<{string:number, fret:number, type:'root'|'interval'|'current'|'correct'|'wrong'}>,
 *   onFretTap:    (string:number, fret:number) => void,
 * }} props
 */
export function FretboardViewport({ viewportMin = 0, highlights = [], onFretTap }) {
  const T = useT();

  // Motion: allowed / fretboard viewport tracking
  // Spring in SVG pixel space: translateX = -viewportMin * FRET_PX
  const springX = useSpring(-viewportMin * FRET_PX, SPRINGS_IV.viewportTrack);
  useEffect(() => {
    springX.set(-viewportMin * FRET_PX);
  }, [viewportMin, springX]);

  const accent   = T.accent     ?? '#1A6CF5';
  const fretCol  = 'rgba(255,255,255,0.10)';
  const markerCol = 'rgba(255,255,255,0.20)';
  const clipId   = 'fret-viewport-clip';

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'hidden', userSelect: 'none' }}
    >
      <defs>
        {/* Clip rect — only shows the content to the right of the label column */}
        <clipPath id={clipId}>
          <rect x={LEFT_PAD} y={0} width={VIEW_W - LEFT_PAD} height={VIEW_H} />
        </clipPath>
      </defs>

      {/* ── 0-fret string name micro capsules (FIXED, not in motion.g) ── */}
      {/* LOCKED: string names ONLY here, not at the top */}
      {STRINGS.map(({ idx, name }) => (
        <g key={`label-${idx}`}>
          <rect
            x={2}
            y={sy(idx) - 4}
            width={24}
            height={8}
            rx={2}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={0.5}
          />
          <text
            x={14}
            y={sy(idx) + 2.5}
            textAnchor="middle"
            fontSize={6}
            fill="rgba(255,255,255,0.55)"
            style={{ fontFamily: '-apple-system, sans-serif' }}
          >
            {name}
          </text>
        </g>
      ))}

      {/* ── Nut line (left edge of playable area) ──────────── */}
      <line
        x1={LEFT_PAD}
        y1={STRING_TOP - 4}
        x2={LEFT_PAD}
        y2={sy(0) + 4}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1.2}
      />

      {/* ── Scrolling fretboard content ─────────────────────── */}
      <g clipPath={`url(#${clipId})`}>
        {/* Translate origin to LEFT_PAD so fret 0 aligns with the nut */}
        <g transform={`translate(${LEFT_PAD}, 0)`}>
          {/* Motion: allowed / fretboard viewport tracking */}
          <motion.g style={{ x: springX }}>

            {/* ── String lines (all 12 frets wide) ──────── */}
            {STRINGS.map(({ idx, sw, op }) => (
              <line
                key={`str-${idx}`}
                x1={0}
                y1={sy(idx)}
                x2={TOTAL_FRETS * FRET_PX}
                y2={sy(idx)}
                stroke={`rgba(255,255,255,${op})`}
                strokeWidth={sw}
              />
            ))}

            {/* ── Fret lines (vertical dividers) ────────── */}
            {Array.from({ length: TOTAL_FRETS }, (_, f) => f + 1).map((f) => (
              <line
                key={`fret-${f}`}
                x1={fretLineX(f)}
                y1={STRING_TOP - 4}
                x2={fretLineX(f)}
                y2={sy(0) + 4}
                stroke={fretCol}
                strokeWidth={0.5}
              />
            ))}

            {/* ── Position dot markers (3/5/7/9) ───────── */}
            {POS_FRETS.map((f) => (
              <circle
                key={`pos-${f}`}
                cx={noteX(f)}
                cy={sy(0) + 8}
                r={1.5}
                fill={markerCol}
              />
            ))}

            {/* ── Tap targets (transparent rects per cell) ─ */}
            {onFretTap && STRINGS.map(({ idx }) =>
              Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => (
                <rect
                  key={`tap-${idx}-${f}`}
                  x={noteX(f) - FRET_PX * 0.45}
                  y={sy(idx) - STRING_PX / 2}
                  width={FRET_PX * 0.9}
                  height={STRING_PX}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onFretTap(idx, f)}
                />
              ))
            )}

            {/* ── Note highlight marks ─────────────────── */}
            {highlights.map(({ string: s, fret: f, type }, i) => (
              <NoteMark
                key={`mark-${i}`}
                cx={noteX(f)}
                cy={sy(s)}
                type={type}
                accent={accent}
              />
            ))}

          </motion.g>
        </g>
      </g>
    </svg>
  );
}

// ── Individual note mark ─────────────────────────────────────
// LOCKED shape family (execution mother doc Part 4.5):
//   root     = open ring, amber #E8A23C
//   interval = solid filled circle, accent
//   current  = small bright dot, white
//   correct  = solid + outer confirmation ring
//   wrong    = broken arc (stroke with gap)
function NoteMark({ cx, cy, type, accent }) {
  switch (type) {
    case 'root':
      return (
        <circle cx={cx} cy={cy} r={4} fill="none"
          stroke="#E8A23C" strokeWidth={1.2} />
      );
    case 'interval':
      return (
        <circle cx={cx} cy={cy} r={3.5} fill={accent} opacity={0.9} />
      );
    case 'current':
      return (
        <circle cx={cx} cy={cy} r={2.5} fill="rgba(255,255,255,0.9)" />
      );
    case 'correct':
      return (
        <>
          <circle cx={cx} cy={cy} r={3.5} fill={accent} />
          <circle cx={cx} cy={cy} r={5.5} fill="none"
            stroke={accent} strokeWidth={0.8} opacity={0.35} />
        </>
      );
    case 'wrong':
      return (
        // Broken circle — arc with gap (strokeDasharray creates the gap)
        <circle cx={cx} cy={cy} r={4} fill="none"
          stroke="#E8A23C" strokeWidth={1.2}
          strokeDasharray="12 8"
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}
