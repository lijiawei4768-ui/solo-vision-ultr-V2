// components/intervals/l2/IntervalsEditorL2.jsx  — v2 uses L2Overlay
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence }     from 'framer-motion';
import { ThemeContext }                from '../../../contexts';
import { FONT_TEXT, FONT_MONO }        from '../../../theme';
import { SPRINGS_IV }                  from '../../../motion/springs';
import { INTERVAL_LABELS }             from '../../../constants';
import { INTERVAL_PRESETS }            from '../../../trainers/intervals/constants';
import { L2Overlay }                   from './L2Overlay';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');
const SUBLABELS = { 'b2':'小2','2':'大2','b3':'小3','3':'大3','4':'纯4','b5':'减5','5':'纯5','b6':'小6','6':'大6','b7':'小7','7':'大7' };

function IntervalsContent({ intervalsPreset, selectedIntervals, onPresetChange, onToggleInterval, isDark }) {
  const isCustom = intervalsPreset === 'custom';
  const titleC   = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const mutedC   = isDark ? 'rgba(235,235,245,0.34)' : 'rgba(0,0,0,0.32)';

  return (
    <div>
      {/* Preset capsules */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
        {INTERVAL_PRESETS.map(p => {
          const act = intervalsPreset === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => onPresetChange?.(p.id)}
              whileTap={{ scale:0.90 }}
              transition={SPRINGS_IV.capsuleSelect}
              style={{
                padding:'5px 13px', borderRadius:18, cursor:'pointer',
                background: act ? (isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')}`,
              }}
            >
              <span style={{ fontSize:12, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_TEXT }}>{p.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Custom grid — stagger in */}
      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
              {ALL_INTERVALS.map((ivl, idx) => {
                const act = !selectedIntervals || selectedIntervals.length===0 || selectedIntervals.includes(ivl);
                return (
                  <motion.button
                    key={ivl}
                    initial={{ opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ ...SPRINGS_IV.contentSwap, delay: idx*0.04 }}
                    onClick={() => onToggleInterval?.(ivl)}
                    whileTap={{ scale:0.90 }}
                    style={{
                      padding:'9px 4px', borderRadius:11, cursor:'pointer',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                      background: act ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      border:`0.5px solid ${act ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                    }}
                  >
                    <span style={{ fontSize:14, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_MONO }}>{ivl}</span>
                    <span style={{ fontSize:8.5, color:mutedC, fontFamily:FONT_TEXT }}>{SUBLABELS[ivl]}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IntervalsEditorL2({ isOpen, onClose, intervalsPreset, selectedIntervals, onPresetChange, onToggleInterval, onOpenL3 }) {
  return (
    <L2Overlay isOpen={isOpen} onClose={onClose} title="Intervals" onDeepDive={onOpenL3}>
      <IntervalsContent
        intervalsPreset={intervalsPreset}
        selectedIntervals={selectedIntervals}
        onPresetChange={onPresetChange}
        onToggleInterval={onToggleInterval}
        isDark={useIsDark()}
      />
    </L2Overlay>
  );
}

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }
