import { useState, useEffect, useCallback } from "react";
import { MOTIVATIONAL_MESSAGES } from "../constants/message";

export const useMotivation = (intervalTime = 8000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
        setIsVisible(true);
      }, 500);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [intervalTime]);

  const nextMessage = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
      setIsVisible(true);
    }, 500);
  }, []);

  return {
    currentMessage: MOTIVATIONAL_MESSAGES[currentIndex],
    isVisible,
    nextMessage,
  };
};
