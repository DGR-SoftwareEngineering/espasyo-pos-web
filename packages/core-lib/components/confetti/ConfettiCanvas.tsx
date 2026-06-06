import React, { forwardRef } from "react";
import confetti from "canvas-confetti";

export interface ConfettiHandle {
  fire: () => void;
}

const ConfettiCanvasComponent = forwardRef<ConfettiHandle, {}>((_, ref) => {
  const fire = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.2, y: 0.9 },
      colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.9 },
      colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
    });
  };

  React.useImperativeHandle(ref, () => ({
    fire,
  }));

  return null;
});

export const ConfettiCanvas = ConfettiCanvasComponent;
