import React, { useEffect } from "react";
import { usePublicSettings } from "../../core/contexts";

const HEX_REGEX = /^#?[0-9a-fA-F]{3,8}$/;

const normalize = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!HEX_REGEX.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

export const ThemeColorVars: React.FC = () => {
  const { theme } = usePublicSettings();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const primary = normalize(theme.primaryColor);
    const secondary = normalize(theme.secondaryColor);
    if (primary) root.style.setProperty("--espasyo-primary", primary);
    else root.style.removeProperty("--espasyo-primary");
    if (secondary) root.style.setProperty("--espasyo-secondary", secondary);
    else root.style.removeProperty("--espasyo-secondary");
  }, [theme.primaryColor, theme.secondaryColor]);

  return null;
};
