// ─────────────────────────────────────────────────────────────
// useProgressSystem v5.0 — Solo Vision Progress Tracking
//
// v5.0 变化：
//   • 移除强制等级锁定 (levels are suggestions, not gates)
//   • 保留完整数据分析：heatmaps, weak spots, streaks
//   • 新增 overallProgressPct (based on sessions)
//   • 完全兼容旧数据存储
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { getLevelById, getAllLevels } from "../data/curriculum";

const STORAGE_KEY = "sv_progress_v2";

const DEFAULT_PROGRESS = {
  currentStageId:      1,
  currentLevelId:      "1-1",
  unlockedLevels:      ["1-1","1-2","1-3","2-1","2-2","2-3","3-1","3-2","3-3"], // all unlocked
  streakDays:          0,
  lastPracticeDate:    null,
  todayMinutes:        0,
  totalSessions:       0,
  levelStats:          {},
  // { "1-1": { attempts, accuracy, bestStreak, passed, lastPracticed } }
  noteHeatmap:         {},
  // { "s0-f3": { attempts, correct } }
  intervalHeatmap:     {},
  // { "M3": { attempts, correct, totalMs, avgReactionMs } }
  chordReactions:      {},
  // { "Cmaj7": [ms, ms, ...] }
  weakNotes:           [],
  weakIntervals:       [],
  weakChords:          [],
  onboardingComplete:  false,
  calibrationComplete: false,
};

