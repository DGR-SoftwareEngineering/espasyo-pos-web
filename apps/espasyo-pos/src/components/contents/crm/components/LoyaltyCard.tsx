import React, { useMemo } from "react";
import { Badge, Box, Callout, Flex, Text, Tooltip } from "@radix-ui/themes";
import {
  LocalCafeOutlined,
  EmojiEventsOutlined,
  AddCircleOutline,
  AccessTimeRounded,
  BlockOutlined,
} from "@mui/icons-material";
import { CustomerLoyaltyCardDto } from "core-lib/api/crm";
import { usePublicSettings } from "core-lib";
import {
  BUSINESS_LOGO_SRC,
  BUSINESS_NAME,
  LOYALTY_REWARD_SLOTS,
  LOYALTY_TOTAL_SLOTS,
} from "../constants";

export type LoyaltyCardMode = "admin" | "cashier" | "pos" | "readonly";

interface LoyaltyCardProps {
  card: CustomerLoyaltyCardDto | null;
  customerName?: string;
  mode?: LoyaltyCardMode;
  /** Next-slot click. Receives the 1-based slot number. */
  onStampClick?: (slotNumber: number) => void;
  /** Filled-reward circle click when availableRewards > 0. */
  onRedeemClick?: () => void;
  loading?: boolean;
  /** Compact strip variant — single row, no left panel. Used inside POS attach widget. */
  compact?: boolean;
}

interface SlotState {
  number: number;
  filled: boolean;
  isReward: boolean;
  isRedeemable: boolean;
  isNextSlot: boolean;
}

const computeSlots = (
  totalStamps: number,
  availableRewards: number,
  nextStampPosition: number,
): SlotState[] => {
  const safeTotal = Math.max(0, totalStamps ?? 0);
  const safeNextPos = Math.max(1, Math.min(12, nextStampPosition));
  const safeRewards = Math.max(0, availableRewards ?? 0);

  // At a 12-stamp completion boundary with unclaimed rewards → show the
  // completed card (all 12 filled + reward highlights). Once all rewards are
  // redeemed, show the new empty card (nextStampPos = 1, filledCount = 0).
  const atBoundary = safeTotal > 0 && safeTotal % LOYALTY_TOTAL_SLOTS === 0;
  const filledCount =
    atBoundary && safeRewards > 0 ? LOYALTY_TOTAL_SLOTS : safeNextPos - 1;

  let rewardsToHighlight = safeRewards;
  return Array.from({ length: LOYALTY_TOTAL_SLOTS }, (_, idx) => {
    const number = idx + 1;
    const filled = number <= filledCount;
    const isNextSlot = !filled && number === safeNextPos;
    const isReward = (LOYALTY_REWARD_SLOTS as readonly number[]).includes(number);
    let isRedeemable = false;
    if (filled && isReward && rewardsToHighlight > 0) {
      isRedeemable = true;
      rewardsToHighlight -= 1;
    }
    return { number, filled, isReward, isRedeemable, isNextSlot };
  });
};

