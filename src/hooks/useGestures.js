// ─────────────────────────────────────────────────────────────
// GESTURE HOOKS — useLongPress, useSwipe, useVerticalSwipe
//
// v2: useSwipe only fires when swipe starts within `edgePx`
//     pixels of the right screen edge (default 56 px).
//     This prevents accidentally opening the control centre
//     while scrolling horizontally inside trainer views.
//
// v3: add useVerticalSwipe for vertical page navigation
// ─────────────────────────────────────────────────────────────
import { useRef, useCallback } from "react";

export function useLongPress(callback, ms = 700) {
  const timerRef = useRef(null);
  const hasLongPressed = useRef(false);

  const start = useCallback((e) => {
    hasLongPressed.current = false;
    // 阻止默认行为（防止触发浏览器复制菜单）
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    timerRef.current = setTimeout(() => {
      hasLongPressed.current = true;
      callback();
      navigator.vibrate?.([8, 10, 8]);
    }, ms);
  }, [callback, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = useCallback((e) => {
    // 如果刚完成了长按，不触发 onClick
    if (hasLongPressed.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }, []);

  return {
    onMouseDown:  start,
    onMouseUp:    cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd:   cancel,
    onClick: handleClick,
    onContextMenu: (e) => { if (e) e.preventDefault(); },
  };
}

/**
 * @param {() => void} onLeft  - called on right-to-left swipe from the right edge
 * @param {() => void} onRight - called on left-to-right swipe (no edge restriction)
 * @param {number}     edgePx  - how many pixels from the right edge trigger onLeft (default 56)
 */
export function useSwipe(onLeft, onRight, edgePx = 56) {
  const startX   = useRef(null);
  const startY   = useRef(null);

  return {
    onTouchStart: (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    },
    onTouchEnd: (e) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // Only treat as a horizontal swipe when the horizontal component dominates
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) {
        startX.current = null;
        return;
      }

      if (dx < 0) {
        // Right-to-left: only trigger when starting near right edge
        const fromRight = window.innerWidth - startX.current;
        if (fromRight <= edgePx) onLeft?.();
      } else {
        onRight?.();
      }

      startX.current = null;
    },
  };
}

/**
 * Vertical swipe detection for page navigation
 * @param {() => void} onSwipeUp - called on upward swipe (to next page)
 * @param {() => void} onSwipeDown - called on downward swipe (to previous page)
 * @param {number} threshold - minimum swipe distance in pixels (default 60)
 */
export function useVerticalSwipe(onSwipeUp, onSwipeDown, threshold = 60) {
  const startY = useRef(null);
  const startX = useRef(null);

  return {
    onTouchStart: (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    },
    onTouchEnd: (e) => {
      if (startY.current === null) return;

      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const dy = endY - startY.current;
      const dx = endX - startX.current;

      // Only treat as vertical swipe when vertical component dominates
      // and swipe distance exceeds threshold
      if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx) * 1.5) {
        if (dy < 0) {
          // Swipe up - go to next page
          onSwipeUp?.();
        } else {
          // Swipe down - go to previous page
          onSwipeDown?.();
        }
      }

      startY.current = null;
      startX.current = null;
    },
    // Also support mouse drag for desktop testing
    onMouseDown: (e) => {
      startX.current = e.clientX;
      startY.current = e.clientY;
    },
    onMouseUp: (e) => {
      if (startY.current === null) return;

      const dy = e.clientY - startY.current;
      const dx = e.clientX - startX.current;

      if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx) * 1.5) {
        if (dy < 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }

      startY.current = null;
      startX.current = null;
    },
  };
}
