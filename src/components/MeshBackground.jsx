// ─────────────────────────────────────────────────────────────
// MESH BACKGROUND v5 — 支持 5 种动画模式
//
// 从 T.bg 读取配置（由 theme.js getTokensV2 生成）：
//   T.bg.animType → "mesh" | "aurora" | "silk" | "grain" | "hybrid"
//   T.bg.base     → 页面背景底色
//   T.bg.blobA/B/C → orb / layer 颜色
//   T.bg.aurora   → { layer1, layer2, layer3 } (aurora 模式)
//   T.bg.silk     → { from, mid, via, to }     (silk 模式)
//   T.bg.grain    → { gradFrom, gradMid, gradVia, gradTo, noiseOpacity } (grain 模式)
//
// Props 接口不变（dark prop 保留但不使用，向后兼容）
// ─────────────────────────────────────────────────────────────
import React, { useContext } from "react";
import { ThemeContext } from "../contexts";

const FALLBACK_BG = {
  animType: "mesh",
  base:     "#080a1a",
  blobA:    "rgba(109,40,217,0.32)",
  blobB:    "rgba(59,130,246,0.26)",
  blobC:    "rgba(139,92,246,0.18)",
};

// ── Shared container style ────────────────────────────────────
function containerStyle(base) {
  return {
    position:      "fixed",
    inset:         0,
    pointerEvents: "none",
    zIndex:        0,
    overflow:      "hidden",
    background:    base,
    transition:    "background 0.6s ease",
  };
}

