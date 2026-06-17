import React from "react";
import { Dialog, Box, Button, Flex, Text, Badge, Heading, Separator } from "@radix-ui/themes";
import { PromoDto, SellableProductDto } from "core-lib/api/commons/types";
import { useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

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

export const PromoSelectDialog: React.FC<Props> = ({
  product,
  promos,
  onApply,
  onClose,
}) => {
  const { isSmallMobile } = useResolution();
  if (promos.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        style={{
          ...(isSmallMobile
            ? mobileDialogStyle
            : { maxWidth: 500, borderRadius: "var(--radius-3)" }),
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

        <Separator my="3" style={isSmallMobile ? { flexShrink: 0 } : undefined} />

        <Box
          style={{
            ...(isSmallMobile
              ? mobileContentStyle
              : { maxHeight: "60vh", overflowY: "auto" }),
          }}
        >
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

                  {promo.type === "BuyXGetY" && (
                    <Text size="1" color="blue">
                      Buy {promo.buyQuantity ?? 1}, get {promo.getQuantity ?? 1} free — {promo.getQuantity ?? 1} item(s) added to cart at no charge.
                    </Text>
                  )}
                  {promo.type === "Bundle" && (
                    <Text size="1" color="violet">
                      Selecting this adds all bundle items to the cart at the combined bundle price.
                    </Text>
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

        <Flex justify="end" gap="2" style={isSmallMobile ? { flexShrink: 0, padding: "var(--space-3)" } : undefined}>
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
