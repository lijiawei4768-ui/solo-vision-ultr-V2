// ─────────────────────────────────────────────────────────────
// PRACTICE HISTORY HOOK — localStorage persistence
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";

const KEY = "svultra_history";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

function save(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-180))); }
  catch {}
}

export function usePracticeHistory() {
  const [history, setHistory] = useState(load);

  // Record a completed session: { tab, correct, total, durationMs }
  const recordSession = useCallback(({ tab, correct, total, durationMs = 0 }) => {
    const entry = { date: today(), tab, correct, total, durationMs, ts: Date.now() };
    setHistory(prev => {
      const next = [...prev, entry];
      save(next);
      return next;
    });
  }, []);

  // Heatmap: returns { [dateStr]: totalMinutes }
  const heatmap = (() => {
    const map = {};
    for (const e of history) {
      map[e.date] = (map[e.date] || 0) + Math.round((e.durationMs || 60000) / 60000);
    }
    return map;
  })();

  // Overall accuracy
  const totalCorrect = history.reduce((s, e) => s + (e.correct || 0), 0);
  const totalAttempts = history.reduce((s, e) => s + (e.total || 0), 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Tab breakdown
  const byTab = ["note", "interval", "changes", "scale"].map(tab => ({
    tab,
    sessions: history.filter(e => e.tab === tab).length,
    correct:  history.filter(e => e.tab === tab).reduce((s, e) => s + (e.correct || 0), 0),
  }));

  // Last practiced tab
  const lastTab = history.length > 0 ? history[history.length - 1].tab : null;

  // Streak: days with at least one session
  const streak = (() => {
    const days = [...new Set(history.map(e => e.date))].sort().reverse();
    let count = 0, cur = today();
    for (const d of days) {
      if (d === cur) { count++; const dt = new Date(cur); dt.setDate(dt.getDate() - 1); cur = dt.toISOString().slice(0, 10); }
      else break;
    }
    return count;
  })();

  return { history, recordSession, heatmap, accuracy, byTab, lastTab, streak };
}
