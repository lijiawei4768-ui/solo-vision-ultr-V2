// components/intervals/l2/L2Overlay.jsx
//
// 修复 L2 偏移问题：
//
// 旧版错误：
//   position:fixed + top:50% + left:50% + transform:translate(-50%,-50%)
//   → framer-motion 的 animate={{ scale, y }} 会覆盖 CSS transform
//   → translate(-50%,-50%) 丢失 → 面板偏到右下角
//
// 新版正确：
//   backdrop = position:fixed inset:0，自身是 flexbox 居中容器
//   panel    = 普通 div（不用 transform 定位）
//   framer-motion 只动画 opacity + scale，不影响位置

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function L2Overlay({ isOpen, onClose, title, children, onDeepDive }) {
  const isDark = useIsDark();

  const panelBg     = isDark ? 'rgba(18,18,24,0.96)' : 'rgba(248,248,252,0.97)';
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleColor  = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedColor  = isDark ? 'rgba(235,235,245,0.30)' : 'rgba(0,0,0,0.30)';
  const divider     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── 全屏背景遮罩 — flex居中容器 ── */}
          {/* 注意：这一层是 position:fixed inset:0，内部用 flexbox 居中面板 */}
          {/* 不在面板本身用 top/left/transform 定位，避免与 framer-motion 冲突 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.48)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              // ── flex居中：面板直接放在这个容器里 ──
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            {/* ── 面板本体 — 用 scale+opacity 动画，不用 position ── */}
            {/* stopPropagation 防止点击面板触发背景 onClose */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={SPRINGS_IV.layerExpand}
              onClick={e => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.y > 60 || info.velocity.y > 300) onClose();
              }}
              style={{
                width: '100%',
                maxWidth: 420,
                maxHeight: '80vh',
                background: panelBg,
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: `0.5px solid ${borderColor}`,
                borderRadius: 22,
                boxShadow: isDark
                  ? '0 24px 80px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.40)'
                  : '0 12px 48px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px 12px',
                borderBottom: `0.5px solid ${divider}`,
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 15, fontWeight: 600,
                  color: titleColor, fontFamily: FONT_TEXT,
                }}>
                  {title}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {onDeepDive && (
                    <span
                      onClick={onDeepDive}
                      style={{
                        fontSize: 11, color: mutedColor,
                        fontFamily: FONT_TEXT, cursor: 'pointer',
                      }}
                    >
                      深度设置 →
                    </span>
                  )}
                  <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.86 }}
                    style={{
                      width: 26, height: 26, borderRadius: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9"
                        stroke={isDark ? 'rgba(235,235,245,0.50)' : 'rgba(0,0,0,0.40)'}
                        strokeWidth={1.4} strokeLinecap="round"/>
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '14px 18px 20px',
              }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
