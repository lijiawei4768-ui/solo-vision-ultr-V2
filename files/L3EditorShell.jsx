// components/intervals/l3/L3EditorShell.jsx  — Batch D
//
// 所有 L3 编辑器的通用外壳 (Page push 进入)
// 顶部：← 返回 + 标题 + 完成
// 内容：children (ScrollArea)
// 底部：应用按钮
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_DISPLAY } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function L3EditorShell({ isOpen, title, onClose, onApply, children }) {
  const isDark = useIsDark();

  const bg         = isDark ? '#0a0a0e' : '#F2F2F7';
  const headerBg   = isDark ? 'rgba(10,10,14,0.95)' : 'rgba(242,242,247,0.95)';
  const border     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const titleC     = isDark ? 'rgba(235,235,245,0.90)' : 'rgba(0,0,0,0.84)';
  const backC      = isDark ? 'rgba(235,235,245,0.52)' : 'rgba(0,0,0,0.46)';
  const applyBg    = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const applyBorder= isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)';

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
          {/* Top bar */}
          <div style={{
            height: 52, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 16px',
            background: headerBg,
            borderBottom: `0.5px solid ${border}`,
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
          }}>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.90 }}
              style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:'4px 0' }}
            >
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8l5-5" stroke={backC} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize:14, color:backC, fontFamily:FONT_TEXT }}>返回</span>
            </motion.button>

            <span style={{ fontSize:16, fontWeight:600, color:titleC, fontFamily:FONT_DISPLAY }}>
              {title}
            </span>

            <motion.button
              onClick={() => { onApply?.(); onClose(); }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding:'5px 14px', borderRadius:16,
                background: applyBg, border:`0.5px solid ${applyBorder}`,
                cursor:'pointer',
              }}
            >
              <span style={{ fontSize:14, fontWeight:500, color:titleC, fontFamily:FONT_TEXT }}>完成</span>
            </motion.button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'20px 16px' }}>
            {children}
          </div>

          {/* Bottom apply */}
          <div style={{
            height:56, display:'flex', alignItems:'center', justifyContent:'center',
            borderTop:`0.5px solid ${border}`,
            paddingBottom:'env(safe-area-inset-bottom,0px)',
            background: headerBg,
            flexShrink:0,
          }}>
            <motion.button
              onClick={() => { onApply?.(); onClose(); }}
              whileTap={{ scale: 0.96 }}
              style={{
                width:'80%', maxWidth:320, height:40, borderRadius:12,
                background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                border:`0.5px solid ${applyBorder}`, cursor:'pointer',
              }}
            >
              <span style={{ fontSize:15, fontWeight:600, color:titleC, fontFamily:FONT_DISPLAY }}>应用</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
