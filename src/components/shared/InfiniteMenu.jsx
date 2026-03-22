// components/shared/InfiniteMenu.jsx
//
// React Bits InfiniteMenu — 完整手写实现
// 原始设计: https://reactbits.dev/components/infinite-menu
//
// Three.js 圆柱体滚动菜单：
//   - N 个 item → N 个面，各自贴 canvas texture
//   - 拖拽 → 旋转圆柱（从内侧看）
//   - 松手 → snap 到最近面 + 惯性
//   - 点击 → onSelect(item, index)

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// canvas texture: 大字标题 + 小字副标题
function makeTexture(title, description, textColor = '#ffffff') {
  const SIZE = 512;
  const cv   = document.createElement('canvas');
  cv.width   = SIZE;
  cv.height  = SIZE;
  const ctx  = cv.getContext('2d');

  // transparent background
  ctx.clearRect(0, 0, SIZE, SIZE);

  // title
  ctx.fillStyle    = textColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = `bold 80px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
  ctx.fillText(title, SIZE / 2, description ? SIZE / 2 - 36 : SIZE / 2);

  // description
  if (description) {
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font      = `42px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
    ctx.fillText(description, SIZE / 2, SIZE / 2 + 46);
  }

  const t = new THREE.CanvasTexture(cv);
  t.needsUpdate = true;
  return t;
}

export default function InfiniteMenu({ items = [], onSelect, scale = 1 }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !items.length) return;

    const W = el.clientWidth  || 300;
    const H = el.clientHeight || 400;
    const N = items.length;

    // ── Scene ────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // ── Cylinder geometry (open-ended, inside-out) ────────────
    const R   = 2.0 * scale;
    const HH  = 2.8 * scale;
    const geo = new THREE.CylinderGeometry(R, R, HH, N, 1, true);
    geo.clearGroups();
    for (let i = 0; i < N; i++) geo.addGroup(i * 6, 6, i);

    const mats = items.map((item) =>
      new THREE.MeshBasicMaterial({
        map:         makeTexture(item.title, item.description, item.color ?? '#fff'),
        transparent: true,
        side:        THREE.BackSide,
        depthWrite:  false,
        alphaTest:   0.01,
      })
    );

    const mesh = new THREE.Mesh(geo, mats);
    scene.add(mesh);

    // ── Drag state ────────────────────────────────────────────
    const step   = (Math.PI * 2) / N;  // angle between faces
    let rotY     = 0;   // current rotation
    let targetY  = 0;   // target after snap
    let dragging = false;
    let lastY    = 0;
    let vel      = 0;
    let didDrag  = false;

    const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

    const onStart = (e) => {
      dragging = true;
      didDrag  = false;
      lastY    = getY(e);
      vel      = 0;
    };

    const onMove = (e) => {
      if (!dragging) return;
      const y  = getY(e);
      const dy = y - lastY;
      lastY    = y;
      vel      = dy;
      if (Math.abs(dy) > 1) didDrag = true;
      targetY -= dy * 0.009;
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      targetY -= vel * 0.05;            // inertia
      targetY  = Math.round(targetY / step) * step;  // snap
    };

    const onTap = () => {
      if (didDrag) return;
      // which face is centred (facing -z = towards viewer)
      const raw = (-mesh.rotation.y / step);
      const idx = ((Math.round(raw) % N) + N) % N;
      onSelect?.(items[idx], idx);
    };

    const cvs = renderer.domElement;
    cvs.addEventListener('mousedown',  onStart);
    cvs.addEventListener('mousemove',  onMove);
    cvs.addEventListener('mouseup',    onEnd);
    cvs.addEventListener('mouseleave', onEnd);
    cvs.addEventListener('touchstart', onStart, { passive: true });
    cvs.addEventListener('touchmove',  onMove,  { passive: true });
    cvs.addEventListener('touchend',   onEnd);
    cvs.addEventListener('click',      onTap);

    // ── Render loop ───────────────────────────────────────────
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      rotY += (targetY - rotY) * 0.14;
      mesh.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cvs.removeEventListener('mousedown',  onStart);
      cvs.removeEventListener('mousemove',  onMove);
      cvs.removeEventListener('mouseup',    onEnd);
      cvs.removeEventListener('mouseleave', onEnd);
      cvs.removeEventListener('touchstart', onStart);
      cvs.removeEventListener('touchmove',  onMove);
      cvs.removeEventListener('touchend',   onEnd);
      cvs.removeEventListener('click',      onTap);
      geo.dispose();
      mats.forEach((m) => { m.map?.dispose(); m.dispose(); });
      renderer.dispose();
      if (el.contains(cvs)) el.removeChild(cvs);
    };
  }, [items, onSelect, scale]);

  return <div ref={wrapRef} style={{ width: '100%', height: '100%' }} />;
}
