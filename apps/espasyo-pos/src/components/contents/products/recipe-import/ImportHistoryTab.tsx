import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Text, Flex, Box, Card, Dialog, Spinner, Callout } from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";

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
  const { showToast } = useToastContext();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; action: "sync" | "revert" } | null>(null);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [batches, setBatches] = useState<any[]>([]);

  const listCb = useApiCallback(async (api) => api.commons.getImportBatchList());
  const syncCb = useApiCallback(async (api, id: string) => api.commons.syncImportBatch(id));
  const revertCb = useApiCallback(async (api, id: string) => api.commons.revertImportBatch(id));

  useEffect(() => {
    listCb.execute();
  }, [refreshKey, localRefreshKey]);

  useEffect(() => {
    if (listCb.result?.data?.response) {
      setBatches(listCb.result.data.response);
    }
  }, [listCb.result]);

  const handleSync = async (batchId: string) => {
    setSyncingId(batchId);
    setConfirmError(null);
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
        setConfirmDialog(null);
        setLocalRefreshKey((k) => k + 1);
      } else {
        setConfirmError(Array.isArray(result?.data?.errors) && result.data.errors[0] ? result.data.errors[0] : "Sync failed. Please try again.");
      }
    } catch (error) {
      const msg = Array.isArray(error) && typeof error[0] === "string"
        ? error[0]
        : "Sync failed. Please try again.";
      setConfirmError(msg);
    } finally {
      setSyncingId(null);
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
        setConfirmError(Array.isArray(result?.data?.errors) && result.data.errors[0] ? result.data.errors[0] : "Operation failed. Please try again.");
      }
    } catch (error) {
      const msg = Array.isArray(error) && typeof error[0] === "string"
        ? error[0]
        : "Operation failed. Please try again.";
      setConfirmError(msg);
    } finally {
      setRevertingId(null);
    }
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
            {batches.map((batch) => (
              <Table.Row key={batch.batchID}>
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
                <Table.Cell>{getStatusBadge(batch.status)}</Table.Cell>
                <Table.Cell>
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
                          onClick={() => {
                            setConfirmError(null);
                            setConfirmDialog({ id: batch.batchID, action: "revert" });
                          }}
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
                        onClick={() => {
                          setConfirmError(null);
                          setConfirmDialog({ id: batch.batchID, action: "revert" });
                        }}
                        disabled={revertingId === batch.batchID}
                      >
                        {revertingId === batch.batchID ? "Reverting..." : "Revert"}
                      </Button>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog.Root open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <Dialog.Content>
            <Dialog.Title>
              {confirmDialog.action === "sync" ? "Sync to Products" : "Discard Batch"}
            </Dialog.Title>
            <Text>
              {confirmDialog.action === "sync"
                ? "This will create all staged products and recipes in the system. They will be visible in the POS."
                : "This will delete all staged data for this batch. This action cannot be undone."}
            </Text>
            {confirmError && (
              <Callout.Root color="red" variant="surface" mt="3">
                <Callout.Icon><WarningAmberOutlined fontSize="small" /></Callout.Icon>
                <Callout.Text size="2">{confirmError}</Callout.Text>
              </Callout.Root>
            )}
            <Flex gap="2" justify="end" mt="4">
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
                {confirmDialog.action === "sync" ? "Sync Now" : "Discard"}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
};
