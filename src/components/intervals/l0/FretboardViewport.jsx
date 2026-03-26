// components/intervals/l0/FretboardViewport.jsx — v8
//
// v8 修复：
//   1. 从5品改为6品 — FRET_PX=72, VIEW_W=LEFT_PAD+6*FRET_PX+4=448
//   2. 使用 T.fretboard tokens 替代硬编码颜色
//   3. 音符点使用 T.noteRoot / T.noteTarget

import React, { useContext, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

const LEFT_PAD    = 12;
const FRET_PX     = 72;   // v8: 72 (5品=86 → 6品=72, 宽度不变)
const STRING_TOP  = 8;
const STRING_PX   = 29;
const TOTAL_FRETS = 12;
const NUM_ROW_H   = 10;
const VIEW_W      = LEFT_PAD + 6 * FRET_PX + 4;  // 12+432+4=448, 显示6品
const VIEW_H      = STRING_TOP + 5 * STRING_PX + NUM_ROW_H + 7; // 170

// LOCKED: 弦粗细/透明度
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
const CLIP_ID   = 'fvp-v8';

export function FretboardViewport({ viewportMin = 0, highlights = [], onFretTap }) {
  const T      = useT();
  const isDark = T.themeDark ?? true;

  const springX = useSpring(-viewportMin * FRET_PX, SPRINGS_IV.viewportTrack);
  useEffect(() => { springX.set(-viewportMin * FRET_PX); }, [viewportMin, springX]);

  const botY = sy(0);

  // v8: 从 T.fretboard 读取，fallback 到硬编码
  const fb = T.fretboard ?? {};
  const labelColor  = isDark ? 'rgba(235,235,245,0.22)' : 'rgba(0,0,0,0.32)';
  const nutColor    = fb.fretColor   ?? (isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)');
  const fretColor   = isDark ? 'rgba(235,235,245,0.08)' : 'rgba(0,0,0,0.09)';
  const markerColor = fb.markerColor ?? (isDark ? 'rgba(235,235,245,0.14)' : 'rgba(0,0,0,0.14)');
  const numColor    = isDark ? 'rgba(235,235,245,0.16)' : 'rgba(0,0,0,0.18)';
  const strColor    = isDark ? 'rgba(235,235,245,' : 'rgba(0,0,0,';

  // v8: 使用 T.noteRoot / T.noteTarget
  const rootStroke  = T.noteRoot   ?? (isDark ? '#FFD60A' : '#FFCC00');
  const targetFill  = T.noteTarget ?? (isDark ? '#64D2FF' : '#5AC8FA');

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

      {/* 弦名标签 */}
      {STRINGS.map(({ idx, name }) => (
        <text key={`l-${idx}`}
          x={LEFT_PAD - 3} y={sy(idx) + 3.5}
          textAnchor="end" fontSize={6.5} fontWeight={500}
          fill={labelColor}
          style={{ fontFamily:'-apple-system,SF Mono,monospace' }}
        >{name}</text>
      ))}

      {/* 琴枕线 */}
      <line x1={LEFT_PAD} y1={STRING_TOP - 4} x2={LEFT_PAD} y2={botY + 4}
        stroke={nutColor} strokeWidth={1.3} />

      {/* 滚动内容 */}
      <g clipPath={`url(#${CLIP_ID})`}>
        <g transform={`translate(${LEFT_PAD},0)`}>
          <motion.g style={{ x: springX }}>
            {/* 弦线 */}
            {STRINGS.map(({ idx, sw, opD, opL }) => (
              <line key={`s-${idx}`}
                x1={0} y1={sy(idx)} x2={TOTAL_FRETS * FRET_PX} y2={sy(idx)}
                stroke={strColor + (isDark ? opD : opL) + ')'}
                strokeWidth={sw} />
            ))}

            {/* 品格线 */}
            {Array.from({ length: TOTAL_FRETS }, (_, f) => f + 1).map(f => (
              <line key={`f-${f}`}
                x1={fretX(f)} y1={STRING_TOP - 4} x2={fretX(f)} y2={botY + 4}
                stroke={fretColor} strokeWidth={0.5} />
            ))}

            {/* 位置标记点 */}
            {POS_FRETS.map(f => (
              <circle key={`pm-${f}`} cx={noteX(f)} cy={botY + 9} r={2}
                fill={markerColor} />
            ))}

            {/* 品格数字 */}
            {[3, 5, 7, 9, 12].map(f => (
              <text key={`fn-${f}`}
                x={noteX(f)} y={botY + 19}
                textAnchor="middle" fontSize={6}
                fill={numColor}
                style={{ fontFamily:'-apple-system,SF Mono,monospace', fontVariantNumeric:'tabular-nums' }}
              >{f}</text>
            ))}

            {/* 点击区域 */}
            {onFretTap && STRINGS.map(({ idx }) =>
              Array.from({ length: TOTAL_FRETS + 1 }, (_, f) => (
                <rect key={`tp-${idx}-${f}`}
                  x={noteX(f) - FRET_PX * 0.45} y={sy(idx) - STRING_PX / 2}
                  width={FRET_PX * 0.9} height={STRING_PX}
                  fill="transparent" style={{ cursor:'pointer' }}
                  onClick={() => onFretTap(idx, f)} />
              ))
            )}

            {/* 音符标记 */}
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
          <circle cx={cx} cy={cy} r={9} fill={rootStroke + '18'} stroke={rootStroke} strokeWidth={2.0} />
        </>
      );
    case 'interval':
      return (
        <>
          <circle cx={cx} cy={cy} r={8}  fill={targetFill} opacity={0.90} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke={targetFill} strokeWidth={0.5} opacity={0.18} />
        </>
      );
    case 'correct':
      return (
        <>
          <circle cx={cx} cy={cy} r={8}  fill={targetFill} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke={targetFill} strokeWidth={0.8} opacity={0.28} />
        </>
      );
    case 'wrong':
      return (
        <circle cx={cx} cy={cy} r={8} fill="none"
          stroke="#FF453A" strokeWidth={2}
          strokeDasharray="10 7" strokeLinecap="round" />
      );
    default:
      return null;
  }
}
