import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { PurchaseOrderStatusDto } from "core-lib/api/commons/types";
import { PO_STATUS_META, PO_STATUS_ORDER } from "../constants";

interface Props {
  status: PurchaseOrderStatusDto;
}

export const StatusTimeline: React.FC<Props> = ({ status }) => {
  const isCancelled = status === PurchaseOrderStatusDto.Cancelled;
  const currentIdx = PO_STATUS_ORDER.indexOf(status);

  if (isCancelled) {
    return (
      <Box
        p="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--red-a3)",
          border: "1px solid var(--red-a5)",
        }}
      >
        <Text size="2" weight="bold" style={{ color: "var(--red-11)" }}>
          Purchase order cancelled
        </Text>
      </Box>
    );
  }

  return (
    <Flex align="center" gap="0" wrap="wrap" style={{ width: "100%" }}>
      {PO_STATUS_ORDER.map((step, idx) => {
        const meta = PO_STATUS_META[step];
        const completed = idx < currentIdx;
        const active = idx === currentIdx;
        const isLast = idx === PO_STATUS_ORDER.length - 1;

        return (
          <React.Fragment key={step}>
            <Flex direction="column" align="center" gap="1" style={{ flex: "0 0 auto", minWidth: 80 }}>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: active
                    ? `var(--${meta.color}-9)`
                    : completed
                      ? `var(--${meta.color}-a4)`
                      : "var(--gray-a3)",
                  color: active
                    ? "var(--accent-contrast)"
                    : completed
                      ? `var(--${meta.color}-11)`
                      : "var(--gray-9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  border: active ? `2px solid var(--${meta.color}-11)` : undefined,
                  transition: "all 200ms ease",
                }}
              >
                {completed ? "✓" : idx + 1}
              </Box>
              <Text
                size="1"
                weight={active ? "bold" : "regular"}
                style={{
                  color: active
                    ? `var(--${meta.color}-11)`
                    : completed
                      ? "var(--gray-12)"
                      : "var(--gray-10)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {meta.label}
              </Text>
            </Flex>
            {!isLast && (
              <Box
                style={{
                  flex: 1,
                  height: 2,
                  background: completed
                    ? `var(--${PO_STATUS_META[PO_STATUS_ORDER[idx + 1]].color}-a5)`
                    : "var(--gray-a3)",
                  margin: "0 4px",
                  marginBottom: 20,
                  minWidth: 16,
                  transition: "background 200ms ease",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};
