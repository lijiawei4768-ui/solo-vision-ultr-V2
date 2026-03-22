// components/intervals/l2/SpaceEditorL2.jsx
// iOS 相册风格拖选（保留）+ 新增"+"自定义 preset 入口

import React, { useContext, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPACE_PRESETS } from '../../../trainers/intervals/constants';
import { L2Overlay } from './L2Overlay';

const ROWS         = 6;
const COLS         = 12;
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
  const [selected,     setSelected]    = useState(() => presetToSelected(spacePresetId));
  const [savingPreset, setSavingPreset]= useState(false);
  const [presetName,   setPresetName]  = useState('');
  // 用户自定义 presets（内存状态，每次打开重置）
  const [customPresets, setCustomPresets] = useState([]);

  const dragMode   = useRef('select');
  const touched    = useRef(new Set());
  const dragging   = useRef(false);

  const isSelected = useCallback((r, c) =>
    selected === null || selected.has(`${r},${c}`), [selected]);

  const toggle = useCallback((r, c, mode) => {
    const key = `${r},${c}`;
    setSelected(prev => {
      const base = prev === null
        ? new Set(Array.from({ length: ROWS * COLS }, (_, i) => `${Math.floor(i/COLS)},${i%COLS}`))
        : new Set(prev);
      if (mode === 'select') base.add(key); else base.delete(key);
      return base;
    });
  }, []);

  // iOS 相册风格 touchmove via elementFromPoint
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const row = parseInt(el.dataset?.row ?? el.closest?.('[data-row]')?.dataset?.row);
    const col = parseInt(el.dataset?.col ?? el.closest?.('[data-col]')?.dataset?.col);
    if (isNaN(row) || isNaN(col)) return;
    dragging.current = true;
    touched.current  = new Set([`${row},${col}`]);
    dragMode.current = isSelected(row, col) ? 'deselect' : 'select';
    toggle(row, col, dragMode.current);
  }, [isSelected, toggle]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const rowEl = el.dataset?.row !== undefined ? el : el.closest?.('[data-row]');
    const colEl = el.dataset?.col !== undefined ? el : el.closest?.('[data-col]');
    if (!rowEl || !colEl) return;
    const row = parseInt(rowEl.dataset.row);
    const col = parseInt(colEl.dataset.col);
    if (isNaN(row) || isNaN(col)) return;
    const key = `${row},${col}`;
    if (touched.current.has(key)) return;
    touched.current.add(key);
    toggle(row, col, dragMode.current);
  }, [toggle]);

  const handleTouchEnd = useCallback(() => { dragging.current = false; }, []);

  const handleMouseDown = useCallback((r, c) => {
    dragging.current = true;
    touched.current  = new Set([`${r},${c}`]);
    dragMode.current = isSelected(r, c) ? 'deselect' : 'select';
    toggle(r, c, dragMode.current);
  }, [isSelected, toggle]);

  const handleMouseEnter = useCallback((r, c) => {
    if (!dragging.current) return;
    const key = `${r},${c}`;
    if (touched.current.has(key)) return;
    touched.current.add(key);
    toggle(r, c, dragMode.current);
  }, [toggle]);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const applyPreset = (id, cells) => {
    if (cells !== undefined) {
      setSelected(cells);
    } else {
      setSelected(id === 'full' ? null : presetToSelected(id));
    }
    onSpaceChange?.(id);
  };

  const saveCustomPreset = () => {
    if (!presetName.trim()) return;
    const snapshot = selected ? new Set(selected) : null;
    setCustomPresets(prev => [...prev, { id: `custom-${Date.now()}`, label: presetName.trim(), cells: snapshot }]);
    setPresetName('');
    setSavingPreset(false);
    onSpaceChange?.('custom');
  };

  const labelC = isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)';
  const cellOn = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const cellOff= isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const bdrOn  = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.18)';
  const bdrOff = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const CELL = 22;
  const GAP  = 3;

  return (
    <div>
      {/* 品位标签 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `20px repeat(${COLS}, ${CELL}px)`,
        gap: `0 ${GAP}px`,
        marginBottom: 4,
      }}>
        <div />
        {Array.from({ length: COLS }, (_, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 7.5, color: labelC, fontFamily: FONT_MONO }}>{i + 1}</div>
        ))}
      </div>

      {/* 6×12 网格 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} style={{
            display: 'grid',
            gridTemplateColumns: `20px repeat(${COLS}, ${CELL}px)`,
            gap: `${GAP}px`,
            marginBottom: r < ROWS - 1 ? GAP : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 3 }}>
              <span style={{ fontSize: 7, color: labelC, fontFamily: FONT_MONO }}>{STRING_NAMES[r]}</span>
            </div>
            {Array.from({ length: COLS }, (_, c) => {
              const on = isSelected(r, c);
              return (
                <div
                  key={c}
                  data-row={r}
                  data-col={c}
                  onMouseDown={() => handleMouseDown(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  style={{
                    width: CELL, height: CELL,
                    borderRadius: 6, cursor: 'pointer',
                    background: on ? cellOn : cellOff,
                    border: `0.5px solid ${on ? bdrOn : bdrOff}`,
                    transition: 'background 0.06s, border-color 0.06s',
                    transform: on ? 'scale(1)' : 'scale(0.88)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Preset 胶囊行 + "+" 按钮 */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* 内置 presets */}
        {SPACE_PRESETS.filter(p => p.id !== 'custom').map(p => {
          const act = spacePresetId === p.id && !customPresets.some(cp => cp.id === spacePresetId);
          return (
            <motion.button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              whileTap={{ scale: 0.93 }}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: act ? 600 : 400,
                color: isDark ? (act ? 'rgba(235,235,245,0.88)' : 'rgba(235,235,245,0.38)') : (act ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0.36)'),
                fontFamily: FONT_TEXT,
              }}>
                {p.label}
              </span>
            </motion.button>
          );
        })}

        {/* 用户自定义 presets */}
        {customPresets.map(cp => {
          const act = spacePresetId === cp.id;
          return (
            <motion.button
              key={cp.id}
              onClick={() => applyPreset(cp.id, cp.cells)}
              whileTap={{ scale: 0.93 }}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: act ? 600 : 400,
                color: isDark ? (act ? 'rgba(235,235,245,0.88)' : 'rgba(235,235,245,0.38)') : (act ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0.36)'),
                fontFamily: FONT_TEXT,
              }}>
                {cp.label}
              </span>
            </motion.button>
          );
        })}

        {/* ── "+" 新增自定义 preset ── */}
        {!savingPreset ? (
          <motion.button
            onClick={() => setSavingPreset(true)}
            whileTap={{ scale: 0.90 }}
            style={{
              flexShrink: 0,
              width: 28, height: 28, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
              cursor: 'pointer',
            }}
          >
            <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8"
                stroke={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'}
                strokeWidth={1.4} strokeLinecap="round"/>
            </svg>
          </motion.button>
        ) : (
          /* 内联命名输入 */
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
                borderRadius: 16, padding: '4px 8px',
              }}
            >
              <input
                autoFocus
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveCustomPreset();
                  if (e.key === 'Escape') setSavingPreset(false);
                }}
                placeholder="名称"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  fontSize: 11, color: isDark ? 'rgba(235,235,245,0.82)' : 'rgba(0,0,0,0.75)',
                  fontFamily: FONT_TEXT, width: 60,
                  '::placeholder': { color: 'rgba(255,255,255,0.3)' },
                }}
              />
              <motion.button
                onClick={saveCustomPreset}
                whileTap={{ scale: 0.88 }}
                style={{
                  padding: '2px 8px', borderRadius: 10,
                  background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 10, color: isDark ? 'rgba(235,235,245,0.75)' : 'rgba(0,0,0,0.65)',
                  fontFamily: FONT_TEXT,
                }}
              >
                保存
              </motion.button>
              <motion.button
                onClick={() => setSavingPreset(false)}
                whileTap={{ scale: 0.88 }}
                style={{
                  padding: '2px 6px', borderRadius: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 10, color: isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.35)',
                  fontFamily: FONT_TEXT,
                }}
              >
                取消
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}
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
