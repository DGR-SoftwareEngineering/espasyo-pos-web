import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { ChevronDownIcon, Cross1Icon } from "@radix-ui/react-icons";
import {
  EmojiEventsOutlined,
  PersonAddAlt1Outlined,
  LocalCafeOutlined,
  UndoOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CustomerDetailDto,
  CustomerLoyaltyCardDto,
  CustomerSearchResultDto,
  RedeemableProductDto,
} from "core-lib/api/crm";
import { AddProductOptions } from "./hooks";
import { LoyaltyCard } from "../../crm/components/LoyaltyCard";
import { AddStampDialog } from "../../crm/components/AddStampDialog";
import { RemoveStampDialog } from "../../crm/components/RemoveStampDialog";
import { SegmentBadge } from "../../crm/components/SegmentBadge";
import { CustomerPickerDialog } from "./CustomerPickerDialog";
import { RedeemRewardDialog } from "./RedeemRewardDialog";

interface CustomerAttachWidgetProps {
  selected: CustomerSearchResultDto | null;
  onAttach: (c: CustomerSearchResultDto) => void;
  onDetach: () => void;
  /** Called whenever the attached customer's underlying detail changes (e.g. after stamp). */
  onRefresh?: (refreshed: CustomerSearchResultDto) => void;
  onRedeemProductSelected: (product: RedeemableProductDto, options: AddProductOptions) => void;
  hasRedeemedInCart: boolean;
  onCancelRedeem: () => void;
  /** When true, start the widget collapsed (compact strip) if a customer is attached. */
  defaultCollapsed?: boolean;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const summaryFromDetail = (
  detail: CustomerDetailDto,
): CustomerSearchResultDto => ({
  customerID: detail.customerID,
  customerNumber: detail.customerNumber,
  fullName: detail.fullName,
  phone: detail.phone ?? null,
  email: detail.email ?? null,
  totalStamps: detail.loyaltyCard?.totalStamps ?? 0,
  availableRewards: detail.loyaltyCard?.availableRewards ?? 0,
  segment: detail.segment,
});

export const CustomerAttachWidget: React.FC<CustomerAttachWidgetProps> = ({
  selected,
  onAttach,
  onDetach,
  onRefresh,
  onRedeemProductSelected,
  hasRedeemedInCart,
  onCancelRedeem,
  defaultCollapsed,
}) => {
  const { showToast } = useToastContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [stampDialogSlot, setStampDialogSlot] = useState<number | null>(null);
  const [stampLoading, setStampLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [latestDetail, setLatestDetail] = useState<CustomerDetailDto | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultCollapsed ?? false);

  const detailCb = useApiCallback(async (api, id: string) => api.crm.getById(id));
  const stampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.addStamp(args.id, { reason: args.reason }),
  );
  const removeStampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.removeStamp(args.id, { reason: args.reason }),
  );

  // Load the full detail (for the mini loyalty card) when a search result is attached.
  React.useEffect(() => {
    let cancelled = false;
    if (!selected) {
      setLatestDetail(null);
      return;
    }
    detailCb
      .execute(selected.customerID)
      .then((r) => {
        if (!cancelled && r?.data?.response) {
          setLatestDetail(r.data.response);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.customerID]);

  // Build a synthetic loyalty card from the search result when the backend
  // hasn't created a card record yet — fixes off-by-one stamp display bug.
  const card: CustomerLoyaltyCardDto | null =
    latestDetail?.loyaltyCard ??
    (selected
      ? {
          customerLoyaltyCardID: "",
          totalStamps: selected.totalStamps,
          availableRewards: selected.availableRewards,
          totalRewardsEarned: selected.availableRewards,
          totalRewardsRedeemed: 0,
          lastStampedAt: null,
          lastRedeemedAt: null,
          stampsUntilNextReward:
            selected.totalStamps === 0
              ? 6
              : selected.totalStamps % 6 === 0
                ? 0
                : 6 - (selected.totalStamps % 6),
          // Derived positional fields (computed locally until server responds)
          stampsInCurrentCard: selected.totalStamps % 12,
          nextStampPosition: (selected.totalStamps % 12) + 1,
          remainingStamps: 12 - (selected.totalStamps % 12),
          canStampToday: true,
          dailyStampLimit: 0,
          dailyStampsRemaining: 0,
          stampsToday: 0,
        }
      : null);

  const availableRewards = card?.availableRewards ?? 0;
  const totalStamps = card?.totalStamps ?? 0;
  const canStampToday = card?.canStampToday ?? true;
  const dailyStampLimit = card?.dailyStampLimit ?? 0;

  const errorMessage = (e: unknown, fallback: string): string => {
    if (Array.isArray(e) && e.length > 0 && typeof e[0] === "string") return e[0];
    return fallback;
  };

  const handleStamp = useCallback(
    async (reason: string | null) => {
      if (!selected) return;
      setStampLoading(true);
      try {
        const result = await stampCb.execute({ id: selected.customerID, reason });
        const refreshedDetail = result?.data?.response;

        if (refreshedDetail) {
          setLatestDetail(refreshedDetail);
          onRefresh?.(summaryFromDetail(refreshedDetail));
        } else {
          // Optimistic fallback — use the currently displayed card as the base
          const oldCard = card ?? {
            customerLoyaltyCardID: "",
            totalStamps: selected.totalStamps ?? 0,
            availableRewards: selected.availableRewards ?? 0,
            totalRewardsEarned: 0,
            totalRewardsRedeemed: 0,
            lastStampedAt: null,
            lastRedeemedAt: null,
            stampsUntilNextReward:
              selected.totalStamps === 0
                ? 6
                : selected.totalStamps % 6 === 0
                  ? 0
                  : 6 - (selected.totalStamps % 6),
          };
          const oldStamps = oldCard.totalStamps ?? 0;
          const newStamps = oldStamps + 1;
          const newStampsInCard = newStamps % 12;
          const rewardsDelta = Math.floor(newStamps / 6) - Math.floor(oldStamps / 6);
          const patchedCard: CustomerLoyaltyCardDto = {
            ...oldCard,
            totalStamps: newStamps,
            stampsInCurrentCard: newStampsInCard,
            nextStampPosition: newStampsInCard + 1,
            remainingStamps: 12 - newStampsInCard,
            stampsToday: (oldCard.stampsToday ?? 0) + 1,
            dailyStampsRemaining: Math.max(0, (oldCard.dailyStampsRemaining ?? 0) - 1),
            canStampToday:
              oldCard.dailyStampLimit === 0 ||
              (oldCard.dailyStampsRemaining ?? 1) > 1,
            availableRewards: (oldCard.availableRewards ?? 0) + rewardsDelta,
            totalRewardsEarned: (oldCard.totalRewardsEarned ?? 0) + rewardsDelta,
            lastStampedAt: new Date().toISOString(),
            stampsUntilNextReward:
              newStamps > 0 && newStamps % 6 === 0 ? 0 : 6 - (newStamps % 6),
          };
          if (latestDetail) {
            const patched = { ...latestDetail, loyaltyCard: patchedCard };
            setLatestDetail(patched);
            onRefresh?.(summaryFromDetail(patched));
          } else {
            onRefresh?.({
              ...selected,
              totalStamps: newStamps,
              availableRewards: patchedCard.availableRewards,
            });
          }
        }
        showToast("Stamp added", "success");
        setStampDialogSlot(null);
      } catch (e) {
        showToast(errorMessage(e, "Failed to add stamp"), "error");
      } finally {
        setStampLoading(false);
      }
    },
    [selected, stampCb, card, latestDetail, onRefresh, showToast],
  );

  const handleRemoveStamp = useCallback(
    async (reason: string | null) => {
      if (!selected) return;
      setRemoveLoading(true);
      try {
        const result = await removeStampCb.execute({ id: selected.customerID, reason });
        const refreshedDetail = result?.data?.response;

        if (refreshedDetail) {
          setLatestDetail(refreshedDetail);
          onRefresh?.(summaryFromDetail(refreshedDetail));
        } else {
          // Optimistic fallback — use the currently displayed card as the base
          const oldCard = card ?? {
            customerLoyaltyCardID: "",
            totalStamps: selected.totalStamps ?? 0,
            availableRewards: selected.availableRewards ?? 0,
            totalRewardsEarned: 0,
            totalRewardsRedeemed: 0,
            lastStampedAt: null,
            lastRedeemedAt: null,
            stampsUntilNextReward: 6,
          };
          const oldStamps = oldCard.totalStamps ?? 0;
          const newStamps = Math.max(0, oldStamps - 1);
          const newStampsInCard = newStamps % 12;
          const rewardsLost = Math.floor(oldStamps / 6) - Math.floor(newStamps / 6);
          const patchedCard: CustomerLoyaltyCardDto = {
            ...oldCard,
            totalStamps: newStamps,
            stampsInCurrentCard: newStampsInCard,
            nextStampPosition: newStampsInCard + 1,
            remainingStamps: 12 - newStampsInCard,
            availableRewards: Math.max(0, (oldCard.availableRewards ?? 0) - rewardsLost),
            totalRewardsEarned: Math.max(0, (oldCard.totalRewardsEarned ?? 0) - rewardsLost),
            stampsUntilNextReward:
              newStamps === 0 ? 6 : newStamps % 6 === 0 ? 0 : 6 - (newStamps % 6),
          };
          if (latestDetail) {
            const patched = { ...latestDetail, loyaltyCard: patchedCard };
            setLatestDetail(patched);
            onRefresh?.(summaryFromDetail(patched));
          } else {
            onRefresh?.({
              ...selected,
              totalStamps: newStamps,
              availableRewards: patchedCard.availableRewards,
            });
          }
        }
        showToast("Stamp removed", "success");
        setRemoveDialogOpen(false);
      } catch (e) {
        showToast(errorMessage(e, "Failed to remove stamp"), "error");
      } finally {
        setRemoveLoading(false);
      }
    },
    [selected, removeStampCb, card, latestDetail, onRefresh, showToast],
  );

  // ─── No customer attached ─────────────────────────────────────────────
  if (!selected) {
    return (
      <>
        <Card variant="surface" size="2" mb="2">
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <PersonAddAlt1Outlined
                style={{ fontSize: 16, color: "var(--indigo-11)" }}
              />
              <Text size="2" weight="medium">
                Attach customer
              </Text>
              <Text size="1" color="gray">
                (optional — earns loyalty stamps)
              </Text>
            </Flex>
            <Button
              variant="soft"
              color="indigo"
              size="2"
              style={{ width: "100%" }}
              onClick={() => setPickerOpen(true)}
            >
              <PersonAddAlt1Outlined style={{ fontSize: 16 }} />
              Browse Customers
            </Button>
          </Flex>
        </Card>

        <CustomerPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onAttach={(c) => {
            onAttach(c);
            setPickerOpen(false);
          }}
        />
      </>
    );
  }

  // ─── Customer attached ────────────────────────────────────────────────
  const hasReward = availableRewards > 0;

  // ─── Compact strip (collapsed) ───────────────────────────────────────
  if (!isExpanded) {
    return (
      <>
        <Card variant="surface" size="1" mb="2">
          <Flex align="center" gap="2" style={{ minHeight: 36 }}>
            {/* Initials avatar */}
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: hasReward ? "var(--amber-a3)" : "var(--indigo-a3)",
                color: hasReward ? "var(--amber-11)" : "var(--indigo-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {getInitials(selected.fullName)}
            </Box>

            {/* Name + Segment */}
            <Flex align="center" gap="1" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Text size="2" weight="medium" truncate style={{ maxWidth: "100%" }}>
                {selected.fullName}
              </Text>
              <SegmentBadge segment={selected.segment} size="1" />
            </Flex>

            {/* Stamp count */}
            {totalStamps > 0 && (
              <Badge color="indigo" variant="soft" size="1" style={{ flexShrink: 0 }}>
                ★ {totalStamps}
              </Badge>
            )}

            {/* Reward badge — clickable to open redeem */}
            {availableRewards > 0 && (
              <Badge
                color="amber"
                variant="solid"
                size="1"
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={() => setRedeemDialogOpen(true)}
              >
                🎁 {availableRewards}
              </Badge>
            )}

            {/* Cancel Redeem (compact) */}
            {hasRedeemedInCart && (
              <Badge
                color="red"
                variant="soft"
                size="1"
                style={{ flexShrink: 0, cursor: "pointer" }}
                onClick={onCancelRedeem}
              >
                Cancel Redeem
              </Badge>
            )}

            {/* Daily limit badge */}
            {!canStampToday && dailyStampLimit > 0 && (
              <Badge color="red" variant="soft" size="1" style={{ flexShrink: 0 }}>
                ⏱ Daily limit
              </Badge>
            )}

            {/* Expand button */}
            <Tooltip content="View loyalty details">
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                onClick={() => setIsExpanded(true)}
                aria-label="Expand customer details"
              >
                <ChevronDownIcon />
              </IconButton>
            </Tooltip>

            {/* Detach button */}
            <Tooltip content="Detach customer">
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                onClick={onDetach}
                aria-label="Detach customer"
              >
                <Cross1Icon />
              </IconButton>
            </Tooltip>
          </Flex>
        </Card>

        <RedeemRewardDialog
          open={redeemDialogOpen}
          onOpenChange={setRedeemDialogOpen}
          customerID={selected.customerID}
          customerName={selected.fullName}
          onSelectProduct={(product, options) => {
            onRedeemProductSelected(product, options);
            setRedeemDialogOpen(false);
          }}
        />
      </>
    );
  }

  // ─── Expanded state ───────────────────────────────────────────────────
  return (
    <>
      <Card
        variant="surface"
        size="2"
        mb="2"
        style={{
          borderColor: hasReward ? "var(--amber-a7)" : undefined,
          background: hasReward
            ? "linear-gradient(135deg, var(--amber-a3), var(--color-background) 60%)"
            : undefined,
          boxShadow: hasReward ? "0 0 0 1px var(--amber-a5)" : undefined,
        }}
      >
        <Flex direction="column" gap="2">
          <Flex justify="between" align="start" gap="2" wrap="wrap">
            <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="3" weight="bold" truncate>
                  {selected.fullName}
                </Text>
                <SegmentBadge segment={selected.segment} size="1" />
              </Flex>
              <Flex gap="2" align="center" wrap="wrap">
                <Badge color="indigo" variant="soft" size="1">
                  {selected.customerNumber}
                </Badge>
                {selected.phone && (
                  <Text size="1" color="gray">
                    {selected.phone}
                  </Text>
                )}
              </Flex>
            </Flex>

            <Flex align="center" gap="1">
              <Tooltip content="Collapse">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="1"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Collapse customer details"
                  style={{ transform: "rotate(180deg)" }}
                >
                  <ChevronDownIcon />
                </IconButton>
              </Tooltip>
              <Tooltip content="Detach customer">
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="1"
                  onClick={onDetach}
                  aria-label="Detach customer"
                >
                  <Cross1Icon />
                </IconButton>
              </Tooltip>
            </Flex>
          </Flex>

          {/* Compact loyalty strip */}
          <Box>
            <LoyaltyCard
              card={card}
              customerName={selected.fullName}
              mode="cashier"
              compact
              loading={stampLoading || removeLoading}
              onStampClick={(slot) => setStampDialogSlot(slot)}
              onRedeemClick={() => setRedeemDialogOpen(true)}
            />
          </Box>

          {hasRedeemedInCart ? (
            <Button
              color="red"
              variant="soft"
              size="2"
              onClick={onCancelRedeem}
              style={{ width: "100%" }}
            >
              <EmojiEventsOutlined style={{ fontSize: 16 }} />
              Cancel Redeem
            </Button>
          ) : hasReward ? (
            <Button
              color="amber"
              variant="solid"
              size="2"
              onClick={() => setRedeemDialogOpen(true)}
              style={{ width: "100%" }}
            >
              <EmojiEventsOutlined style={{ fontSize: 16 }} />
              Redeem Free Drink ({availableRewards})
            </Button>
          ) : null}

          {!hasReward && totalStamps > 0 && (
            <Flex justify="between" align="center" gap="2">
              <Text size="1" color="gray">
                <LocalCafeOutlined style={{ fontSize: 12, verticalAlign: "middle" }} />{" "}
                {totalStamps} stamps · this sale will add 1 stamp on completion
              </Text>
              <Button
                variant="ghost"
                color="red"
                size="1"
                disabled={stampLoading || removeLoading}
                onClick={() => setRemoveDialogOpen(true)}
              >
                <UndoOutlined style={{ fontSize: 13 }} />
                Remove last stamp
              </Button>
            </Flex>
          )}
        </Flex>
      </Card>

      <AddStampDialog
        open={stampDialogSlot != null}
        customerName={selected.fullName}
        slotNumber={stampDialogSlot}
        loading={stampLoading}
        onClose={() => (stampLoading ? null : setStampDialogSlot(null))}
        onSubmit={handleStamp}
      />

      <RemoveStampDialog
        open={removeDialogOpen}
        customerName={selected.fullName}
        currentStamps={totalStamps}
        loading={removeLoading}
        onClose={() => (removeLoading ? undefined : setRemoveDialogOpen(false))}
        onSubmit={handleRemoveStamp}
      />

      <RedeemRewardDialog
        open={redeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
        customerID={selected.customerID}
        customerName={selected.fullName}
        onSelectProduct={(product, options) => {
          onRedeemProductSelected(product, options);
          setRedeemDialogOpen(false);
        }}
      />

    </>
  );
};
