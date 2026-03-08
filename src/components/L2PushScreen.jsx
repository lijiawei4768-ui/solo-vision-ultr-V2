// ─────────────────────────────────────────────────────────────
// L2PushScreen — iOS push navigation base
// 通用 L2 层导航容器，所有 trainer 可复用
//
// 用法：
//   <L2PushScreen open={open} onClose={onClose} title="Intervals" subtitle="Content">
//     {/* 各 trainer 自己的内容 */}
//   </L2PushScreen>
//
// 行为：
//   • 从右侧滑入（slide in from right）
//   • 左边缘右划关闭（left-edge swipe-right to dismiss）
//   • 无 × 按钮，纯 iOS push navigation 体验
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { ThemeContext } from "../contexts";

function useT() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? DT;
}

export function L2PushScreen({ open, onClose, title, subtitle, children, zIndex = 200 }) {
  const T = useT();
  const startXRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const isDragRef = useRef(false);

  function onTouchStart(e) {
    if (e.touches[0].clientX < 48) {
      startXRef.current = e.touches[0].clientX;
      isDragRef.current = true;
    }
  }
  function onTouchMove(e) {
    if (!isDragRef.current || startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    if (dx > 0) setDragX(dx);
  }
  function onTouchEnd() {
    if (!isDragRef.current) return;
    if (dragX > 80) onClose();
    setDragX(0);
    isDragRef.current = false;
    startXRef.current = null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="l2-screen"
          initial={{ x: "100%" }}
          animate={{ x: dragX }}
          exit={{ x: "100%" }}
          transition={SPRINGS.pageTransition}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            position: "fixed", inset: 0, zIndex,
            background: "rgba(16,16,22,0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center",
            padding: "max(52px, env(safe-area-inset-top, 44px)) 20px 16px",
            flexShrink: 0,
            borderBottom: `0.5px solid ${T.border ?? "rgba(255,255,255,0.1)"}`,
          }}>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.88 }}
              transition={SPRINGS.tap}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none",
                color: T.accent ?? "#E8A23C",
                cursor: "pointer",
                fontSize: 16, fontWeight: 500,
                fontFamily: FONT_TEXT,
                padding: "4px 0", marginRight: 12,
              }}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 1 L1 9 L9 17" />
              </svg>
            </motion.button>
            <div>
              {subtitle && (
                <div style={{ fontSize: 10, color: T.textTertiary, letterSpacing: 1, textTransform: "uppercase" }}>
                  {subtitle}
                </div>
              )}
              <div style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginTop: 1 }}>
                {title}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default L2PushScreen;
