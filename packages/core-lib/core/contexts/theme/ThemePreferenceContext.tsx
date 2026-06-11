import React, { createContext, useContext, useEffect, useState } from "react";

type AppearanceType = "light" | "dark";

interface ThemePreferenceContextValue {
  appearance: AppearanceType;
  toggleAppearance: () => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

const STORAGE_KEY = "espasyo.theme.appearance";

export const ThemePreferenceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [appearance, setAppearance] = useState<AppearanceType>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as AppearanceType | null;
    if (stored === "light" || stored === "dark") {
      setAppearance(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setAppearance(prefersDark ? "dark" : "light");
  }, []);

  const toggleAppearance = () => {
    setAppearance((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemePreferenceContext.Provider value={{ appearance, toggleAppearance }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = (): ThemePreferenceContextValue => {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error("useThemePreference must be used within ThemePreferenceProvider");
  }
  return context;
};
