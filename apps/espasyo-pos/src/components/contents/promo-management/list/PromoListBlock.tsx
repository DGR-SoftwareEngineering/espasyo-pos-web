import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Text,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AddCircleOutlined } from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { PromoDto, PromoSuggestionDto, SystemSettingDto } from "core-lib/api/commons/types";
import { SETTING_KEYS } from "core-lib/business/settings";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { PromoList } from "./PromoList";
import { PromoSuggestionsPanel } from "./PromoSuggestionsPanel";
import { usePromoFilters } from "./hooks";
import { PaginationMeta } from "./types";
import { STATUS_TABS, DIALOG_TITLES, StatusFilter } from "../constants";
import { PromoFormBlock } from "../forms/PromoFormBlock";

export const PromoListBlock: React.FC = () => {
  const { showToast } = useToastContext();

  const [promos, setPromos] = useState<PromoDto[]>([]);
  const [suggestions, setSuggestions] = useState<PromoSuggestionDto[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [fromSuggestion, setFromSuggestion] = useState<PromoSuggestionDto | null>(null);

  const [activateTarget, setActivateTarget] = useState<PromoDto | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PromoDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const promosData = useApi((api) => api.commons.promoList(), []);
  const promoSettingsData = useApi(
    (api) => api.commons.settingsByCategory("Promo"),
    [],
  );
  const activateCb = useApiCallback(async (api, id: string) =>
    api.commons.promoActivate(id),
  );
  const deactivateCb = useApiCallback(async (api, id: string) =>
    api.commons.promoDeactivate(id),
  );
  const deleteCb = useApiCallback(async (api, id: string) =>
    api.commons.promoDelete(id),
  );
  const suggestionsCb = useApiCallback(async (api) => api.commons.promoSuggestions());

  useEffect(() => {
    setPromos(promosData.result?.data?.response ?? []);
  }, [promosData.result]);

  useEffect(() => {
    const settings: SystemSettingDto[] = promoSettingsData.result?.data?.response ?? [];
    const aiSetting = settings.find((s) => s.key === SETTING_KEYS.PromoAiSuggestionEnabled);
    setIsAiEnabled(aiSetting?.value?.toLowerCase() === "true");
  }, [promoSettingsData.result]);

  const loadSuggestions = useCallback(async () => {
    setSuggestionLoading(true);
    try {
      const result = await suggestionsCb.execute();
      setSuggestions(result?.data?.response ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionLoading(false);
    }
  }, [suggestionsCb]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleRefresh = useCallback(() => {
    promosData.execute();
    setPageNumber(1);
  }, [promosData]);

  const { filters, filteredPromos, stats, updateFilter, updateStatusFilter } =
    usePromoFilters({ promos });

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredPromos.slice(start, start + pageSize);
  }, [filteredPromos, pageNumber, pageSize]);

  const pagination: PaginationMeta = useMemo(
    () => ({
      pageNumber,
      totalPages: Math.ceil(filteredPromos.length / pageSize),
      hasNextPage: pageNumber < Math.ceil(filteredPromos.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      pageSize,
    }),
    [filteredPromos.length, pageNumber, pageSize],
  );

  const handleView = useCallback((promo: PromoDto) => {
    // TODO: open view dialog (future enhancement)
  }, []);

  const handleActivateConfirm = useCallback(async () => {
    if (!activateTarget) return;
    setActionLoading(true);
    try {
      const result = await activateCb.execute(activateTarget.promoID);
      if (result?.data?.success) {
        showToast(`"${activateTarget.title}" is now Active`, "success");
        setActivateTarget(null);
        handleRefresh();
        return;
      }
      const msg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to activate promo";
      showToast(msg, "error");
    } catch {
      showToast("Failed to activate promo", "error");
    } finally {
      setActionLoading(false);
    }
  }, [activateTarget, activateCb, handleRefresh, showToast]);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    try {
      const result = await deactivateCb.execute(deactivateTarget.promoID);
      if (result?.data?.success) {
        showToast(`"${deactivateTarget.title}" has been deactivated`, "success");
        setDeactivateTarget(null);
        handleRefresh();
        return;
      }
      const msg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to deactivate promo";
      showToast(msg, "error");
    } catch {
      showToast("Failed to deactivate promo", "error");
    } finally {
      setActionLoading(false);
    }
  }, [deactivateTarget, deactivateCb, handleRefresh, showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const result = await deleteCb.execute(deleteTarget.promoID);
      if (result?.data?.success) {
        showToast(`"${deleteTarget.title}" has been deleted`, "success");
        setDeleteTarget(null);
        handleRefresh();
        return;
      }
      const msg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to delete promo";
      showToast(msg, "error");
    } catch {
      showToast("Failed to delete promo", "error");
    } finally {
      setActionLoading(false);
    }
  }, [deleteTarget, deleteCb, handleRefresh, showToast]);

  const handleUseSuggestion = useCallback((suggestion: PromoSuggestionDto) => {
    setFromSuggestion(suggestion);
    setCreateOpen(true);
  }, []);

  const handleNewPromo = useCallback(() => {
    setFromSuggestion(null);
    setCreateOpen(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setCreateOpen(false);
    setFromSuggestion(null);
    handleRefresh();
  }, [handleRefresh]);

  return (
    <Box style={{ width: "100%" }}>
      {/* Header + Stats */}
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Promo Management"
          subtitle="Create, manage, and activate promotional pricing"
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard label="Total Promos" value={stats.total} color="primary" />
          <StatsCard label="Active" value={stats.active} color="success" />
          <StatsCard label="Draft" value={stats.draft} color="info" />
          <StatsCard label="Expired" value={stats.expired} color="error" />
        </Flex>

        {/* Status tabs */}
        <Box
          mt="4"
          style={{
            display: "inline-flex",
            borderRadius: 999,
            border: "1px solid var(--gray-a4)",
            background: "var(--gray-a2)",
            padding: 3,
            gap: 2,
          }}
        >
          {STATUS_TABS.map((tab) => {
            const active = filters.statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  updateStatusFilter(tab as StatusFilter);
                  setPageNumber(1);
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  background: active ? "var(--color-background)" : "transparent",
                  color: active ? "var(--accent-11)" : "var(--gray-11)",
                  boxShadow: active ? "var(--shadow-1)" : "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                  textTransform: tab === "all" ? undefined : undefined,
                }}
              >
                {tab === "all" ? "All" : tab}
              </button>
            );
          })}
        </Box>

        <Flex justify="between" align="center" gap="3" mt="3" wrap="wrap">
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => {
              updateFilter("searchTerm", value);
              setPageNumber(1);
            }}
            searchPlaceholder="Search by promo title…"
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            resultCount={filteredPromos.length}
            resultLabel="promos"
            pageSize={pageSize}
          />
          <Flex gap="2">
            <Button
              variant="soft"
              color="gray"
              size="2"
              onClick={handleRefresh}
              disabled={promosData.loading}
            >
              <ReloadIcon />
              Refresh
            </Button>
            <Button
              variant="solid"
              color="indigo"
              size="2"
              onClick={handleNewPromo}
            >
              <AddCircleOutlined fontSize="small" />
              New Promo
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* AI Suggestions */}
      <PromoSuggestionsPanel
        suggestions={suggestions}
        loading={suggestionLoading}
        onRegenerate={loadSuggestions}
        onUseSuggestion={handleUseSuggestion}
        isAiEnabled={isAiEnabled}
        isAiSettingsLoading={promoSettingsData.loading}
      />

      {/* Promo List */}
      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <PromoList
          data={paginatedData}
          loading={promosData.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => p - 1)}
          onView={handleView}
          onActivate={setActivateTarget}
          onDeactivate={setDeactivateTarget}
          onDelete={setDeleteTarget}
        />
      </Card>

      {filteredPromos.length > 0 && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, filteredPromos.length)} of{" "}
            {filteredPromos.length} entries
          </Text>
        </Flex>
      )}

      {/* Create Promo Dialog */}
      <DialogBox
        open={createOpen}
        onClose={() => { setCreateOpen(false); setFromSuggestion(null); }}
        title={DIALOG_TITLES.create}
        maxWidth="md"
      >
        <PromoFormBlock
          fromSuggestion={fromSuggestion}
          onSuccess={handleCreateSuccess}
        />
      </DialogBox>

      {/* Activate Confirmation */}
      <AlertDialog.Root
        open={!!activateTarget}
        onOpenChange={(open) => { if (!open) setActivateTarget(null); }}
      >
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Activate this promo?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            <strong>&quot;{activateTarget?.title}&quot;</strong> will become the active promo.
            Any currently active promo will be automatically deactivated.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={actionLoading}>Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              color="green"
              onClick={handleActivateConfirm}
              loading={actionLoading}
            >
              Activate
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Deactivate Confirmation */}
      <AlertDialog.Root
        open={!!deactivateTarget}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
      >
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Deactivate this promo?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            <strong>&quot;{deactivateTarget?.title}&quot;</strong> will be set to Inactive
            and will no longer apply at checkout.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={actionLoading}>Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              color="orange"
              onClick={handleDeactivateConfirm}
              loading={actionLoading}
            >
              Deactivate
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Delete Confirmation */}
      <AlertDialog.Root
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Delete this promo?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            <strong>&quot;{deleteTarget?.title}&quot;</strong> will be permanently deleted.
            This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={actionLoading}>Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={actionLoading}
            >
              Delete
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};
