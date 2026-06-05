import React, { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  CloseRounded,
  EmojiEventsOutlined,
  LocalCafeOutlined,
  PersonAddAlt1Outlined,
  SearchOutlined,
  UndoOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CustomerDetailDto,
  CustomerLoyaltyCardDto,
  CustomerSearchResultDto,
} from "core-lib/api/crm";
import {
  CustomerPromoProductDto,
  CustomerPromoProductItemDto,
} from "core-lib/api/commons/types";
import { LoyaltyCard } from "../../crm/components/LoyaltyCard";
import { AddStampDialog } from "../../crm/components/AddStampDialog";
import { RemoveStampDialog } from "../../crm/components/RemoveStampDialog";
import { SegmentBadge } from "../../crm/components/SegmentBadge";
import { CustomerFormBlock } from "../../crm/forms/CustomerFormBlock";
import { AddCircleOutlined } from "@mui/icons-material";

const PAGE_SIZE = 15;
const DEBOUNCE_MS = 300;

interface CustomerPickerDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAttach: (c: CustomerSearchResultDto) => void;
  onAttachPromoProduct?: (
    customer: CustomerSearchResultDto,
    item: CustomerPromoProductItemDto,
    promo: CustomerPromoProductDto,
  ) => void;
  excludeIds?: string[];
}

