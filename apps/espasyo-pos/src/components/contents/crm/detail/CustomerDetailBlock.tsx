import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Box, Button, Card, Flex, Skeleton, Tabs, Text } from "@radix-ui/themes";
import { Pencil1Icon } from "@radix-ui/react-icons";
import {
  PersonOutlined,
  ReceiptLongOutlined,
  LocalCafeOutlined,
  StickyNote2Outlined,
  LocalOfferOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { CustomerDetailDto, RedeemableProductDto } from "core-lib/api/crm";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { StatsHeader } from "./StatsHeader";
import { ProfileTab } from "./ProfileTab";
import { PurchasesTab } from "./PurchasesTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { NotesTab } from "./NotesTab";
import { CustomerFormBlock } from "../forms/CustomerFormBlock";
import { EditTagsDialog } from "../forms/EditTagsDialog";
import { DIALOG_TITLES } from "../constants";

interface CustomerDetailBlockProps {
  customerId: string;
}

export const CustomerDetailBlock: React.FC<CustomerDetailBlockProps> = ({
  customerId,
}) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [customer, setCustomer] = useState<CustomerDetailDto | null>(null);
  const [redeemableProducts, setRedeemableProducts] = useState<RedeemableProductDto[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [crmRefreshKey, setCrmRefreshKey] = useState(0);
  const [tab, setTab] = useState<"profile" | "purchases" | "loyalty" | "notes">(
    "profile",
  );

  const detailData = useApi(
    (api) => api.crm.getById(customerId),
    [customerId],
  );
  const updateTagsCb = useApiCallback(
    async (api, args: { id: string; tags: string[] }) =>
      api.crm.updateTags(args.id, { tags: args.tags }),
  );

  useEffect(() => {
    const resp = detailData.result?.data?.response;
    if (resp) {
      setCustomer(resp);
    }
  }, [detailData.result]);

  const handleRefresh = useCallback((next: CustomerDetailDto) => {
    setCustomer(next);
    setCrmRefreshKey((k) => k + 1);
  }, []);

  const handleTagsSubmit = useCallback(
    async (next: string[]) => {
      if (!customer) return;
      setTagsLoading(true);
      try {
        const result = await updateTagsCb.execute({
          id: customer.customerID,
          tags: next,
        });
        const refreshed = result?.data?.response;
        if (result?.data?.success && refreshed) {
          showToast("Tags updated", "success");
          setTagsOpen(false);
          handleRefresh(refreshed);
          return;
        }
        const msg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Failed to update tags";
        showToast(msg, "error");
      } catch {
        showToast("Failed to update tags", "error");
      } finally {
        setTagsLoading(false);
      }
    },
    [customer, updateTagsCb, showToast, handleRefresh],
  );

  if (detailData.loading && !customer) {
    return (
      <Box>
        <Skeleton height="80px" mb="4" style={{ borderRadius: "var(--radius-3)" }} />
        <Skeleton height="200px" mb="3" style={{ borderRadius: "var(--radius-3)" }} />
        <Skeleton height="400px" style={{ borderRadius: "var(--radius-3)" }} />
      </Box>
    );
  }

  if (!customer) {
    return (
      <Card variant="surface" size="3">
        <Flex direction="column" align="center" gap="2" p="5">
          <WarningAmberOutlined style={{ fontSize: 32, color: "var(--red-11)" }} />
          <Text size="3" weight="bold">Customer not found</Text>
          <Text size="2" color="gray">
            They may have been removed or you don&apos;t have access.
          </Text>
          <Button variant="soft" mt="2" onClick={() => router.push("/admin/hub/crm/customers")}>
            Back to customers
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Box>
      <StatsHeader
        customer={customer}
        onBack={() => router.push("/admin/hub/crm/customers")}
        rightActions={
          <>
            <Button variant="soft" color="orange" size="2" onClick={() => setTagsOpen(true)}>
              <LocalOfferOutlined style={{ fontSize: 16 }} />
              Manage Tags
            </Button>
            <Button variant="solid" color="indigo" size="2" onClick={() => setEditOpen(true)}>
              <Pencil1Icon /> Edit Profile
            </Button>
          </>
        }
      />

      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <Tabs.List>
          <Tabs.Trigger value="profile">
            <Flex align="center" gap="2">
              <PersonOutlined style={{ fontSize: 16 }} /> Profile
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="purchases">
            <Flex align="center" gap="2">
              <ReceiptLongOutlined style={{ fontSize: 16 }} /> Purchases
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="loyalty">
            <Flex align="center" gap="2">
              <LocalCafeOutlined style={{ fontSize: 16 }} /> Loyalty
              {(customer.loyaltyCard?.availableRewards ?? 0) > 0 && (
                <Badge color="amber" variant="solid" size="1" ml="1">
                  {customer.loyaltyCard?.availableRewards}
                </Badge>
              )}
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="notes">
            <Flex align="center" gap="2">
              <StickyNote2Outlined style={{ fontSize: 16 }} /> Notes
              {(customer.notes?.length ?? 0) > 0 && (
                <Badge color="gray" variant="soft" size="1" ml="1">
                  {customer.notes.length}
                </Badge>
              )}
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="4" key={tab}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Tabs.Content value="profile">
              <ProfileTab
                customer={customer}
                onEdit={() => setEditOpen(true)}
                onEditTags={() => setTagsOpen(true)}
              />
            </Tabs.Content>
            <Tabs.Content value="purchases">
              <PurchasesTab customerId={customer.customerID} />
            </Tabs.Content>
            <Tabs.Content value="loyalty">
              <LoyaltyTab
                customer={customer}
                onCustomerRefresh={handleRefresh}
                refreshKey={crmRefreshKey}
                redeemableProducts={redeemableProducts}
              />
            </Tabs.Content>
            <Tabs.Content value="notes">
              <NotesTab customer={customer} onCustomerRefresh={handleRefresh} />
            </Tabs.Content>
          </motion.div>
        </Box>
      </Tabs.Root>

      <DialogBox
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={DIALOG_TITLES.edit}
        maxWidth="md"
      >
        <CustomerFormBlock
          customer={customer}
          isInDialog
          onSuccess={(updated) => {
            setEditOpen(false);
            handleRefresh(updated);
          }}
        />
      </DialogBox>

      <EditTagsDialog
        open={tagsOpen}
        initialTags={customer.tags ?? []}
        loading={tagsLoading}
        onClose={() => (tagsLoading ? null : setTagsOpen(false))}
        onSubmit={handleTagsSubmit}
      />
    </Box>
  );
};
