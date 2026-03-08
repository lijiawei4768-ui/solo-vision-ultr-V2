// ─────────────────────────────────────────────────────────────
// src/contexts.js — v2
// ThemeContext + CalibContext + re-exports LangContext
// ─────────────────────────────────────────────────────────────
import { createContext, useContext } from "react";
import { DT } from "./theme";

export const ThemeContext = createContext({ dark: true, toggle: () => {}, tokens: DT });
export function useTheme() { return useContext(ThemeContext); }

export const CalibContext = createContext({ pitchOffset: 1.0, minRms: 0.01 });
export function useCalib() { return useContext(CalibContext); }

// LangContext is defined in i18n.js to avoid circular deps;
// re-export here so existing code that imports from contexts.js still works
export { LangContext, useLang, useI18n } from "./i18n";
