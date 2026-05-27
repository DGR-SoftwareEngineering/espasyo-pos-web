import React from "react";
import { Box, Card, Flex, Grid, Text } from "@radix-ui/themes";
import {
  LocalCafeOutlined,
  EmojiEventsOutlined,
  CardGiftcardOutlined,
  AccessTimeRounded,
  TodayOutlined,
  HomeOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { CustomerDetailDto, RedeemableProductDto } from "core-lib/api/crm";
import { formatCurrency } from "core-lib/business/strings";
import { LoyaltyCardBlock } from "../components/LoyaltyCardBlock";
import { StampHistorySection } from "./StampHistorySection";
import { formatRelativeDate } from "../format";

interface LoyaltyTabProps {
  customer: CustomerDetailDto;
  onCustomerRefresh: (c: CustomerDetailDto) => void;
  refreshKey?: number;
  redeemableProducts?: RedeemableProductDto[];
}

const StatItem: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = "gray" }) => {
  const colorClass = color.includes("-") ? color : `var(--${color}-11)`;
  const bgColor = color.includes("-") ? color.replace("-11", "-a2") : `var(--${color}-a2)`;
  const borderColor = color.includes("-") ? color.replace("-11", "-a4") : `var(--${color}-a4)`;

  return (
    <Card
      variant="surface"
      size="2"
      style={{
        background: bgColor,
        borderColor: borderColor,
      }}
    >
      <Flex direction="column" gap="2">
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${bgColor}99`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colorClass,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Text size="1" color="gray" weight="medium">
            {label}
          </Text>
        </Flex>
        <Text size="5" weight="bold" style={{ color: colorClass, lineHeight: 1 }}>
          {value}
        </Text>
      </Flex>
    </Card>
  );
};

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  customer,
  onCustomerRefresh,
  refreshKey = 0,
  redeemableProducts = [],
}) => {
  const card = customer.loyaltyCard;
  const stampsInCurrentCard = (card?.totalStamps ?? 0) % 6;
  const stampsToNextReward = card?.availableRewards && card.availableRewards > 0 ? 0 : 6 - stampsInCurrentCard;
  const progressPercent = stampsInCurrentCard > 0 ? (stampsInCurrentCard / 6) * 100 : 0;

  return (
    <Flex direction="column" gap="4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }}>
        <Card variant="surface" size="3">
          <Flex align="center" gap="2" mb="3">
            <LocalCafeOutlined style={{ fontSize: 18, color: "var(--brown-11, #4A2F1E)" }} />
            <Text size="3" weight="bold">
              Loyalty Card
            </Text>
          </Flex>
          <LoyaltyCardBlock
            customer={customer}
            mode="admin"
            onCustomerRefresh={onCustomerRefresh}
          />
          <Text size="1" color="gray" mt="3" as="div">
            Tip: Only the next available slot (highlighted in blue) can be stamped — stamps must be earned in order. Reward slots (6 and 12) glow gold when ready to redeem.
          </Text>
        </Card>
      </motion.div>

      {card && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <Card variant="surface" size="3">
            <Flex align="center" gap="2" mb="3">
              <EmojiEventsOutlined style={{ fontSize: 18, color: "var(--amber-11)" }} />
              <Text size="3" weight="bold">
                {card.availableRewards > 0 ? "🎉 Reward Ready!" : `${stampsToNextReward} stamps to next reward`}
              </Text>
            </Flex>

            {card.availableRewards > 0 ? (
              <Box
                style={{
                  padding: 12,
                  borderRadius: "var(--radius-3)",
                  background: "var(--amber-a2)",
                  border: "2px solid var(--amber-8)",
                  textAlign: "center",
                }}
              >
                <Text size="3" weight="bold" style={{ color: "var(--amber-11)" }}>
                  {card.availableRewards} Reward{card.availableRewards !== 1 ? "s" : ""} Available
                </Text>
              </Box>
            ) : (
              <Box>
                <Flex justify="between" align="center" gap="2" mb="2">
                  <Text size="1" color="gray">{stampsInCurrentCard} / 6 stamps</Text>
                  <Text size="1" color="gray" weight="medium">{Math.round(progressPercent)}%</Text>
                </Flex>
                <Box
                  style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 4,
                    background: "var(--amber-a3)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "var(--amber-9)",
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16 }}>
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3">
          <StatItem
            label="Total Stamps"
            value={String(card?.totalStamps ?? 0)}
            icon={<LocalCafeOutlined style={{ fontSize: 16 }} />}
            color="brown"
          />
          <StatItem
            label="Rewards Available"
            value={String(card?.availableRewards ?? 0)}
            icon={<EmojiEventsOutlined style={{ fontSize: 16 }} />}
            color="amber"
          />
          <StatItem
            label="Stamps Today"
            value={
              card?.dailyStampLimit === 0
                ? `${card?.stampsToday ?? 0} (unlimited)`
                : `${card?.stampsToday ?? 0} / ${card?.dailyStampLimit ?? 3}`
            }
            icon={<TodayOutlined style={{ fontSize: 16 }} />}
            color={card?.canStampToday === false ? "red" : "gray"}
          />
          <StatItem
            label="Rewards Earned"
            value={String(card?.totalRewardsEarned ?? 0)}
            icon={<CardGiftcardOutlined style={{ fontSize: 16 }} />}
            color="green"
          />
          <StatItem
            label="Rewards Redeemed"
            value={String(card?.totalRewardsRedeemed ?? 0)}
            icon={<CardGiftcardOutlined style={{ fontSize: 16 }} />}
            color="indigo"
          />
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.24 }}>
        <Card variant="surface" size="3">
          <Flex align="center" gap="2" mb="3">
            <AccessTimeRounded style={{ fontSize: 18, color: "var(--gray-11)" }} />
            <Text size="3" weight="bold">
              Activity
            </Text>
          </Flex>
          <Grid columns={{ initial: "1", sm: "2" }} gap="3">
            <InfoRow
              icon={<LocalCafeOutlined style={{ fontSize: 16 }} />}
              label="Last stamp"
              value={formatRelativeDate(card?.lastStampedAt)}
            />
            <InfoRow
              icon={<EmojiEventsOutlined style={{ fontSize: 16 }} />}
              label="Last redeem"
              value={formatRelativeDate(card?.lastRedeemedAt)}
            />
            <InfoRow
              icon={<TodayOutlined style={{ fontSize: 16 }} />}
              label="Daily status"
              value={
                card?.dailyStampLimit === 0
                  ? "Unlimited"
                  : card?.canStampToday === false
                    ? "Limit reached"
                    : `${card?.dailyStampsRemaining ?? "?"} remaining`
              }
            />
          </Grid>
        </Card>
      </motion.div>

      {redeemableProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.32 }}>
          <Card variant="surface" size="3">
            <Flex align="center" gap="2" mb="3">
              <CardGiftcardOutlined style={{ fontSize: 18, color: "var(--blue-11)" }} />
              <Text size="3" weight="bold">
                Available Rewards ({redeemableProducts.length})
              </Text>
            </Flex>
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="3">
              {redeemableProducts.map((product) => (
                <Card key={product.productID} variant="classic" size="2">
                  <Flex direction="column" gap="2">
                    {product.imageUrl && (
                      <Box
                        style={{
                          width: "100%",
                          height: 150,
                          backgroundColor: "var(--gray-3)",
                          borderRadius: "var(--radius-2)",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    )}
                    <Box>
                      <Text size="2" weight="bold">
                        {product.name}
                      </Text>
                      <Text size="1" color="gray" as="div" mt="1">
                        {product.description}
                      </Text>
                    </Box>
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray">
                        {product.productCategoryName}
                      </Text>
                      <Text size="2" weight="bold" color="blue">
                        {formatCurrency(product.unitPrice)}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
        <StampHistorySection
          customerId={customer.customerID}
          refreshKey={refreshKey}
        />
      </motion.div>
    </Flex>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <Flex gap="3" align="start">
    <Box
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--gray-a3)",
        color: "var(--gray-11)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
      <Text size="1" color="gray">
        {label}
      </Text>
      <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
        {value || "—"}
      </Text>
    </Flex>
  </Flex>
);
