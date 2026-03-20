// components/intervals/l2/SpaceEditorL2.jsx  — v2 uses L2Overlay
//
// 6×12 drag-select grid — 内容方向保留，容器改成 L2Overlay 中间聚焦层
import React, { useContext, useCallback, useRef, useState } from 'react';
import { motion }              from 'framer-motion';
import { ThemeContext }         from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV }           from '../../../motion/springs';
import { SPACE_PRESETS }        from '../../../trainers/intervals/constants';
import { L2Overlay }            from './L2Overlay';

const ROWS = 6;
const COLS = 12;
const CELL = 26;
const GAP  = 4;
const STRING_NAMES = ['E2','A2','D3','G3','B3','e4'];

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

function presetToSelected(id) {
  const p = SPACE_PRESETS.find(x => x.id === id);
  if (!p || id === 'full' || id === 'custom') return null;
  const cells = new Set();
  const { fretRange, strings } = p;
  for (let r = 0; r < ROWS; r++) {
    if (strings && !strings.includes(r)) continue;
    for (let c = fretRange.min; c <= Math.min(fretRange.max, COLS - 1); c++) {
      cells.add(`${r},${c}`);
    }
  }
  return cells;
}

function GridContent({ spacePresetId, onSpaceChange, isDark }) {
  const [selected, setSelected] = useState(() => presetToSelected(spacePresetId));
  const dragging = useRef(false);
  const dragMode = useRef('select');
  const touched  = useRef(new Set());

  const isSelected = useCallback((r, c) =>
    selected === null || selected.has(`${r},${c}`), [selected]);

  const mutate = useCallback((r, c) => {
    setSelected(prev => {
      const next = prev === null
        ? new Set(Array.from({length:ROWS*COLS}, (_, i) => `${Math.floor(i/COLS)},${i%COLS}`))
        : new Set(prev);
      const key = `${r},${c}`;
      if (dragMode.current === 'select') next.add(key); else next.delete(key);
      return next;
    });
  }, []);

  const handleDown = useCallback((r, c, e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    touched.current = new Set([`${r},${c}`]);
    dragMode.current = isSelected(r, c) ? 'deselect' : 'select';
    mutate(r, c);
  }, [isSelected, mutate]);

  const handleEnter = useCallback((r, c) => {
    if (!dragging.current) return;
    const key = `${r},${c}`;
    if (touched.current.has(key)) return;
    touched.current.add(key);
    mutate(r, c);
  }, [mutate]);

  const handleUp = useCallback(() => { dragging.current = false; }, []);

  const applyPreset = (id) => {
    setSelected(id === 'full' ? null : presetToSelected(id));
    onSpaceChange?.(id);
  };

  const labelC  = isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)';
  const titleC  = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const cellOn  = isDark ? 'rgba(255,255,255,0.17)' : 'rgba(0,0,0,0.13)';
  const cellOff = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const bdrOn   = isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.18)';
  const bdrOff  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  return (
    <div>
      {/* Fret label row */}
      <div style={{ display:'grid', gridTemplateColumns:`18px repeat(${COLS},${CELL}px)`, gap:`0 ${GAP}px`, marginBottom:4 }}>
        <div/>
        {Array.from({length:COLS}, (_,i) => (
          <div key={i} style={{ textAlign:'center', fontSize:7.5, color:labelC, fontFamily:FONT_MONO }}>{i+1}</div>
        ))}
      </div>

      {/* Grid rows */}
      <div style={{ touchAction:'none', userSelect:'none' }}>
        {Array.from({length:ROWS}, (_,r) => (
          <div key={r} style={{ display:'grid', gridTemplateColumns:`18px repeat(${COLS},${CELL}px)`, gap:`${GAP}px`, marginBottom: r<ROWS-1 ? GAP : 0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:3 }}>
              <span style={{ fontSize:7, color:labelC, fontFamily:FONT_MONO }}>{STRING_NAMES[r]}</span>
            </div>
            {Array.from({length:COLS}, (_,c) => {
              const on = isSelected(r,c);
              return (
                <motion.div
                  key={c}
                  onPointerDown={e => handleDown(r,c,e)}
                  onPointerEnter={() => handleEnter(r,c)}
                  onPointerUp={handleUp}
                  animate={{ scale: on ? 1 : 0.88 }}
                  transition={SPRINGS_IV.gridCellSelect}
                  style={{
                    width:CELL, height:CELL, borderRadius:7, cursor:'pointer',
                    background: on ? cellOn : cellOff,
                    border: `0.5px solid ${on ? bdrOn : bdrOff}`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Preset row */}
      <div style={{ display:'flex', gap:6, marginTop:12, overflowX:'auto' }}>
        {SPACE_PRESETS.filter(p => p.id !== 'custom').map(p => {
          const act = spacePresetId === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              whileTap={{ scale:0.93 }}
              style={{
                flexShrink:0, padding:'5px 12px', borderRadius:16, cursor:'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
              }}
            >
              <span style={{ fontSize:11, fontWeight:act?600:400, color:isDark?(act?'rgba(235,235,245,0.88)':'rgba(235,235,245,0.38)'):(act?'rgba(0,0,0,0.80)':'rgba(0,0,0,0.36)'), fontFamily:FONT_TEXT }}>
                {p.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function SpaceEditorL2({ isOpen, onClose, spacePresetId, onSpaceChange, onOpenL3 }) {
  const isDark = useIsDark();
  return (
    <L2Overlay isOpen={isOpen} onClose={onClose} title="Space 音域" onDeepDive={onOpenL3}>
      <GridContent spacePresetId={spacePresetId} onSpaceChange={onSpaceChange} isDark={isDark} />
    </L2Overlay>
  );
}
