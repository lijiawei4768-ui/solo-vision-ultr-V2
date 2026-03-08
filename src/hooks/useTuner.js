// ─────────────────────────────────────────────────────────────
// src/hooks/useTuner.js — v1.0
//
// T16：调音器系统钩子
//   • 基于 YIN 检测，与校准系统完全独立
//   • 管理 TunerProfile（tuningStatus + intonationStatus）
//   • 处理频率 → 音名 + 八度 + cents 偏差
//   • 支持 A4 参考频率配置（默认 440 Hz）
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { audioCore }             from "../engine/AudioCore";
import { yinDetect, computeRMS } from "../engine/YinDetector";

// ── 常量 ─────────────────────────────────────────────────────
const TUNER_STORAGE_KEY = "svultra_tuner_v1";
const NOTE_NAMES        = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const STRING_NAMES      = ["E2","A2","D3","G3","B3","e4"];
const FFT_SIZE          = 2048;
const STABLE_FRAMES     = 3;   // 3帧中位数稳定窗口
const UPDATE_INTERVAL   = 50;  // cents 数字刷新最小间隔（ms）

// ── 标准调音参考频率（E标准，A4=440）─────────────────────────
const STANDARD_FREQ = {
  E2: 82.41, A2: 110.00, D3: 146.83,
  G3: 196.00, B3: 246.94, e4: 329.63,
};

// ── 默认 TunerProfile ─────────────────────────────────────────
function defaultTunerProfile() {
  const status = {};
  STRING_NAMES.forEach(s => { status[s] = { cents: null, tuned: false }; });
  return {
    tuningStatus:        status,
    allTuned:            false,
    intonationStatus:    null,
    intonationChecked:   false,
    intonationDiagnosis: "",
    referenceA4:         440,
    tunedAt:             null,
  };
}

// ── 存储 ──────────────────────────────────────────────────────
export function loadTunerProfile() {
  try {
    const raw = localStorage.getItem(TUNER_STORAGE_KEY);
    if (!raw) return defaultTunerProfile();
    return { ...defaultTunerProfile(), ...JSON.parse(raw) };
  } catch { return defaultTunerProfile(); }
}

export function saveTunerProfile(p) {
  try { localStorage.setItem(TUNER_STORAGE_KEY, JSON.stringify(p)); } catch {}
}

// ── 频率 → 音名 + 八度 + cents ────────────────────────────────
export function freqToNote(freq, refA4 = 440) {
  if (!freq || freq <= 0) return null;
  const semitones = 12 * Math.log2(freq / refA4) + 69; // MIDI note number
  const rounded   = Math.round(semitones);
  const cents     = Math.round((semitones - rounded) * 100);
  const octave    = Math.floor(rounded / 12) - 1;
  const name      = NOTE_NAMES[((rounded % 12) + 12) % 12];
  return { name, octave, noteStr: `${name}${octave}`, cents, freq };
}

// ── 识别当前弹奏的是哪根弦 ────────────────────────────────────
export function detectString(freq, refA4 = 440) {
  if (!freq || freq <= 0) return null;
  let closest = null, minDist = Infinity;
  STRING_NAMES.forEach(s => {
    const ref  = STANDARD_FREQ[s];
    const dist = Math.abs(1200 * Math.log2(freq / ref));
    if (dist < minDist) { minDist = dist; closest = s; }
  });
  // 只有在 ±70 cents 范围内才认为是该弦
  return minDist < 70 ? closest : null;
}

// ── 中位数频率 ────────────────────────────────────────────────
function medianFreq(buf) {
  const valid = buf.filter(f => f > 0);
  if (!valid.length) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[m - 1] + sorted[m]) / 2 : sorted[m];
}

// ── 八度检测诊断 ──────────────────────────────────────────────
export function generateDiagnosis(intonation) {
  if (!intonation) return "";
  const fret12Devs = STRING_NAMES.map(s => intonation[s]?.fret12 ?? 0);
  const highCount  = fret12Devs.filter(c => c > 10).length;
  const veryHigh   = fret12Devs.filter(c => c > 20).length;
  const allGood    = fret12Devs.every(c => Math.abs(c) <= 8);

  if (allGood)      return "八度准确度良好，可以开始校准";
  if (veryHigh > 2) return "多根弦12品明显偏高，建议更换新弦";
  if (highCount > 3) return "多根弦12品偏高，弦可能老化，建议更换新弦";
  return "个别弦八度偏差较大，可咨询乐器维修";
}