export const CustomerPickerDialog: React.FC<CustomerPickerDialogProps> = ({
  open,
  onOpenChange,
  onAttach,
  onAttachPromoProduct,
  excludeIds = [],
}) => {
  const { showToast } = useToastContext();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<CustomerSearchResultDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  const [previewCustomer, setPreviewCustomer] = useState<CustomerSearchResultDto | null>(null);
  const [previewDetail, setPreviewDetail] = useState<CustomerDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [promoProducts, setPromoProducts] = useState<CustomerPromoProductDto[]>([]);
  const [promoProductsLoading, setPromoProductsLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<{
    item: CustomerPromoProductItemDto;
    promo: CustomerPromoProductDto;
  } | null>(null);

  const [deleteRowTarget, setDeleteRowTarget] = useState<CustomerSearchResultDto | null>(null);
  const [deleteRowLoading, setDeleteRowLoading] = useState(false);

  const [stampDialogSlot, setStampDialogSlot] = useState<number | null>(null);
  const [stampLoading, setStampLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const browseCb = useApiCallback(
    async (api, params: { search?: string; pageNumber: number }) =>
      api.crm.browse({
        search: params.search,
        pageNumber: params.pageNumber,
        pageSize: PAGE_SIZE,
      }),
  );
  const detailCb = useApiCallback(async (api, id: string) => api.crm.getById(id));
  const promoProductsCb = useApiCallback(async (api, id: string) =>
    api.commons.promoProductsForCustomer(id),
  );
  // Extract the stable execute ref — the callback container object is recreated each
  // render and must NOT go in an effect dependency array (caused an infinite loop).
  const promoProductsExecute = promoProductsCb.execute;
  const softDeleteCb = useApiCallback(async (api, id: string) => api.crm.softDelete(id));
  const stampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.addStamp(args.id, { reason: args.reason }),
  );
  const removeStampCb = useApiCallback(
    async (api, args: { id: string; reason: string | null }) =>
      api.crm.removeStamp(args.id, { reason: args.reason }),
  );
  const enrollCb = useApiCallback(
    async (api, args: { id: string; hasCard: boolean }) =>
      api.crm.update(args.id, { hasPhysicalCard: args.hasCard }),
  );

  const loadPage = useCallback(
    async (q: string, p: number) => {
      setListLoading(true);
      try {
        const r = await browseCb.execute({ search: q || undefined, pageNumber: p });
        const data = r?.data?.response;
        setCustomers(data?.items ?? []);
        setTotalPages(data?.totalPages ?? 1);
      } catch {
        setCustomers([]);
      } finally {
        setListLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Debounce query → reset to page 1 when user types
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Load list whenever debouncedQuery, page, or open changes
  useEffect(() => {
    if (!open) return;
    loadPage(debouncedQuery, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, open]);

  // Reset all state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setPage(1);
      setCustomers([]);
      setTotalPages(1);
      setPreviewCustomer(null);
      setPreviewDetail(null);
      setPromoProducts([]);
      setSelectedOffer(null);
    }
  }, [open]);

  // Load exclusive (customer-specific) promo products whenever the previewed customer changes
  useEffect(() => {
    const customerId = previewCustomer?.customerID;
    if (!customerId) {
      setPromoProducts([]);
      setSelectedOffer(null);
      return;
    }

    setSelectedOffer(null); // Clear selection when switching customer rows

    let isMounted = true;
    const fetchPromoProducts = async () => {
      setPromoProductsLoading(true);
      try {
        const result = await promoProductsExecute(customerId);
        if (isMounted) {
          setPromoProducts(result?.data?.response ?? []);
        }
      } catch {
        if (isMounted) setPromoProducts([]);
      } finally {
        if (isMounted) setPromoProductsLoading(false);
      }
    };
    fetchPromoProducts();

    return () => {
      isMounted = false;
    };
  }, [previewCustomer?.customerID, promoProductsExecute]);

  const handleRowClick = useCallback(
    async (c: CustomerSearchResultDto) => {
      setPreviewCustomer(c);
      setPreviewDetail(null);
      setDetailLoading(true);
      try {
        const r = await detailCb.execute(c.customerID);
        if (r?.data?.response) {
          const detail = r.data.response;
          setPreviewDetail(detail);
          // CRITICAL: Update previewCustomer with the latest hasPhysicalCard from detail
          setPreviewCustomer({
            ...c,
            hasPhysicalCard: detail.hasPhysicalCard,
            totalStamps: detail.loyaltyCard?.totalStamps ?? c.totalStamps,
            availableRewards: detail.loyaltyCard?.availableRewards ?? c.availableRewards,
          });
        }
      } catch {
        // Will fall back to synthetic card built from search result
      } finally {
        setDetailLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const buildSyntheticCard = (c: CustomerSearchResultDto): CustomerLoyaltyCardDto => ({
    customerLoyaltyCardID: "",
    totalStamps: c.totalStamps,
    availableRewards: c.availableRewards,
    totalRewardsEarned: c.availableRewards,
    totalRewardsRedeemed: 0,
    lastStampedAt: null,
    lastRedeemedAt: null,
    stampsUntilNextReward:
      c.totalStamps === 0
        ? 6
        : c.totalStamps % 6 === 0
          ? 0
          : 6 - (c.totalStamps % 6),
  });

  const savedToSearchResult = (c: CustomerDetailDto): CustomerSearchResultDto => ({
    customerID: c.customerID,
    customerNumber: c.customerNumber,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    totalStamps: c.loyaltyCard?.totalStamps ?? 0,
    availableRewards: c.loyaltyCard?.availableRewards ?? 0,
    segment: c.segment,
    hasPhysicalCard: c.hasPhysicalCard,
  });

  // Use backend card when available, fall back to synthetic from search result
  const previewCard: CustomerLoyaltyCardDto | null =
    previewDetail?.loyaltyCard ??
    (previewCustomer ? buildSyntheticCard(previewCustomer) : null);

  const currentStamps = previewCard?.totalStamps ?? previewCustomer?.totalStamps ?? 0;

  // Enrollment state model - ALWAYS use previewCustomer.hasPhysicalCard
  const isEnrolled = previewCustomer?.hasPhysicalCard ?? false;
  const isPaused =
    !isEnrolled &&
    (previewDetail
      ? previewDetail.loyaltyCard !== null
      : previewCustomer && previewCustomer.totalStamps > 0);
  const hasCard = isEnrolled || isPaused;

  const handleEnroll = useCallback(
    async (customerId: string) => {
      setEnrollmentLoading(true);
      try {
        const result = await enrollCb.execute({ id: customerId, hasCard: true });
        if (!result?.data?.success || !result?.data?.response) {
          const msg =
            Array.isArray(result?.data?.errors) && result.data.errors.length > 0
              ? (result.data.errors as string[])[0]
              : result?.data?.message ?? "Failed to enroll";
          showToast(msg, "error");
          return;
        }
        
        const refreshedDetail = result.data.response;
        setPreviewDetail(refreshedDetail);
        
        // CRITICAL: Update previewCustomer with the new hasPhysicalCard value
        const updatedCustomer = {
          ...previewCustomer!,
          hasPhysicalCard: true,
          totalStamps: refreshedDetail.loyaltyCard?.totalStamps ?? previewCustomer!.totalStamps,
          availableRewards: refreshedDetail.loyaltyCard?.availableRewards ?? previewCustomer!.availableRewards,
        };
        setPreviewCustomer(updatedCustomer);
        
        // Also update the customer in the list
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === updatedCustomer.customerID ? updatedCustomer : c,
          ),
        );
        
        showToast("Customer enrolled in loyalty program", "success");
      } catch {
        showToast("Failed to enroll customer", "error");
      } finally {
        setEnrollmentLoading(false);
      }
    },
    [enrollCb, previewCustomer, showToast],
  );

  const handleRevoke = useCallback(
    async (customerId: string) => {
      setEnrollmentLoading(true);
      try {
        const result = await enrollCb.execute({ id: customerId, hasCard: false });
        if (!result?.data?.success || !result?.data?.response) {
          const msg =
            Array.isArray(result?.data?.errors) && result.data.errors.length > 0
              ? (result.data.errors as string[])[0]
              : result?.data?.message ?? "Failed to pause enrollment";
          showToast(msg, "error");
          return;
        }
        
        const refreshedDetail = result.data.response;
        setPreviewDetail(refreshedDetail);
        
        // CRITICAL: Update previewCustomer with the new hasPhysicalCard value
        const updatedCustomer = {
          ...previewCustomer!,
          hasPhysicalCard: false,
          totalStamps: refreshedDetail.loyaltyCard?.totalStamps ?? previewCustomer!.totalStamps,
          availableRewards: refreshedDetail.loyaltyCard?.availableRewards ?? previewCustomer!.availableRewards,
        };
        setPreviewCustomer(updatedCustomer);
        
        // Also update the customer in the list
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === updatedCustomer.customerID ? updatedCustomer : c,
          ),
        );
        
        showToast("Loyalty enrollment paused", "success");
      } catch {
        showToast("Failed to pause enrollment", "error");
      } finally {
        setEnrollmentLoading(false);
      }
    },
    [enrollCb, previewCustomer, showToast],
  );

  const handleStamp = useCallback(
    async (reason: string | null) => {
      if (!previewCustomer) return;
      setStampLoading(true);
      try {
        const result = await stampCb.execute({ id: previewCustomer.customerID, reason });
        const refreshed = result?.data?.response;

        let updatedCustomer: CustomerSearchResultDto;

        if (refreshed) {
          setPreviewDetail(refreshed);
          updatedCustomer = {
            ...previewCustomer,
            totalStamps: refreshed.loyaltyCard?.totalStamps ?? previewCustomer.totalStamps + 1,
            availableRewards:
              refreshed.loyaltyCard?.availableRewards ?? previewCustomer.availableRewards,
          };
        } else {
          // Optimistic fallback
          const oldStamps = previewCard?.totalStamps ?? previewCustomer.totalStamps;
          const newStamps = oldStamps + 1;
          const rewardsDelta = Math.floor(newStamps / 6) - Math.floor(oldStamps / 6);
          updatedCustomer = {
            ...previewCustomer,
            totalStamps: newStamps,
            availableRewards: previewCustomer.availableRewards + rewardsDelta,
          };
          // If detail had a real loyalty card, patch it too
          if (previewDetail?.loyaltyCard) {
            const oldCard = previewDetail.loyaltyCard;
            setPreviewDetail({
              ...previewDetail,
              loyaltyCard: {
                ...oldCard,
                totalStamps: newStamps,
                availableRewards: oldCard.availableRewards + rewardsDelta,
                totalRewardsEarned: oldCard.totalRewardsEarned + rewardsDelta,
                lastStampedAt: new Date().toISOString(),
                stampsUntilNextReward:
                  newStamps > 0 && newStamps % 6 === 0 ? 0 : 6 - (newStamps % 6),
              },
            });
          }
        }

        setPreviewCustomer(updatedCustomer);
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === updatedCustomer.customerID ? updatedCustomer : c,
          ),
        );
        showToast("Stamp added", "success");
        setStampDialogSlot(null);
      } catch (e: unknown) {
        const msg =
          Array.isArray(e) && typeof e[0] === "string" ? e[0] : "Failed to add stamp";
        showToast(msg, "error");
      } finally {
        setStampLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewCustomer, previewDetail, showToast],
  );

  const handleRemoveStamp = useCallback(
    async (reason: string | null) => {
      if (!previewCustomer) return;
      setRemoveLoading(true);
      try {
        const result = await removeStampCb.execute({ id: previewCustomer.customerID, reason });
        const refreshed = result?.data?.response;

        let updatedCustomer: CustomerSearchResultDto;

        if (refreshed) {
          setPreviewDetail(refreshed);
          updatedCustomer = {
            ...previewCustomer,
            totalStamps: refreshed.loyaltyCard?.totalStamps ?? Math.max(0, previewCustomer.totalStamps - 1),
            availableRewards:
              refreshed.loyaltyCard?.availableRewards ?? previewCustomer.availableRewards,
          };
        } else {
          // Optimistic fallback
          const oldStamps = previewCard?.totalStamps ?? previewCustomer.totalStamps;
          const newStamps = Math.max(0, oldStamps - 1);
          const rewardsLost = Math.floor(oldStamps / 6) - Math.floor(newStamps / 6);
          updatedCustomer = {
            ...previewCustomer,
            totalStamps: newStamps,
            availableRewards: Math.max(0, previewCustomer.availableRewards - rewardsLost),
          };
          if (previewDetail?.loyaltyCard) {
            const oldCard = previewDetail.loyaltyCard;
            setPreviewDetail({
              ...previewDetail,
              loyaltyCard: {
                ...oldCard,
                totalStamps: newStamps,
                availableRewards: Math.max(0, oldCard.availableRewards - rewardsLost),
                totalRewardsEarned: Math.max(0, oldCard.totalRewardsEarned - rewardsLost),
                stampsUntilNextReward:
                  newStamps === 0 ? 6 : newStamps % 6 === 0 ? 0 : 6 - (newStamps % 6),
              },
            });
          }
        }

        setPreviewCustomer(updatedCustomer);
        setCustomers((prev) =>
          prev.map((c) =>
            c.customerID === updatedCustomer.customerID ? updatedCustomer : c,
          ),
        );
        showToast("Stamp removed", "success");
        setRemoveDialogOpen(false);
      } catch (e: unknown) {
        const msg =
          Array.isArray(e) && typeof e[0] === "string" ? e[0] : "Failed to remove stamp";
        showToast(msg, "error");
      } finally {
        setRemoveLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewCustomer, previewDetail, showToast],
  );

  const handleDeleteCustomerRow = (c: CustomerSearchResultDto) => {
    setDeleteRowTarget(c);
  };

  const handleConfirmDeleteRow = useCallback(async () => {
    if (!deleteRowTarget) return;
    setDeleteRowLoading(true);
    try {
      const result = await softDeleteCb.execute(deleteRowTarget.customerID);
      if (result?.data?.success) {
        showToast(`${deleteRowTarget.fullName} deleted`, "success");
        setCustomers((prev) => prev.filter((c) => c.customerID !== deleteRowTarget.customerID));
        if (previewCustomer?.customerID === deleteRowTarget.customerID) {
          setPreviewCustomer(null);
          setPreviewDetail(null);
          setPromoProducts([]);
        }
        setDeleteRowTarget(null);
      } else {
        showToast(result?.data?.message ?? "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete customer", "error");
    } finally {
      setDeleteRowLoading(false);
    }
  }, [deleteRowTarget, softDeleteCb, showToast, previewCustomer]);

  const handleAttach = () => {
    if (!previewCustomer) return;
    onAttach(previewCustomer);
    if (selectedOffer) {
      onAttachPromoProduct?.(previewCustomer, selectedOffer.item, selectedOffer.promo);
    }
    onOpenChange(false);
  };

  const filteredCustomers = customers.filter((c) => !excludeIds.includes(c.customerID));

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          style={{ maxWidth: 820, padding: 0, overflow: "hidden", borderRadius: 16 }}
          aria-describedby={undefined}
        >
          {/* Header */}
          <Flex
            align="center"
            px="4"
            py="3"
            gap="3"
            style={{ borderBottom: "1px solid var(--gray-a4)" }}
          >
            <Flex align="center" gap="2" style={{ flex: 1 }}>
              <PersonAddAlt1Outlined style={{ fontSize: 18, color: "var(--indigo-11)" }} />
              <Dialog.Title>
                <Text size="4" weight="bold">
                  Select Customer
                </Text>
              </Dialog.Title>
            </Flex>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" size="2" aria-label="Close">
                <Cross1Icon />
              </IconButton>
            </Dialog.Close>
          </Flex>

          {/* Two-pane body */}
          <Flex style={{ height: 520 }}>
            {/* ── Left: browse list ───────────────────────── */}
            <Flex
              direction="column"
              style={{
                width: "42%",
                borderRight: "1px solid var(--gray-a4)",
                minWidth: 0,
              }}
            >
              {/* Search + New Customer */}
              <Flex direction="column" gap="2" p="3" style={{ borderBottom: "1px solid var(--gray-a4)" }}>
                <TextField.Root
                  size="2"
                  placeholder="Search name, phone, or #…"
                  value={query}
                  autoFocus
                  onChange={(e) => setQuery(e.target.value)}
                >
                  <TextField.Slot>
                    <SearchOutlined style={{ fontSize: 15, opacity: 0.5 }} />
                  </TextField.Slot>
                  {query && (
                    <TextField.Slot>
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                        }}
                        aria-label="Clear search"
                      >
                        <CloseRounded style={{ fontSize: 15, opacity: 0.5 }} />
                      </button>
                    </TextField.Slot>
                  )}
                </TextField.Root>
                <Button
                  variant="soft"
                  color="indigo"
                  size="2"
                  onClick={() => setCreateOpen(true)}
                  style={{ width: "100%" }}
                >
                  <AddCircleOutlined style={{ fontSize: 16 }} />
                  New Customer
                </Button>
              </Flex>

              {/* List */}
              <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                {listLoading ? (
                  <Flex align="center" justify="center" style={{ height: 140 }}>
                    <Spinner loading size="3" />
                  </Flex>
                ) : filteredCustomers.length === 0 ? (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="2"
                    p="5"
                    style={{ height: 140 }}
                  >
                    <Text size="2" color="gray">
                      No customers found
                    </Text>
                    {query && (
                      <Text size="1" color="gray">
                        Try a different term
                      </Text>
                    )}
                    <button
                      type="button"
                      onClick={() => setCreateOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--indigo-11)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Create new customer
                    </button>
                  </Flex>
                ) : (
                  <Flex direction="column" p="2" gap="1">
                    {filteredCustomers.map((c) => {
                      const isSelected = previewCustomer?.customerID === c.customerID;
                      return (
                        <Flex key={c.customerID} align="center" gap="1">
                        <button
                          type="button"
                          onClick={() => handleRowClick(c)}
                          style={{
                            flex: 1,
                            textAlign: "left",
                            padding: "9px 10px",
                            border: `1px solid ${isSelected ? "var(--indigo-a7)" : "transparent"}`,
                            background: isSelected ? "var(--indigo-a3)" : "transparent",
                            cursor: "pointer",
                            borderRadius: 10,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background =
                                "var(--gray-a3)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background =
                                "transparent";
                          }}
                        >
                          <Flex justify="between" align="start" gap="2">
                            <Box style={{ minWidth: 0, flex: 1 }}>
                              <Flex align="center" gap="2" mb="1" wrap="nowrap">
                                <Text
                                  size="2"
                                  weight="medium"
                                  truncate
                                  style={{
                                    color: isSelected ? "var(--indigo-11)" : undefined,
                                  }}
                                >
                                  {c.fullName}
                                </Text>
                                <SegmentBadge segment={c.segment} size="1" />
                              </Flex>
                              <Flex gap="2" align="center">
                                <Text size="1" color="gray">
                                  {c.customerNumber}
                                </Text>
                                {c.phone && (
                                  <Text size="1" color="gray">
                                    · {c.phone}
                                  </Text>
                                )}
                              </Flex>
                            </Box>
                            <Box style={{ flexShrink: 0, textAlign: "right" }}>
                              {c.availableRewards > 0 ? (
                                <Badge
                                  color="amber"
                                  variant="solid"
                                  size="1"
                                  style={{ gap: 2 }}
                                >
                                  <EmojiEventsOutlined style={{ fontSize: 9 }} />
                                  {c.availableRewards}
                                </Badge>
                              ) : (
                                <Text size="1" color="gray">
                                  <LocalCafeOutlined
                                    style={{ fontSize: 11, verticalAlign: "middle" }}
                                  />{" "}
                                  {c.totalStamps}
                                </Text>
                              )}
                            </Box>
                          </Flex>
                        </button>
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="red"
                          style={{ flexShrink: 0 }}
                          title="Soft-delete customer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomerRow(c);
                          }}
                        >
                          <TrashIcon />
                        </IconButton>
                        </Flex>
                      );
                    })}
                  </Flex>
                )}
              </ScrollArea>

              {/* Pagination */}
              <Flex
                align="center"
                justify="between"
                px="3"
                py="2"
                gap="2"
                style={{ borderTop: "1px solid var(--gray-a4)" }}
              >
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={page <= 1 || listLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Text size="1" color="gray">
                  Page {page} of {Math.max(1, totalPages)}
                </Text>
                <IconButton
                  variant="soft"
                  color="gray"
                  size="1"
                  disabled={page >= totalPages || listLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
            </Flex>

            {/* ── Right: customer detail & stamp ──────────── */}
            <Flex
              direction="column"
              style={{ flex: 1, overflow: "hidden", minWidth: 0 }}
            >
              {!previewCustomer ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  gap="3"
                  style={{ height: "100%", padding: 32, opacity: 0.45 }}
                >
                  <PersonAddAlt1Outlined
                    style={{ fontSize: 48, color: "var(--gray-9)" }}
                  />
                  <Text size="2" color="gray" align="center">
                    Select a customer from the list to view their loyalty details
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" style={{ height: "100%" }}>
                  {/* Customer header */}
                  <Box
                    px="4"
                    py="3"
                    style={{
                      borderBottom: "1px solid var(--gray-a4)",
                      background:
                        "linear-gradient(180deg, var(--indigo-a2) 0%, var(--color-panel-solid) 100%)",
                    }}
                  >
                    <Flex align="center" gap="2" wrap="wrap">
                      <Text size="4" weight="bold">
                        {previewCustomer.fullName}
                      </Text>
                      <SegmentBadge segment={previewCustomer.segment} size="1" />
                    </Flex>
                    <Flex gap="2" align="center" mt="1" wrap="wrap">
                      <Badge color="indigo" variant="soft" size="1">
                        {previewCustomer.customerNumber}
                      </Badge>
                      {previewCustomer.phone && (
                        <Text size="1" color="gray">
                          {previewCustomer.phone}
                        </Text>
                      )}
                    </Flex>
                  </Box>

                  {/* Loyalty card + stamp — three state model */}
                  <ScrollArea style={{ flex: 1 }}>
                    <Box p="4">
                      {detailLoading ? (
                        <Flex align="center" justify="center" py="5">
                          <Spinner loading size="2" />
                        </Flex>
                      ) : isEnrolled ? (
                        <>
                          <Text
                            size="2"
                            weight="medium"
                            color="gray"
                            mb="2"
                            as="div"
                          >
                            Loyalty Card
                          </Text>
                          <LoyaltyCard
                            card={previewCard}
                            customerName={previewCustomer.fullName}
                            mode="cashier"
                            compact
                            loading={stampLoading || removeLoading}
                            onStampClick={(slot) => setStampDialogSlot(slot)}
                          />
                          <Button
                            variant="soft"
                            color="amber"
                            size="2"
                            mt="3"
                            style={{ width: "100%" }}
                            disabled={stampLoading || removeLoading}
                            onClick={() => setStampDialogSlot(currentStamps + 1)}
                          >
                            <LocalCafeOutlined style={{ fontSize: 16 }} />
                            Add Stamp
                          </Button>
                          {currentStamps > 0 && (
                            <Button
                              variant="soft"
                              color="red"
                              size="2"
                              mt="2"
                              style={{ width: "100%" }}
                              disabled={stampLoading || removeLoading}
                              onClick={() => setRemoveDialogOpen(true)}
                            >
                              <UndoOutlined style={{ fontSize: 16 }} />
                              Remove Stamp
                            </Button>
                          )}

                          <Flex justify="end" mt="2">
                            <Button
                              variant="ghost"
                              color="red"
                              size="1"
                              loading={enrollmentLoading}
                              onClick={() => handleRevoke(previewCustomer.customerID)}
                            >
                              Pause
                            </Button>
                          </Flex>
                        </>
                      ) : isPaused ? (
                        <>
                          <Text
                            size="2"
                            weight="medium"
                            color="gray"
                            mb="2"
                            as="div"
                          >
                            Loyalty Card (Paused)
                          </Text>
                          <LoyaltyCard
                            card={previewCard}
                            customerName={previewCustomer.fullName}
                            mode="cashier"
                            compact
                          />
                          <Callout.Root color="orange" variant="soft" size="1" mt="3">
                            <Callout.Text>
                              Loyalty program paused — stamps preserved
                            </Callout.Text>
                          </Callout.Root>

                          <Button
                            size="2"
                            color="indigo"
                            mt="3"
                            loading={enrollmentLoading}
                            onClick={() => handleEnroll(previewCustomer.customerID)}
                            style={{ width: "100%" }}
                          >
                            Re-enroll
                          </Button>
                        </>
                      ) : (
                        <>
                          <Box style={{ padding: "16px", background: "var(--gray-a3)", borderRadius: 8, marginBottom: "12px" }}>
                            <Text size="2" color="gray">
                              Not enrolled in loyalty program
                            </Text>
                          </Box>

                          {previewDetail && previewDetail.totalVisits >= 5 ? (
                            <Button
                              size="2"
                              color="indigo"
                              loading={enrollmentLoading}
                              onClick={() => handleEnroll(previewCustomer.customerID)}
                              style={{ width: "100%" }}
                            >
                              Enroll in Loyalty Card
                            </Button>
                          ) : previewDetail ? (
                            <Text size="1" color="gray" style={{ textAlign: "center", display: "block" }}>
                              {previewDetail.totalVisits} / 5 purchases · {5 - previewDetail.totalVisits} more {(5 - previewDetail.totalVisits) === 1 ? "purchase" : "purchases"} required
                            </Text>
                          ) : null}
                        </>
                      )}

                      {/* Exclusive Offers — customer-specific promos (independent of loyalty) */}
                      {!detailLoading && (promoProductsLoading || promoProducts.length > 0) && (
                        <Box
                          mt="4"
                          pt="4"
                          style={{ borderTop: "1px solid var(--gray-a4)" }}
                        >
                          <Flex align="center" gap="2" mb="2">
                            <EmojiEventsOutlined
                              style={{ fontSize: 16, color: "var(--teal-11)" }}
                            />
                            <Text size="2" weight="bold" style={{ color: "var(--teal-11)" }}>
                              Exclusive Offers
                            </Text>
                          </Flex>

                          {promoProductsLoading ? (
                            <Flex align="center" justify="center" py="3">
                              <Spinner loading size="1" />
                            </Flex>
                          ) : (
                            <Flex direction="column" gap="2">
                              {promoProducts.flatMap((promo) =>
                                promo.items.map((item) => {
                                  const isSelected =
                                    selectedOffer?.item.productID === item.productID &&
                                    selectedOffer?.promo.promoID === promo.promoID;
                                  return (
                                    <Flex
                                      key={`${promo.promoID}-${item.productID}`}
                                      justify="between"
                                      align="center"
                                      gap="2"
                                      p="2"
                                      style={{
                                        background: isSelected ? "var(--teal-a4)" : "var(--teal-a2)",
                                        borderRadius: 8,
                                        border: isSelected ? "2px solid var(--teal-11)" : "1px solid var(--teal-a4)",
                                        cursor: "pointer",
                                        transition: "all 150ms ease",
                                      }}
                                      onClick={() =>
                                        setSelectedOffer(
                                          isSelected ? null : { item, promo }
                                        )
                                      }
                                    >
                                      <Flex
                                        direction="column"
                                        gap="1"
                                        style={{ flex: 1, minWidth: 0 }}
                                      >
                                        <Text size="1" weight="bold" truncate>
                                          {item.productName}
                                        </Text>
                                        <Flex gap="2" align="center" wrap="wrap">
                                          <Text
                                            size="1"
                                            color="gray"
                                            style={{ textDecoration: "line-through" }}
                                          >
                                            {item.originalPrice.toFixed(2)}
                                          </Text>
                                          <Text
                                            size="2"
                                            weight="bold"
                                            style={{ color: "var(--teal-11)" }}
                                          >
                                            {item.adjustedPrice.toFixed(2)}
                                          </Text>
                                          <Badge size="1" color="teal" variant="soft">
                                            {promo.type === "PercentageDiscount"
                                              ? `${promo.discountPercent}% off`
                                              : promo.type === "FixedDiscount"
                                                ? `${promo.discountAmount} off`
                                                : promo.title}
                                          </Badge>
                                        </Flex>
                                      </Flex>
                                      {isSelected && (
                                        <Text size="2" weight="bold" style={{ color: "var(--teal-11)" }}>
                                          ✓
                                        </Text>
                                      )}
                                    </Flex>
                                  );
                                }),
                              )}
                            </Flex>
                          )}
                        </Box>
                      )}
                    </Box>
                  </ScrollArea>

                  {/* Attach CTA */}
                  <Box
                    px="4"
                    py="3"
                    style={{
                      borderTop: "1px solid var(--gray-a4)",
                      background: "var(--color-panel-solid)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleAttach}
                      style={{
                        width: "100%",
                        height: 46,
                        border: "none",
                        borderRadius: 12,
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        background:
                          "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 100%)",
                        boxShadow: "0 4px 14px var(--indigo-a6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <PersonAddAlt1Outlined style={{ fontSize: 16 }} />
                      Attach to Order
                    </button>
                  </Box>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Sibling dialogs — not nested inside the picker Dialog.Root */}
      <AddStampDialog
        open={stampDialogSlot != null}
        customerName={previewCustomer?.fullName}
        slotNumber={stampDialogSlot}
        loading={stampLoading}
        onClose={() => (stampLoading ? undefined : setStampDialogSlot(null))}
        onSubmit={handleStamp}
      />
      <RemoveStampDialog
        open={removeDialogOpen}
        customerName={previewCustomer?.fullName}
        currentStamps={currentStamps}
        loading={removeLoading}
        onClose={() => (removeLoading ? undefined : setRemoveDialogOpen(false))}
        onSubmit={handleRemoveStamp}
      />

      {/* New Customer Dialog */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Content style={{ maxWidth: 520 }} aria-describedby={undefined}>
          <Dialog.Title>
            <Flex align="center" gap="2">
              <AddCircleOutlined style={{ fontSize: 20, color: "var(--indigo-11)" }} />
              New Customer
            </Flex>
          </Dialog.Title>
          <CustomerFormBlock
            isInDialog
            onSuccess={(saved) => {
              setCreateOpen(false);
              const newCustomer = savedToSearchResult(saved);
              setPreviewCustomer(newCustomer);
              setPreviewDetail(saved);
              setCustomers((prev) => [newCustomer, ...prev]);
            }}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Cashier soft-delete confirmation */}
      <AlertDialog.Root
        open={!!deleteRowTarget}
        onOpenChange={(o) => !o && setDeleteRowTarget(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Customer</AlertDialog.Title>
          <AlertDialog.Description>
            Soft-delete <strong>{deleteRowTarget?.fullName}</strong>? They will be removed from
            the list but can be restored later from the Deleted Customers page.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={handleConfirmDeleteRow} loading={deleteRowLoading}>
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};