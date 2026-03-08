// ─────────────────────────────────────────────────────────────
// src/hooks/useCalibration.js  — v2.0
//
// v2.0 (Batch 1):
//   • onMicError callback — passes getUserMedia/HTTPS errors up to UI
//     instead of crashing. PreFlightView shows a friendly bilingual
//     error card. 麦克风错误上报回调，UI 显示友好提示。
//   • retryNoise — restarts noise measurement from scratch when the
//     environment is too noisy. 噪底过高时可重试，不再自动跳过。
//   • noiseForced — true when user clicks "continue anyway" despite
//     noisy environment. Passed through to CalibrationProfile.
//     用户强制跳过噪声警告时为 true，写入校准档案。
//   • advance (on NOISE_DONE) now only advances if noiseOk OR user
//     explicitly confirmed. StepNoise controls this via onRetry /
//     onContinue split.
//     仅在噪底合格或用户确认后才自动推进，不再无条件 advance()。
//
// v1.3 (retained):
//   • Calibration YIN gate uses rec._noiseFloorRaw × 1.5.
//   • liveCents octave correction.
//   • skipString closure bug fix.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { audioCore }             from '../engine/AudioCore';
import { yinDetect, computeRMS } from '../engine/YinDetector';
import { CalibrationRecorder }   from './CalibrationProfile';
import { GUITAR_STRINGS }        from '../engine/GuitarModeEngine';

const FFT_SIZE    = 2048;
const STRING_NAMES = Object.keys(GUITAR_STRINGS);

// 噪底阈值 — 超过此值认为环境太嘈杂
// Noise threshold — above this value the room is considered too noisy
const NOISE_TOO_LOUD_THRESHOLD = 0.035;

const PHASE = {
  INTRO:          'intro',
  NOISE_SAMPLING: 'noise_sampling',
  NOISE_DONE:     'noise_done',
  STRING_CALIB:   'string_calib',
  COMPLETED:      'completed',
};

