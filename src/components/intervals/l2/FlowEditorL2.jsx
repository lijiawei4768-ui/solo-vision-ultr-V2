// components/intervals/l2/FlowEditorL2.jsx  — v2 uses L2Overlay
//
// Flow 预设列表 — iOS Focus Mode 列表风格，容器改成 L2Overlay 中间聚焦层
import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext }             from '../../../contexts';
import { FONT_TEXT, FONT_DISPLAY }  from '../../../theme';
import { SPRINGS_IV }               from '../../../motion/springs';
import { FLOW_PRESETS }             from '../../../trainers/intervals/constants';
import { L2Overlay }                from './L2Overlay';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

function FlowListContent({ flowPreset, onFlowChange, isDark }) {
  const titleC  = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const mutedC  = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.34)';
  const rowBdr  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const selBg   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  const current = FLOW_PRESETS.find(p => p.id === flowPreset) ?? FLOW_PRESETS[0];

  return (
    <div>
      {/* Current preset big display */}
      <motion.div
        key={current.id}
        initial={{ opacity:0, y:5 }}
        animate={{ opacity:1, y:0 }}
        transition={SPRINGS_IV.contentSwap}
        style={{ textAlign:'center', paddingBottom:14, borderBottom:`0.5px solid ${rowBdr}`, marginBottom:4 }}
      >
        <div style={{ fontSize:26, fontWeight:500, color:titleC, fontFamily:FONT_DISPLAY }}>{current.label}</div>
        <div style={{ fontSize:11, color:mutedC, fontFamily:FONT_TEXT, marginTop:3 }}>{current.summary}</div>
      </motion.div>

      {/* Preset list */}
      {FLOW_PRESETS.map((p, i) => {
        const act = p.id === flowPreset;
        return (
          <motion.div
            key={p.id}
            onClick={() => onFlowChange?.(p.id)}
            whileTap={{ opacity: 0.7 }}
            style={{
              display:'flex', alignItems:'center', padding:'0 4px',
              height:52, cursor:'pointer', position:'relative',
              background: act ? selBg : 'transparent',
              borderBottom: i < FLOW_PRESETS.length-1 ? `0.5px solid ${rowBdr}` : 'none',
            }}
          >
            {/* Active bar */}
            <AnimatePresence>
              {act && (
                <motion.div
                  initial={{ scaleY:0 }}
                  animate={{ scaleY:1 }}
                  exit={{ scaleY:0 }}
                  style={{
                    position:'absolute', left:0, top:'18%', bottom:'18%',
                    width:3, borderRadius:'0 2px 2px 0',
                    background: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                    transformOrigin:'top',
                  }}
                />
              )}
            </AnimatePresence>

            <div style={{ flex:1, paddingLeft:10 }}>
              <div style={{ fontSize:15, fontWeight:act?600:400, color: act ? titleC : mutedC, fontFamily:FONT_TEXT }}>{p.label}</div>
              <div style={{ fontSize:11, color:mutedC, fontFamily:FONT_TEXT, marginTop:1 }}>{p.summary}</div>
            </div>

            {act && (
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5l3.5 3.5 5.5-7" stroke={isDark ? 'rgba(235,235,245,0.65)' : 'rgba(0,0,0,0.50)'} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function FlowEditorL2({ isOpen, onClose, flowPreset, onFlowChange, onOpenL3 }) {
  const isDark = useIsDark();
  return (
    <L2Overlay isOpen={isOpen} onClose={onClose} title="Flow 节奏" onDeepDive={onOpenL3}>
      <FlowListContent flowPreset={flowPreset} onFlowChange={onFlowChange} isDark={isDark} />
    </L2Overlay>
  );
}
