import React, { forwardRef } from "react";
import confetti from "canvas-confetti";

export interface ConfettiHandle {
  fire: () => void;
}

export const ConfettiCanvas = forwardRef<ConfettiHandle, {}>((_, ref) => {
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

  return (
    <canvas
      id="confetti-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
});

ConfettiCanvas.displayName = "ConfettiCanvas";