export function useCalibration({ onComplete, settings, onMicError }) {
  const recorderRef    = useRef(null);
  const rafRef         = useRef(null);
  const bufRef         = useRef(new Float32Array(FFT_SIZE));
  const phaseRef       = useRef(PHASE.INTRO);
  const onCompleteRef  = useRef(onComplete);
  const onMicErrorRef  = useRef(onMicError);
  useEffect(() => { onCompleteRef.current = onComplete; });
  useEffect(() => { onMicErrorRef.current = onMicError; });

  if (!recorderRef.current) recorderRef.current = new CalibrationRecorder();

  const [phase,          setPhase]          = useState(PHASE.INTRO);
  const [noiseProgress,  setNoiseProgress]  = useState(0);
  // noiseOk: true = clean, false = too loud
  const [noiseOk,        setNoiseOk]        = useState(false);
  // noiseForced: user clicked "continue anyway" despite bad noise floor
  const [noiseForced,    setNoiseForced]    = useState(false);
  const [currentString,  setCurrentString]  = useState(null);
  const [stringProgress, setStringProgress] = useState(0);
  const [statusMsg,      setStatusMsg]      = useState('');
  const [stringsDone,    setStringsDone]    = useState([]);
  const [liveCents,      setLiveCents]      = useState(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const tick = useCallback(() => {
    const analyser = audioCore.analyser;
    if (!analyser) { rafRef.current = requestAnimationFrame(tick); return; }

    analyser.getFloatTimeDomainData(bufRef.current);
    const rms = computeRMS(bufRef.current);
    const rec = recorderRef.current;
    const now = performance.now();

    // ── Noise sampling ─────────────────────────────────────
    if (phaseRef.current === PHASE.NOISE_SAMPLING) {
      const status = rec.feedNoise(rms, now);
      setNoiseProgress(rec.progress);
      if (status === 'noise_done') {
        // 判断是否超过噪声阈值
        const ok = rec._noiseFloorRaw < NOISE_TOO_LOUD_THRESHOLD;
        setNoiseOk(ok);
        setPhase(PHASE.NOISE_DONE);
        return; // wait for user to press Continue or Retry
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── Per-string calibration ──────────────────────────────
    if (phaseRef.current === PHASE.STRING_CALIB) {
      const rawFloor  = rec._noiseFloorRaw > 0 ? rec._noiseFloorRaw : rec._noiseFloor;
      const calibGate = rawFloor > 0 ? Math.min(rawFloor * 1.2, 0.008) : 0.003;

      const rawFreq = rms > calibGate
        ? yinDetect(bufRef.current, audioCore.sampleRate)
        : -1;

      const status = rec.feedString(rawFreq, rms, now);
      setStringProgress(rec.progress);
      setStatusMsg(rec.statusMsg);

      // Live cents display with octave correction
      if (rawFreq > 0 && rec._currentString) {
        const target = GUITAR_STRINGS[rec._currentString];
        let displayCents = 1200 * Math.log2(rawFreq / target);
        if (Math.abs(displayCents) > 120) {
          const halfCents = 1200 * Math.log2((rawFreq / 2) / target);
          if (Math.abs(halfCents) < Math.abs(displayCents)) displayCents = halfCents;
        }
        setLiveCents(Math.abs(displayCents) < 120 ? displayCents : null);
      } else {
        setLiveCents(null);
      }

      if (status === 'string_done') {
        setStringsDone(prev => [...prev, rec._currentString ?? '']);
        const nextStr = rec.nextString();
        if (nextStr) {
          setCurrentString(nextStr);
          setStringProgress(0);
          setLiveCents(null);
        }
      } else if (status === 'all_done') {
        setStringsDone(prev => [...prev, rec._currentString ?? '']);
        setPhase(PHASE.COMPLETED);
        stopLoop();
        audioCore.stop();

        const profile = rec.getProfile();
        onCompleteRef.current({
          guitarProfile: profile,
          noiseFloor:    profile?.noiseFloor ?? 0.005,
          noiseForced,   // 透传噪声强制标志
          calibratedAt:  Date.now(),
        });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop, noiseForced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start microphone + noise phase ───────────────────────
  const startNoise = useCallback(async () => {
    const rec = recorderRef.current;
    rec.startNoise(performance.now());
    setPhase(PHASE.NOISE_SAMPLING);
    setNoiseProgress(0);
    setNoiseForced(false);
    try {
      await audioCore.start({ fftSize: FFT_SIZE });
    } catch (err) {
      // 麦克风启动失败（HTTPS / 权限问题）— 上报给 UI
      console.error('useCalibration: audioCore.start failed:', err);
      onMicErrorRef.current?.(err);
      setPhase(PHASE.INTRO); // reset back to intro
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ── Retry noise measurement ───────────────────────────────
  // 重试噪底测量（环境太嘈杂时用）
  const retryNoise = useCallback(() => {
    stopLoop();
    const rec = recorderRef.current;
    rec.startNoise(performance.now());
    setPhase(PHASE.NOISE_SAMPLING);
    setNoiseProgress(0);
    setNoiseForced(false);
    // audioCore already running — just restart RAF loop
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, stopLoop]);

  // ── Advance from NOISE_DONE → STRING_CALIB ───────────────
  // Called by StepNoise "Continue" button (noiseOk OR force-continue).
  // When noiseOk is false and user clicks continue anyway, set noiseForced.
  const advanceFromNoise = useCallback((forced = false) => {
    if (forced) setNoiseForced(true);
    const rec   = recorderRef.current;
    const first = rec.nextString();
    if (!first) return;
    setCurrentString(first);
    setStringProgress(0);
    setStringsDone([]);
    setLiveCents(null);
    setStatusMsg(rec.statusMsg);
    setPhase(PHASE.STRING_CALIB);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const skip = useCallback(() => {
    stopLoop();
    audioCore.stop();
    onCompleteRef.current({ guitarProfile: null, noiseFloor: 0.005, calibratedAt: Date.now(), skipped: true });
  }, [stopLoop]);

  // ── Skip current string if stuck ─────────────────────────
  const skipString = useCallback(() => {
    const rec     = recorderRef.current;
    const skipped = rec._currentString;
    const nextStr = rec.skipCurrentString?.();

    setStringsDone(prev => skipped ? [...prev, skipped] : prev);

    if (nextStr) {
      setCurrentString(nextStr);
      setStringProgress(0);
      setLiveCents(null);
      setStatusMsg(`Skipped ${skipped} — play open ${nextStr}`);
    } else {
      setPhase(PHASE.COMPLETED);
      stopLoop();
      audioCore.stop();

      const profile = rec.getProfile();
      onCompleteRef.current({
        guitarProfile: profile,
        noiseFloor:    profile?.noiseFloor ?? 0.005,
        noiseForced,
        calibratedAt:  Date.now(),
        skipped:       true,
      });
    }
  }, [stopLoop, noiseForced]);

  useEffect(() => {
    return () => { stopLoop(); audioCore.stop(); };
  }, [stopLoop]);

  // ── Derive step number for UI ─────────────────────────────
  const step =
    phase === PHASE.INTRO         ? 0
  : phase === PHASE.NOISE_SAMPLING ||
    phase === PHASE.NOISE_DONE    ? 1
  : phase === PHASE.STRING_CALIB  ? 2
  : 3;

  // ── advance — context-aware ────────────────────────────────
  // INTRO → startNoise
  // NOISE_DONE + noiseOk → advanceFromNoise(false)
  // NOISE_DONE + !noiseOk → advanceFromNoise(true) [force-continue]
  const advance =
    phase === PHASE.INTRO      ? startNoise
  : phase === PHASE.NOISE_DONE ? () => advanceFromNoise(!noiseOk)
  : () => {};

  return {
    phase, noiseProgress, noiseOk, noiseForced,
    currentString, stringProgress, stringsDone, statusMsg,
    liveCents,
    allStringNames: STRING_NAMES,
    startNoise, retryNoise, skip, skipString,
    step,
    noiseDone:   phase === PHASE.NOISE_DONE || phase === PHASE.STRING_CALIB || phase === PHASE.COMPLETED,
    pitchLocked: phase === PHASE.COMPLETED,
    advance,
    finish: skip,
  };
}
