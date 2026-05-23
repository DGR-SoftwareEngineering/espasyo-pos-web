import React from "react";
import { Dialog, Box, Button, Flex, Text, Badge, Heading, Separator } from "@radix-ui/themes";
import { PromoDto, SellableProductDto } from "core-lib/api/commons/types";

interface Props {
  product: SellableProductDto;
  promos: PromoDto[];
  onApply: (promo: PromoDto) => void;
  onClose: () => void;
}

const getPromoTypeBadgeColor = (type: string) => {
  switch (type) {
    case "PercentageDiscount":
      return "amber";
    case "FixedDiscount":
      return "blue";
    case "BuyXGetY":
      return "green";
    case "Bundle":
      return "violet";
    default:
      return "gray";
  }
};

const getPromoDiscountText = (promo: PromoDto) => {
  switch (promo.type) {
    case "PercentageDiscount":
      return `${promo.discountPercent ?? 0}% OFF`;
    case "FixedDiscount":
      return `₱${promo.discountAmount ?? 0} OFF`;
    case "BuyXGetY":
      return `Buy ${promo.buyQuantity ?? 1} Get ${promo.getQuantity ?? 1} Free`;
    case "Bundle":
      return `Bundle Price: ₱${promo.bundlePrice ?? 0}`;
    default:
      return "Promo";
  }
};

import { StarIcon } from "@radix-ui/react-icons";

export const PromoSelectDialog: React.FC<Props> = ({
  product,
  promos,
  onApply,
  onClose,
}) => {
  if (promos.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        style={{
          maxWidth: 500,
          borderRadius: "var(--radius-3)",
        }}
      >
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Text size="5" weight="bold">
              🏷️ Available Promos
            </Text>
          </Flex>
          <Text size="2" color="gray">
            for {product.name}
          </Text>
        </Dialog.Title>

        <Separator my="3" />

        <Box style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Flex direction="column" gap="3">
            {promos.map((promo) => (
              <Box
                key={promo.promoID}
                p="4"
                style={{
                  border: "1px solid var(--gray-a6)",
                  borderRadius: "var(--radius-2)",
                  background: "var(--gray-a2)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--amber-a8)";
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--amber-a3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--gray-a6)";
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--gray-a2)";
                }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2" justify="between">
                    <Heading size="3">{promo.title}</Heading>
                    <Badge color={getPromoTypeBadgeColor(promo.type)} size="2">
                      {promo.type}
                    </Badge>
                  </Flex>

                  {promo.description && (
                    <Text size="2" color="gray">
                      {promo.description}
                    </Text>
                  )}

                  <Text
                    size="3"
                    weight="bold"
                    style={{
                      color: "var(--amber-11)",
                      marginTop: 8,
                    }}
                  >
                    {getPromoDiscountText(promo)}
                  </Text>

                  {promo.originalPrice && promo.promoPrice && (
                    <Flex align="center" gap="2">
                      <Text size="2">
                        <s style={{ color: "var(--gray-9)" }}>
                          ₱{promo.originalPrice.toFixed(2)}
                        </s>
                      </Text>
                      <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
                        ₱{promo.promoPrice.toFixed(2)}
                      </Text>
                    </Flex>
                  )}

                  <Button
                    color="green"
                    size="2"
                    onClick={() => onApply(promo)}
                    style={{ marginTop: 8, width: "100%" }}
                  >
                    Apply Promo
                  </Button>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>

        <Separator my="3" />

        <Flex justify="end" gap="2">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
