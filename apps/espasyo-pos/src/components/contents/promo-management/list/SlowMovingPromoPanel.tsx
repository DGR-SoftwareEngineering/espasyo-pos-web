import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Card,
  Skeleton,
} from "@radix-ui/themes";;
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  TrendingDownOutlined,
  TrendingUpOutlined,
  AutoAwesomeOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { formatCurrency } from "core-lib/business/strings";
import { SlowMovingPromoQueryParams, SlowMovingPromoSuggestionDto, PromoSuggestionDto } from "core-lib/api/commons/types";

interface SlowMovingPromoPanelProps {
  onUseSuggestion: (suggestion: PromoSuggestionDto) => void;
}

const SlowMovingCard: React.FC<{
  suggestion: SlowMovingPromoSuggestionDto;
  onUse: () => void;
}> = ({ suggestion, onUse }) => {
  const isViable = suggestion.profit >= 0;
  const qtyPercent = Math.min(suggestion.quantitySold / 10, 1) * 100;

  return (
    <Card
      variant="surface"
      style={{
        border: "1px solid var(--orange-a5)",
        background: "var(--color-background)",
      }}
    >
      <Flex direction="column" gap="2">
        {/* Header */}
        <Flex align="start" justify="between" gap="2">
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text size="2" weight="bold">
              {suggestion.productName}
            </Text>
            {suggestion.description && (
              <Text size="1" color="gray">
                {suggestion.description}
              </Text>
            )}
          </Flex>
          <Badge color="orange" variant="surface" size="1" style={{ whiteSpace: "nowrap" }}>
            10% Off
          </Badge>
        </Flex>

        {/* Qty Sold — the core slow signal */}
        <Flex
          align="center"
          gap="2"
          px="2"
          py="1"
          style={{
            background: "var(--orange-a2)",
            borderRadius: 6,
            borderLeft: "3px solid var(--orange-9)",
          }}
        >
          <TrendingDownOutlined style={{ fontSize: 14, color: "var(--orange-11)" }} />
          <Text size="1" weight="medium" color="orange" style={{ color: "var(--orange-11)" }}>
            {suggestion.quantitySold.toFixed(1)} units sold
          </Text>
          <Box style={{ flex: 1 }} />
          <Box
            style={{
              background: "var(--orange-9)",
              height: 4,
              borderRadius: 2,
              width: `${Math.max(qtyPercent, 10)}px`,
            }}
          />
        </Flex>

        {/* Revenue in period */}
        <Flex align="center" justify="between" gap="2">
          <Text size="1" color="gray">
            Period Revenue
          </Text>
          <Text size="2" weight="medium">
            {formatCurrency(suggestion.revenue)}
          </Text>
        </Flex>

        <Separator size="4" />

        {/* Pricing */}
        <Flex gap="3" wrap="wrap">
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">
              Original
            </Text>
            <Text size="2" weight="medium">
              {formatCurrency(suggestion.originalPrice)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">
              Promo Price
            </Text>
            <Text size="2" weight="bold" style={{ color: "var(--orange-11)" }}>
              {formatCurrency(suggestion.promoPrice)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">
              Profit
            </Text>
            <Text
              size="2"
              weight="medium"
              style={{
                color: suggestion.profit >= 0 ? "var(--green-11)" : "var(--red-11)",
              }}
            >
              {formatCurrency(suggestion.profit)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">
              Margin
            </Text>
            <Text
              size="2"
              weight="bold"
              style={{
                color:
                  suggestion.margin >= 20
                    ? "var(--green-11)"
                    : suggestion.margin >= 5
                      ? "var(--orange-11)"
                      : "var(--red-11)",
              }}
            >
              {suggestion.margin.toFixed(1)}%
            </Text>
          </Flex>
        </Flex>

        <Button
          variant="soft"
          color="orange"
          size="2"
          onClick={onUse}
          disabled={!isViable}
        >
          <AutoAwesomeOutlined style={{ fontSize: 14 }} />
          Create Promo
        </Button>
      </Flex>
    </Card>
  );
};

export const SlowMovingPromoPanel: React.FC<SlowMovingPromoPanelProps> = ({
  onUseSuggestion,
}) => {
  const [suggestions, setSuggestions] = useState<SlowMovingPromoSuggestionDto[]>([]);

  const suggestionsCb = useApiCallback(
    async (api, params: SlowMovingPromoQueryParams = {}) =>
      api.commons.productPerformancePromoSuggestions(params),
  );

  const loadSuggestions = useCallback(async () => {
    const result = await suggestionsCb.execute({});
    setSuggestions(result?.data?.response ?? []);
  }, [suggestionsCb]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  return (
    <Card
      variant="surface"
      size="3"
      mb="4"
      style={{
        background: "linear-gradient(135deg, var(--orange-a3) 0%, var(--amber-a3) 100%)",
      }}
    >
      <Flex align="center" justify="between" mb="3" wrap="wrap" gap="2">
        <Flex align="center" gap="2">
          <TrendingDownOutlined style={{ fontSize: 20, color: "var(--orange-11)" }} />
          <Text size="3" weight="bold">
            Slow-Mover Auto Suggestions
          </Text>
          <Badge color="orange" variant="soft" size="1" radius="full">
            <AutoAwesomeOutlined style={{ fontSize: 10 }} />
            10% Off
          </Badge>
        </Flex>
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={loadSuggestions}
          loading={suggestionsCb.loading}
        >
          <ReloadIcon />
          Refresh
        </Button>
      </Flex>

      <Text size="2" color="gray" as="div" mb="3">
        Auto-generated discount recommendations for your slowest-selling items. Only
        suggestions with positive profit margins are shown.
      </Text>

      {suggestionsCb.loading ? (
        <Flex gap="3" wrap="wrap">
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} style={{ flex: "1 1 240px", minWidth: 240 }}>
              <Skeleton height="280px" />
            </Box>
          ))}
        </Flex>
      ) : suggestions.length === 0 ? (
        <Card variant="surface" style={{ background: "var(--gray-a2)" }}>
          <Flex align="center" justify="center" direction="column" gap="2" py="4">
            <TrendingUpOutlined style={{ fontSize: 32, color: "var(--green-9)" }} />
            <Text size="2" color="gray">
              No slow-moving products detected. All your items are selling well!
            </Text>
          </Flex>
        </Card>
      ) : (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {suggestions.map((s, idx) => (
            <SlowMovingCard
              key={idx}
              suggestion={s}
              onUse={() => onUseSuggestion(s)}
            />
          ))}
        </Box>
      )}
    </Card>
  );
};
