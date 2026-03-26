// src/components/shared/design/GhostButton.jsx
// 次级/透明按钮
// props: children, onClick, style, fullWidth

import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../../contexts";
import { DT, FONT_TEXT } from "../../../theme";

function useT() { return useContext(ThemeContext)?.tokens ?? DT; }

export function GhostButton({ children, onClick, style, fullWidth = true }) {
  const T = useT();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        width:          fullWidth ? "100%" : undefined,
        padding:        "15px 20px",
        border:         `0.5px solid ${T.border ?? "rgba(110,120,180,0.16)"}`,
        borderRadius:   18,
        fontFamily:     FONT_TEXT,
        fontSize:       14,
        fontWeight:     600,
        cursor:         "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            6,
        background:     T.glass?.surface1 ?? "rgba(255,255,255,0.60)",
        backdropFilter: T.glass?.blur ?? "blur(14px)",
        WebkitBackdropFilter: T.glass?.blur ?? "blur(14px)",
        color:          T.textSecondary ?? "#52527a",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
