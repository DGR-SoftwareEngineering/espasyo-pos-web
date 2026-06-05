import React from "react";
import { Badge, Box, Card, Flex, Separator, Text } from "@radix-ui/themes";
import {
  AttachMoneyOutlined,
  EventNoteOutlined,
  ReceiptLongOutlined,
  TrendingUpOutlined,
  AccessTimeRounded,
  ArrowBackIosNewRounded,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { CustomerDetailDto, CustomerSegment } from "core-lib/api/crm";
import { formatCurrency } from "core-lib/business/strings";
import { computeAOV, formatBirthday, formatRelativeDate } from "../format";
import { SegmentBadge } from "../components/SegmentBadge";
import { SEGMENT_CONFIG } from "../constants";

interface StatsHeaderProps {
  customer: CustomerDetailDto;
  onBack?: () => void;
  rightActions?: React.ReactNode;
}

const tintForSegment = (s: CustomerSegment): string => {
  const color = SEGMENT_CONFIG[s]?.color ?? "gray";
  // Use the existing radix color scale tokens. Most -a2 tokens are valid.
  return `var(--${color}-a3)`;
};

function formatMemberDuration(createdAt: string | null | undefined): string {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

const MiniKpiCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = "gray" }) => {
  const colorClass = color.includes("-") ? color : `var(--${color}-11)`;
  const bgColor = color.includes("-") ? color.replace("-11", "-a2") : `var(--${color}-a2)`;
  const borderColor = color.includes("-") ? color.replace("-11", "-a4") : `var(--${color}-a4)`;

  return (
    <Box
      style={{
        padding: "10px 14px",
        borderRadius: "var(--radius-3)",
        background: bgColor,
        border: `1px solid ${borderColor}`,
        minWidth: 0,
      }}
    >
      <Flex align="center" gap="2" mb="1">
        <Box style={{ width: 28, height: 28, borderRadius: 6, background: `${bgColor}99`, display: "flex", alignItems: "center", justifyContent: "center", color: colorClass, flexShrink: 0 }}>
          {icon}
        </Box>
        <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", fontSize: 10 }}>
          {label}
        </Text>
      </Flex>
      <Text size="4" weight="bold" style={{ color: colorClass, lineHeight: 1 }}>
        {value}
      </Text>
    </Box>
  );
};

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  customer,
  onBack,
  rightActions,
}) => {
  const aov = computeAOV(customer.totalSpend, customer.totalVisits);
  const memberDuration = formatMemberDuration(customer.createdAt);
  const displayTags = (customer.tags ?? []).slice(0, 4);
  const moreTags = (customer.tags ?? []).length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card
        variant="surface"
        size="3"
        mb="4"
        style={{
          background: `linear-gradient(135deg, ${tintForSegment(customer.segment)} 0%, var(--color-background) 70%)`,
          borderColor: "var(--gray-a4)",
        }}
      >
        <Flex direction="column" gap="3">
          {onBack && (
            <Box>
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gray-11)",
                  padding: 0,
                  fontSize: 12,
                }}
              >
                <ArrowBackIosNewRounded style={{ fontSize: 12 }} />
                All customers
              </button>
            </Box>
          )}

          <Flex justify="between" align="start" gap="4" wrap="wrap">
            <Flex align="center" gap="3" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  background: "var(--accent-a4)",
                  color: "var(--accent-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 28,
                  border: `3px solid var(--${SEGMENT_CONFIG[customer.segment]?.color ?? "gray"}-8)`,
                  flexShrink: 0,
                }}
              >
                {(customer.firstName?.[0] ?? "?").toUpperCase()}
                {(customer.lastName?.[0] ?? "").toUpperCase()}
              </Box>
              <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
                <Flex align="center" gap="2" wrap="wrap">
                  <Text size="6" weight="bold" style={{ lineHeight: 1 }}>
                    {customer.fullName}
                  </Text>
                  <SegmentBadge segment={customer.segment} size="2" tooltip />
                  {!customer.isActive && (
                    <Badge color="gray" variant="soft" size="1">
                      Inactive
                    </Badge>
                  )}
                </Flex>

                {displayTags.length > 0 && (
                  <Flex gap="1" wrap="wrap" align="center">
                    {displayTags.map((tag) => (
                      <Badge key={tag} color="orange" variant="soft" size="1">
                        {tag}
                      </Badge>
                    ))}
                    {moreTags > 0 && (
                      <Badge color="gray" variant="soft" size="1">
                        +{moreTags}
                      </Badge>
                    )}
                  </Flex>
                )}

                <Flex align="center" gap="2" wrap="wrap">
                  <Badge color="indigo" variant="soft">
                    {customer.customerNumber}
                  </Badge>
                  {memberDuration && (
                    <Badge color="indigo" variant="soft">
                      {memberDuration} member
                    </Badge>
                  )}
                  {customer.phone && (
                    <Text size="2" color="gray">
                      {customer.phone}
                    </Text>
                  )}
                  {customer.email && (
                    <Text size="2" color="gray">
                      · {customer.email}
                    </Text>
                  )}
                  {customer.birthday && (
                    <Text size="2" color="gray">
                      · 🎂 {formatBirthday(customer.birthday)}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Flex>

            {rightActions && <Flex gap="2">{rightActions}</Flex>}
          </Flex>

          <Separator size="4" />

          <Box>
            <Flex style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
              <MiniKpiCard
                label="Total Visits"
                value={String(customer.totalVisits)}
                icon={<EventNoteOutlined style={{ fontSize: 14 }} />}
                color="blue"
              />
              <MiniKpiCard
                label="Lifetime Spend"
                value={formatCurrency(customer.totalSpend)}
                icon={<AttachMoneyOutlined style={{ fontSize: 14 }} />}
                color="green"
              />
              <MiniKpiCard
                label="Avg. Order"
                value={formatCurrency(aov)}
                icon={<TrendingUpOutlined style={{ fontSize: 14 }} />}
                color="indigo"
              />
              <MiniKpiCard
                label="Last Visit"
                value={formatRelativeDate(customer.lastVisitAt)}
                icon={<AccessTimeRounded style={{ fontSize: 14 }} />}
                color="gray"
              />
              <MiniKpiCard
                label="Loyalty Stamps"
                value={String(customer.loyaltyCard?.totalStamps ?? 0)}
                icon={<ReceiptLongOutlined style={{ fontSize: 14 }} />}
                color="brown"
              />
              <MiniKpiCard
                label="First Visit"
                value={formatRelativeDate(customer.firstVisitAt)}
                icon={<CalendarTodayOutlined style={{ fontSize: 14 }} />}
                color="teal"
              />
            </Flex>
          </Box>
        </Flex>
      </Card>
    </motion.div>
  );
};
