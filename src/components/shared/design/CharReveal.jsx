// src/components/shared/design/CharReveal.jsx
// 逐字显现动画组件
// props: text, delay(整体延迟s), charDelay(字符间隔s), style, className, as(标签)

import React, { useMemo } from "react";
import { motion } from "framer-motion";

export function CharReveal({
  text = "",
  delay = 0,
  charDelay = 0.03,
  style,
  className,
  as: Tag = "span",
}) {
  const chars = useMemo(() => Array.from(text), [text]);

  return (
    <Tag style={{ display: "inline", ...style }} className={className}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * charDelay,
            duration: 0.38,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : undefined }}
        >
          {ch}
        </motion.span>
      ))}
    </Tag>
  );
}
