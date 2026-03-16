// ─────────────────────────────────────────────────────────────
// components/intervals/l0/FretboardViewport.jsx — Visual Correction
//
// Changes vs Batch B:
//   • Fret lines: opacity 0.10 → 0.18, strokeWidth 0.5 → 0.6
//   • Nut line: strokeWidth 1.2 → 1.8 (clear zero-fret anchor)
//   • 0-fret capsules: taller 8→10px, more legible, right-side
//     shadow notch to suggest depth
//   • Note marks: all radii +1px for mobile visibility
//     root ring strokeWidth 1.2→1.8
//   • Position dots (3/5/7/9): r 1.5→2.5, opacity 0.20→0.28
//   • Fret number labels added below the string area
//   • String lines top/bottom padding added (more stage feel)
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
const LEFT_PAD    = 32;   // space for string-name capsules
const FRET_PX     = 46;   // px per fret
const STRING_TOP  = 14;   // y of top string (e4)
const STRING_PX   = 17;   // vertical spacing between strings
const TOTAL_FRETS = 12;
const NUM_ROW_H   = 12;   // height of fret number row at bottom

const VIEW_W = LEFT_PAD + 5 * FRET_PX + 4;
const VIEW_H = STRING_TOP + 5 * STRING_PX + NUM_ROW_H + 10;

// LOCKED string weights (execution mother doc Part 2.5 — do not change)
const STRINGS = [
  { idx: 0, name: 'E2', sw: 1.30, op: 0.34 },
  { idx: 1, name: 'A2', sw: 1.05, op: 0.30 },
  { idx: 2, name: 'D3', sw: 0.85, op: 0.27 },
  { idx: 3, name: 'G3', sw: 0.70, op: 0.24 },
  { idx: 4, name: 'B3', sw: 0.55, op: 0.22 },
  { idx: 5, name: 'e4', sw: 0.40, op: 0.20 },
];

const sy = (s) => STRING_TOP + (5 - s) * STRING_PX;
const fretLineX = (f) => f * FRET_PX;
const noteX     = (f) => f === 0 ? 0 : (f - 0.5) * FRET_PX;

const POS_FRETS  = [3, 5, 7, 9];
const clipId     = 'fret-viewport-clip';

export function FretboardViewport({ viewportMin = 0, highlights = [], onFretTap }) {
  const T = useT();

  const springX = useSpring(-viewportMin * FRET_PX, SPRINGS_IV.viewportTrack);
  useEffect(() => { springX.set(-viewportMin * FRET_PX); }, [viewportMin, springX]);

  const accent     = T.accent ?? '#1A6CF5';
  const stringBotY = sy(0); // y of lowest string (E2)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'hidden', userSelect: 'none' }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={LEFT_PAD} y={0} width={VIEW_W - LEFT_PAD} height={VIEW_H} />
        </clipPath>
      </defs>

      {/* ── 0-fret string-name capsules (FIXED, outside motion.g) ── */}
      {/* LOCKED: string names ONLY here — not at the top row */}
      {STRINGS.map(({ idx, name }) => (
        <g key={`lbl-${idx}`}>
          {/* Capsule background */}
          <rect
            x={2} y={sy(idx) - 5}
            width={26} height={10}
            rx={2}
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.5}
          />
          {/* Right-edge shadow notch — depth hint */}
          <line
            x1={28} y1={sy(idx) - 4}
            x2={28} y2={sy(idx) + 4}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={1}
          />
          <text
            x={15} y={sy(idx) + 3.5}
            textAnchor="middle"
            fontSize={6.5}
            fontWeight={500}
            fill="rgba(255,255,255,0.60)"
            style={{ fontFamily: '-apple-system, SF Mono, monospace' }}
          >
            {name}
          </text>
        </g>
      ))}

      {/* ── Nut line — FIX: more prominent anchor ────────── */}
      <line
        x1={LEFT_PAD} y1={STRING_TOP - 6}
        x2={LEFT_PAD} y2={stringBotY + 6}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={1.8}
      />

      {/* ── Scrolling fretboard content ──────────────────── */}
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${LEFT_PAD}, 0)`}>
          {/* Motion: allowed / fretboard viewport tracking */}
          <motion.g style={{ x: springX }}>

            {/* String lines */}
            {STRINGS.map(({ idx, sw, op }) => (
              <line key={`s-${idx}`}
                x1={0} y1={sy(idx)}
                x2={TOTAL_FRETS * FRET_PX} y2={sy(idx)}
                stroke={`rgba(255,255,255,${op})`}
                strokeWidth={sw}
              />
            ))}

            {/* Fret lines — FIX: opacity 0.10 → 0.18, strokeWidth 0.5 → 0.6 */}
            {Array.from({ length: TOTAL_FRETS }, (_, f) => f + 1).map((f) => (
              <line key={`f-${f}`}
                x1={fretLineX(f)} y1={STRING_TOP - 5}
                x2={fretLineX(f)} y2={stringBotY + 5}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={0.6}
              />
            ))}

            {/* Position dot markers — FIX: r 1.5→2.5, opacity 0.20→0.28 */}
            {POS_FRETS.map((f) => (
              <circle key={`pos-${f}`}
                cx={noteX(f)} cy={stringBotY + 9}
                r={2.5}
                fill="rgba(255,255,255,0.28)"
              />
            ))}

            {/* Fret number labels below strings */}
            {Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => f).map((f) => (
              (f === 0 || f % 3 === 0) ? (
                <text key={`fn-${f}`}
                  x={f === 0 ? 0 : noteX(f)}
                  y={stringBotY + 22}
                  textAnchor="middle"
                  fontSize={7}
                  fill="rgba(255,255,255,0.20)"
                  style={{ fontFamily: '-apple-system, SF Mono, monospace', fontVariantNumeric: 'tabular-nums' }}
                >
                  {f}
                </text>
              ) : null
            ))}

            {/* Tap targets */}
            {onFretTap && STRINGS.map(({ idx }) =>
              Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => (
                <rect key={`tap-${idx}-${f}`}
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

            {/* Note highlight marks */}
            {highlights.map(({ string: s, fret: f, type }, i) => (
              <NoteMark key={`mk-${i}`}
                cx={noteX(f)} cy={sy(s)}
                type={type} accent={accent}
              />
            ))}

          </motion.g>
        </g>
      </g>
    </svg>
  );
}

// ── Note mark shapes — LOCKED family (execution mother doc Part 4.5) ──
// FIX: all radii increased by ~1px for mobile visibility
function NoteMark({ cx, cy, type, accent }) {
  switch (type) {
    case 'root':
      return (
        <circle cx={cx} cy={cy} r={5.5} fill="none"
          stroke="#E8A23C" strokeWidth={1.8} />
      );
    case 'interval':
      return (
        <circle cx={cx} cy={cy} r={4.5} fill={accent} opacity={0.9} />
      );
    case 'current':
      return (
        <>
          <circle cx={cx} cy={cy} r={3.5} fill="rgba(255,255,255,0.90)" />
          {/* Subtle glow ring */}
          <circle cx={cx} cy={cy} r={6} fill="none"
            stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        </>
      );
    case 'correct':
      return (
        <>
          <circle cx={cx} cy={cy} r={4.5} fill={accent} />
          <circle cx={cx} cy={cy} r={7} fill="none"
            stroke={accent} strokeWidth={1} opacity={0.35} />
        </>
      );
    case 'wrong':
      return (
        <circle cx={cx} cy={cy} r={5} fill="none"
          stroke="#E8A23C" strokeWidth={1.6}
          strokeDasharray="10 8" strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}
