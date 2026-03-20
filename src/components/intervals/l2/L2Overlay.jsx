// components/intervals/l2/L2Overlay.jsx  — iOS Control Center gather layer
//
// L2 的正确形态：不是 bottom sheet modal
//
// 进入方式：
//   - 从触发源位置 scale+opacity in，聚拢到屏幕中央
//   - 背景：L0+L1 全部 blur+dim，感觉进入系统聚焦态
//   - 内容容器居中浮现，不贴底部
//
// 退出方式：
//   - 向下 swipe dismiss
//   - 点击背景 dismiss
//   - scale+opacity out
//
// 使用方式：把具体内容作为 children 传入
//   <L2Overlay isOpen={...} onClose={...} title="Space 音域">
//     <SpaceGridContent ... />
//   </L2Overlay>

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext }          from '../../../contexts';
import { FONT_TEXT }             from '../../../theme';
import { SPRINGS_IV }            from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function L2Overlay({ isOpen, onClose, title, children, onDeepDive }) {
  const isDark = useIsDark();

  const overlayBg   = isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.45)';
  const panelBg     = isDark ? 'rgba(18,18,24,0.94)' : 'rgba(248,248,252,0.95)';
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleColor  = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const mutedColor  = isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen blur backdrop — iOS control center feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: overlayBg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Content panel — gathers to center from scale 0.88 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92,   y: 16 }}
            transition={SPRINGS_IV.layerExpand}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.06}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 300) onClose();
            }}
            style={{
              position: 'fixed',
              // centered vertically, slightly above center for visual weight
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 65,
              width: 'min(92vw, 420px)',
              maxHeight: '78vh',
              background: panelBg,
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: `0.5px solid ${borderColor}`,
              borderRadius: 24,
              boxShadow: isDark
                ? '0 24px 80px rgba(0,0,0,0.60), 0 4px 16px rgba(0,0,0,0.40)'
                : '0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px 10px',
              borderBottom: `0.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: titleColor, fontFamily: FONT_TEXT }}>
                {title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {onDeepDive && (
                  <span
                    onClick={onDeepDive}
                    style={{ fontSize: 11, color: mutedColor, fontFamily: FONT_TEXT, cursor: 'pointer' }}
                  >
                    深度设置 →
                  </span>
                )}
                {/* Close pill */}
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke={isDark ? 'rgba(235,235,245,0.50)' : 'rgba(0,0,0,0.40)'}
                      strokeWidth={1.4} strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div style={{
              flex: 1, overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '14px 18px 18px',
            }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
