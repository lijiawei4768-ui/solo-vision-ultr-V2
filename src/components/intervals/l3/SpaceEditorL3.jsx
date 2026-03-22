// components/intervals/l3/SpaceEditorL3.jsx
// Fix 4: L3 深度补强
//   新增：品位锁定模式、位置步进控制、高级视口选项

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT, FONT_MONO } from '../../../theme';
import { L3EditorShell } from './L3EditorShell';
import { SPRINGS_IV } from '../../../motion/springs';

const STRING_NAMES = ['E2','A2','D3','G3','B3','e4'];
function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

function Section({ label, isDark, children }) {
  const labelC = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const line   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <div style={{ paddingBottom: 22, borderBottom: `0.5px solid ${line}`, marginBottom: 22 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: labelC,
        fontFamily: FONT_TEXT, textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 14,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, isDark }) {
  const titleC = isDark ? 'rgba(235,235,245,0.84)' : 'rgba(0,0,0,0.80)';
  const subC   = isDark ? 'rgba(235,235,245,0.36)' : 'rgba(0,0,0,0.36)';
  const trackOn  = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)';
  const trackOff = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 0',
    }}>
      <div>
        <div style={{ fontSize: 14, color: titleC, fontFamily: FONT_TEXT }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: subC, fontFamily: FONT_TEXT, marginTop: 2 }}>{sub}</div>}
      </div>
      <motion.div
        onClick={() => onChange(!value)}
        animate={{ background: value ? trackOn : trackOff }}
        style={{
          width: 44, height: 26, borderRadius: 13,
          position: 'relative', cursor: 'pointer', flexShrink: 0,
          border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
        }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 480, damping: 28 }}
          style={{
            position: 'absolute', top: 3, width: 20, height: 20,
            borderRadius: 10,
            background: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.65)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </motion.div>
    </div>
  );
}

export function SpaceEditorL3({ isOpen, onClose, spaceSettings, onSpaceSettings }) {
  const isDark = useIsDark();
  const [fretMin,      setFretMin]     = useState(spaceSettings?.fretRange?.min ?? 0);
  const [fretMax,      setFretMax]     = useState(spaceSettings?.fretRange?.max ?? 12);
  const [strings,      setStrings]     = useState(
    spaceSettings?.strings ?? [true,true,true,true,true,true]
  );
  // 新增状态
  const [posLock,      setPosLock]     = useState(false);   // 位置锁定
  const [posStep,      setPosStep]     = useState(1);        // 位置步进
  const [linkedView,   setLinkedView]  = useState(true);    // 视口跟随根音
  const [octaveLimit,  setOctaveLimit] = useState(false);   // 限单八度

  const titleC   = isDark ? 'rgba(235,235,245,0.88)' : 'rgba(0,0,0,0.82)';
  const mutedC   = isDark ? 'rgba(235,235,245,0.38)' : 'rgba(0,0,0,0.36)';
  const sliderBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const line     = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const toggleString = (i) => setStrings(prev => prev.map((v, j) => j === i ? !v : v));

  const apply = () => onSpaceSettings?.({
    fretRange: { min: fretMin, max: fretMax },
    strings,
    positionLock: posLock,
    positionStep: posStep,
    linkedViewport: linkedView,
    octaveLimit,
  });

  return (
    <L3EditorShell isOpen={isOpen} title="Space 音域" onClose={onClose} onApply={apply}>

      {/* 品位范围 */}
      <Section label="品位范围" isDark={isDark}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: titleC, fontFamily: FONT_MONO, minWidth: 28, textAlign: 'center' }}>
            {fretMin}
          </span>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ height: 3, background: sliderBg, borderRadius: 2, position: 'relative' }}>
              <div style={{
                position: 'absolute', left: `${(fretMin/12)*100}%`, right: `${((12-fretMax)/12)*100}%`,
                height: '100%', background: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.25)',
                borderRadius: 2,
              }} />
            </div>
            <input type="range" min={0} max={11} value={fretMin}
              onChange={e => { const v = +e.target.value; if (v < fretMax) setFretMin(v); }}
              style={{ position: 'absolute', inset: '-8px 0', opacity: 0, cursor: 'pointer', width: '100%' }}
            />
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: titleC, fontFamily: FONT_MONO, minWidth: 28, textAlign: 'center' }}>
            {fretMax}
          </span>
        </div>
        <input type="range" min={1} max={12} value={fretMax}
          onChange={e => { const v = +e.target.value; if (v > fretMin) setFretMax(v); }}
          style={{ width: '100%', height: 3, appearance: 'none', WebkitAppearance: 'none', background: sliderBg, borderRadius: 2, cursor: 'pointer' }}
        />
        <div style={{ fontSize: 11, color: mutedC, fontFamily: FONT_TEXT, marginTop: 8 }}>
          品位 {fretMin} – {fretMax}（共 {fretMax - fretMin + 1} 格）
        </div>
      </Section>

      {/* 弦选择 */}
      <Section label="弦选择" isDark={isDark}>
        <div style={{ display: 'flex', gap: 7 }}>
          {STRING_NAMES.map((s, i) => {
            const act = strings[i];
            return (
              <motion.button
                key={i}
                onClick={() => toggleString(i)}
                whileTap={{ scale: 0.88 }}
                style={{
                  flex: 1, height: 46, borderRadius: 11, cursor: 'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily: FONT_MONO }}>{s}</span>
                <span style={{ fontSize: 8, color: act ? mutedC : isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)', fontFamily: FONT_TEXT }}>
                  {['6','5','4','3','2','1'][i]}弦
                </span>
              </motion.button>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: mutedC, fontFamily: FONT_TEXT }}>
          已启用：{strings.filter(Boolean).length} 条弦
        </div>
      </Section>

      {/* 位置步进 */}
      <Section label="位置步进" isDark={isDark}>
        <div style={{ fontSize: 12, color: mutedC, fontFamily: FONT_TEXT, marginBottom: 12 }}>
          每次换题时，根音位置移动的步数
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const act = posStep === n;
            return (
              <motion.button key={n} onClick={() => setPosStep(n)} whileTap={{ scale: 0.88 }}
                style={{
                  flex: 1, height: 44, borderRadius: 11, cursor: 'pointer',
                  background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  border: `0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: act ? 600 : 400, color: act ? titleC : mutedC, fontFamily: FONT_MONO }}>
                  {n === 1 ? '1' : `+${n}`}
                </span>
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* 高级选项 */}
      <Section label="高级" isDark={isDark}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: `0.5px solid ${line}` }}>
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="视口跟随根音"
              sub="换题时自动对准根音所在品位"
              value={linkedView} onChange={setLinkedView} isDark={isDark}
            />
          </div>
          <div style={{ height: '0.5px', background: line, margin: '0 14px' }} />
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="位置锁定"
              sub="固定品位起点，不随题目变化"
              value={posLock} onChange={setPosLock} isDark={isDark}
            />
          </div>
          <div style={{ height: '0.5px', background: line, margin: '0 14px' }} />
          <div style={{ padding: '0 14px' }}>
            <ToggleRow
              label="限制单八度内"
              sub="根音与目标音程差不超过 12 品"
              value={octaveLimit} onChange={setOctaveLimit} isDark={isDark}
            />
          </div>
        </div>
      </Section>

    </L3EditorShell>
  );
}
