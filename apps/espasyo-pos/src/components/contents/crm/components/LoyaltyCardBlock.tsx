import React, { useCallback, useState } from "react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { EmojiEventsOutlined, UndoOutlined } from "@mui/icons-material";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { useToastContext } from "core-lib";
import { CustomerDetailDto } from "core-lib/api/crm";
import { LoyaltyCard, LoyaltyCardMode } from "./LoyaltyCard";
import { AddStampDialog } from "./AddStampDialog";
import { RemoveStampDialog } from "./RemoveStampDialog";
import { DIALOG_TITLES, LOYALTY_TOTAL_SLOTS } from "../constants";

interface LoyaltyCardBlockProps {
  customer: CustomerDetailDto | null;
  mode?: LoyaltyCardMode;
  compact?: boolean;
  /** Called with the refreshed customer after a stamp/redeem succeeds. */
  onCustomerRefresh?: (updated: CustomerDetailDto) => void;
}

export const LoyaltyCardBlock: React.FC<LoyaltyCardBlockProps> = ({
  customer,
  mode = "admin",
  compact = false,
  onCustomerRefresh,
}) => {
  const { showToast } = useToastContext();

  const [stampDialogSlot, setStampDialogSlot] = useState<number | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [redeemConfirmOpen, setRedeemConfirmOpen] = useState(false);
  const [stampLoading, setStampLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const { isSmallMobile } = useResolution();

  const addStampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.addStamp(args.id, { reason: args.reason }),
  );
  const removeStampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.removeStamp(args.id, { reason: args.reason }),
  );
  const redeemCb = useApiCallback(async (api, id: string) =>
    api.crm.confirmRedeem(id),
  );
  const refetchCb = useApiCallback(async (api, id: string) => api.crm.getById(id));

  const errorMessage = (e: unknown, fallback: string): string => {
    if (Array.isArray(e) && e.length > 0 && typeof e[0] === "string") return e[0];
    return fallback;
  };

  const handleStampSubmit = useCallback(
    async (reason: string | null) => {
      if (!customer) return;
      setStampLoading(true);
      try {
        const result = await addStampCb.execute({ id: customer.customerID, reason });
        const refreshed = result?.data?.response;

        showToast("Stamp added", "success");
        setStampDialogSlot(null);

        if (refreshed) {
          onCustomerRefresh?.(refreshed);
        } else {
          const oldCard = customer.loyaltyCard!;
          const oldStamps = oldCard.totalStamps ?? 0;
          const newStamps = oldStamps + 1;
          const newStampsInCard = newStamps % LOYALTY_TOTAL_SLOTS;
          const rewardsDelta = Math.floor(newStamps / 6) - Math.floor(oldStamps / 6);
          onCustomerRefresh?.({
            ...customer,
            loyaltyCard: {
              ...oldCard,
              totalStamps: newStamps,
              stampsInCurrentCard: newStampsInCard,
              nextStampPosition: newStampsInCard + 1,
              remainingStamps: LOYALTY_TOTAL_SLOTS - newStampsInCard,
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
            },
          });
        }
      } catch (e) {
        showToast(errorMessage(e, "Failed to add stamp"), "error");
      } finally {
        setStampLoading(false);
      }
    },
    [customer, addStampCb, onCustomerRefresh, showToast],
  );

  const handleRemoveStamp = useCallback(
    async (reason: string | null) => {
      if (!customer) return;
      setRemoveLoading(true);
      try {
        const result = await removeStampCb.execute({ id: customer.customerID, reason });
        const refreshed = result?.data?.response;

        showToast("Stamp removed", "success");
        setRemoveDialogOpen(false);

        if (refreshed) {
          onCustomerRefresh?.(refreshed);
        } else {
          const oldCard = customer.loyaltyCard!;
          const oldStamps = oldCard.totalStamps ?? 0;
          const newStamps = Math.max(0, oldStamps - 1);
          const newStampsInCard = newStamps % LOYALTY_TOTAL_SLOTS;
          const rewardsLost = Math.floor(oldStamps / 6) - Math.floor(newStamps / 6);
          onCustomerRefresh?.({
            ...customer,
            loyaltyCard: {
              ...oldCard,
              totalStamps: newStamps,
              stampsInCurrentCard: newStampsInCard,
              nextStampPosition: newStampsInCard + 1,
              remainingStamps: LOYALTY_TOTAL_SLOTS - newStampsInCard,
              availableRewards: Math.max(0, (oldCard.availableRewards ?? 0) - rewardsLost),
              totalRewardsEarned: Math.max(0, (oldCard.totalRewardsEarned ?? 0) - rewardsLost),
              stampsUntilNextReward:
                newStamps === 0 ? 6 : newStamps % 6 === 0 ? 0 : 6 - (newStamps % 6),
            },
          });
        }
      } catch (e) {
        showToast(errorMessage(e, "Failed to remove stamp"), "error");
      } finally {
        setRemoveLoading(false);
      }
    },
    [customer, removeStampCb, onCustomerRefresh, showToast],
  );

  const handleRedeemConfirm = useCallback(async () => {
    if (!customer) return;
    setRedeemLoading(true);
    try {
      await redeemCb.execute(customer.customerID);

      const refreshResult = await refetchCb.execute(customer.customerID);
      const refreshed = refreshResult?.data?.response;

      showToast("Free drink redeemed", "success");
      setRedeemConfirmOpen(false);
      if (refreshed) {
        onCustomerRefresh?.(refreshed);
      } else {
        showToast(
          "Reward redeemed but the card couldn't refresh — please reload.",
          "warning",
        );
      }
    } catch (e) {
      showToast(errorMessage(e, "Failed to redeem reward"), "error");
    } finally {
      setRedeemLoading(false);
    }
  }, [customer, redeemCb, refetchCb, onCustomerRefresh, showToast]);

  const currentStamps = customer?.loyaltyCard?.totalStamps ?? 0;

  return (
    <>
      <LoyaltyCard
        card={customer?.loyaltyCard ?? null}
        customerName={customer?.fullName}
        mode={mode}
        compact={compact}
        loading={stampLoading || removeLoading || redeemLoading}
        onStampClick={(slot) => setStampDialogSlot(slot)}
        onRedeemClick={() => setRedeemConfirmOpen(true)}
      />

      {currentStamps > 0 && (
        <Flex justify="end" mt="2">
          <Button
            variant="soft"
            color="red"
            size="1"
            disabled={stampLoading || removeLoading || redeemLoading}
            onClick={() => setRemoveDialogOpen(true)}
          >
            <UndoOutlined style={{ fontSize: 14 }} />
            Remove Stamp
          </Button>
        </Flex>
      )}

      <AddStampDialog
        open={stampDialogSlot != null}
        customerName={customer?.fullName}
        slotNumber={stampDialogSlot}
        loading={stampLoading}
        onClose={() => (stampLoading ? null : setStampDialogSlot(null))}
        onSubmit={handleStampSubmit}
      />

      <RemoveStampDialog
        open={removeDialogOpen}
        customerName={customer?.fullName}
        currentStamps={currentStamps}
        loading={removeLoading}
        onClose={() => (removeLoading ? undefined : setRemoveDialogOpen(false))}
        onSubmit={handleRemoveStamp}
      />

      <AlertDialog.Root
        open={redeemConfirmOpen}
        onOpenChange={(o) => (!o && !redeemLoading ? setRedeemConfirmOpen(false) : undefined)}
      >
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 440 }}>
          <AlertDialog.Title>{DIALOG_TITLES.redeemReward}</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Redeem one free 12oz drink for{" "}
            <strong>{customer?.fullName ?? "this customer"}</strong>?
            They have <strong>{customer?.loyaltyCard?.availableRewards ?? 0}</strong> reward(s) available.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={redeemLoading}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button color="green" onClick={handleRedeemConfirm} loading={redeemLoading}>
              <EmojiEventsOutlined style={{ fontSize: 16 }} />
              Redeem
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

    </>
  );
};