// ── 主 Hook ───────────────────────────────────────────────────
export function useTuner({ enabled = false, referenceA4 = 440 } = {}) {
  const [profile,    setProfile]    = useState(loadTunerProfile);
  const [current,    setCurrent]    = useState(null);  // { name, octave, noteStr, cents, freq }
  const [listening,  setListening]  = useState(false);
  const [error,      setError]      = useState(null);

  const rafRef        = useRef(null);
  const bufRef        = useRef(new Float32Array(FFT_SIZE));
  const freqWinRef    = useRef([]);          // STABLE_FRAMES 帧窗口
  const lastUpdateRef = useRef(0);
  const profileRef    = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // ── 标记某弦为已调准 ─────────────────────────────────────────
  const markStringTuned = useCallback((stringName, cents) => {
    setProfile(prev => {
      const next = {
        ...prev,
        tuningStatus: {
          ...prev.tuningStatus,
          [stringName]: { cents, tuned: Math.abs(cents) <= 5 },
        },
      };
      next.allTuned = STRING_NAMES.every(s => next.tuningStatus[s]?.tuned);
      if (next.allTuned) next.tunedAt = Date.now();
      saveTunerProfile(next);
      return next;
    });
  }, []);

  // ── 保存八度检测结果 ──────────────────────────────────────────
  const saveIntonation = useCallback((intonation) => {
    setProfile(prev => {
      const diagnosis = generateDiagnosis(intonation);
      const next = {
        ...prev,
        intonationStatus:  intonation,
        intonationChecked: true,
        intonationDiagnosis: diagnosis,
      };
      saveTunerProfile(next);
      return next;
    });
  }, []);

  // ── 重置调音状态 ──────────────────────────────────────────────
  const resetTuning = useCallback(() => {
    const fresh = defaultTunerProfile();
    setProfile(fresh);
    saveTunerProfile(fresh);
  }, []);

  // ── 音频检测循环 ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCore.stop();
      setListening(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await audioCore.start({ fftSize: FFT_SIZE });
        if (cancelled) return;
        setListening(true);
        setError(null);
        const sampleRate = audioCore.sampleRate ?? 44100;

        function tick() {
          if (cancelled) return;
          rafRef.current = requestAnimationFrame(tick);
          const analyser = audioCore.analyser;
          if (!analyser) return;

          analyser.getFloatTimeDomainData(bufRef.current);
          const rms = computeRMS(bufRef.current);
          if (rms < 0.005) return; // 静音不处理

          const rawFreq = yinDetect(bufRef.current, sampleRate);
          if (rawFreq > 0) {
            freqWinRef.current.push(rawFreq);
            if (freqWinRef.current.length > STABLE_FRAMES) freqWinRef.current.shift();
          }

          const now = performance.now();
          if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;
          lastUpdateRef.current = now;

          const stableFreq = medianFreq(freqWinRef.current);
          if (stableFreq <= 0) return;

          const note = freqToNote(stableFreq, referenceA4);
          if (!note) return;

          setCurrent(note);

          // 如果识别到标准弦，更新调音状态
          const str = detectString(stableFreq, referenceA4);
          if (str) markStringTuned(str, note.cents);
        }

        tick();
      } catch (e) {
        if (!cancelled) setError(e.message || "Microphone access denied");
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCore.stop();
      setListening(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, referenceA4]);

  return {
    current,       // 当前检测到的音符信息
    profile,       // TunerProfile
    listening,
    error,
    markStringTuned,
    saveIntonation,
    resetTuning,
  };
}

// ---
// TUNER.1.0 — 2026-03-05
//
// Added:
// - useTuner hook：YIN 检测 + 3帧中位数稳定窗口
// - freqToNote()：频率 → 音名 + 八度 + cents 偏差
// - detectString()：识别当前演奏的是哪根弦（±70c 范围）
// - loadTunerProfile / saveTunerProfile：localStorage 持久化
// - generateDiagnosis()：八度检测自动诊断文字
// - markStringTuned()：单弦调准标记
// - saveIntonation()：八度检测结果保存
//
// Fixed:
// - N/A（新文件）
//
// Pending:
// - referenceA4 设置界面入口（待加入 Settings）
// - 八度检测模式的交互式逐弦检测流程（在 TunerView 中实现）
// ---
