// ─────────────────────────────────────────────────────────────
// VerticalPageLayout.jsx — 垂直翻页布局系统
//
// 支持主页、个人页、设置页的垂直滑动切换
// 使用垂直滑动手势实现页面切换，带有弹簧动画
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

const PAGE_HEIGHT = 100; // vh

/**
 * 垂直翻页布局组件
 * @param {Object} pages - 页面配置对象 { key: { component: Component, title: string } }
 * @param {string} initialPage - 初始页面 key
 * @param {Object} props - 其他传递给页面的 props
 */
export function VerticalPageLayout({ pages, initialPage, ...props }) {
  const pageKeys = Object.keys(pages);
  const [currentPage, setCurrentPage] = useState(initialPage || pageKeys[0]);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const currentIndex = pageKeys.indexOf(currentPage);

  // 滑动阈值
  const SWIPE_THRESHOLD = 80;

  const handleDragEnd = useCallback((_, info) => {
    const { offset } = info;
    const direction = offset.y > 0 ? 1 : -1; // 向下拖 = 向上翻页（显示下一页）

    if (direction > 0 && currentIndex < pageKeys.length - 1) {
      // 向下滑 → 显示下一页
      setCurrentPage(pageKeys[currentIndex + 1]);
    } else if (direction < 0 && currentIndex > 0) {
      // 向上滑 → 显示上一页
      setCurrentPage(pageKeys[currentIndex - 1]);
    }
  }, [currentIndex, pageKeys]);

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" && currentIndex < pageKeys.length - 1) {
        setCurrentPage(pageKeys[currentIndex + 1]);
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentPage(pageKeys[currentIndex - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, pageKeys]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      {/* 页面指示器 */}
      <div style={{
        position: "absolute",
        top: "50%",
        right: 8,
        transform: "translateY(-50%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        pointerEvents: "none",
      }}>
        {pageKeys.map((key, idx) => (
          <div
            key={key}
            style={{
              width: idx === currentIndex ? 6 : 4,
              height: idx === currentIndex ? 20 : 4,
              borderRadius: 3,
              background: idx === currentIndex
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.25)",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* 页面标题指示 */}
      <div style={{
        position: "absolute",
        top: 16,
        left: 20,
        zIndex: 100,
        opacity: 0.5,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
        pointerEvents: "none",
      }}>
        {currentIndex + 1} / {pageKeys.length}
      </div>

      {/* 页面容器 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ y: PAGE_HEIGHT, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -PAGE_HEIGHT, opacity: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          drag="y"
          dragConstraints={{
            top: 0,
            bottom: 0,
          }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            handleDragEnd(e, info);
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pages[currentPage]?.component && (
            React.createElement(pages[currentPage].component, props)
          )}
        </motion.div>
      </AnimatePresence>

      {/* 滑动提示 */}
      <SlideHint visible={currentIndex === 0} direction="down" />
    </div>
  );
}

/**
 * 滑动提示组件
 */
function SlideHint({ visible, direction }) {
  if (!visible) return null;

  const isDown = direction === "down";

  return (
    <motion.div
      initial={{ opacity: 0, y: isDown ? 10 : -10 }}
      animate={{ opacity: [0, 1, 0], y: isDown ? [0, 8, 0] : [0, -8, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        bottom: isDown ? 100 : "auto",
        top: !isDown ? 100 : "auto",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        opacity: 0.4,
      }}
    >
      <div style={{
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
      }}>
        {isDown ? "↓" : "↑"}
      </div>
      <div style={{
        fontSize: 9,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
      }}>
        {isDown ? "Swipe up" : "Swipe down"}
      </div>
    </motion.div>
  );
}

/**
 * 可滚动内容包装器
 * 用于需要内部滚动的页面
 */
export function ScrollableContent({ children, style, ...props }) {
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 40,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default VerticalPageLayout;
