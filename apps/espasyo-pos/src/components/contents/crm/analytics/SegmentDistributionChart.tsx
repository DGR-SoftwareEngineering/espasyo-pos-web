import React from "react";
import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { CustomerSegment } from "core-lib/api/crm";
import { SEGMENT_CONFIG } from "../constants";

interface SegmentDistributionChartProps {
  distribution: Record<string, number> | null | undefined;
  total: number;
}

const SEGMENT_NAME_KEYS: Record<string, CustomerSegment> = {
  New: CustomerSegment.New,
  Regular: CustomerSegment.Regular,
  VIP: CustomerSegment.VIP,
  Occasional: CustomerSegment.Occasional,
  AtRisk: CustomerSegment.AtRisk,
};

export const SegmentDistributionChart: React.FC<SegmentDistributionChartProps> = ({
  distribution,
  total,
}) => {
  const safeTotal = Math.max(0, total ?? 0);

  // Build ordered rows matching SEGMENT_CONFIG order
  const rows = (
    [
      CustomerSegment.New,
      CustomerSegment.Regular,
      CustomerSegment.VIP,
      CustomerSegment.Occasional,
      CustomerSegment.AtRisk,
    ] as CustomerSegment[]
  ).map((seg) => {
    const cfg = SEGMENT_CONFIG[seg];
    let count = 0;
    if (distribution) {
      for (const [k, v] of Object.entries(distribution)) {
        if (SEGMENT_NAME_KEYS[k] === seg) count = v;
      }
    }
    const pct = safeTotal > 0 ? (count / safeTotal) * 100 : 0;
    return { seg, cfg, count, pct };
  });

  return (
    <Card variant="surface" size="3">
      <Flex justify="between" align="center" mb="3">
        <Text size="3" weight="bold">
          Segment Distribution
        </Text>
        <Badge variant="soft" color="gray" size="1">
          {safeTotal} active customer(s)
        </Badge>
      </Flex>

      {safeTotal === 0 ? (
        <Box style={{ padding: 24, textAlign: "center" }}>
          <Text size="2" color="gray">
            No customers to chart yet.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="3">
          {rows.map(({ seg, cfg, count, pct }) => (
            <Flex key={seg} direction="column" gap="1">
              <Flex justify="between" align="center">
                <Badge color={cfg.color} variant="soft" size="1">
                  {cfg.label}
                </Badge>
                <Text size="2" weight="medium">
                  {count}{" "}
                  <Text size="1" color="gray">
                    ({pct.toFixed(1)}%)
                  </Text>
                </Text>
              </Flex>
              <Box
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "var(--gray-a3)",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: `var(--${cfg.color}-9)`,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
            </Flex>
          ))}
        </Flex>
      )}
    </Card>
  );
};
