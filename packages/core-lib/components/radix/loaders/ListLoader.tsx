import React from "react";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { AnimatedBoxSkeleton } from "../animations/AnimatedBoxSkeleton";

interface Props {
  id?: string;
  loadersCount?: number;
  isFullWidth?: boolean;
  /** Gap between skeleton groups in pixels. Defaults to 16. */
  spacing?: number;
  "data-testid"?: string;
}

export const ListLoader: React.FC<Props> = ({
  id,
  loadersCount = 1,
  isFullWidth,
  spacing = 16,
  ...props
}) => (
  <Box id={id} style={{ width: "100%" }} data-testid={props["data-testid"]}>
    <Flex direction="column" gap={String(spacing / 4) as never}>
      {Array.from(Array(loadersCount)).map((_, index) => (
        <Grid key={index} columns="12" gap="3">
          <Box style={{ gridColumn: isFullWidth ? "span 12" : "span 8" }}>
            <AnimatedBoxSkeleton height={24} />
          </Box>
          <Box style={{ gridColumn: isFullWidth ? "span 12" : "span 4" }}>
            <AnimatedBoxSkeleton height={24} />
          </Box>
          <Box style={{ gridColumn: isFullWidth ? "span 12" : "span 6" }}>
            <AnimatedBoxSkeleton height={24} light />
          </Box>
        </Grid>
      ))}
    </Flex>
  </Box>
);
