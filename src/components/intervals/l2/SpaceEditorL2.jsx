// components/intervals/l2/SpaceEditorL2.jsx  — Batch D
//
// L2 快调层 — Space 音域编辑器
// 6×12 drag-select grid（6行=弦，12列=品位）
// 进入：从 Space widget 区域 shared layout expand
// 支持：pointer drag 任意方向经过即选中（iOS 相册多选手感）
import React, { useContext, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { SPACE_PRESETS } from '../../../trainers/intervals/constants';

const ROWS = 6;
const COLS = 12;
const CELL = 26;
const GAP  = 4;
const STRING_NAMES = ['E2','A2','D3','G3','B3','e4'];
const FRET_LABELS  = Array.from({length: 12}, (_, i) => String(i + 1));

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// Convert preset id → selected cell set (Set of "r,c")
function presetToSelected(presetId) {
  const p = SPACE_PRESETS.find(x => x.id === presetId);
  if (!p || presetId === 'full' || presetId === 'custom') return null; // null = all selected
  const { fretRange, strings } = p;
  const cells = new Set();
  const stringRows = strings ? strings : [0,1,2,3,4,5];
  for (let r = 0; r < ROWS; r++) {
    if (strings && !strings.includes(r)) continue;
    for (let c = (fretRange.min); c <= Math.min(fretRange.max, COLS - 1); c++) {
      cells.add(`${r},${c}`);
    }
  }
  return cells;
}

export function SpaceEditorL2({ isOpen, onClose, spacePresetId, onSpaceChange, onOpenL3 }) {
  const isDark = useIsDark();
  const [selected, setSelected] = useState(() => presetToSelected(spacePresetId));
  const dragging  = useRef(false);
  const dragMode  = useRef('select'); // 'select' | 'deselect'
  const touched   = useRef(new Set());

  const bg     = isDark ? 'rgba(18,18,22,0.97)' : 'rgba(250,250,252,0.98)';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleC = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const labelC = isDark ? 'rgba(235,235,245,0.32)' : 'rgba(0,0,0,0.30)';
  const cellActiveBg   = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const cellInactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const cellActiveBorder   = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.20)';
  const cellInactiveBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const isSelected = useCallback((r, c) => {
    if (selected === null) return true;
    return selected.has(`${r},${c}`);
  }, [selected]);

  const toggleCell = useCallback((r, c) => {
    setSelected(prev => {
      const next = prev === null
        ? new Set(Array.from({length: ROWS}, (_, rr) => Array.from({length: COLS}, (_, cc) => `${rr},${cc}`)).flat())
        : new Set(prev);
      const key = `${r},${c}`;
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((r, c, e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current  = true;
    touched.current   = new Set([`${r},${c}`]);
    dragMode.current  = isSelected(r, c) ? 'deselect' : 'select';
    setSelected(prev => {
      const next = prev === null
        ? new Set(Array.from({length: ROWS}, (_, rr) => Array.from({length: COLS}, (_, cc) => `${rr},${cc}`)).flat())
        : new Set(prev);
      const key = `${r},${c}`;
      if (dragMode.current === 'select') next.add(key); else next.delete(key);
      return next;
    });
  }, [isSelected]);

  const handlePointerEnter = useCallback((r, c) => {
    if (!dragging.current) return;
    const key = `${r},${c}`;
    if (touched.current.has(key)) return;
    touched.current.add(key);
    setSelected(prev => {
      const next = prev === null
        ? new Set(Array.from({length: ROWS}, (_, rr) => Array.from({length: COLS}, (_, cc) => `${rr},${cc}`)).flat())
        : new Set(prev);
      if (dragMode.current === 'select') next.add(key); else next.delete(key);
      return next;
    });
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  const applyPreset = useCallback((pid) => {
    if (pid === 'full') { setSelected(null); onSpaceChange?.(pid); return; }
    setSelected(presetToSelected(pid));
    onSpaceChange?.(pid);
  }, [onSpaceChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          layoutId="space-widget"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={SPRINGS_IV.layerExpand}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'flex-end',
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            style={{
              width: '100%', maxWidth: 480, margin: '0 auto',
              background: bg,
              borderRadius: '20px 20px 0 0',
              border: `0.5px solid ${border}`,
              borderBottom: 'none',
              padding: '0 0 env(safe-area-inset-bottom,0px)',
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
              <span style={{ fontSize:16, fontWeight:600, color:titleC, fontFamily:FONT_TEXT }}>Space 音域</span>
              <CloseBtn onClose={onClose} isDark={isDark} />
            </div>

            {/* Grid */}
            <div style={{ padding:'0 16px', touchAction:'none', userSelect:'none' }}>
              {/* Fret label row */}
              <div style={{ display:'grid', gridTemplateColumns:`20px repeat(${COLS}, ${CELL}px)`, gap:`0 ${GAP}px`, marginBottom:4 }}>
                <div />
                {FRET_LABELS.map(f => (
                  <div key={f} style={{ textAlign:'center', fontSize:8, color:labelC, fontFamily:FONT_MONO, lineHeight:'16px' }}>{f}</div>
                ))}
              </div>
              {/* String rows */}
              {Array.from({length: ROWS}, (_, r) => (
                <div key={r} style={{ display:'grid', gridTemplateColumns:`20px repeat(${COLS}, ${CELL}px)`, gap:`${GAP}px`, marginBottom: r < ROWS-1 ? GAP : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:4 }}>
                    <span style={{ fontSize:7, color:labelC, fontFamily:FONT_MONO }}>{STRING_NAMES[r]}</span>
                  </div>
                  {Array.from({length: COLS}, (_, c) => {
                    const active = isSelected(r, c);
                    return (
                      <motion.div
                        key={c}
                        onPointerDown={e => handlePointerDown(r, c, e)}
                        onPointerEnter={() => handlePointerEnter(r, c)}
                        onPointerUp={handlePointerUp}
                        animate={{ scale: active ? 1 : 0.9 }}
                        transition={SPRINGS_IV.gridCellSelect}
                        style={{
                          width: CELL, height: CELL,
                          borderRadius: 7,
                          background: active ? cellActiveBg : cellInactiveBg,
                          border: `0.5px solid ${active ? cellActiveBorder : cellInactiveBorder}`,
                          cursor: 'pointer',
                          touchAction: 'none',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Preset row */}
            <div style={{ display:'flex', gap:8, padding:'14px 16px 8px', overflowX:'auto' }}>
              {SPACE_PRESETS.filter(p => p.id !== 'custom').map(p => {
                const act = spacePresetId === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    whileTap={{ scale: 0.93 }}
                    transition={SPRINGS_IV.capsuleSelect}
                    style={{
                      flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                      background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)')}`,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize:12, fontWeight: act ? 600 : 400, color: act ? titleC : labelC, fontFamily:FONT_TEXT }}>{p.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Deep settings footer */}
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'4px 20px 16px' }}>
              <span onClick={onOpenL3} style={{ fontSize:12, color:labelC, fontFamily:FONT_TEXT, cursor:'pointer' }}>深度设置 →</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CloseBtn({ onClose, isDark }) {
  return (
    <motion.button onClick={onClose} whileTap={{ scale: 0.88 }} style={{
      width:28, height:28, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
      background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
      cursor:'pointer',
    }}>
      <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke={isDark ? 'rgba(235,235,245,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth={1.5} strokeLinecap="round"/>
      </svg>
    </motion.button>
  );
}
