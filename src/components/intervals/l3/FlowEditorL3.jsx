// components/intervals/l3/FlowEditorL3.jsx
// Fix 4: L3 深度补强 — 新增 BPM、复音罚则、方向锁、节奏细分

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';
import { FLOW_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

function Section({ label, isDark, children }) {
  const labelC = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div style={{ paddingBottom: 22, borderBottom: `0.5px solid ${line}`, marginBottom: 22 }}>
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
  const trackOn = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)';
  const trackOff= isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0' }}>
      <div>
        <div style={{ fontSize: 14, color: titleC, fontFamily: FONT_TEXT }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: subC, fontFamily: FONT_TEXT, marginTop: 2 }}>{sub}</div>}
      </div>
      <motion.div
        onClick={() => onChange(!value)}
        animate={{ background: value ? trackOn : trackOff }}
        style={{
          width: 44, height: 26, borderRadius: 13, position: 'relative',
          cursor: 'pointer', flexShrink: 0,
          border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
        }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 480, damping: 28 }}
          style={{
            position: 'absolute', top: 3, width: 20, height: 20, borderRadius: 10,
            background: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.65)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </motion.div>
    </div>
  );
}

export function FlowEditorL3({ isOpen, onClose, flowPreset, positionsPerString, onFlowSettings }) {
  const isDark = useIsDark();
  const [order,         setOrder]        = useState(flowPreset ?? 'free');
  const [pps,           setPps]          = useState(positionsPerString ?? 3);
  const [bpm,           setBpm]          = useState(0);    // 0 = 不限速
  const [repeatPenalty, setRepeatPenalty]= useState(true); // 避免重复上一题
  const [dirLock,       setDirLock]      = useState(false);// 锁定方向
  const [groupByString, setGroupByString]= useState(false);// 按弦分组

  const titleC   = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC   = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const line     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';

  const BPM_VALS = [0, 40, 60, 80, 100, 120];

  return (
    <L3EditorShell isOpen={isOpen} title="Flow 节奏" onClose={onClose}
      onApply={() => onFlowSettings?.({ order, positionsPerString: pps, bpm, repeatPenalty, directionLock: dirLock, groupByString })}
    >

      {/* 顺序模式 */}
      <Section label="顺序模式" isDark={isDark}>
        {FLOW_PRESETS.map(p => {
          const act = order === p.id;
          return (
            <motion.div key={p.id} onClick={() => setOrder(p.id)} whileTap={{ opacity: 0.7 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 12, marginBottom: 7, cursor: 'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily: FONT_TEXT }}>{p.label}</div>
                <div style={{ fontSize: 11, color: mutedC, fontFamily: FONT_TEXT, marginTop: 2 }}>{p.summary}</div>
              </div>
              {act && (
                <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3.5 3.5 5.5-7" stroke={isDark ? 'rgba(235,235,245,0.65)' : 'rgba(0,0,0,0.50)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.div>
          );
        })}
      </Section>

      {/* 每弦题数 */}
      <Section label="每弦题数" isDark={isDark}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: titleC, fontFamily: FONT_MONO, minWidth: 36 }}>{pps}</span>
          <input type="range" min={1} max={10} value={pps}
            onChange={e => setPps(+e.target.value)}
            style={{ flex: 1, height: 3, appearance: 'none', WebkitAppearance: 'none', background: sliderBg, borderRadius: 2, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, color: mutedC, fontFamily: FONT_MONO }}>10</span>
        </div>
        <div style={{ fontSize: 11, color: mutedC, fontFamily: FONT_TEXT, marginTop: 8 }}>
          每条弦练习 {pps} 道题后换弦
        </div>
      </Section>

      {/* BPM 节拍控制 */}
      <Section label="节拍速度 BPM" isDark={isDark}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {BPM_VALS.map(v => {
            const act = bpm === v;
            return (
              <motion.button key={v} onClick={() => setBpm(v)} whileTap={{ scale: 0.88 }}
                style={{
                  padding: '7px 14px', borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily: FONT_MONO }}>
                  {v === 0 ? '自由' : v}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: mutedC, fontFamily: FONT_TEXT, marginTop: 8 }}>
          {bpm === 0 ? '不限速，自由作答' : `${bpm} BPM — 每拍显示新题`}
        </div>
      </Section>

      {/* 高级选项 */}
      <Section label="高级规则" isDark={isDark}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: `0.5px solid ${line}` }}>
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="避免重复上题"
              sub="相邻两题不出相同根音 + 音程"
              value={repeatPenalty} onChange={setRepeatPenalty} isDark={isDark}
            />
          </div>
          <div style={{ height: '0.5px', background: line, margin: '0 14px' }} />
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="按弦分组"
              sub="完成一条弦所有题目后再换弦"
              value={groupByString} onChange={setGroupByString} isDark={isDark}
            />
          </div>
          <div style={{ height: '0.5px', background: line, margin: '0 14px' }} />
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="方向锁定"
              sub="仅允许低→高或高→低单方向出题"
              value={dirLock} onChange={setDirLock} isDark={isDark}
            />
          </div>
        </div>
      </Section>

    </L3EditorShell>
  );
}
