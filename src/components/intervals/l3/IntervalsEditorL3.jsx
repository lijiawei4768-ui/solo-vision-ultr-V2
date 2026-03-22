// components/intervals/l3/IntervalsEditorL3.jsx
// 深度补强：新增难度档位、识别方向、答题时限、音程分组显示

import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';
import { INTERVAL_LABELS } from '../../../constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');

const INTERVAL_META = {
  'b2': { name:'小二度', semitones:1,  group:'半音'   },
  '2':  { name:'大二度', semitones:2,  group:'全音'   },
  'b3': { name:'小三度', semitones:3,  group:'三度'   },
  '3':  { name:'大三度', semitones:4,  group:'三度'   },
  '4':  { name:'纯四度', semitones:5,  group:'四五度' },
  'b5': { name:'减五度', semitones:6,  group:'三全音' },
  '5':  { name:'纯五度', semitones:7,  group:'四五度' },
  'b6': { name:'小六度', semitones:8,  group:'六度'   },
  '6':  { name:'大六度', semitones:9,  group:'六度'   },
  'b7': { name:'小七度', semitones:10, group:'七度'   },
  '7':  { name:'大七度', semitones:11, group:'七度'   },
};

const BUILT_IN_PRESETS = [
  { id:'all',     label:'All 11',      intervals: ALL_INTERVALS },
  { id:'triad',   label:'Triad',        intervals: ['3','5'] },
  { id:'seventh', label:'7th Chord',    intervals: ['3','5','b7'] },
  { id:'guide',   label:'Guide Tones',  intervals: ['3','b7'] },
  { id:'half',    label:'近音程',        intervals: ['b2','2','b3'] },
  { id:'wide',    label:'宽音程',        intervals: ['5','b6','6','b7','7'] },
];

function Section({ label, isDark, children, noBorder }) {
  const labelC = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.34)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div style={{
      paddingBottom: noBorder ? 0 : 20,
      borderBottom: noBorder ? 'none' : `0.5px solid ${line}`,
      marginBottom: noBorder ? 0 : 22,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: labelC, fontFamily: FONT_TEXT,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, isDark }) {
  const titleC  = isDark ? 'rgba(235,235,245,0.84)' : 'rgba(0,0,0,0.80)';
  const subC    = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.36)';
  const trackOn = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.20)';
  const trackOff= isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0' }}>
      <div>
        <div style={{ fontSize:14, color:titleC, fontFamily:FONT_TEXT }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:subC, fontFamily:FONT_TEXT, marginTop:2 }}>{sub}</div>}
      </div>
      <motion.div onClick={() => onChange(!value)}
        animate={{ background: value ? trackOn : trackOff }}
        style={{
          width:44, height:26, borderRadius:13, position:'relative', cursor:'pointer', flexShrink:0,
          border:`0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
        }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type:'spring', stiffness:480, damping:28 }}
          style={{
            position:'absolute', top:3, width:20, height:20, borderRadius:10,
            background: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.65)',
            boxShadow:'0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </motion.div>
    </div>
  );
}

export function IntervalsEditorL3({ isOpen, onClose, selectedIntervals, onIntervalsChange }) {
  const isDark = useIsDark();

  const [sel,          setSel]         = useState(selectedIntervals?.length === 0 ? ALL_INTERVALS : (selectedIntervals ?? ALL_INTERVALS));
  const [difficulty,   setDifficulty]  = useState('normal');  // easy / normal / hard
  const [direction,    setDirection]   = useState('both');     // ascending / descending / both
  const [timeLimit,    setTimeLimit]   = useState(0);          // 0 = 无限制, 秒数
  const [showSemitone, setShowSemitone]= useState(false);      // 显示半音数
  const [showName,     setShowName]    = useState(true);       // 显示中文名称
  const [confirmSel,   setConfirmSel]  = useState(false);      // 保存时二次确认

  const titleC = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const toggle = (ivl) => setSel(prev =>
    prev.includes(ivl) ? (prev.length === 1 ? prev : prev.filter(i => i !== ivl)) : [...prev, ivl]
  );

  const applyPreset = (p) => setSel(p.intervals);

  // 按 group 分组显示
  const groups = {};
  ALL_INTERVALS.forEach(ivl => {
    const g = INTERVAL_META[ivl]?.group ?? '其他';
    if (!groups[g]) groups[g] = [];
    groups[g].push(ivl);
  });

  return (
    <L3EditorShell isOpen={isOpen} title="Intervals" onClose={onClose} onApply={() => {
      const final = sel.length === ALL_INTERVALS.length ? [] : sel;
      onIntervalsChange?.(final);
    }}>

      {/* 快捷预设 */}
      <Section label={`快捷预设（已选 ${sel.length}/11）`} isDark={isDark}>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {BUILT_IN_PRESETS.map(p => {
            const act = JSON.stringify([...p.intervals].sort()) === JSON.stringify([...sel].sort());
            return (
              <motion.button key={p.id} onClick={() => applyPreset(p)} whileTap={{ scale:0.92 }}
                style={{
                  padding:'6px 14px', borderRadius:18, cursor:'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize:12, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_TEXT }}>{p.label}</span>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* 自定义选择 — 按音程组分组显示 */}
      <Section label="自定义选择" isDark={isDark}>
        {Object.entries(groups).map(([groupName, ivls]) => (
          <div key={groupName} style={{ marginBottom: 12 }}>
            <div style={{ fontSize:9, color:mutedC, fontFamily:FONT_TEXT, marginBottom:7, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              {groupName}
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {ivls.map(ivl => {
                const active = sel.includes(ivl);
                const meta   = INTERVAL_META[ivl];
                return (
                  <motion.button
                    key={ivl}
                    onClick={() => toggle(ivl)}
                    whileTap={{ scale:0.88 }}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center',
                      padding:'10px 10px', borderRadius:12, cursor:'pointer', minWidth:52,
                      background: active ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      border:`0.5px solid ${active ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                    }}
                  >
                    <span style={{ fontSize:15, fontWeight:active?600:400, color:active?titleC:mutedC, fontFamily:FONT_MONO }}>{ivl}</span>
                    {showName && (
                      <span style={{ fontSize:8, color:isDark?'rgba(235,235,245,0.26)':'rgba(0,0,0,0.24)', fontFamily:FONT_TEXT, marginTop:2 }}>
                        {meta?.name}
                      </span>
                    )}
                    {showSemitone && (
                      <span style={{ fontSize:8, color:isDark?'rgba(235,235,245,0.22)':'rgba(0,0,0,0.20)', fontFamily:FONT_MONO, marginTop:1 }}>
                        {meta?.semitones}st
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      {/* 难度档位 */}
      <Section label="难度档位" isDark={isDark}>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { id:'easy',   label:'简单', sub:'较慢节奏' },
            { id:'normal', label:'正常', sub:'标准节奏' },
            { id:'hard',   label:'困难', sub:'限时作答' },
          ].map(d => {
            const act = difficulty === d.id;
            return (
              <motion.button key={d.id} onClick={() => setDifficulty(d.id)} whileTap={{ scale:0.90 }}
                style={{
                  flex:1, padding:'11px 6px', borderRadius:12, cursor:'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                }}
              >
                <span style={{ fontSize:13, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_TEXT }}>{d.label}</span>
                <span style={{ fontSize:9, color:mutedC, fontFamily:FONT_TEXT }}>{d.sub}</span>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* 识别方向 */}
      <Section label="识别方向" isDark={isDark}>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { id:'ascending',  label:'上行', sub:'低→高' },
            { id:'descending', label:'下行', sub:'高→低' },
            { id:'both',       label:'双向', sub:'随机' },
          ].map(d => {
            const act = direction === d.id;
            return (
              <motion.button key={d.id} onClick={() => setDirection(d.id)} whileTap={{ scale:0.90 }}
                style={{
                  flex:1, padding:'11px 6px', borderRadius:12, cursor:'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                }}
              >
                <span style={{ fontSize:13, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_TEXT }}>{d.label}</span>
                <span style={{ fontSize:9, color:mutedC, fontFamily:FONT_TEXT }}>{d.sub}</span>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* 答题时限 */}
      <Section label="答题时限" isDark={isDark}>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {[0, 3, 5, 8, 10, 15].map(t => {
            const act = timeLimit === t;
            return (
              <motion.button key={t} onClick={() => setTimeLimit(t)} whileTap={{ scale:0.88 }}
                style={{
                  padding:'7px 14px', borderRadius:11, cursor:'pointer', flexShrink:0,
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize:13, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_MONO }}>
                  {t === 0 ? '无限' : `${t}s`}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div style={{ fontSize:11, color:mutedC, fontFamily:FONT_TEXT, marginTop:8 }}>
          {timeLimit === 0 ? '不限制作答时间' : `每题限 ${timeLimit} 秒，超时算错`}
        </div>
      </Section>

      {/* 显示偏好 */}
      <Section label="显示偏好" isDark={isDark} noBorder>
        <div style={{ borderRadius:12, overflow:'hidden', border:`0.5px solid ${line}` }}>
          <div style={{ padding:'0 14px' }}>
            <ToggleRow label="显示中文名称" sub="题目下方显示音程中文名" value={showName} onChange={setShowName} isDark={isDark} />
          </div>
          <div style={{ height:'0.5px', background:line, margin:'0 14px' }} />
          <div style={{ padding:'0 14px' }}>
            <ToggleRow label="显示半音数" sub="标注音程的半音数量" value={showSemitone} onChange={setShowSemitone} isDark={isDark} />
          </div>
        </div>
      </Section>

    </L3EditorShell>
  );
}
