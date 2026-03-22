// components/intervals/l2/SpaceEditorL2.jsx
// Fix 6: iOS 相册风格拖选
//   - touchmove 在容器级监听，用 elementFromPoint 找目标格
//   - 每个格子有 data-row / data-col 属性
//   - 从任意起点开始，连续滑过即选中
//   - 反向滑（经过已选中格）= 取消

import React, { useContext, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
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
  const [selected, setSelected] = useState(() => presetToSelected(spacePresetId));

  // drag state refs
  const dragMode  = useRef('select'); // 'select' | 'deselect'
  const touched   = useRef(new Set());
  const dragging  = useRef(false);
  const gridRef   = useRef(null);

  const isSelected = useCallback((r, c) =>
    selected === null || selected.has(`${r},${c}`), [selected]);

  // 切换单格状态
  const toggle = useCallback((r, c, mode) => {
    const key = `${r},${c}`;
    setSelected(prev => {
      // prev===null 表示全选
      const base = prev === null
        ? new Set(Array.from({ length: ROWS * COLS }, (_, i) => `${Math.floor(i/COLS)},${i%COLS}`))
        : new Set(prev);
      if (mode === 'select') base.add(key);
      else base.delete(key);
      return base;
    });
  }, []);

  // ── iOS 相册风格：touchmove 在容器级用 elementFromPoint ──
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const el    = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const row = parseInt(el.dataset.row ?? el.closest?.('[data-row]')?.dataset?.row);
    const col = parseInt(el.dataset.col ?? el.closest?.('[data-col]')?.dataset?.col);
    if (isNaN(row) || isNaN(col)) return;

    dragging.current = true;
    touched.current  = new Set([`${row},${col}`]);
    // 起始格的当前状态决定本次是"选中"还是"取消"模式
    dragMode.current = isSelected(row, col) ? 'deselect' : 'select';
    toggle(row, col, dragMode.current);
  }, [isSelected, toggle]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault(); // 防止滚动
    const touch = e.touches[0];
    const el    = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;

    // 找到有 data-row/col 的元素（或祖先）
    const rowEl = el.dataset?.row !== undefined ? el : el.closest?.('[data-row]');
    const colEl = el.dataset?.col !== undefined ? el : el.closest?.('[data-col]');
    if (!rowEl || !colEl) return;
    const row = parseInt(rowEl.dataset.row);
    const col = parseInt(colEl.dataset.col);
    if (isNaN(row) || isNaN(col)) return;

    const key = `${row},${col}`;
    if (touched.current.has(key)) return; // 已经处理过
    touched.current.add(key);
    toggle(row, col, dragMode.current);
  }, [toggle]);

  const handleTouchEnd = useCallback(() => {
    dragging.current = false;
  }, []);

  // 鼠标备用（桌面调试）
  const handleMouseDown = useCallback((r, c, e) => {
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

  const applyPreset = (id) => {
    setSelected(id === 'full' ? null : presetToSelected(id));
    onSpaceChange?.(id);
  };

  const labelC  = isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)';
  const cellOn  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const cellOff = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const bdrOn   = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.18)';
  const bdrOff  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  // 每格尺寸自适应（L2面板约 92vw）
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
          <div key={i} style={{ textAlign: 'center', fontSize: 7.5, color: labelC, fontFamily: FONT_MONO }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* 网格 — 触摸事件在容器级 */}
      <div
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleMouseUp}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {Array.from({ length: ROWS }, (_, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `20px repeat(${COLS}, ${CELL}px)`,
              gap: `${GAP}px`,
              marginBottom: r < ROWS - 1 ? GAP : 0,
            }}
          >
            {/* 弦标签 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 3,
            }}>
              <span style={{ fontSize: 7, color: labelC, fontFamily: FONT_MONO }}>
                {STRING_NAMES[r]}
              </span>
            </div>

            {/* 格子 */}
            {Array.from({ length: COLS }, (_, c) => {
              const on = isSelected(r, c);
              return (
                <div
                  key={c}
                  data-row={r}
                  data-col={c}
                  onMouseDown={(e) => handleMouseDown(r, c, e)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  style={{
                    width: CELL, height: CELL,
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: on ? cellOn : cellOff,
                    border: `0.5px solid ${on ? bdrOn : bdrOff}`,
                    // 平滑过渡提供视觉反馈
                    transition: 'background 0.06s, border-color 0.06s',
                    // 选中时轻微放大
                    transform: on ? 'scale(1)' : 'scale(0.88)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Preset 胶囊 */}
      <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
        {SPACE_PRESETS.filter(p => p.id !== 'custom').map(p => {
          const act = spacePresetId === p.id;
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
