
// ─────────────────────────────────────────────────────────────
// src/hooks/useAudioEngine.js  — v3.0 (Median Stabilization)
//
// v3.0 变更（T1）：
//   • 稳定窗口升级：2帧 → 中位数 + 3帧验证（减少误识别抖动）
//   • 新增 medianFreq() 辅助函数：5帧滑动窗口取中位数
//   • freqBuffer 循环缓冲区：最近 5 帧频率，中位数对抗瞬间噪声
//
// v2.0 变更（保留）：
//   • hybridDetect()（ACF + YIN 双引擎），修复 E2/A2 弦识别失败
//   • FFT_SIZE = 2048，满足 E2(82Hz) 最低要求
//
// External API: UNCHANGED — 对所有 Trainer 完全向后兼容。
//   onPitchDetected: (freq: Hz, rms: number) => void
//
// Pipeline (v3.0):
//   Raw buffer → YIN → hybridDetect → 5帧中位数 → GuitarModeEngine → isStable
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { audioCore }                        from '../engine/AudioCore';
import { yinDetect, computeRMS }            from '../engine/YinDetector';
import { GuitarModeEngine, GUITAR_STRINGS } from '../engine/GuitarModeEngine';
import { hybridDetect }                     from '../engine/AcfDetector';
import {
  loadCalibrationProfile,
  defaultCalibrationProfile,
} from './CalibrationProfile';

const FFT_SIZE = 2048;   // ≥ 2048 为 YIN 检测 E2(82Hz) 的最低要求
const MEDIAN_WIN  = 5;   // 中位数滑动窗口大小（帧数）
const CONFIRM_WIN = 3;   // 连续确认帧数（中位数吻合才触发）

/** 5帧滑动窗口取中位数频率，对抗瞬间噪声尖峰 */
function medianFreq(buf) {
  const valid = buf.filter(f => f > 0);
  if (valid.length < 2) return valid[0] ?? 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** GuitarModeResult → Hz（向后兼容 Trainer 的 onPitchDetected 签名）*/
function resultToFreq(result) {
  const base = GUITAR_STRINGS[result.stringName];
  return base * Math.pow(2, result.cents / 1200);
}

export function useAudioEngine({ onPitchDetected, enabled = false }) {
  // 稳定回调引用——避免重新订阅检测循环
  const cbRef    = useRef(onPitchDetected);
  useEffect(() => { cbRef.current = onPitchDetected; });

  const rafRef        = useRef(null);
  const bufRef        = useRef(new Float32Array(FFT_SIZE));
  const frameRef      = useRef(0);
  const freqBufRef    = useRef(new Array(MEDIAN_WIN).fill(0)); // 中位数窗口
  const confirmRef    = useRef(0);  // 连续确认帧计数

  // GuitarModeEngine — 每次 hook 生命周期创建一次
  // 加载已保存的校准 profile，noiseFloor + 弦偏移从第一帧起生效
  const profileRef = useRef(null);
  const engineRef  = useRef(null);
  if (!engineRef.current) {
    profileRef.current = loadCalibrationProfile() ?? defaultCalibrationProfile();
    engineRef.current  = new GuitarModeEngine(profileRef.current);
  }

  const [rms,       setRms]       = useState(0);
  const [listening, setListening] = useState(false);
  const [error,     setError]     = useState(null);

  // ── start ─────────────────────────────────────────────────────
  const start = async () => {
    try {
      await audioCore.start({ fftSize: FFT_SIZE });
      setListening(true);
      setError(null);
    } catch (e) {
      setError(e.message || 'Microphone access denied');
    }
  };

  // ── stop ──────────────────────────────────────────────────────
  const stop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    audioCore.stop();
    engineRef.current.reset();
    setListening(false);
    setRms(0);
  };

  // ── detection loop ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;

    start().then(() => {
      if (cancelled) return;

      const sampleRate = audioCore.sampleRate ?? 44100;

      function tick() {
        if (cancelled) return;
        rafRef.current = requestAnimationFrame(tick);

        const analyser = audioCore.analyser;
        if (!analyser) return;

        analyser.getFloatTimeDomainData(bufRef.current);
        const currentRms = computeRMS(bufRef.current);

        // 每 3 帧更新一次 RMS 显示（节省渲染开销）
        if (frameRef.current++ % 3 === 0) setRms(currentRms);

        // ── v2.0 核心改动：混合检测 ─────────────────────────
        // Step 1: YIN 检测（现有引擎）
        const yinFreq = yinDetect(bufRef.current, sampleRate);

        // Step 2: ACF 混合验证
        //   - < 150 Hz（E2/A2 范围）：ACF 交叉验证 + 倍频纠正
        //   - ≥ 150 Hz：直接使用 YIN，不额外消耗 CPU
        const finalFreq = hybridDetect(bufRef.current, sampleRate, yinFreq > 0 ? yinFreq : null);

        // Step 3: GuitarModeEngine（弦匹配、倍频纠正、锁定窗口、校准偏移）
        const result = engineRef.current.process(
          finalFreq ?? -1,
          currentRms,
          performance.now()
        );

        // Step 4: 中位数滑动窗口 + 连续 CONFIRM_WIN 帧确认
        if (finalFreq > 0) {
          freqBufRef.current.push(finalFreq);
          if (freqBufRef.current.length > MEDIAN_WIN) freqBufRef.current.shift();
        }
        const mFreq = medianFreq(freqBufRef.current);
        const resultM = mFreq > 0
          ? engineRef.current.process(mFreq, currentRms, performance.now())
          : null;

        if (resultM?.isStable) {
          confirmRef.current++;
          if (confirmRef.current >= CONFIRM_WIN) {
            cbRef.current?.(resultToFreq(resultM), currentRms);
            confirmRef.current = 0;
          }
        } else if (result?.isStable && !resultM) {
          // 降级：中位数引擎无输出时回退到原始引擎
          cbRef.current?.(resultToFreq(result), currentRms);
          confirmRef.current = 0;
        } else {
          confirmRef.current = Math.max(0, confirmRef.current - 1);
        }
      }

      tick();
    });

    return () => {
      cancelled = true;
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { rms, listening, error };
}