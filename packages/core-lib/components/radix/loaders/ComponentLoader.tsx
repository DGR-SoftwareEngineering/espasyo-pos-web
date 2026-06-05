import React from "react";
import { Box, Spinner } from "@radix-ui/themes";

interface Props {
  disableMarginBottom?: boolean;
}

export const ComponentLoader: React.FC<Props> = ({ disableMarginBottom }) => (
  <Box
    data-testid="component-loader"
    style={{
      marginBottom: disableMarginBottom ? 0 : 64,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Spinner size="3" loading />
  </Box>
);
