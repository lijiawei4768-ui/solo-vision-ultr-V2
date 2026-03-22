// components/intervals/l2/FlowEditorL2.jsx
//
// ── iOS Focus Mode / Control Center 风格 ──────────────────────
// 不用 L2Overlay 矩形框，用专属 FlowFocusSheet：
//   背景：position:fixed inset:0 + 强 backdrop-filter
//   内容：从底部中心"长出来" — transformOrigin:'bottom center'
//          initial scale:0.15, y:80  →  animate scale:1, y:0
//          spring stiffness:300, damping:26
//   面板：无硬边框，靠 blur+shadow 定义边界，圆角 28px
//   关闭：tap 背景 / swipe-down / 自带 ×

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_DISPLAY } from '../../../theme';
import { FLOW_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// ── 内容：preset 列表 ─────────────────────────────────────────
function FlowContent({ flowPreset, onFlowChange, onClose, onOpenL3, isDark }) {
  const titleC = isDark ? 'rgba(235,235,245,0.90)' : 'rgba(0,0,0,0.84)';
  const mutedC = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.38)';
  const rowBdr = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const selBg  = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';

  const current = FLOW_PRESETS.find(p => p.id === flowPreset) ?? FLOW_PRESETS[0];

  return (
    <>
      {/* 当前 preset 大字 */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          textAlign: 'center',
          paddingBottom: 16,
          borderBottom: `0.5px solid ${rowBdr}`,
          marginBottom: 6,
        }}
      >
        <div style={{
          fontSize: 30, fontWeight: 500,
          color: titleC, fontFamily: FONT_DISPLAY,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {current.label}
        </div>
        <div style={{
          fontSize: 12, color: mutedC,
          fontFamily: FONT_TEXT, marginTop: 5,
        }}>
          {current.summary}
        </div>
      </motion.div>

      {/* Preset 列表 */}
      {FLOW_PRESETS.map((p, i) => {
        const act = p.id === flowPreset;
        return (
          <motion.div
            key={p.id}
            onClick={() => { onFlowChange?.(p.id); }}
            whileTap={{ opacity: 0.65 }}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '0 10px',
              height: 54, cursor: 'pointer',
              position: 'relative',
              background: act ? selBg : 'transparent',
              borderRadius: act ? 12 : 0,
              borderBottom: i < FLOW_PRESETS.length - 1 && !act
                ? `0.5px solid ${rowBdr}` : 'none',
              marginBottom: act ? 3 : 0,
            }}
          >
            {/* 左侧激活竖条 */}
            <AnimatePresence>
              {act && (
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
                  style={{
                    position: 'absolute', left: 0, top: '16%', bottom: '16%',
                    width: 3, borderRadius: '0 2px 2px 0',
                    background: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.40)',
                    transformOrigin: 'top',
                  }}
                />
              )}
            </AnimatePresence>

            <div style={{ flex: 1, paddingLeft: act ? 14 : 10 }}>
              <div style={{
                fontSize: 15, fontWeight: act ? 600 : 400,
                color: act ? titleC : mutedC,
                fontFamily: FONT_TEXT,
              }}>
                {p.label}
              </div>
              <div style={{
                fontSize: 11, color: mutedC,
                fontFamily: FONT_TEXT, marginTop: 1,
              }}>
                {p.summary}
              </div>
            </div>

            {act && (
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5l3.5 3.5 5.5-7"
                  stroke={isDark ? 'rgba(235,235,245,0.60)' : 'rgba(0,0,0,0.45)'}
                  strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </motion.div>
        );
      })}

      {/* 底部操作行 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, marginTop: 6,
        borderTop: `0.5px solid ${rowBdr}`,
      }}>
        {onOpenL3 && (
          <motion.div
            onClick={onOpenL3}
            whileTap={{ opacity: 0.6 }}
            style={{ fontSize: 12, color: mutedC, fontFamily: FONT_TEXT, cursor: 'pointer' }}
          >
            深度设置 →
          </motion.div>
        )}
        <div style={{ flex: 1 }} />
        {/* 完成按钮 */}
        <motion.div
          onClick={onClose}
          whileTap={{ scale: 0.93 }}
          style={{
            padding: '7px 18px', borderRadius: 20,
            background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)',
            border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: isDark ? 'rgba(235,235,245,0.80)' : 'rgba(0,0,0,0.72)',
            fontFamily: FONT_TEXT,
          }}>
            完成
          </span>
        </motion.div>
      </div>
    </>
  );
}

// ── 主组件 ────────────────────────────────────────────────────
export function FlowEditorL2({ isOpen, onClose, flowPreset, onFlowChange, onOpenL3 }) {
  const isDark = useIsDark();

  // 背景：强 blur + 轻 dim，模拟 iOS 专注模式背景
  const backdropBg = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.28)';

  // 面板：无硬边框，纯靠 blur + shadow 塑形
  const panelBg = isDark ? 'rgba(22,22,30,0.78)' : 'rgba(250,250,254,0.84)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── 背景遮罩 ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: backdropBg,
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          />

          {/* ── 浮层面板 — 从底部中心长出来 ── */}
          {/*
            iOS Control Center 风格动画：
              transformOrigin: 'bottom center'
              initial: scale:0.15 (极小), y:80 (在底部触发点位置)
              animate: scale:1, y:0 (展开到正常大小)
            视觉效果：像从 Flow 卡片"长出来"，不是弹出来
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.15, y: 80 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.20,   y: 60 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 26,
              mass: 0.85,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y > 55 || info.velocity.y > 280) onClose();
            }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              // 垂直居中偏下，接近 L1 触发区域
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
              left: '50%',
              x: '-50%',   // framer-motion x transform
              zIndex: 65,
              width: 'min(92vw, 380px)',
              transformOrigin: 'bottom center',

              // 无硬边框 — 靠 blur + shadow 塑形
              background: panelBg,
              backdropFilter: 'blur(44px)',
              WebkitBackdropFilter: 'blur(44px)',
              // 极细内发光边 + 外层柔和阴影
              boxShadow: isDark
                ? 'inset 0 0.5px 0 rgba(255,255,255,0.10), 0 28px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.30)'
                : 'inset 0 0.5px 0 rgba(255,255,255,0.95), 0 16px 48px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.07)',
              borderRadius: 28,
              // 只在有内容实体时加极淡边框
              border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}`,
              padding: '18px 16px 16px',
              overflow: 'hidden',
            }}
          >
            {/* 拖动 handle */}
            <div style={{
              width: 28, height: 3, borderRadius: 2,
              background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
              margin: '0 auto 16px',
            }} />

            <FlowContent
              flowPreset={flowPreset}
              onFlowChange={onFlowChange}
              onClose={onClose}
              onOpenL3={onOpenL3}
              isDark={isDark}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
