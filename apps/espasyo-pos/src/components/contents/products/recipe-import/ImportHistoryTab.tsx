import React, { useState, useEffect } from "react";
import {
  Badge,
  Text,
  Flex,
  Box,
} from "core-lib/components/radix/proxies";
import {
  Table,
  Button,
  Card,
  Dialog,
  Spinner,
  Callout,
  TextField,
} from "@radix-ui/themes";;
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import type { RevertBatchSafetyDto } from "core-lib/api/commons/types";
import { SyncLoadingOverlay } from "./SyncLoadingOverlay";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("fil-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ImportHistoryTabProps {
  refreshKey?: number;
}

export const ImportHistoryTab: React.FC<ImportHistoryTabProps> = ({ refreshKey = 0 }) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const { isSmallMobile } = useResolution();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; action: "sync" | "revert" } | null>(null);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchSearch, setBatchSearch] = useState("");
  const [syncOverlayVisible, setSyncOverlayVisible] = useState(false);
  const [safetyData, setSafetyData] = useState<RevertBatchSafetyDto | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  const listCb = useApiCallback(async (api) => api.commons.getImportBatchList());
  const syncCb = useApiCallback(async (api, id: string) => api.commons.syncImportBatch(id));
  const revertCb = useApiCallback(async (api, id: string) => api.commons.revertImportBatch(id));
  const safetyCb = useApiCallback(async (api, id: string) => api.commons.checkRevertBatchSafety(id));

  useEffect(() => {
    listCb.execute();
  }, [refreshKey, localRefreshKey]);

  useEffect(() => {
    if (listCb.result?.data?.response) {
      setBatches(listCb.result.data.response);
    }
  }, [listCb.result]);

  const filteredBatches = batches.filter((b) =>
    b.batchCode.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const handleSync = async (batchId: string) => {
    // Close dialog first so the loading overlay is visible immediately
    setConfirmDialog(null);
    setConfirmError(null);
    setSyncingId(batchId);
    setSyncOverlayVisible(true);
    try {
      const result = await syncCb.execute(batchId);
      if (result?.data?.success && result.data.response) {
        const { ingredientsCreated, menuItemsCreated, recipesCreated, errors } = result.data.response;
        const summary = `Synced: ${ingredientsCreated} ingredient(s), ${menuItemsCreated} menu item(s), ${recipesCreated} recipe(s).`;
        if (errors?.length > 0) {
          showToast(`${summary} ${errors.length} item(s) skipped.`, "warning");
        } else {
          showToast(summary, "success");
        }
        setBatches((prev) =>
          prev.map((b) =>
            b.batchID === batchId
              ? { ...b, status: "Synced", syncedAt: new Date().toISOString() }
              : b
          )
        );
        setLocalRefreshKey((k) => k + 1);
      } else {
        const msg = Array.isArray(result?.data?.errors) && result.data.errors[0]
          ? result.data.errors[0]
          : "Sync failed. Please try again.";
        showToast(msg, "error");
      }
    } catch (error) {
      const msg =
        Array.isArray(error) && typeof error[0] === "string"
          ? error[0]
          : "Sync failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSyncingId(null);
      setSyncOverlayVisible(false);
    }
  };

  const handleRevert = async (batchId: string) => {
    setRevertingId(batchId);
    setConfirmError(null);
    try {
      const result = await revertCb.execute(batchId);
      if (result?.data?.success) {
        const action = confirmDialog?.action === "sync" ? "synced" : "reverted/discarded";
        showToast(`Batch ${action} successfully.`, "success");
        setConfirmDialog(null);
        setBatches((prev) => prev.filter((b) => b.batchID !== batchId));
      } else {
        setConfirmError(
          Array.isArray(result?.data?.errors) && result.data.errors[0]
            ? result.data.errors[0]
            : "Operation failed. Please try again."
        );
      }
    } catch (error) {
      const msg =
        Array.isArray(error) && typeof error[0] === "string"
          ? error[0]
          : "Operation failed. Please try again.";
      setConfirmError(msg);
    } finally {
      setRevertingId(null);
    }
  };

  const handleRevertClick = async (batch: any) => {
    setConfirmError(null);
    if (batch.status === "Synced") {
      setSafetyLoading(true);
      setSafetyData(null);
      try {
        const res = await safetyCb.execute(batch.batchID);
        setSafetyData(res?.data?.response ?? null);
      } catch {
        setSafetyData(null);
      } finally {
        setSafetyLoading(false);
      }
    } else {
      setSafetyData(null);
    }
    setConfirmDialog({ id: batch.batchID, action: "revert" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge color="amber">Pending Sync</Badge>;
      case "Synced":
        return <Badge color="green">Synced</Badge>;
      case "Reverted":
        return <Badge color="red">Reverted</Badge>;
      case "Discarded":
        return <Badge color="gray">Discarded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (listCb.loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
        <Spinner />
      </Flex>
    );
  }

  if (batches.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: "3rem" }}>
        <Text color="gray">No import history yet. Start by importing a recipe file.</Text>
      </Card>
    );
  }

  return (
    <>
      <Box mb="3">
        <TextField.Root
          placeholder="Search by batch code..."
          value={batchSearch}
          onChange={(e) => setBatchSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      {filteredBatches.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "2rem" }}>
          <Text color="gray">No batches match &quot;{batchSearch}&quot;.</Text>
        </Card>
      ) : (
        <Box style={{ overflowX: "auto" }}>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Batch Code</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Date Imported</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Imported By</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">Ingredients</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">Menu Items</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">Recipes</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredBatches.map((batch) => (
                <Table.Row
                  key={batch.batchID}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    router.push(`/admin/hub/product/import-recipes/${batch.batchID}`)
                  }
                >
                  <Table.Cell>
                    <Text weight="medium" size="2">
                      {batch.batchCode}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{formatDateTime(batch.importedAt)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{batch.importedByName}</Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text size="2">{batch.totalIngredients}</Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text size="2">{batch.totalMenuItems}</Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text size="2">{batch.totalRecipes}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex direction="column" gap="1" align="start">
                      {getStatusBadge(batch.status)}
                      {batch.status === "Pending" && batch.syncedMenuItemCount > 0 && (
                        <Badge color="blue" variant="soft" size="1">
                          {batch.syncedMenuItemCount}/{batch.totalMenuItems} synced
                        </Badge>
                      )}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Flex gap="2">
                      {batch.status === "Pending" && (
                        <>
                          <Button
                            size="1"
                            color="green"
                            onClick={() => {
                              setConfirmError(null);
                              setConfirmDialog({ id: batch.batchID, action: "sync" });
                            }}
                            disabled={syncingId === batch.batchID}
                          >
                            {syncingId === batch.batchID ? "Syncing..." : "Sync"}
                          </Button>
                          <Button
                            size="1"
                            color="red"
                            variant="ghost"
                            onClick={() => handleRevertClick(batch)}
                          >
                            Discard
                          </Button>
                        </>
                      )}
                      {batch.status === "Synced" && (
                        <Button
                          size="1"
                          color="red"
                          variant="ghost"
                          onClick={() => handleRevertClick(batch)}
                          disabled={revertingId === batch.batchID || safetyLoading}
                        >
                          {safetyLoading ? "Checking..." : revertingId === batch.batchID ? "Reverting..." : "Revert"}
                        </Button>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (() => {
        const confirmBatch = batches.find((b) => b.batchID === confirmDialog.id);
        const isSyncedRevert = confirmDialog.action === "revert" && confirmBatch?.status === "Synced";
        return (
          <Dialog.Root open={!!confirmDialog} onOpenChange={(open) => { if (!open) { setConfirmDialog(null); setSafetyData(null); } }}>
            <Dialog.Content style={isSmallMobile ? mobileDialogStyle : undefined}>
              <Dialog.Title>
                {confirmDialog.action === "sync" ? "Sync to Products" : isSyncedRevert ? "Revert Batch" : "Discard Batch"}
              </Dialog.Title>
              <Text>
                {confirmDialog.action === "sync"
                  ? "This will create all staged products and recipes in the system. They will be visible in the POS."
                  : isSyncedRevert
                  ? "This will deactivate all products, ingredients, and recipes that were created from this import batch."
                  : "This will delete all staged data for this batch. This action cannot be undone."}
              </Text>
              {isSyncedRevert && safetyData?.hasInventory && (
                <Callout.Root color="orange" variant="surface" mt="3">
                  <Callout.Icon>
                    <WarningAmberOutlined fontSize="small" />
                  </Callout.Icon>
                  <Callout.Text size="2">
                    <Text weight="bold">Warning:</Text> {safetyData.inventoryCount} synced product(s) have active inventory records and are currently sellable in the cashier. Reverting will deactivate them.
                  </Callout.Text>
                  <Box mt="2">
                    {safetyData.affectedProducts.map((p, i) => (
                      <Text key={i} as="p" size="1" color="orange">
                        • {p.productName} ({p.isMenuItem ? "Menu Item" : "Ingredient"}) — Qty: {p.currentQuantity}
                      </Text>
                    ))}
                  </Box>
                </Callout.Root>
              )}
              {confirmError && (
                <Callout.Root color="red" variant="surface" mt="3">
                  <Callout.Icon>
                    <WarningAmberOutlined fontSize="small" />
                  </Callout.Icon>
                  <Callout.Text size="2">{confirmError}</Callout.Text>
                </Callout.Root>
              )}
              <Flex gap="2" justify="end" mt="4" style={isSmallMobile ? mobileFooterStyle : undefined}>
                <Dialog.Close>
                  <Button variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button
                  color={confirmDialog.action === "sync" ? "green" : "red"}
                  onClick={() => {
                    if (confirmDialog.action === "sync") {
                      handleSync(confirmDialog.id);
                    } else {
                      handleRevert(confirmDialog.id);
                    }
                  }}
                  disabled={syncingId === confirmDialog.id || revertingId === confirmDialog.id}
                >
                  {confirmDialog.action === "sync" ? "Sync Now" : isSyncedRevert ? "Revert" : "Discard"}
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        );
      })()}

      <SyncLoadingOverlay visible={syncOverlayVisible} />
    </>
  );
};
