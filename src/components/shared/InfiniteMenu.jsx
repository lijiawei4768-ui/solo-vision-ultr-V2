// components/shared/InfiniteMenu.jsx
//
// React Bits InfiniteMenu 风格 — 纯 CSS 3D 实现
// 不依赖 three.js，用 perspective + rotateX 模拟圆柱体滚动
//
// 效果：
//   - N 个 item 排列在虚拟圆柱面上
//   - 手指/鼠标上下拖拽 → 圆柱旋转
//   - 松手 → 惯性 + snap 到最近项
//   - 中心项完整显示，上下项 fade + scale

import React, { useRef, useState, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 72;   // px, 每项高度
const PERSPECTIVE = 600;  // px, 透视距离
const VISIBLE     = 5;    // 显示几项（奇数，中心 = 选中）

export default function InfiniteMenu({ items = [], onSelect, scale = 1 }) {
  const [offset, setOffset] = useState(0);       // 当前偏移（正数=向下滚）
  const dragging  = useRef(false);
  const startY    = useRef(0);
  const startOff  = useRef(0);
  const velRef    = useRef(0);
  const lastY     = useRef(0);
  const rafRef    = useRef(null);
  const didDrag   = useRef(false);

  const N = items.length;
  if (!N) return null;

  // snap to nearest item index
  const snap = useCallback((off, vel) => {
    // inertia
    let target = off + vel * 6;
    // round to nearest item
    target = Math.round(target / ITEM_HEIGHT) * ITEM_HEIGHT;
    // clamp (optional: allow infinite wrap)
    // target = Math.max(-(N-1)*ITEM_HEIGHT, Math.min(0, target));

    const animate = () => {
      setOffset(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.3) return target;
        rafRef.current = requestAnimationFrame(animate);
        return prev + diff * 0.18;
      });
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [N]);

  const getEventY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  const onStart = useCallback((e) => {
    cancelAnimationFrame(rafRef.current);
    dragging.current = true;
    didDrag.current  = false;
    startY.current   = getEventY(e);
    startOff.current = offset;
    lastY.current    = getEventY(e);
    velRef.current   = 0;
  }, [offset]);

  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    const y  = getEventY(e);
    const dy = y - lastY.current;
    lastY.current = y;
    velRef.current = dy;
    if (Math.abs(dy) > 1) didDrag.current = true;
    const newOff = startOff.current + (y - startY.current);
    setOffset(newOff);
  }, []);

  const onEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    snap(offset, velRef.current);
  }, [offset, snap]);

  const onTap = useCallback(() => {
    if (didDrag.current) return;
    // 当前中心项
    const idx = ((-Math.round(offset / ITEM_HEIGHT)) % N + N) % N;
    onSelect?.(items[idx], idx);
  }, [offset, N, items, onSelect]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // 计算每项的 3D 位置
  // 圆柱半径 r, 每项角度 = 360/N
  const r         = (ITEM_HEIGHT * N) / (2 * Math.PI);
  const angleStep = 360 / N;

  // 当前旋转角 (offset → degrees)
  const rotX = (offset / ITEM_HEIGHT) * angleStep;

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
      }}
    >
      {/* 圆柱容器 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: ITEM_HEIGHT * scale,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX}deg) scale(${scale})`,
          transition: dragging.current ? 'none' : undefined,
        }}
      >
        {items.map((item, i) => {
          const angle      = angleStep * i;
          // 每项与当前中心的角度差（用于淡化）
          const angleDiff  = ((angle - rotX) % 360 + 360) % 360;
          const normalised = angleDiff > 180 ? angleDiff - 360 : angleDiff;
          const absAngle   = Math.abs(normalised);
          // 超过这个角度就完全不可见
          const maxVisible = angleStep * (VISIBLE / 2);
          const opacity    = absAngle > maxVisible ? 0 : 1 - (absAngle / maxVisible) * 0.7;
          const isCenter   = absAngle < angleStep * 0.5;

          return (
            <div
              key={item.id ?? i}
              style={{
                position:  'absolute',
                top:       '50%',
                left:      0,
                right:     0,
                height:    ITEM_HEIGHT,
                marginTop: -ITEM_HEIGHT / 2,
                display:   'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                backfaceVisibility: 'hidden',
                transform: `rotateX(${-angle}deg) translateZ(${r}px)`,
                opacity,
                transition: 'opacity 0.1s',
                gap: 4,
              }}
            >
              <span style={{
                fontSize:   isCenter ? 22 : 16,
                fontWeight: isCenter ? 700 : 400,
                color:      isCenter ? '#fff' : 'rgba(255,255,255,0.4)',
                lineHeight: 1,
                transition: 'all 0.15s',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
              }}>
                {item.title}
              </span>
              {item.description && (
                <span style={{
                  fontSize: isCenter ? 11 : 9,
                  color:    isCenter ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                  lineHeight: 1,
                  transition: 'all 0.15s',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                }}>
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 选中项高亮线 */}
      <div style={{
        position:  'absolute',
        left:      '10%',
        right:     '10%',
        height:    1,
        background: 'rgba(255,255,255,0.12)',
        top:       `calc(50% - ${ITEM_HEIGHT * scale / 2}px)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position:  'absolute',
        left:      '10%',
        right:     '10%',
        height:    1,
        background: 'rgba(255,255,255,0.12)',
        top:       `calc(50% + ${ITEM_HEIGHT * scale / 2}px)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}
