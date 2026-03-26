// src/components/shared/design/AccordionItem.jsx
// 手风琴单项，使用 AnimatePresence + height auto
// props: title, subtitle, icon(ReactNode), children, open, onToggle,
//        iconBg, iconBorder, accentColor, style

import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../../contexts";
import { DT, FONT_TEXT, FONT_DISPLAY } from "../../../theme";

function useT() { return useContext(ThemeContext)?.tokens ?? DT; }

export function AccordionItem({
  title,
  subtitle,
  icon,
  children,
  open,
  onToggle,
  iconBg,
  iconBorder,
  accentColor,
  style,
}) {
  const T = useT();

  return (
    <div
      style={{
        borderRadius:   16,
        background:     T.glass?.surface1 ?? "rgba(255,255,255,0.80)",
        backdropFilter: T.glass?.blur ?? "blur(22px)",
        WebkitBackdropFilter: T.glass?.blur ?? "blur(22px)",
        border:         `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
        overflow:       "hidden",
        ...style,
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        12,
          padding:    "14px 16px",
          cursor:     "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {icon && (
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   12,
            background:     iconBg  ?? (T.accentSub ?? "rgba(90,90,214,0.10)"),
            border:         `0.5px solid ${iconBorder ?? (T.accentBorder ?? "rgba(90,90,214,0.20)")}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}>
            {icon}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize:      14,
            fontWeight:    700,
            color:         T.textPrimary ?? "#17172a",
            fontFamily:    FONT_DISPLAY,
            letterSpacing: "-0.1px",
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontSize:  11,
              color:     T.textTertiary ?? "#9898b8",
              marginTop: 2,
              fontFamily: FONT_TEXT,
            }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0, 0.22, 1] }}
          style={{ flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={T.textTertiary ?? "#9898b8"} strokeWidth="2" strokeLinecap="round">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </motion.div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.32, 0, 0.22, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding:    "0 16px 16px",
              paddingTop: 2,
              fontSize:   13,
              color:      T.textSecondary ?? "#52527a",
              fontFamily: FONT_TEXT,
              lineHeight: 1.65,
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
