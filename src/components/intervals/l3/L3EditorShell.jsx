// components/intervals/l3/L3EditorShell.jsx
// Fix 5: 退出按钮离开左上角系统热区
//   - header 加 paddingTop: safe-area-inset-top
//   - 头部布局: 左侧空 | 中间标题 | 右侧"完成"
//   - 底部独立"返回"大按钮 → 远离系统热区，拇指友好

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_DISPLAY } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function L3EditorShell({ isOpen, title, onClose, onApply, children }) {
  const isDark = useIsDark();

  const bg          = isDark ? '#0a0a0e' : '#F2F2F7';
  const headerBg    = isDark ? 'rgba(10,10,14,0.96)' : 'rgba(242,242,247,0.96)';
  const border      = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const titleC      = isDark ? 'rgba(235,235,245,0.90)' : 'rgba(0,0,0,0.84)';
  const mutedC      = isDark ? 'rgba(235,235,245,0.46)' : 'rgba(0,0,0,0.40)';
  const doneC       = isDark ? 'rgba(235,235,245,0.80)' : 'rgba(0,0,0,0.75)';
  const backBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const backBorder  = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
  const applyBg     = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.08)';
  const applyBorder = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.13)';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={SPRINGS_IV.pagePush}
          style={{
            position: 'fixed', inset: 0, zIndex: 70,
            background: bg,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* ── Header ── */}
          {/* Fix 5: paddingTop = safe-area-inset-top 避免被状态栏遮挡 */}
          {/* 布局: 左侧无按钮（避免左上系统热区）| 居中标题 | 右侧"完成" */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 16,
            background: headerBg,
            borderBottom: `0.5px solid ${border}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            flexShrink: 0,
            minHeight: 56,
          }}>
            {/* 左侧：空白占位（与右侧"完成"等宽，让标题居中） */}
            <div style={{ width: 52 }} />

            {/* 中间：标题 */}
            <span style={{
              fontSize: 16, fontWeight: 600,
              color: titleC, fontFamily: FONT_DISPLAY,
              textAlign: 'center',
            }}>
              {title}
            </span>

            {/* 右侧：完成 */}
            <motion.button
              onClick={() => { onApply?.(); onClose(); }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '5px 14px', borderRadius: 16, width: 52,
                background: applyBg, border: `0.5px solid ${applyBorder}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: doneC, fontFamily: FONT_TEXT }}>
                完成
              </span>
            </motion.button>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{
            flex: 1, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px 16px 12px',
          }}>
            {children}
          </div>

          {/* ── Bottom bar: 应用 + 返回 ── */}
          {/* Fix 5: 返回放在底部，拇指区，远离左上角系统热区 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '10px 16px',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
            borderTop: `0.5px solid ${border}`,
            background: headerBg,
            flexShrink: 0,
          }}>
            {/* 应用按钮 */}
            <motion.button
              onClick={() => { onApply?.(); onClose(); }}
              whileTap={{ scale: 0.97 }}
              style={{
                height: 46, width: '100%', borderRadius: 13,
                background: applyBg, border: `0.5px solid ${applyBorder}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: titleC, fontFamily: FONT_DISPLAY }}>
                应用
              </span>
            </motion.button>

            {/* 返回按钮 — 底部居中，大热区，拇指友好 */}
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.97, opacity: 0.7 }}
              style={{
                height: 40, width: '100%', borderRadius: 12,
                background: backBg, border: `0.5px solid ${backBorder}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <path d="M9 12L4 7l5-5" stroke={mutedC} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 400, color: mutedC, fontFamily: FONT_TEXT }}>
                返回
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
