// components/intervals/l0/FretboardViewport.jsx  — Visual Reset v7b
//
// Aspect ratio math:
//   Container ≈ 440×167 → ratio 2.63:1
//   VIEW_W=446 VIEW_H=170 → ratio 2.62 → scale=0.982, fills width, all 6 strings visible.
//
// Note colors: Root = systemYellow, Interval = systemTeal (dark/light variants).
// String opacity raised for visibility in both modes.
// LOCKED: STRINGS strokeWidth/opacity per execution mother doc Part 2.5.
import React, { useContext, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const LEFT_PAD    = 12;
const FRET_PX     = 86;
const STRING_TOP  = 8;
const STRING_PX   = 29;
const TOTAL_FRETS = 12;
const NUM_ROW_H   = 10;
const VIEW_W      = LEFT_PAD + 5 * FRET_PX + 4;  // 446
const VIEW_H      = STRING_TOP + 5 * STRING_PX + NUM_ROW_H + 7; // 170

// LOCKED
const STRINGS = [
  { idx:0, name:'E2', sw:1.30, opD:0.48, opL:0.44 },
  { idx:1, name:'A2', sw:1.05, opD:0.42, opL:0.36 },
  { idx:2, name:'D3', sw:0.85, opD:0.36, opL:0.30 },
  { idx:3, name:'G3', sw:0.70, opD:0.32, opL:0.26 },
  { idx:4, name:'B3', sw:0.55, opD:0.28, opL:0.22 },
  { idx:5, name:'e4', sw:0.40, opD:0.25, opL:0.18 },
];

const sy    = (s) => STRING_TOP + (5 - s) * STRING_PX;
const fretX = (f) => f * FRET_PX;
const noteX = (f) => f === 0 ? 0 : (f - 0.5) * FRET_PX;
const POS_FRETS = [3, 5, 7, 9];
const CLIP_ID   = 'fvp-v7b';

export function FretboardViewport({ viewportMin = 0, highlights = [], onFretTap }) {
  const isDark = useIsDark();
  const springX = useSpring(-viewportMin * FRET_PX, SPRINGS_IV.viewportTrack);
  useEffect(() => { springX.set(-viewportMin * FRET_PX); }, [viewportMin, springX]);

  const botY = sy(0);

  // Mode-aware colors
  const labelColor  = isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.32)';
  const nutColor    = isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.28)';
  const fretColor   = isDark ? 'rgba(235,235,245,0.08)' : 'rgba(0,0,0,0.09)';
  const markerColor = isDark ? 'rgba(235,235,245,0.14)' : 'rgba(0,0,0,0.14)';
  const numColor    = isDark ? 'rgba(235,235,245,0.16)' : 'rgba(0,0,0,0.18)';
  const strColor    = isDark ? 'rgba(235,235,245,' : 'rgba(0,0,0,';  // + opacity + ')'

  // systemYellow/Teal note colors
  const rootStroke   = isDark ? '#FFD60A' : '#FFCC00';
  const targetFill   = isDark ? '#64D2FF' : '#5AC8FA';

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%" height="100%"
      preserveAspectRatio="xMinYMid meet"
      style={{ display:'block', overflow:'hidden', userSelect:'none' }}
    >
      <defs>
        <clipPath id={CLIP_ID}>
          <rect x={LEFT_PAD} y={0} width={VIEW_W - LEFT_PAD} height={VIEW_H} />
        </clipPath>
      </defs>

      {/* LOCKED: string names at 0-fret only */}
      {STRINGS.map(({ idx, name }) => (
        <text key={`l-${idx}`}
          x={LEFT_PAD - 3} y={sy(idx) + 3.5}
          textAnchor="end" fontSize={6.5} fontWeight={500}
          fill={labelColor}
          style={{ fontFamily:'-apple-system,SF Mono,monospace' }}
        >{name}</text>
      ))}

      {/* Nut line */}
      <line x1={LEFT_PAD} y1={STRING_TOP - 4} x2={LEFT_PAD} y2={botY + 4}
        stroke={nutColor} strokeWidth={1.3} />

      {/* Scrolling content */}
      <g clipPath={`url(#${CLIP_ID})`}>
        <g transform={`translate(${LEFT_PAD},0)`}>
          <motion.g style={{ x: springX }}>
            {/* LOCKED: string lines */}
            {STRINGS.map(({ idx, sw, opD, opL }) => (
              <line key={`s-${idx}`}
                x1={0} y1={sy(idx)} x2={TOTAL_FRETS * FRET_PX} y2={sy(idx)}
                stroke={strColor + (isDark ? opD : opL) + ')'}
                strokeWidth={sw} />
            ))}

            {/* Fret dividers */}
            {Array.from({ length: TOTAL_FRETS }, (_, f) => f + 1).map(f => (
              <line key={`f-${f}`}
                x1={fretX(f)} y1={STRING_TOP - 4} x2={fretX(f)} y2={botY + 4}
                stroke={fretColor} strokeWidth={0.5} />
            ))}

            {/* Position markers */}
            {POS_FRETS.map(f => (
              <circle key={`pm-${f}`} cx={noteX(f)} cy={botY + 9} r={2}
                fill={markerColor} />
            ))}

            {/* Fret number labels */}
            {[3, 5, 7, 9, 12].map(f => (
              <text key={`fn-${f}`}
                x={noteX(f)} y={botY + 19}
                textAnchor="middle" fontSize={6}
                fill={numColor}
                style={{ fontFamily:'-apple-system,SF Mono,monospace', fontVariantNumeric:'tabular-nums' }}
              >{f}</text>
            ))}

            {/* Tap targets */}
            {onFretTap && STRINGS.map(({ idx }) =>
              Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => (
                <rect key={`tp-${idx}-${f}`}
                  x={noteX(f) - FRET_PX * 0.45} y={sy(idx) - STRING_PX / 2}
                  width={FRET_PX * 0.9} height={STRING_PX}
                  fill="transparent" style={{ cursor:'pointer' }}
                  onClick={() => onFretTap(idx, f)} />
              ))
            )}

            {/* Note marks */}
            {highlights.map(({ string: s, fret: f, type }, i) => (
              <NoteMark key={`mk-${i}`}
                cx={noteX(f)} cy={sy(s)} type={type}
                rootStroke={rootStroke} targetFill={targetFill} />
            ))}
          </motion.g>
        </g>
      </g>
    </svg>
  );
}

function NoteMark({ cx, cy, type, rootStroke, targetFill }) {
  switch (type) {
    case 'root':
      return (
        <>
          <circle cx={cx} cy={cy} r={9} fill={rootStroke + '0F'} stroke={rootStroke} strokeWidth={2.0} />
        </>
      );
    case 'interval':
      return (
        <>
          <circle cx={cx} cy={cy} r={8} fill={targetFill} opacity={0.90} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke={targetFill} strokeWidth={0.5} opacity={0.16} />
        </>
      );
    case 'correct':
      return (
        <>
          <circle cx={cx} cy={cy} r={8} fill={targetFill} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke={targetFill} strokeWidth={0.8} opacity={0.25} />
        </>
      );
    case 'wrong':
      return <circle cx={cx} cy={cy} r={8} fill="none" stroke="#FF453A" strokeWidth={2} strokeDasharray="10 7" strokeLinecap="round" />;
    default:
      return null;
  }
}
