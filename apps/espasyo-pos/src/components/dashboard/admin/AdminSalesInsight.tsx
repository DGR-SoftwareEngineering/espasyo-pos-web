import React from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Card,
  Skeleton,
} from "@radix-ui/themes";;
import {
  LightningBoltIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";
import { useRouter } from 'core-lib/core/router'
import { useApi } from "core-lib/core/hooks";

export const AdminSalesInsight: React.FC = () => {
  const router = useRouter();
  const insight = useApi((api) => api.commons.getSalesInsight(), []);
  const data = insight.result?.data?.response;
  const isLoading = insight.loading;

  return (
    <Box mb="5" px="4">
      <Card size="3" variant="surface">
        <Flex direction="column" gap="4">
          {/* Header */}
          <Flex justify="between" align="center" wrap="wrap" gap="2">
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-3)",
                  background: "var(--accent-a3)",
                  color: "var(--accent-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MagicWandIcon width="18" height="18" />
              </Box>
              <Box>
                <Text size="3" weight="bold">
                  Sales Insights
                </Text>
                <Text size="1" color="gray" as="div">
                  {isLoading ? (
                    <Skeleton>Loading period...</Skeleton>
                  ) : data ? (
                    `AI-powered analysis · ${data.periodLabel}`
                  ) : (
                    "No data available"
                  )}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" gap="2">
              {data?.isAiGenerated && (
                <Badge color="violet" variant="soft" size="1">
                  AI
                </Badge>
              )}
              {data && !data.isAiGenerated && (
                <Badge color="gray" variant="soft" size="1">
                  Auto
                </Badge>
              )}
            </Flex>
          </Flex>

          <Separator size="4" />

          {/* Summary callout */}
          <Box
            p="3"
            style={{
              borderLeft: "3px solid var(--accent-a5)",
              background: "var(--accent-a2)",
              borderRadius: "var(--radius-2)",
            }}
          >
            {isLoading ? (
              <Flex direction="column" gap="1">
                <Skeleton>
                  <Text size="2">Loading sales insight summary for this period...</Text>
                </Skeleton>
                <Skeleton>
                  <Text size="2">Additional analysis details here</Text>
                </Skeleton>
              </Flex>
            ) : data ? (
              <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                {data.summary}
              </Text>
            ) : (
              <Text size="2" color="gray">
                No insight data available.
              </Text>
            )}
          </Box>

          {/* Highlights + Recommendations */}
          {(isLoading || (data && (data.highlights.length > 0 || data.recommendations.length > 0))) && (
            <Flex
              gap="4"
              direction={{ initial: "column", sm: "row" }}
            >
              {/* Highlights */}
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="bold" mb="3" style={{ display: "block" }}>
                  Key Highlights
                </Text>
                {isLoading ? (
                  <Flex direction="column" gap="2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i}>
                        <Text size="2">Loading highlight item here...</Text>
                      </Skeleton>
                    ))}
                  </Flex>
                ) : (
                  <Flex direction="column" gap="2">
                    {data?.highlights.map((h, i) => (
                      <Flex key={i} align="start" gap="2">
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            marginTop: 7,
                            background: "var(--green-9)",
                            flexShrink: 0,
                          }}
                        />
                        <Text size="2" color="gray" style={{ lineHeight: 1.5 }}>
                          {h}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>

              {/* Recommendations */}
              <Box style={{ flex: 1 }}>
                <Flex align="center" gap="1" mb="3">
                  <LightningBoltIcon width={14} height={14} color="var(--amber-9)" />
                  <Text size="2" weight="bold">
                    Recommendations
                  </Text>
                </Flex>
                {isLoading ? (
                  <Flex direction="column" gap="2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i}>
                        <Text size="2">Loading recommendation item here...</Text>
                      </Skeleton>
                    ))}
                  </Flex>
                ) : (
                  <Flex direction="column" gap="2">
                    {data?.recommendations.map((r, i) => (
                      <Flex key={i} align="start" gap="2">
                        <Box
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "var(--radius-1)",
                            background: "var(--amber-a3)",
                            color: "var(--amber-11)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 1,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {i + 1}
                        </Box>
                        <Text size="2" color="gray" style={{ lineHeight: 1.5 }}>
                          {r}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>
            </Flex>
          )}

          <Flex justify="end" pt="1">
            <Button
              variant="ghost"
              size="1"
              onClick={() => router.push("/admin/hub/reports")}
            >
              View full financial report →
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};
