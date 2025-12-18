"use client";
import React, { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";

interface Props {
  isAuthenticated: boolean;
  loading: boolean;
  appearance?: "light" | "dark";
  logout: () => Promise<void>;
  children: ReactNode;
}

export const RadixThemeFramework: React.FC<Props> = ({
  isAuthenticated,
  loading,
  appearance,
  logout,
  children,
}) => {
  return <Theme appearance={appearance}>{children}</Theme>;
};
