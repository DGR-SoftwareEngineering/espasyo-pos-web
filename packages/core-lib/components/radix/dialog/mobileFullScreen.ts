import type { CSSProperties } from "react";

export const mobileDialogStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100dvw",
  height: "100dvh",
  borderRadius: 0,
  display: "flex",
  flexDirection: "column",
};

export const mobileContentStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
};

export const mobileHeaderStyle: CSSProperties = {
  flexShrink: 0,
};

export const mobileFooterStyle: CSSProperties = {
  flexShrink: 0,
};