export function useProgressSystem() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // v5: ensure all levels are unlocked (migration)
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          unlockedLevels: DEFAULT_PROGRESS.unlockedLevels,
        };
      }
    } catch (e) {}
    return { ...DEFAULT_PROGRESS };
  });

  const sessionStartRef = useRef(null);

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
  }, [progress]);

  // Daily streak check on mount
  useEffect(() => {
    const today = new Date().toDateString();
    setProgress(p => {
      if (p.lastPracticeDate === today) return p;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = p.lastPracticeDate === yesterday.toDateString();
      return {
        ...p,
        streakDays:       wasYesterday ? p.streakDays + 1 : (p.lastPracticeDate ? 0 : p.streakDays),
        todayMinutes:     0,
        lastPracticeDate: today,
      };
    });
  }, []); // eslint-disable-line

  // ── Session timer ─────────────────────────────────────────
  const startSession = useCallback(() => {
    sessionStartRef.current = Date.now();
  }, []);

  const endSession = useCallback(() => {
    if (!sessionStartRef.current) return;
    const minutes = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
    sessionStartRef.current = null;
    setProgress(p => ({
      ...p,
      todayMinutes:  p.todayMinutes  + minutes,
      totalSessions: (p.totalSessions || 0) + 1,
    }));
  }, []);

  // ── Record a note attempt ─────────────────────────────────
  const recordNoteAttempt = useCallback(({ string, fret, correct }) => {
    const key = "s" + string + "-f" + fret;
    setProgress(p => {
      const hm   = { ...p.noteHeatmap };
      const cell = hm[key] || { attempts: 0, correct: 0 };
      hm[key]    = { attempts: cell.attempts + 1, correct: cell.correct + (correct ? 1 : 0) };

      const weakNotes = Object.entries(hm)
        .filter(([, v]) => v.attempts >= 3 && v.correct / v.attempts < 0.6)
        .sort((a, b) => (a[1].correct / a[1].attempts) - (b[1].correct / b[1].attempts))
        .slice(0, 10).map(([k]) => k);

      return { ...p, noteHeatmap: hm, weakNotes };
    });
  }, []);

  // ── Record an interval attempt ────────────────────────────
  const recordIntervalAttempt = useCallback(({ interval, correct, reactionMs }) => {
    setProgress(p => {
      const hm   = { ...p.intervalHeatmap };
      const cell = hm[interval] || { attempts: 0, correct: 0, totalMs: 0, avgReactionMs: 0 };
      const newAttempts = cell.attempts + 1;
      const newTotal    = cell.totalMs + (reactionMs || 0);
      hm[interval] = {
        attempts:      newAttempts,
        correct:       cell.correct + (correct ? 1 : 0),
        totalMs:       newTotal,
        avgReactionMs: Math.round(newTotal / newAttempts),
      };

      const weakIntervals = Object.entries(hm)
        .filter(([, v]) => v.attempts >= 3)
        .sort((a, b) => {
          const sa = (a[1].correct / a[1].attempts) - (a[1].avgReactionMs / 5000);
          const sb = (b[1].correct / b[1].attempts) - (b[1].avgReactionMs / 5000);
          return sa - sb;
        })
        .slice(0, 5).map(([k]) => k);

      return { ...p, intervalHeatmap: hm, weakIntervals };
    });
  }, []);

  // ── Record chord reaction ─────────────────────────────────
  const recordChordReaction = useCallback(({ chordSymbol, reactionMs }) => {
    setProgress(p => {
      const cr = { ...p.chordReactions };
      cr[chordSymbol] = [...(cr[chordSymbol] || []), reactionMs].slice(-20);

      const weakChords = Object.entries(cr)
        .filter(([, times]) => times.length >= 3)
        .map(([sym, times]) => ({ sym, avg: times.reduce((a, b) => a + b, 0) / times.length }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3).map(d => d.sym);

      return { ...p, chordReactions: cr, weakChords };
    });
  }, []);

  // ── Complete a level (soft — no locking, just record stats) ──
  const completeLevel = useCallback((levelId, { accuracy, streak }) => {
    const found = getLevelById(levelId);
    if (!found) return false;
    const { level } = found;

    const passed =
      accuracy >= level.successCriteria.accuracy &&
      streak   >= level.successCriteria.streak;

    setProgress(p => {
      const prev     = p.levelStats[levelId] || {};
      const newStats = {
        ...p.levelStats,
        [levelId]: {
          ...prev,
          attempts:      (prev.attempts || 0) + 1,
          accuracy,
          bestStreak:    Math.max(prev.bestStreak || 0, streak),
          passed:        passed || prev.passed || false,
          lastPracticed: new Date().toISOString(),
        },
      };

      // v5: All levels stay unlocked — no gate logic
      return {
        ...p,
        levelStats: newStats,
      };
    });

    return passed;
  }, []);

  // ── Onboarding / Calibration ──────────────────────────────
  const completeOnboarding = useCallback(() =>
    setProgress(p => ({ ...p, onboardingComplete: true })), []);

  const completeCalibration = useCallback(() =>
    setProgress(p => ({ ...p, calibrationComplete: true })), []);

  const resetProgress = useCallback(() =>
    setProgress({ ...DEFAULT_PROGRESS }), []);

  // ── Derived values ────────────────────────────────────────
  // Progress % based on sessions completed (not level gates)
  const overallProgressPct = (() => {
    const sessions = progress.totalSessions || 0;
    // Nonlinear scale: 0→50 sessions = 0→80%, 50+ = 80→100%
    if (sessions <= 0)  return 0;
    if (sessions >= 100) return 100;
    if (sessions <= 50) return Math.round((sessions / 50) * 80);
    return Math.round(80 + ((sessions - 50) / 50) * 20);
  })();

  // 6×13 grid for note heatmap display
  const noteHeatmapGrid = (() => {
    const grid = [];
    for (let s = 0; s < 6; s++) {
      const row = [];
      for (let f = 0; f <= 12; f++) {
        const cell = progress.noteHeatmap["s" + s + "-f" + f];
        row.push(cell && cell.attempts > 0
          ? { accuracy: cell.correct / cell.attempts, attempts: cell.attempts }
          : null);
      }
      grid.push(row);
    }
    return grid;
  })();

  return {
    progress,
    overallProgressPct,
    noteHeatmapGrid,
    startSession,
    endSession,
    recordNoteAttempt,
    recordIntervalAttempt,
    recordChordReaction,
    completeLevel,
    completeOnboarding,
    completeCalibration,
    resetProgress,
  };
}