// ─────────────────────────────────────────────────────────────
// MODE 1: Mesh — 3 floating radial-gradient orbs (original)
// ─────────────────────────────────────────────────────────────
function MeshMode({ bg }) {
  const blobA = bg.blobA ?? FALLBACK_BG.blobA;
  const blobB = bg.blobB ?? FALLBACK_BG.blobB;
  const blobC = bg.blobC ?? FALLBACK_BG.blobC;

  return (
    <div style={containerStyle(bg.base ?? FALLBACK_BG.base)}>
      <div style={{
        position: "absolute", width: "72vw", height: "72vw",
        maxWidth: 540, maxHeight: 540,
        top: "-22%", left: "-14%", borderRadius: "50%",
        background: `radial-gradient(circle, ${blobA} 0%, transparent 68%)`,
        animation: "meshOrbA 26s ease-in-out infinite",
        willChange: "transform", transition: "background 0.8s ease",
      }} />
      <div style={{
        position: "absolute", width: "58vw", height: "58vw",
        maxWidth: 440, maxHeight: 440,
        bottom: "6%", right: "-8%", borderRadius: "50%",
        background: `radial-gradient(circle, ${blobB} 0%, transparent 70%)`,
        animation: "meshOrbB 34s ease-in-out infinite",
        willChange: "transform", transition: "background 0.8s ease",
      }} />
      <div style={{
        position: "absolute", width: "44vw", height: "44vw",
        maxWidth: 320, maxHeight: 320,
        top: "34%", left: "26%", borderRadius: "50%",
        background: `radial-gradient(circle, ${blobC} 0%, transparent 70%)`,
        animation: "meshOrbC 42s ease-in-out infinite",
        willChange: "transform", transition: "background 0.8s ease",
      }} />
      <style>{`
        @keyframes meshOrbA {
          0%,100% { transform: translate(0,0) scale(1); }
          30%     { transform: translate(5%, 3%) scale(1.05); }
          65%     { transform: translate(-3%, 6%) scale(0.96); }
        }
        @keyframes meshOrbB {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(-5%,-5%) scale(1.07); }
          70%     { transform: translate(3%,-2%) scale(0.94); }
        }
        @keyframes meshOrbC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(3%, -5%) scale(1.09); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODE 2: Aurora — 3 layered elliptical gradients, slow scale+fade
// ─────────────────────────────────────────────────────────────
function AuroraMode({ bg }) {
  const a = bg.aurora ?? {};
  const l1 = a.layer1 ?? bg.blobA ?? "rgba(0,200,180,0.18)";
  const l2 = a.layer2 ?? bg.blobB ?? "rgba(99,102,241,0.20)";
  const l3 = a.layer3 ?? bg.blobC ?? "rgba(167,139,250,0.16)";

  const layerBase = {
    position: "absolute", width: "100%", height: "100%",
    willChange: "transform, opacity",
  };

  return (
    <div style={containerStyle(bg.base ?? "#0a0d1a")}>
      <div style={{
        ...layerBase,
        background: `radial-gradient(ellipse 120% 60% at 20% 50%, ${l1} 0%, transparent 60%)`,
        animation: "auroraA 10s ease-in-out infinite",
      }} />
      <div style={{
        ...layerBase,
        background: `radial-gradient(ellipse 100% 80% at 80% 30%, ${l2} 0%, transparent 60%)`,
        animation: "auroraB 13s ease-in-out infinite",
      }} />
      <div style={{
        ...layerBase,
        background: `radial-gradient(ellipse 80% 60% at 50% 80%, ${l3} 0%, transparent 60%)`,
        animation: "auroraC 16s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes auroraA {
          0%,100% { opacity:1; transform:scale(1) translate(0,0); }
          50%     { opacity:0.72; transform:scale(1.08) translate(2%,-3%); }
        }
        @keyframes auroraB {
          0%,100% { opacity:1; transform:scale(1) translate(0,0); }
          40%     { opacity:0.80; transform:scale(1.12) translate(-3%,2%); }
          80%     { opacity:0.65; transform:scale(0.94) translate(2%,-1%); }
        }
        @keyframes auroraC {
          0%,100% { opacity:1; transform:scale(1) translate(0,0); }
          55%     { opacity:0.75; transform:scale(1.10) translate(1%,4%); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODE 3: Silk — large rotating linear-gradient fluid
// ─────────────────────────────────────────────────────────────
function SilkMode({ bg }) {
  const s     = bg.silk ?? {};
  const from  = s.from  ?? "#c7d2fe";
  const mid   = s.mid   ?? "#e8e6ff";
  const via   = s.via   ?? "#bae6ff";
  const to    = s.to    ?? "#fecdd3";

  return (
    <div style={containerStyle(bg.base ?? "#f0f4ff")}>
      {/* Primary silk wave */}
      <div style={{
        position:   "absolute",
        width:      "200%",
        height:     "200%",
        top:        "-50%",
        left:       "-50%",
        background: `linear-gradient(135deg, ${from} 0%, ${mid} 25%, ${via} 50%, ${to} 75%, ${from} 100%)`,
        animation:  "silkMove 14s ease-in-out infinite",
        willChange: "transform",
        opacity:    0.85,
      }} />
      {/* Secondary subtle layer for depth */}
      <div style={{
        position:   "absolute",
        width:      "200%",
        height:     "200%",
        top:        "-50%",
        left:       "-50%",
        background: `linear-gradient(225deg, ${via} 0%, ${from} 40%, ${mid} 80%, ${to} 100%)`,
        animation:  "silkMove2 20s ease-in-out infinite",
        willChange: "transform",
        opacity:    0.30,
      }} />
      <style>{`
        @keyframes silkMove {
          0%,100% { transform: translate(-25%,-25%) rotate(0deg); }
          50%     { transform: translate(-20%,-30%) rotate(8deg); }
        }
        @keyframes silkMove2 {
          0%,100% { transform: translate(-25%,-25%) rotate(0deg); }
          50%     { transform: translate(-28%,-22%) rotate(-6deg); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODE 4: Grain — gradient base + noise texture + slow hue-rotate
// ─────────────────────────────────────────────────────────────

// SVG noise data URI — inline, zero external deps
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function GrainMode({ bg }) {
  const g           = bg.grain ?? {};
  const gradFrom    = g.gradFrom    ?? "#f0e8ff";
  const gradMid     = g.gradMid     ?? "#e8f4ff";
  const gradVia     = g.gradVia     ?? "#f0fff8";
  const gradTo      = g.gradTo      ?? "#fff8f0";
  const noiseOpacity = g.noiseOpacity ?? 0.12;

  return (
    <div style={containerStyle(bg.base ?? "#f7f5f0")}>
      {/* Animated gradient base */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradMid} 40%, ${gradVia} 70%, ${gradTo} 100%)`,
        animation:  "grainShift 16s ease-in-out infinite",
        willChange: "filter",
      }} />
      {/* Noise overlay */}
      <div style={{
        position:        "absolute",
        inset:           0,
        backgroundImage: NOISE_SVG,
        backgroundSize:  "256px",
        opacity:         noiseOpacity,
        mixBlendMode:    "multiply",
      }} />
      <style>{`
        @keyframes grainShift {
          0%,100% { filter: hue-rotate(0deg) saturate(1); }
          50%     { filter: hue-rotate(12deg) saturate(1.08); }
        }
      `}</style>
    </div>
  );
}

function HybridMode({ bg }) {
  const a = bg.aurora ?? {};
  const l1 = a.layer1 ?? "rgba(99,102,241,0.14)";
  const l2 = a.layer2 ?? "rgba(14,165,233,0.12)";
  const l3 = a.layer3 ?? "rgba(236,72,153,0.10)";

  return (
    <div style={containerStyle(bg.base ?? "#070912")}>
      <div style={{
        position: "absolute", width: "68vw", height: "68vw",
        maxWidth: 520, maxHeight: 520,
        top: "-20%", left: "-12%", borderRadius: "50%",
        background: `radial-gradient(circle, ${bg.blobA ?? "rgba(109,40,217,0.30)"} 0%, transparent 68%)`,
        animation: "hybridOrbA 24s ease-in-out infinite",
        filter: "blur(4px)",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", width: "56vw", height: "56vw",
        maxWidth: 420, maxHeight: 420,
        bottom: "8%", right: "-8%", borderRadius: "50%",
        background: `radial-gradient(circle, ${bg.blobB ?? "rgba(14,165,233,0.25)"} 0%, transparent 70%)`,
        animation: "hybridOrbB 32s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", width: "40vw", height: "40vw",
        maxWidth: 300, maxHeight: 300,
        top: "38%", left: "32%", borderRadius: "50%",
        background: `radial-gradient(circle, ${bg.blobC ?? "rgba(236,72,153,0.20)"} 0%, transparent 72%)`,
        animation: "hybridOrbC 28s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 130% 60% at 18% 45%, ${l1} 0%, transparent 58%),
          radial-gradient(ellipse 90% 70% at 82% 28%, ${l2} 0%, transparent 58%),
          radial-gradient(ellipse 80% 55% at 52% 82%, ${l3} 0%, transparent 58%)`,
        animation: "hybridVeil 18s ease-in-out infinite",
        willChange: "transform, opacity",
      }} />
      <style>{`
        @keyframes hybridOrbA {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(4%, 3%) scale(1.06); }
        }
        @keyframes hybridOrbB {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-4%,-4%) scale(1.08); }
        }
        @keyframes hybridOrbC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(3%,-6%) scale(1.04); }
        }
        @keyframes hybridVeil {
          0%,100% { opacity: 0.86; transform: scale(1) translate(0,0); }
          50%     { opacity: 0.66; transform: scale(1.05) translate(1.5%,-2%); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function MeshBackground({ dark }) {
  const ctx      = useContext(ThemeContext);
  const bg       = ctx?.tokens?.bg ?? FALLBACK_BG;
  const animType = bg.animType ?? "mesh";

  // Fallback to mesh for unknown types
  switch (animType) {
    case "aurora": return <AuroraMode bg={bg} />;
    case "hybrid": return <HybridMode bg={bg} />;
    case "silk":   return <SilkMode   bg={bg} />;
    case "grain":  return <GrainMode  bg={bg} />;
    default:       return <MeshMode   bg={bg} />;
  }
}
