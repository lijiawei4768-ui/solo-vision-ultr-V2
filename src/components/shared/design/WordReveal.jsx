// src/components/shared/design/WordReveal.jsx
// 词组渐显动画（中文逐字，英文逐词）
// props: text, delay, wordDelay, style, className, as

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export function WordReveal({
  text = "",
  delay = 0,
  wordDelay = 0.06,
  style,
  className,
  as: Tag = "span",
}) {
  // For CJK text treat each character as a "word"
  const tokens = useMemo(() => {
    const isCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(text);
    if (isCJK) return Array.from(text);
    return text.split(/(\s+)/);
  }, [text]);

  return (
    <Tag style={{ display: "inline", ...style }} className={className}>
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * wordDelay,
            duration: 0.36,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", whiteSpace: /^\s+$/.test(token) ? "pre" : undefined }}
        >
          {token}
        </motion.span>
      ))}
    </Tag>
  );
}
