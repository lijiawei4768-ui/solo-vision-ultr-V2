// components/intervals/l3/SpaceEditorL3.jsx  — Batch D
// 完整 Space 设置：品位范围滑杆 + 弦选择 + 预设管理
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';

const STRING_NAMES = ['E2','A2','D3','G3','B3','e4'];
function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

function Row({ label, isDark, children }) {
  const labelC = isDark ? 'rgba(235,235,245,0.44)' : 'rgba(0,0,0,0.42)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div style={{ paddingBottom:20, borderBottom:`0.5px solid ${line}`, marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:600, color:labelC, fontFamily:FONT_TEXT, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export function SpaceEditorL3({ isOpen, onClose, spaceSettings, onSpaceSettings }) {
  const isDark = useIsDark();
  const [fretMin, setFretMin] = useState(spaceSettings?.fretRange?.min ?? 0);
  const [fretMax, setFretMax] = useState(spaceSettings?.fretRange?.max ?? 12);
  const [strings, setStrings] = useState(spaceSettings?.strings ?? [true,true,true,true,true,true]);

  const titleC   = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  const toggleString = (i) => setStrings(prev => prev.map((v,j) => j===i ? !v : v));

  const apply = () => {
    onSpaceSettings?.({ fretRange:{ min:fretMin, max:fretMax }, strings });
  };

  return (
    <L3EditorShell isOpen={isOpen} title="Space 音域" onClose={onClose} onApply={apply}>
      {/* Fret range */}
      <Row label="品位范围" isDark={isDark}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:titleC, fontFamily:FONT_MONO, width:24 }}>{fretMin}</span>
          <input
            type="range" min={0} max={11} value={fretMin}
            onChange={e => { const v = +e.target.value; if (v < fretMax) setFretMin(v); }}
            style={{ flex:1, height:3, appearance:'none', WebkitAppearance:'none', background:sliderBg, borderRadius:2, cursor:'pointer' }}
          />
          <span style={{ fontSize:13, color:titleC, fontFamily:FONT_MONO, width:24, textAlign:'right' }}>12</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10 }}>
          <span style={{ fontSize:13, color:titleC, fontFamily:FONT_MONO, width:24 }}>{fretMax}</span>
          <input
            type="range" min={1} max={12} value={fretMax}
            onChange={e => { const v = +e.target.value; if (v > fretMin) setFretMax(v); }}
            style={{ flex:1, height:3, appearance:'none', WebkitAppearance:'none', background:sliderBg, borderRadius:2, cursor:'pointer' }}
          />
          <span style={{ fontSize:13, color:isDark ? 'rgba(235,235,245,0.30)' : 'rgba(0,0,0,0.28)', fontFamily:FONT_MONO, width:24, textAlign:'right' }}>12</span>
        </div>
        <div style={{ fontSize:11, color:isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.28)', fontFamily:FONT_TEXT, marginTop:8 }}>
          当前范围：品位 {fretMin} – {fretMax}（共 {fretMax - fretMin + 1} 格）
        </div>
      </Row>

      {/* String selection */}
      <Row label="弦选择" isDark={isDark}>
        <div style={{ display:'flex', gap:8 }}>
          {STRING_NAMES.map((s,i) => {
            const act = strings[i];
            return (
              <motion.button
                key={i}
                onClick={() => toggleString(i)}
                whileTap={{ scale: 0.88 }}
                transition={SPRINGS_IV.buttonPress}
                style={{
                  flex:1, height:44, borderRadius:10, cursor:'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize:11, fontWeight: act ? 600 : 400, color: act ? titleC : (isDark ? 'rgba(235,235,245,0.30)' : 'rgba(0,0,0,0.30)'), fontFamily:FONT_MONO }}>
                  {s}
                </span>
              </motion.button>
            );
          })}
        </div>
      </Row>
    </L3EditorShell>
  );
}
