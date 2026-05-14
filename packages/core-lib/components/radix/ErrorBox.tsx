import React from "react";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface Props {
  label: string;
  /** Optional bottom margin in pixels. Default `64` (~MUI `mb={8}`). */
  mb?: number;
  /** Optional background override. Defaults to a tinted error surface. */
  customBackground?: string;
}

export const ErrorBox: React.FC<Props> = ({
  label,
  mb = 64,
  customBackground,
}) => (
  <Box
    role="alert"
    style={{
      minHeight: 256,
      background: customBackground ?? "var(--red-a3)",
      borderRadius: "var(--radius-3)",
      padding: "40px 80px",
    }}
  >
    <Flex
      direction={{ initial: "column", md: "row" }}
      justify="center"
      align="center"
      gap="6"
      wrap="wrap"
    >
      <Box style={{ marginBottom: mb, color: "var(--red-11)" }}>
        <ExclamationTriangleIcon width={64} height={64} />
      </Box>
      <Heading size="6" align="center" style={{ color: "var(--red-11)" }}>
        {label}
      </Heading>
    </Flex>
  </Box>
);
