import React from "react";
import { Box } from "@radix-ui/themes";
import { usePageLoaderContext } from "../../core/contexts";

interface Props {
  children: React.ReactNode;
}

export const ContentArea = ({ children }: Props) => {
  const { isContentTransition } = usePageLoaderContext();

  return (
    <Box
      style={{
        position: "relative",
        minHeight: "calc(100vh - 64px)",
        transition: "opacity 200ms ease",
        opacity: isContentTransition ? 0.7 : 1,
        pointerEvents: isContentTransition ? "none" : "auto",
      }}
    >
      <Box
        style={{
          opacity: isContentTransition ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
