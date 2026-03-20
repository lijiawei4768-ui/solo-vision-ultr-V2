// components/intervals/l2/FlowEditorL2.jsx  — Batch D
//
// L2 快调层 — Flow 节奏编辑器
// iOS Focus Mode 风格：当前预设大字 + 垂直滚动列表
// 进入：两段动效 — 先从 Flow widget expand，然后 settle 到居中
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_DISPLAY } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { FLOW_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function FlowEditorL2({ isOpen, onClose, flowPreset, onFlowChange, onOpenL3 }) {
  const isDark = useIsDark();

  const bg        = isDark ? 'rgba(18,18,22,0.97)' : 'rgba(250,250,252,0.98)';
  const border    = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleC    = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC    = isDark ? 'rgba(235,235,245,0.34)' : 'rgba(0,0,0,0.34)';
  const selectedBg= isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const rowBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const current = FLOW_PRESETS.find(p => p.id === flowPreset) ?? FLOW_PRESETS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position:'fixed', inset:0, zIndex:60,
            display:'flex', alignItems:'flex-end',
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)',
            backdropFilter:'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            layoutId="flow-widget"
            initial={{ y: 40, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 30, scale: 0.96, opacity: 0 }}
            transition={SPRINGS_IV.layerExpand}
            style={{
              width:'100%', maxWidth:480, margin:'0 auto',
              background:bg, borderRadius:'20px 20px 0 0',
              border:`0.5px solid ${border}`, borderBottom:'none',
              paddingBottom:'env(safe-area-inset-bottom,0px)',
              overflow:'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 0' }}>
              <span style={{ fontSize:16, fontWeight:600, color:titleC, fontFamily:FONT_TEXT }}>Flow 节奏</span>
              <CloseBtn onClose={onClose} isDark={isDark} />
            </div>

            {/* Current preset big label */}
            <div style={{ textAlign:'center', padding:'20px 20px 8px' }}>
              <motion.span
                key={current.id}
                initial={{ opacity:0, y:6 }}
                animate={{ opacity:1, y:0 }}
                transition={SPRINGS_IV.contentSwap}
                style={{ fontSize:28, fontWeight:500, color:titleC, fontFamily:FONT_DISPLAY }}
              >
                {current.label}
              </motion.span>
              <div style={{ fontSize:12, color:mutedC, fontFamily:FONT_TEXT, marginTop:4 }}>
                {current.summary}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height:'0.5px', background:rowBorder, margin:'0 0' }} />

            {/* Preset list — iOS Focus Mode style */}
            <div style={{ maxHeight:260, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
              {FLOW_PRESETS.map((p, i) => {
                const active = p.id === flowPreset;
                return (
                  <motion.div
                    key={p.id}
                    onClick={() => { onFlowChange?.(p.id); }}
                    style={{
                      display:'flex', alignItems:'center',
                      padding:'0 20px',
                      height:56,
                      cursor:'pointer',
                      background: active ? selectedBg : 'transparent',
                      borderBottom: i < FLOW_PRESETS.length - 1 ? `0.5px solid ${rowBorder}` : 'none',
                      position:'relative',
                    }}
                    whileTap={{ opacity: 0.7 }}
                  >
                    {/* Active indicator — 3px left bar */}
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          exit={{ scaleY: 0 }}
                          style={{
                            position:'absolute', left:0, top:'20%', bottom:'20%',
                            width:3, borderRadius:'0 2px 2px 0',
                            background: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                            transformOrigin:'top',
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <div style={{ flex:1, paddingLeft:8 }}>
                      <div style={{
                        fontSize:16, fontWeight: active ? 600 : 400,
                        color: active ? titleC : (isDark ? 'rgba(235,235,245,0.62)' : 'rgba(0,0,0,0.60)'),
                        fontFamily:FONT_TEXT,
                      }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize:12, color:mutedC, fontFamily:FONT_TEXT, marginTop:1 }}>
                        {p.summary}
                      </div>
                    </div>

                    {active && (
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3.5 3.5 5.5-7" stroke={isDark ? 'rgba(235,235,245,0.7)' : 'rgba(0,0,0,0.55)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'10px 20px 14px' }}>
              <span onClick={onOpenL3} style={{ fontSize:12, color:mutedC, fontFamily:FONT_TEXT, cursor:'pointer' }}>深度设置 →</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CloseBtn({ onClose, isDark }) {
  return (
    <motion.button onClick={onClose} whileTap={{ scale: 0.88 }} style={{
      width:28, height:28, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
      background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      border:`0.5px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
      cursor:'pointer',
    }}>
      <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke={isDark ? 'rgba(235,235,245,0.5)' : 'rgba(0,0,0,0.4)'} strokeWidth={1.5} strokeLinecap="round"/>
      </svg>
    </motion.button>
  );
}
