// ─────────────────────────────────────────────────────────────
// MESH BACKGROUND v2 — Orb colours updated for new palette
//
// Dark  — deep violet + warm gold (matches new accent #8875FF
//         and root note #C99A50)
// Light — very subtle lavender + warm blush, barely visible;
//         iOS light mode should feel clean, not atmospheric
// ─────────────────────────────────────────────────────────────
import React from "react";

export function MeshBackground({ dark = true }) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, overflow: "hidden" }}>

      {/* Orb A — violet / indigo anchor (top-left) */}
      <div style={{
        position: "absolute",
        width: "75vw", height: "75vw", maxWidth: 520, maxHeight: 520,
        top: "-20%", left: "-12%",
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(100,80,220,0.20) 0%, transparent 68%)"
          : "radial-gradient(circle, rgba(100,80,220,0.06) 0%, transparent 68%)",
        animation: "orb1 26s ease-in-out infinite",
        willChange: "transform",
      }} />

      {/* Orb B — warm champagne / gold (bottom-right) */}
      <div style={{
        position: "absolute",
        width: "55vw", height: "55vw", maxWidth: 400, maxHeight: 400,
        bottom: "8%", right: "-6%",
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(160,110,30,0.13) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(180,130,50,0.07) 0%, transparent 70%)",
        animation: "orb2 34s ease-in-out infinite",
        willChange: "transform",
      }} />

      {/* Orb C — teal (mid-left) matches target note colour */}
      <div style={{
        position: "absolute",
        width: "40vw", height: "40vw", maxWidth: 280, maxHeight: 280,
        bottom: "30%", left: "20%",
        borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(30,140,120,0.09) 0%, transparent 70%)"
          : "transparent",
        animation: "orb3 42s ease-in-out infinite",
        willChange: "transform",
      }} />

      <style>{`
        @keyframes orb1 {
          0%,100%{ transform: translate(0,0) scale(1); }
          30%    { transform: translate(5%, 3%) scale(1.04); }
          65%    { transform: translate(-3%, 6%) scale(0.97); }
        }
        @keyframes orb2 {
          0%,100%{ transform: translate(0,0) scale(1); }
          40%    { transform: translate(-4%,-5%) scale(1.06); }
          70%    { transform: translate(3%,-2%) scale(0.95); }
        }
        @keyframes orb3 {
          0%,100%{ transform: translate(0,0) scale(1); }
          50%    { transform: translate(2%, -4%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
