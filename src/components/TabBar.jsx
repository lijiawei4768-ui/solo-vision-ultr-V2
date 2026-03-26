// ─────────────────────────────────────────────────────────────
// FLOATING TAB BAR — near-black capsule, 6 tabs
// v3 — hidden prop 추가: L1/L2/L3 열릴 때 아래로 슬라이드 아웃
// ─────────────────────────────────────────────────────────────
import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_TEXT } from "../theme";
import { ThemeContext } from "../contexts";

export const TABS = [
  { id: "home",     label: "Home",      icon: "⌂" },
  { id: "note",     label: "Notes",     icon: "♩" },
  { id: "interval", label: "Intervals", icon: "◎" },
  { id: "changes",  label: "Changes",   icon: "♫" },
  { id: "scale",    label: "Scales",    icon: "≋" },
  { id: "persona",  label: "Me",        icon: "◉" },
];

export function TabBar({ activeTab, onTabChange, hidden = false }) {
  const ctx    = useContext(ThemeContext);
  const isDark = ctx?.dark ?? true;
  const T      = ctx?.tokens ?? DT;

  const navBg = isDark
    ? "rgba(12,12,16,0.88)"
    : "rgba(240,240,246,0.92)";
  const navBorderTop = isDark
    ? "0.5px solid rgba(255,255,255,0.10)"
    : `0.5px solid ${T.border}`;
  const navBorderSide = isDark
    ? "0.5px solid rgba(255,255,255,0.06)"
    : `0.5px solid ${T.border}`;

  return (
    <motion.nav
      animate={{
        y:              hidden ? "110%" : "0%",
        pointerEvents:  hidden ? "none" : "auto",
      }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 36,
        mass: 0.9,
      }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: "0 16px env(safe-area-inset-bottom, 16px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 560,
        background: navBg,
        backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        borderTop:    navBorderTop,
        borderLeft:   navBorderSide,
        borderRight:  navBorderSide,
        borderBottom: navBorderSide,
        borderRadius: 28,
        boxShadow: isDark ? "0 -4px 40px rgba(0,0,0,0.5)" : "0 -4px 24px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", padding: "4px" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const activeBg = isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.06)";
            const activeBorder = isDark
              ? "0.5px solid rgba(255,255,255,0.10)"
              : `0.5px solid ${T.border}`;
            return (
              <motion.button key={tab.id}
                onClick={() => !hidden && onTabChange(tab.id)}
                whileTap={{ scale: 0.9 }} transition={DT.springSnap}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "9px 2px", borderRadius: 22, position: "relative",
                  border: "none", cursor: "pointer",
                  background: active ? activeBg : "transparent",
                }}>
                {active && (
                  <motion.div layoutId="activeTab" style={{
                    position: "absolute", inset: 0, borderRadius: 22,
                    background: activeBg,
                    borderTop: activeBorder,
                  }} transition={DT.spring} />
                )}
                <span style={{
                  fontSize: 15, lineHeight: 1, marginBottom: 3,
                  position: "relative",
                  opacity: active ? 1 : 0.4,
                  color: active ? DT.accent : T.textPrimary,
                }}>
                  {tab.icon}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: active ? 600 : 400,
                  position: "relative",
                  color: active ? DT.accent : T.textTertiary,
                  letterSpacing: 0.2, fontFamily: FONT_TEXT,
                }}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
