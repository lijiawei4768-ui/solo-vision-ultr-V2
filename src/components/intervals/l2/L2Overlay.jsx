// components/intervals/l2/L2Overlay.jsx
// Fix 7: iOS 控制中心视觉感
//   - 更薄的背景透明度 + 更强的 blur
//   - 边框用极细微渐变感
//   - 面板四角更圆 (26px)
//   - 阴影更柔和、更有层次

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function L2Overlay({ isOpen, onClose, title, children, onDeepDive }) {
  const isDark = useIsDark();

  // iOS 控制中心风格：更轻薄、更通透、更模糊
  const backdropBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)';
  const panelBg    = isDark
    ? 'rgba(28,28,36,0.82)'    // 比原来更透明，依赖 blur 提供不透明感
    : 'rgba(252,252,255,0.88)';
  const borderColor= isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)';
  const titleColor = isDark ? 'rgba(235,235,245,0.90)' : 'rgba(0,0,0,0.84)';
  const mutedColor = isDark ? 'rgba(235,235,245,0.32)' : 'rgba(0,0,0,0.32)';
  const divider    = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const closeBg    = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';

  return (
    <AnimatePresence>
      {isOpen && (
        // 全屏 flex 居中容器
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.20 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: backdropBg,
            backdropFilter: 'blur(24px)',        // 更强的背景模糊
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
          }}
        >
          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{   opacity: 0, scale: 0.92,   y: 8   }}
            transition={SPRINGS_IV.layerExpand ?? {
              type: 'spring', stiffness: 360, damping: 30,
            }}
            onClick={e => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.07}
            onDragEnd={(_, info) => {
              if (info.offset.y > 60 || info.velocity.y > 300) onClose();
            }}
            style={{
              width: '100%',
              maxWidth: 400,
              maxHeight: '78vh',
              // iOS 控制中心感：强 blur + 半透明
              background: panelBg,
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: `0.5px solid ${borderColor}`,
              borderRadius: 26,              // 更圆润
              // 多层阴影：外层柔和扩散 + 内层 inner glow 感
              boxShadow: isDark
                ? '0 32px 96px rgba(0,0,0,0.60), 0 8px 24px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.08)'
                : '0 16px 56px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.90)',
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
              padding: '14px 16px 12px',
              borderBottom: `0.5px solid ${divider}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: titleColor, fontFamily: FONT_TEXT,
                letterSpacing: '-0.01em',
              }}>
                {title}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {onDeepDive && (
                  <span
                    onClick={onDeepDive}
                    style={{
                      fontSize: 11, color: mutedColor,
                      fontFamily: FONT_TEXT, cursor: 'pointer',
                      letterSpacing: '0.01em',
                    }}
                  >
                    深度设置 →
                  </span>
                )}
                {/* 关闭按钮 — 右上角，远离系统热区左侧 */}
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.84 }}
                  style={{
                    width: 26, height: 26, borderRadius: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: closeBg,
                    border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
                    <path
                      d="M1 1l8 8M9 1L1 9"
                      stroke={isDark ? 'rgba(235,235,245,0.55)' : 'rgba(0,0,0,0.45)'}
                      strokeWidth={1.4} strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '14px 16px 18px',
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
