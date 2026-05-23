import React from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Link,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  AutoAwesomeOutlined,
  SettingsOutlined,
  SmartToyOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { PromoSuggestionDto } from "core-lib/api/commons/types";
import { formatCurrency } from "core-lib/business/strings";
import { TYPE_CONFIG } from "../constants";

interface PromoSuggestionsPanelProps {
  suggestions: PromoSuggestionDto[];
  loading: boolean;
  onRegenerate: () => void;
  onUseSuggestion: (suggestion: PromoSuggestionDto) => void;
  isAiEnabled?: boolean;
  isAiSettingsLoading?: boolean;
}

const SuggestionCard: React.FC<{
  suggestion: PromoSuggestionDto;
  onUse: () => void;
}> = ({ suggestion, onUse }) => {
  const typeCfg = TYPE_CONFIG[suggestion.promoType] ?? {
    shortLabel: `Type ${suggestion.promoType}`,
    description: "",
  };
  const isViable = suggestion.profit >= 0;

  return (
    <Card
      variant="surface"
      style={{
        border: "1px solid var(--gray-a5)",
        background: "var(--color-background)",
      }}
    >
      <Flex direction="column" gap="2">
        <Flex align="center" gap="2" wrap="wrap">
          <Badge color="indigo" variant="soft" size="1" radius="medium">
            {typeCfg.shortLabel}
          </Badge>
          <Badge
            color={isViable ? "green" : "red"}
            variant="surface"
            size="1"
            radius="medium"
          >
            {isViable ? "Viable" : "Not Viable"}
          </Badge>
        </Flex>

        <Text size="2" weight="bold">
          {suggestion.description}
        </Text>
        <Text size="1" color="gray">
          {suggestion.reason}
        </Text>

        <Separator size="4" />

        <Flex gap="3" wrap="wrap">
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">Original</Text>
            <Text size="2" weight="medium">
              {formatCurrency(suggestion.originalPrice)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">Promo Price</Text>
            <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
              {formatCurrency(suggestion.promoPrice)}
            </Text>
          </Flex>
          <Flex direction="column" gap="0">
            <Text size="1" color="gray">Profit</Text>
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
            <Text size="1" color="gray">Margin</Text>
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
          color="indigo"
          size="2"
          onClick={onUse}
          disabled={!isViable}
        >
          Use This Suggestion
        </Button>
      </Flex>
    </Card>
  );
};

export const PromoSuggestionsPanel: React.FC<PromoSuggestionsPanelProps> = ({
  suggestions,
  loading,
  onRegenerate,
  onUseSuggestion,
  isAiEnabled,
  isAiSettingsLoading,
}) => {
  return (
    <Card variant="surface" size="3" mb="4">
      <Flex align="center" justify="between" mb="3" wrap="wrap" gap="2">
        <Flex align="center" gap="2">
          <SmartToyOutlined style={{ fontSize: 20, color: "var(--violet-11)" }} />
          <Text size="3" weight="bold">
            Promo Suggestions
          </Text>
          {!isAiSettingsLoading && (
            isAiEnabled ? (
              <Badge color="violet" variant="solid" size="1" radius="full">
                <AutoAwesomeOutlined style={{ fontSize: 10 }} />
                AI Active
              </Badge>
            ) : (
              <Badge color="gray" variant="surface" size="1">
                Rules-based
              </Badge>
            )
          )}
        </Flex>
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={onRegenerate}
          loading={loading}
        >
          <ReloadIcon />
          Regenerate
        </Button>
      </Flex>

      {!isAiSettingsLoading && !isAiEnabled && (
        <Callout.Root color="violet" variant="surface" size="1" mb="3">
          <Callout.Icon>
            <AutoAwesomeOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            <strong>Upgrade to AI-powered suggestions.</strong> Enable{" "}
            <Text weight="bold" style={{ color: "var(--violet-11)" }}>
              Promo.AI.SuggestionEnabled
            </Text>{" "}
            in{" "}
            <Flex align="center" gap="1" display="inline-flex">
              <SettingsOutlined style={{ fontSize: 12 }} />
              <Text size="1" weight="medium">Settings → System Settings → Promo</Text>
            </Flex>{" "}
            and configure an API key to get Claude-powered, context-aware recommendations.
          </Callout.Text>
        </Callout.Root>
      )}

      <Text size="2" color="gray" as="div" mb="3">
        {isAiEnabled
          ? "Suggestions are generated by AI using your live sales data and product catalog. Results are financially validated using real DB prices."
          : "Suggestions are generated from your sales data — slow-moving products, top-sellers, high-margin items, and bundle opportunities."}
      </Text>

      {loading ? (
        <Flex gap="3" wrap="wrap">
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} style={{ flex: "1 1 240px", minWidth: 240 }}>
              <Skeleton height="180px" />
            </Box>
          ))}
        </Flex>
      ) : suggestions.length === 0 ? (
        <Card variant="surface" style={{ background: "var(--gray-a2)" }}>
          <Flex align="center" justify="center" direction="column" gap="2" py="4">
            <TrendingUpOutlined style={{ fontSize: 32, color: "var(--gray-9)" }} />
            <Text size="2" color="gray">
              No suggestions available. Make sure you have active products with sales data.
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
            <SuggestionCard
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
