// components/shared/InfiniteMenu.jsx
//
// React Bits InfiniteMenu 风格 — 纯 CSS 3D，无 three.js 依赖
// 所有 hooks 在条件判断之前调用（修复 react-hooks/rules-of-hooks）

import React, { useRef, useState, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 72;
const PERSPECTIVE = 600;
const VISIBLE     = 5;

export default function InfiniteMenu({ items = [], onSelect, scale = 1 }) {
  // ── 所有 hooks 必须在最顶部，不能有条件 ──────────────────
  const [offset, setOffset] = useState(0);
  const dragging  = useRef(false);
  const startY    = useRef(0);
  const startOff  = useRef(0);
  const velRef    = useRef(0);
  const lastY     = useRef(0);
  const rafRef    = useRef(null);
  const didDrag   = useRef(false);
  const itemsRef  = useRef(items);
  const offsetRef = useRef(offset);

  // 保持 ref 同步（避免 stale closure）
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const snap = useCallback((off, vel) => {
    let target = off + vel * 6;
    target = Math.round(target / ITEM_HEIGHT) * ITEM_HEIGHT;
    const animate = () => {
      setOffset(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.3) return target;
        rafRef.current = requestAnimationFrame(animate);
        return prev + diff * 0.18;
      });
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const getEventY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  const onStart = useCallback((e) => {
    cancelAnimationFrame(rafRef.current);
    dragging.current = true;
    didDrag.current  = false;
    startY.current   = getEventY(e);
    startOff.current = offsetRef.current;
    lastY.current    = getEventY(e);
    velRef.current   = 0;
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    const y  = getEventY(e);
    const dy = y - lastY.current;
    lastY.current  = y;
    velRef.current = dy;
    if (Math.abs(dy) > 1) didDrag.current = true;
    setOffset(startOff.current + (y - startY.current));
  }, []);

  const onEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    snap(offsetRef.current, velRef.current);
  }, [snap]);

  const onTap = useCallback(() => {
    if (didDrag.current) return;
    const N   = itemsRef.current.length;
    if (!N) return;
    const idx = ((-Math.round(offsetRef.current / ITEM_HEIGHT)) % N + N) % N;
    onSelect?.(itemsRef.current[idx], idx);
  }, [onSelect]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── 条件判断必须在所有 hooks 之后 ────────────────────────
  const N = items.length;
  if (!N) return null;

  const r         = (ITEM_HEIGHT * N) / (2 * Math.PI);
  const angleStep = 360 / N;
  const rotX      = (offset / ITEM_HEIGHT) * angleStep;

  return (
    <div
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onClick={onTap}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: PERSPECTIVE,
        cursor: 'grab',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 圆柱体 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: ITEM_HEIGHT * scale,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotX}deg) scale(${scale})`,
      }}>
        {items.map((item, i) => {
          const angle      = angleStep * i;
          const angleDiff  = ((angle - rotX) % 360 + 360) % 360;
          const normalised = angleDiff > 180 ? angleDiff - 360 : angleDiff;
          const absAngle   = Math.abs(normalised);
          const maxVisible = angleStep * (VISIBLE / 2);
          const opacity    = absAngle > maxVisible ? 0 : 1 - (absAngle / maxVisible) * 0.7;
          const isCenter   = absAngle < angleStep * 0.5;

          return (
            <div
              key={item.id ?? i}
              style={{
                position:       'absolute',
                top:            '50%',
                left:           0,
                right:          0,
                height:         ITEM_HEIGHT,
                marginTop:      -ITEM_HEIGHT / 2,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                transform: `rotateX(${-angle}deg) translateZ(${r}px)`,
                opacity,
                gap: 4,
              }}
            >
              <span style={{
                fontSize:   isCenter ? 22 : 16,
                fontWeight: isCenter ? 700 : 400,
                color:      isCenter ? '#fff' : 'rgba(255,255,255,0.38)',
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
              }}>
                {item.title}
              </span>
              {item.description && (
                <span style={{
                  fontSize:   isCenter ? 11 : 9,
                  color:      isCenter ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)',
                  lineHeight: 1,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                }}>
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 选中区域上下分割线 */}
      {[-1, 1].map(sign => (
        <div key={sign} style={{
          position:   'absolute',
          left:       '8%',
          right:      '8%',
          height:     0.5,
          background: 'rgba(255,255,255,0.13)',
          top:        `calc(50% + ${sign * ITEM_HEIGHT * scale / 2}px)`,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}
