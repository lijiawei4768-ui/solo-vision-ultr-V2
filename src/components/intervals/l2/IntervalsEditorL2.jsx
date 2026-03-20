// components/intervals/l2/IntervalsEditorL2.jsx  — Batch D
//
// L2 快调层 — Intervals 音程选择器
// 顶部：预设胶囊横排 (All 11 / Triad / Seventh / Guide / Custom)
// Custom 激活时：11 个音程 toggle 网格 stagger 出现
// 进入：从 Intervals widget 区域 expand
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { INTERVAL_LABELS } from '../../../constants';
import { INTERVAL_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');
const INTERVAL_SUBLABELS = {
  'b2':'小2','2':'大2','b3':'小3','3':'大3','4':'纯4',
  'b5':'减5','5':'纯5','b6':'小6','6':'大6','b7':'小7','7':'大7',
};

export function IntervalsEditorL2({ isOpen, onClose, intervalsPreset, selectedIntervals, onPresetChange, onToggleInterval, onOpenL3 }) {
  const isDark = useIsDark();
  const isCustom = intervalsPreset === 'custom';

  const bg     = isDark ? 'rgba(18,18,22,0.97)' : 'rgba(250,250,252,0.98)';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleC = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC = isDark ? 'rgba(235,235,245,0.34)' : 'rgba(0,0,0,0.34)';

  const currentPreset = INTERVAL_PRESETS.find(p => p.id === intervalsPreset) ?? INTERVAL_PRESETS[0];

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
            layoutId="intervals-widget"
            initial={{ y:40, scale:0.94 }}
            animate={{ y:0, scale:1 }}
            exit={{ y:30, scale:0.96, opacity:0 }}
            transition={SPRINGS_IV.layerExpand}
            style={{
              width:'100%', maxWidth:480, margin:'0 auto',
              background:bg, borderRadius:'20px 20px 0 0',
              border:`0.5px solid ${border}`, borderBottom:'none',
              paddingBottom:'env(safe-area-inset-bottom,0px)',
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
              <span style={{ fontSize:16, fontWeight:600, color:titleC, fontFamily:FONT_TEXT }}>
                {currentPreset.label}
              </span>
              <CloseBtn onClose={onClose} isDark={isDark} />
            </div>

            {/* Preset capsules */}
            <div style={{ display:'flex', gap:7, padding:'0 16px 14px', overflowX:'auto' }}>
              {INTERVAL_PRESETS.map(p => {
                const act = intervalsPreset === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => onPresetChange?.(p.id)}
                    whileTap={{ scale: 0.90 }}
                    transition={SPRINGS_IV.capsuleSelect}
                    style={{
                      flexShrink:0, padding:'6px 14px', borderRadius:20,
                      background: act ? (isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.18)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
                      cursor:'pointer',
                    }}
                  >
                    <span style={{ fontSize:12, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily:FONT_TEXT }}>
                      {p.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom toggle grid */}
            <AnimatePresence>
              {isCustom && (
                <motion.div
                  initial={{ opacity:0, height:0 }}
                  animate={{ opacity:1, height:'auto' }}
                  exit={{ opacity:0, height:0 }}
                  style={{ overflow:'hidden', padding:'0 16px' }}
                >
                  <div style={{
                    display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
                    gap:7, paddingBottom:14,
                  }}>
                    {ALL_INTERVALS.map((ivl, idx) => {
                      const active = !selectedIntervals || selectedIntervals.length === 0 || selectedIntervals.includes(ivl);
                      return (
                        <motion.button
                          key={ivl}
                          initial={{ opacity:0, y:8 }}
                          animate={{ opacity:1, y:0 }}
                          transition={{ ...SPRINGS_IV.contentSwap, delay: idx * 0.04 }}
                          onClick={() => onToggleInterval?.(ivl)}
                          whileTap={{ scale: 0.92 }}
                          style={{
                            display:'flex', flexDirection:'column', alignItems:'center',
                            padding:'9px 6px', borderRadius:12, cursor:'pointer',
                            background: active
                              ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
                              : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                            border:`0.5px solid ${active
                              ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)')
                              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                          }}
                        >
                          <span style={{ fontSize:14, fontWeight: active ? 600 : 400, color: active ? titleC : mutedC, fontFamily:FONT_MONO }}>
                            {ivl}
                          </span>
                          <span style={{ fontSize:9, color:isDark ? 'rgba(235,235,245,0.30)' : 'rgba(0,0,0,0.28)', fontFamily:FONT_TEXT, marginTop:2 }}>
                            {INTERVAL_SUBLABELS[ivl]}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'4px 20px 16px' }}>
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
