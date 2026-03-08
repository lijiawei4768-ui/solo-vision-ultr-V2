// ─────────────────────────────────────────────────────────────
// TRAINER SHARED — TrainerHeader used by all 4 trainers
// v2 — Added onToggleAudio / audioEnabled mic button
// ─────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT } from "../theme";
import { PhysicalButton, SignalBar, StatusPill } from "../components/ui";

export function TrainerHeader({
  title, subtitle,
  status, streak, score,
  rms, audioEnabled,
  onToggleAudio,   // NEW — called when mic button is tapped
  onStats,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: DT.textPrimary, letterSpacing: "-0.3px", fontFamily: FONT_DISPLAY }}>{title}</div>
          <div style={{ fontSize: 11, color: DT.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SignalBar rms={rms} enabled={audioEnabled} />
          <StatusPill status={status} />

          {streak > 1 && (
            <motion.span initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={DT.springSnap}
              style={{ padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: "rgba(232,162,60,0.18)", color: DT.accent, border: `0.5px solid ${DT.accentBorder}` }}>
              🔥 {streak}
            </motion.span>
          )}

          {/* ── Mic toggle ─────────────────────────────── */}
          {onToggleAudio && (
            <motion.button
              onClick={onToggleAudio}
              whileTap={{ scale: 0.9 }}
              transition={DT.springSnap}
              style={{
                padding: "5px 11px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT_TEXT,
                cursor: "pointer",
                border: `0.5px solid ${audioEnabled ? "rgba(52,199,89,0.5)" : DT.border}`,
                background: audioEnabled ? "rgba(52,199,89,0.15)" : DT.surface2,
                color: audioEnabled ? DT.positive : DT.textTertiary,
                transition: "background 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              {audioEnabled ? "🎤 On" : "🎤 Off"}
            </motion.button>
          )}

          {onStats && score.total >= 5 && (
            <PhysicalButton onClick={onStats} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 10 }}>
              Stats
            </PhysicalButton>
          )}
        </div>
      </div>

      {score.total > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: "rgba(52,199,89,0.1)", color: DT.positive }}>✓ {score.correct}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, background: DT.surface1, color: DT.textTertiary }}>Total {score.total}</span>
          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "rgba(10,132,255,0.1)", color: "#4FC3F7" }}>
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
