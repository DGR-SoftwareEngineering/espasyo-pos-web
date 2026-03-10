import { useState, useEffect } from "react";

export const useGreeting = () => {
  const [greeting, setGreeting] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setTimeOfDay("morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
      setTimeOfDay("afternoon");
    } else {
      setGreeting("Good Evening");
      setTimeOfDay("evening");
    }
  }, []);

  return { greeting, timeOfDay };
};
