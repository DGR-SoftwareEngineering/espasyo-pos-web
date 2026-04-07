import { Stack } from "@mui/material";
import { AnimatedBoxSkeleton } from "../../animations";
import React from "react";

interface Props {
  id: string;
  fullHeight?: boolean;
  message?: string;
  light?: boolean;
}

export const ChartLoader: React.FC<Props> = ({
  id,
  fullHeight,
  message,
  light = false,
}) => {
  return (
    <Stack
      id={id}
      data-testid="chart-loader"
      width="100%"
      height={fullHeight ? "100%" : 400}
      gap={4}
      alignItems="center"
      aria-live="assertive"
      data-loading-msg={message}
    >
      <AnimatedBoxSkeleton
        width="100%"
        height="100%"
        pt={4}
        pb={2}
        pl={4}
        pr={2}
        light={light}
      ></AnimatedBoxSkeleton>
    </Stack>
  );
};
