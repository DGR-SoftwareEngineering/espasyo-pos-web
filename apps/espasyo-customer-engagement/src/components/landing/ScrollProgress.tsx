import React from "react";
import { motion, useScroll } from "framer-motion";

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 z-50 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};