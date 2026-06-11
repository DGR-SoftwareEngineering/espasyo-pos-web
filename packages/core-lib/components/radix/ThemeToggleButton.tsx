import React from "react";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useThemePreference } from "../../core/contexts/theme/ThemePreferenceContext";

export const ThemeToggleButton: React.FC = () => {
  const { appearance, toggleAppearance } = useThemePreference();

  const icon = appearance === "dark" ? <SunIcon /> : <MoonIcon />;
  const tooltip = appearance === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip content={tooltip}>
      <IconButton
        variant="ghost"
        color="gray"
        onClick={toggleAppearance}
        aria-label="Toggle theme"
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};
