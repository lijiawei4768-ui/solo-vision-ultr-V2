// ─────────────────────────────────────────────────────────────
// TOAST SYSTEM — amber capsule notifications (Sonner-style)
// Usage: const { toast } = useToast(); toast.correct("Correct!");
// ─────────────────────────────────────────────────────────────
import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT } from "../theme";

const ToastCtx = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = "info", duration = 2200) => {
    const id = ++_id;
    setToasts(t => [...t.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const toast = {
    correct: msg => push(msg, "correct"),
    wrong:   msg => push(msg, "wrong"),
    info:    msg => push(msg, "info"),
  };

  const cfg = {
    correct: { bg: "rgba(52,199,89,0.2)",    border: "rgba(52,199,89,0.5)",    color: "#34C759" },
    wrong:   { bg: "rgba(255,69,58,0.2)",    border: "rgba(255,69,58,0.5)",    color: "#FF453A" },
    info:    { bg: "rgba(232,162,60,0.18)",   border: DT.accentBorder,          color: DT.accent  },
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}>
        <AnimatePresence>
          {toasts.map(t => {
            const c = cfg[t.type] || cfg.info;
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                style={{
                  background: c.bg, border: `0.5px solid ${c.border}`,
                  borderRadius: 24, padding: "9px 20px",
                  color: c.color, fontSize: 13, fontWeight: 600,
                  fontFamily: "-apple-system,'SF Pro Text',sans-serif",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                  letterSpacing: 0.2,
                }}>
                {t.msg}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
