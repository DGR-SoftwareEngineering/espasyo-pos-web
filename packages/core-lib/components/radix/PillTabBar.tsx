import React from "react";
import { Box } from "@radix-ui/themes";

export interface PillTab<T extends string | number = string | number> {
  value: T;
  label: string;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
}

interface PillTabBarProps<T extends string | number = string | number> {
  tabs: PillTab<T>[];
  activeTab: T;
  onTabChange: (value: T) => void;
}

export const PillTabBar = <T extends string | number = string | number>({
  tabs,
  activeTab,
  onTabChange,
}: PillTabBarProps<T>) => (
  <Box
    mt="4"
    style={{
      display: "inline-flex",
      borderRadius: 999,
      border: "1px solid var(--gray-a4)",
      background: "var(--gray-a2)",
      padding: 3,
      gap: 2,
      flexWrap: "wrap",
    }}
  >
    {tabs.map((tab) => {
      const active = activeTab === tab.value;
      return (
        <button
          key={String(tab.value)}
          onClick={() => onTabChange(tab.value)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: active ? 600 : 400,
            background: active ? "var(--color-background)" : "transparent",
            color: active ? (tab.color ?? "var(--accent-11)") : "var(--gray-11)",
            boxShadow: active ? "var(--shadow-1)" : "none",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && <>&nbsp;\u00B7 {tab.count}</>}
        </button>
      );
    })}
  </Box>
);
