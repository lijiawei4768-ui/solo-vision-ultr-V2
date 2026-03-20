// components/intervals/l3/FlowEditorL3.jsx  — Batch D
// 完整 Flow 设置：顺序 + 每弦数量
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';
import { FLOW_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

export function FlowEditorL3({ isOpen, onClose, flowPreset, positionsPerString, onFlowSettings }) {
  const isDark = useIsDark();
  const [order, setOrder]    = useState(flowPreset ?? 'free');
  const [pps,   setPps]      = useState(positionsPerString ?? 3);

  const titleC   = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC   = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const line     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <L3EditorShell isOpen={isOpen} title="Flow 节奏" onClose={onClose} onApply={() => onFlowSettings?.({ order, positionsPerString: pps })}>
      {/* Order */}
      <div style={{ paddingBottom:20, borderBottom:`0.5px solid ${line}`, marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:600, color:mutedC, fontFamily:FONT_TEXT, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>顺序模式</div>
        {FLOW_PRESETS.map(p => {
          const act = order === p.id;
          return (
            <motion.div
              key={p.id}
              onClick={() => setOrder(p.id)}
              whileTap={{ opacity:0.7 }}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 14px', borderRadius:12, marginBottom:7, cursor:'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
              }}
            >
              <div>
                <div style={{ fontSize:15, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily:FONT_TEXT }}>{p.label}</div>
                <div style={{ fontSize:11, color:mutedC, fontFamily:FONT_TEXT, marginTop:2 }}>{p.summary}</div>
              </div>
              {act && <svg width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-7" stroke={isDark ? 'rgba(235,235,245,0.65)' : 'rgba(0,0,0,0.50)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </motion.div>
          );
        })}
      </div>

      {/* Positions per string */}
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:mutedC, fontFamily:FONT_TEXT, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>每弦题数</div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:22, fontWeight:600, color:titleC, fontFamily:FONT_MONO, width:28 }}>{pps}</span>
          <input
            type="range" min={1} max={8} value={pps}
            onChange={e => setPps(+e.target.value)}
            style={{ flex:1, height:3, appearance:'none', WebkitAppearance:'none', background:sliderBg, borderRadius:2, cursor:'pointer' }}
          />
          <span style={{ fontSize:13, color:mutedC, fontFamily:FONT_MONO }}>8</span>
        </div>
        <div style={{ fontSize:11, color:mutedC, fontFamily:FONT_TEXT, marginTop:8 }}>每根弦练习 {pps} 道题后换下一根弦</div>
      </div>
    </L3EditorShell>
  );
}
