// src/components/shared/design/EyebrowBadge.jsx
// 小胶囊标签: "核心系统" / "调音器" 等
// props: children, variant ('a'|'g'|'o'|'r'), style, animDelay

import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../../contexts";
import { DT, FONT_TEXT } from "../../../theme";

function useT() { return useContext(ThemeContext)?.tokens ?? DT; }

export function EyebrowBadge({ children, variant = "a", style, animDelay = 0 }) {
  const T = useT();

  const VARIANT_MAP = {
    a: {
      bg:     T.accentSub  ?? "rgba(90,90,214,0.10)",
      color:  T.accent     ?? "#5a5ad6",
      border: T.accentBorder ?? "rgba(90,90,214,0.20)",
    },
    g: {
      bg:     T.positive ? T.positive + "18" : "rgba(34,166,114,0.10)",
      color:  T.positive ?? "#22a672",
      border: T.positive ? T.positive + "38" : "rgba(34,166,114,0.22)",
    },
    o: {
      bg:     T.warning ? T.warning + "18" : "rgba(192,120,48,0.10)",
      color:  T.warning ?? "#c07830",
      border: T.warning ? T.warning + "38" : "rgba(192,120,48,0.22)",
    },
    r: {
      bg:     T.negative ? T.negative + "18" : "rgba(194,64,80,0.10)",
      color:  T.negative ?? "#c24050",
      border: T.negative ? T.negative + "38" : "rgba(194,64,80,0.22)",
    },
  };

  const v = VARIANT_MAP[variant] ?? VARIANT_MAP.a;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            5,
        padding:        "4px 11px",
        borderRadius:   9,
        fontSize:       10,
        fontWeight:     800,
        letterSpacing:  "0.12em",
        textTransform:  "uppercase",
        background:     v.bg,
        color:          v.color,
        border:         `0.5px solid ${v.border}`,
        fontFamily:     FONT_TEXT,
        alignSelf:      "flex-start",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
