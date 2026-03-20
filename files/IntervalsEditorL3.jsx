// components/intervals/l3/IntervalsEditorL3.jsx  — Batch D
// 完整 Intervals 设置：11 音程完整多选 + 预设管理
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { DT, FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';
import { INTERVAL_LABELS } from '../../../constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');
const INTERVAL_SUBLABELS = {
  'b2':'小2','2':'大2','b3':'小3','3':'大3','4':'纯4',
  'b5':'减5','5':'纯5','b6':'小6','6':'大6','b7':'小7','7':'大7',
};
const BUILT_IN_PRESETS = [
  { id:'all',     label:'All 11',     intervals: ALL_INTERVALS },
  { id:'triad',   label:'Triad',      intervals: ['3','5'] },
  { id:'seventh', label:'7th Chord',  intervals: ['3','5','b7'] },
  { id:'guide',   label:'Guide Tones',intervals: ['3','b7'] },
];

export function IntervalsEditorL3({ isOpen, onClose, selectedIntervals, onIntervalsChange }) {
  const isDark = useIsDark();
  const [sel, setSel] = useState(selectedIntervals?.length === 0 ? ALL_INTERVALS : (selectedIntervals ?? ALL_INTERVALS));

  const titleC = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.34)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const toggle = (ivl) => setSel(prev =>
    prev.includes(ivl)
      ? (prev.length === 1 ? prev : prev.filter(i => i !== ivl))
      : [...prev, ivl]
  );

  const applyPreset = (p) => setSel(p.intervals);

  return (
    <L3EditorShell isOpen={isOpen} title="Intervals" onClose={onClose} onApply={() => {
      const final = sel.length === ALL_INTERVALS.length ? [] : sel;
      onIntervalsChange?.(final);
    }}>
      {/* Built-in presets */}
      <div style={{ paddingBottom:16, borderBottom:`0.5px solid ${line}`, marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:600, color:mutedC, fontFamily:FONT_TEXT, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>快捷预设</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {BUILT_IN_PRESETS.map(p => {
            const act = JSON.stringify([...p.intervals].sort()) === JSON.stringify([...sel].sort());
            return (
              <motion.button key={p.id} onClick={() => applyPreset(p)} whileTap={{ scale:0.92 }}
                style={{
                  padding:'5px 14px', borderRadius:18,
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
                  cursor:'pointer',
                }}>
                <span style={{ fontSize:12, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily:FONT_TEXT }}>{p.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Full 11 toggle grid */}
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:mutedC, fontFamily:FONT_TEXT, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>
          自定义（{sel.length} / 11）
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
          {ALL_INTERVALS.map((ivl, idx) => {
            const active = sel.includes(ivl);
            return (
              <motion.button
                key={ivl}
                onClick={() => toggle(ivl)}
                initial={{ opacity:0, y:6 }}
                animate={{ opacity:1, y:0 }}
                transition={{ ...SPRINGS_IV.contentSwap, delay: idx * 0.03 }}
                whileTap={{ scale:0.90 }}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  padding:'11px 6px', borderRadius:12, cursor:'pointer',
                  background: active ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${active ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize:15, fontWeight: active ? 600 : 400, color: active ? titleC : mutedC, fontFamily:FONT_MONO }}>{ivl}</span>
                <span style={{ fontSize:9, color:isDark ? 'rgba(235,235,245,0.28)' : 'rgba(0,0,0,0.26)', fontFamily:FONT_TEXT, marginTop:3 }}>{INTERVAL_SUBLABELS[ivl]}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </L3EditorShell>
  );
}
