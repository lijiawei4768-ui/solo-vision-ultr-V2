// src/components/shared/design/PrimaryButton.jsx
// 主按钮，带 shimmer 效果和 whileTap scale
// props: children, onClick, disabled, style, color(override accent), loading

import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../../contexts";
import { DT, FONT_TEXT } from "../../../theme";

function useT() { return useContext(ThemeContext)?.tokens ?? DT; }

export function PrimaryButton({ children, onClick, disabled, style, color, fullWidth = true, loading }) {
  const T = useT();
  const bg = color ?? T.accent ?? "#5a5ad6";

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.962 }}
      onClick={disabled || loading ? undefined : onClick}
      style={{
        width:          fullWidth ? "100%" : undefined,
        padding:        "15px 18px",
        border:         "none",
        borderRadius:   18,
        fontFamily:     FONT_TEXT,
        fontSize:       15,
        fontWeight:     700,
        letterSpacing:  "0.01em",
        cursor:         disabled ? "not-allowed" : "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            7,
        background:     disabled ? (T.surface2 ?? "#e0e0e0") : bg,
        color:          disabled ? (T.textTertiary ?? "#aaa") : "#fff",
        boxShadow:      disabled ? "none" : `0 4px 22px ${bg}55, 0 1px 4px ${bg}33`,
        position:       "relative",
        overflow:       "hidden",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {/* shimmer */}
      {!disabled && (
        <span style={{
          position:   "absolute",
          top:        0,
          left:       "-100%",
          width:      "50%",
          height:     "100%",
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",
          animation:  "svuShimmer 3s infinite",
          pointerEvents: "none",
        }} />
      )}
      {loading ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
        </svg>
      ) : children}
    </motion.button>
  );
}
