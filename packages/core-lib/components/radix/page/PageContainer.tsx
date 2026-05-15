import React from "react";
import { Box } from "@radix-ui/themes";

interface Props {
  loading?: boolean;
  stickOut?: boolean;
  stickOutMaxWidth?: number;
  contentMaxWidth?: number;
}

const DEFAULT_STICK_OUT_WIDTH = 960;
const DEFAULT_CONTENT_WIDTH = 1280;

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  stickOut,
  stickOutMaxWidth = DEFAULT_STICK_OUT_WIDTH,
  contentMaxWidth = DEFAULT_CONTENT_WIDTH,
}) => {
  const maxWidth = stickOut ? stickOutMaxWidth : contentMaxWidth;

  return (
    <Box
      asChild
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <main id="mainContent" role="main">
        <Box
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: stickOut ? "var(--shadow-4)" : undefined,
          }}
        >
          <Box
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignSelf: "center",
              marginInline: "auto",
              width: "100%",
              maxWidth,
              paddingTop: 48,
              paddingBottom: 96,
              paddingInline: "clamp(16px, 4vw, 32px)",
            }}
          >
            {children}
          </Box>
        </Box>
      </main>
    </Box>
  );
};