/** Single circle. Tweaks size + interaction by mode. */
const StampCircle: React.FC<{
  slot: SlotState;
  size: number;
  interactive: boolean;
  stampDisabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}> = ({ slot, size, interactive, stampDisabled, loading, onClick }) => {
  const tooltipText = (() => {
    if (slot.filled && slot.isRedeemable)
      return "Free 12oz drink — click to redeem";
    if (slot.filled && slot.isReward) return "Reward earned & redeemed";
    if (slot.filled) return `Stamp #${slot.number}`;
    if (slot.isNextSlot && stampDisabled) return "Daily stamp limit reached";
    if (slot.isNextSlot) return "Next stamp — click to add";
    if (slot.isReward) return `Slot ${slot.number} — Free 12oz drink reward`;
    return interactive
      ? `Click to add stamp at slot #${slot.number}`
      : `Slot #${slot.number}`;
  })();

  const isDisabled = loading || !interactive || (slot.isNextSlot && stampDisabled);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease",
    flexShrink: 0,
    border: "2px solid var(--gray-a6)",
    background: "var(--gray-a2)",
    color: "var(--gray-9)",
    cursor: interactive && !isDisabled ? "pointer" : "default",
    position: "relative",
  };

  let style: React.CSSProperties = { ...baseStyle };

  if (slot.filled && slot.isRedeemable) {
    style = {
      ...style,
      background: "linear-gradient(135deg, var(--amber-9), var(--amber-11))",
      borderColor: "var(--amber-11)",
      color: "white",
      boxShadow: "0 0 0 4px var(--amber-a4), 0 4px 12px var(--amber-a6)",
      animation: "loyalty-pulse 1.8s ease-in-out infinite",
    };
  } else if (slot.filled && slot.isReward) {
    style = {
      ...style,
      background: "linear-gradient(135deg, var(--amber-7), var(--amber-9))",
      borderColor: "var(--amber-9)",
      color: "white",
      boxShadow: "0 2px 6px var(--amber-a4)",
    };
  } else if (slot.filled) {
    style = {
      ...style,
      background:
        "linear-gradient(135deg, var(--brown-9, #6F4E37), var(--brown-11, #4A2F1E))",
      borderColor: "var(--brown-11, #4A2F1E)",
      color: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    };
  } else if (slot.isNextSlot && !stampDisabled) {
    // Next available slot — highlighted in indigo
    style = {
      ...style,
      border: "2px solid var(--indigo-9)",
      background: "var(--indigo-a2)",
      color: "var(--indigo-11)",
      animation: "next-slot-pulse 2s ease-in-out infinite",
    };
  } else if (slot.isNextSlot && stampDisabled) {
    // Daily limit reached — show next slot as locked
    style = {
      ...style,
      border: "2px dashed var(--red-a7)",
      background: "var(--red-a2)",
      color: "var(--red-9)",
      cursor: "not-allowed",
    };
  } else if (slot.isReward) {
    style = {
      ...style,
      border: "2px dashed var(--amber-9)",
      background: "var(--amber-a2)",
      color: "var(--amber-11)",
    };
  } else {
    style = {
      ...style,
      border: "2px dashed var(--gray-a5)",
      background: "var(--gray-a2)",
      color: "var(--gray-7)",
    };
  }

  const hoverProps =
    interactive && !isDisabled
      ? {
          onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
            if (!slot.filled && slot.isNextSlot) {
              (e.currentTarget as HTMLElement).style.background =
                "var(--indigo-a3)";
            }
          },
          onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            if (!slot.filled && slot.isNextSlot) {
              (e.currentTarget as HTMLElement).style.background =
                "var(--indigo-a2)";
            }
          },
        }
      : {};

  const iconSize = Math.round(size * 0.5);
  const inner = slot.filled ? (
    slot.isReward ? (
      <EmojiEventsOutlined style={{ fontSize: iconSize }} />
    ) : (
      <LocalCafeOutlined style={{ fontSize: iconSize }} />
    )
  ) : slot.isNextSlot && stampDisabled ? (
    <BlockOutlined style={{ fontSize: iconSize, opacity: 0.6 }} />
  ) : slot.isNextSlot ? (
    <AddCircleOutline style={{ fontSize: iconSize, opacity: 0.8 }} />
  ) : slot.isReward ? (
    <EmojiEventsOutlined style={{ fontSize: iconSize, opacity: 0.5 }} />
  ) : null;

  return (
    <Tooltip content={tooltipText}>
      <button
        type="button"
        aria-label={tooltipText}
        disabled={isDisabled}
        onClick={interactive && !isDisabled ? onClick : undefined}
        style={style}
        {...hoverProps}
      >
        {inner}
      </button>
    </Tooltip>
  );
};

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  card,
  customerName,
  mode = "readonly",
  onStampClick,
  onRedeemClick,
  loading = false,
  compact = false,
}) => {
  const totalStamps = card?.totalStamps ?? 0;
  const availableRewards = card?.availableRewards ?? 0;
  const stampsUntilNextReward =
    card?.stampsUntilNextReward ??
    (totalStamps === 0 ? 6 : 6 - (totalStamps % 6 || 6));

  const { crm } = usePublicSettings();

  // Use server-provided nextStampPosition when available; fall back to local calc
  const nextStampPos =
    card?.nextStampPosition ?? (totalStamps % LOYALTY_TOTAL_SLOTS) + 1;
  const canStampToday = card?.canStampToday ?? true;
  const dailyStampLimit = card?.dailyStampLimit ?? crm.maxStampsPerDay;
  const dailyStampsRemaining = card?.dailyStampsRemaining ?? 0;

  const slots = useMemo(
    () => computeSlots(totalStamps, availableRewards, nextStampPos),
    [totalStamps, availableRewards, nextStampPos],
  );

  const canStamp = mode === "admin" || mode === "cashier" || mode === "pos";
  const canRedeem = mode === "admin" || mode === "cashier" || mode === "pos";

  const handleSlotClick = (slot: SlotState) => {
    if (loading) return;
    if (slot.filled && slot.isRedeemable && canRedeem) {
      onRedeemClick?.();
      return;
    }
    if (slot.isNextSlot && canStamp && canStampToday) {
      onStampClick?.(slot.number);
    }
  };

  // ─── COMPACT (single 12-dot strip used in POS attach widget) ─────────────
  if (compact) {
    return (
      <Box>
        <style>{KEYFRAMES_CSS}</style>
        <Flex align="center" gap="1" wrap="wrap">
          {slots.map((s) => (
            <StampCircle
              key={s.number}
              slot={s}
              size={20}
              interactive={
                (canStamp && s.isNextSlot) || (canRedeem && s.isRedeemable)
              }
              stampDisabled={!canStampToday}
              loading={loading}
              onClick={() => handleSlotClick(s)}
            />
          ))}
        </Flex>
        <Flex direction="column" gap="1" mt="2">
          <Text size="1" color="gray">
            {totalStamps} stamps ·{" "}
            {availableRewards > 0
              ? `${availableRewards} free drink${availableRewards === 1 ? "" : "s"} ready`
              : `${stampsUntilNextReward} more for a free drink`}
          </Text>
          {dailyStampLimit > 0 && (
            <Text size="1" color={canStampToday ? "gray" : "red"}>
              {canStampToday
                ? `${dailyStampsRemaining} stamp${dailyStampsRemaining === 1 ? "" : "s"} left today`
                : "Daily limit reached · Resets tomorrow"}
            </Text>
          )}
        </Flex>
      </Box>
    );
  }

  // ─── FULL CARD ────────────────────────────────────────────────────────────
  const circleSize = 56;
  return (
    <Box
      style={{
        position: "relative",
        borderRadius: 20,
        padding: 24,
        background:
          "linear-gradient(135deg, #fffdf7 0%, #f7ebd6 55%, #efd9a8 100%)",
        border: "1px solid var(--amber-a5)",
        boxShadow:
          "0 10px 30px rgba(120, 85, 30, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        overflow: "hidden",
      }}
    >
      <style>{KEYFRAMES_CSS}</style>

      {/* subtle coffee-stain background decoration */}
      <Box
        aria-hidden
        style={{
          position: "absolute",
          right: -50,
          bottom: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(111,78,55,0.08) 0%, rgba(111,78,55,0) 70%)",
          pointerEvents: "none",
        }}
      />

      <Flex gap="6" wrap="wrap" align="center" justify="between" style={{ position: "relative" }}>
        {/* LEFT panel */}
        <Flex direction="column" gap="2" style={{ minWidth: 180, maxWidth: 240 }}>
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              padding: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={BUSINESS_LOGO_SRC}
              alt={BUSINESS_NAME}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </Box>
          <Text size="5" weight="bold" style={{ color: "var(--brown-12, #2A1B0E)" }}>
            Loyalty Card
          </Text>
          <Text size="2" style={{ color: "var(--brown-11, #4A2F1E)" }}>
            {BUSINESS_NAME}
          </Text>
          {customerName && (
            <Text size="1" color="gray" style={{ fontStyle: "italic" }}>
              {customerName}
            </Text>
          )}
          <Flex gap="2" align="center" mt="2" wrap="wrap">
            <Badge color="amber" variant="soft" size="1">
              {totalStamps} total stamp{totalStamps === 1 ? "" : "s"}
            </Badge>
            {availableRewards > 0 ? (
              <Badge color="green" variant="solid" size="1" style={{ gap: 4 }}>
                <EmojiEventsOutlined style={{ fontSize: 12 }} />
                {availableRewards} free drink{availableRewards === 1 ? "" : "s"} ready
              </Badge>
            ) : (
              <Badge color="gray" variant="soft" size="1">
                {stampsUntilNextReward} more for a free drink
              </Badge>
            )}
          </Flex>
        </Flex>

        {/* RIGHT panel — 12 circles in a 3×4 grid */}
        <Flex direction="column" gap="2">
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              padding: 14,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 16,
              border: "1px solid rgba(120, 85, 30, 0.15)",
            }}
          >
            {slots.map((s) => (
              <StampCircle
                key={s.number}
                slot={s}
                size={circleSize}
                interactive={
                  (canStamp && s.isNextSlot) || (canRedeem && s.isRedeemable)
                }
                stampDisabled={!canStampToday}
                loading={loading}
                onClick={() => handleSlotClick(s)}
              />
            ))}
          </Box>

          {/* Daily cap status */}
          {dailyStampLimit > 0 && (
            <Callout.Root
              color={canStampToday ? "blue" : "red"}
              variant="surface"
              size="1"
            >
              <Callout.Icon>
                {canStampToday
                  ? <AccessTimeRounded style={{ fontSize: 14 }} />
                  : <BlockOutlined style={{ fontSize: 14 }} />}
              </Callout.Icon>
              <Callout.Text>
                {canStampToday
                  ? `${dailyStampsRemaining} of ${dailyStampLimit} stamp${dailyStampLimit === 1 ? "" : "s"} remaining today`
                  : `Daily limit of ${dailyStampLimit} reached · Resets at midnight`}
              </Callout.Text>
            </Callout.Root>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

const KEYFRAMES_CSS = `
  @keyframes loyalty-pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px var(--amber-a4), 0 4px 12px var(--amber-a6);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 8px var(--amber-a3), 0 6px 18px var(--amber-a7);
      transform: scale(1.04);
    }
  }
  @keyframes next-slot-pulse {
    0%, 100% {
      box-shadow: 0 0 0 2px var(--indigo-a4);
    }
    50% {
      box-shadow: 0 0 0 4px var(--indigo-a3), 0 2px 8px var(--indigo-a5);
    }
  }
`;
