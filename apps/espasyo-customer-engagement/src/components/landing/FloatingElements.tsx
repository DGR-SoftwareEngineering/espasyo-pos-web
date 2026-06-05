import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const floatingElements = [
  { emoji: "☕", size: 60, top: "15%", left: "5%", delay: 0, duration: 20 },
  { emoji: "⭐", size: 40, top: "70%", right: "8%", delay: 2, duration: 25 },
  { emoji: "🎁", size: 50, bottom: "20%", left: "10%", delay: 4, duration: 22 },
];

export const FloatingElements: React.FC = () => {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute opacity-10"
          style={{
            fontSize: el.size,
            top: el.top,
            left: el.left,
            right: el.right,
            bottom: el.bottom,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  );
};