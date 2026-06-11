import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  Flex,
  Box,
  Text,
  Button,
  Badge,
  Spinner,
  Table,
} from "@radix-ui/themes";
import {
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { useOfflineMode } from "../../core/contexts/OfflineModeContext";
import {
  getPendingOfflineSales,
  type OfflineSaleRecord,
} from "../../core/services/offlineDb";

type SyncRowStatus = "pending" | "synced" | "failed";

interface SyncRow extends OfflineSaleRecord {
  rowStatus: SyncRowStatus;
  rowError?: string;
}

type Stage = "preview" | "progress";

export const SyncOfflineDialog: React.FC = () => {
  const {
    syncDialogOpen,
    closeSyncDialog,
    executeSyncAll,
    isSyncing,
    refreshPendingCount,
  } = useOfflineMode();

  const [stage, setStage] = useState<Stage>("preview");
  const [rows, setRows] = useState<SyncRow[]>([]);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPreview = useCallback(async () => {
    const pending = await getPendingOfflineSales();
    setRows(
      pending.map((r) => ({ ...r, rowStatus: "pending" as SyncRowStatus })),
    );
  }, []);

  useEffect(() => {
    if (syncDialogOpen) {
      setStage("preview");
      loadPreview();
    }
  }, [syncDialogOpen, loadPreview]);

  // After sync finishes, re-read IndexedDB to populate results
  useEffect(() => {
    if (stage === "progress" && !isSyncing) {
      getPendingOfflineSales().then((stillPending) => {
        const pendingIds = new Set(stillPending.map((r) => r.localId));
        setRows((prev) =>
          prev.map((r) => ({
            ...r,
            rowStatus: pendingIds.has(r.localId) ? "failed" : "synced",
          })),
        );

        const allDone = true; // isSyncing going false means the batch completed
        if (allDone) {
          const anyFailed = stillPending.length > 0;
          if (!anyFailed) {
            doneTimerRef.current = setTimeout(() => {
              closeSyncDialog();
              setStage("preview");
            }, 1500);
          }
        }
      });
    }
  }, [isSyncing, stage, closeSyncDialog]);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const handleSyncAll = useCallback(async () => {
    setStage("progress");
    await executeSyncAll();
    await refreshPendingCount();
  }, [executeSyncAll, refreshPendingCount]);

  const handleClose = useCallback(() => {
    if (!isSyncing) {
      closeSyncDialog();
      setStage("preview");
    }
  }, [isSyncing, closeSyncDialog]);

  const totalAmount = (record: OfflineSaleRecord) =>
    record.payload.payments.reduce((sum, p) => sum + p.amount, 0);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const allFinished = stage === "progress" && !isSyncing;
  const hasFailed = rows.some((r) => r.rowStatus === "failed");

  return (
    <Dialog.Root
      open={syncDialogOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Content
        maxWidth="580px"
        onEscapeKeyDown={(e) => {
          if (isSyncing) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isSyncing) e.preventDefault();
        }}
      >
        <Dialog.Title>
          {stage === "preview"
            ? `Sync ${rows.length} Offline Sale(s)`
            : "Syncing Offline Sales"}
        </Dialog.Title>

        {stage === "preview" && (
          <>
            <Text size="2" color="gray">
              Review the queued sales below before uploading them to the server.
            </Text>
            <Box mt="3" mb="4">
              <Table.Root variant="surface" size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Items</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rows.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={4}>
                        <Text size="2" color="gray">
                          No pending sales.
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )}
                  {rows.map((row) => (
                    <Table.Row key={row.localId}>
                      <Table.Cell>
                        <Text size="2">{formatTime(row.createdAt)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{row.payload.items.length}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">
                          ₱{totalAmount(row).toFixed(2)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="orange" size="1">
                          Pending
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
            <Flex justify="end" gap="2">
              <Button variant="soft" color="gray" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSyncAll}
                disabled={rows.length === 0}
              >
                Sync All ({rows.length} sale{rows.length !== 1 ? "s" : ""})
              </Button>
            </Flex>
          </>
        )}

        {stage === "progress" && (
          <>
            {isSyncing && (
              <Flex align="center" gap="2" my="2">
                <Spinner loading size="2" />
                <Text size="2">Uploading sales to server…</Text>
              </Flex>
            )}
            {allFinished && (
              <Text size="2" color={hasFailed ? "red" : "green"} my="2">
                {hasFailed
                  ? "Some sales failed to sync. See details below."
                  : "All sales synced successfully!"}
              </Text>
            )}
            <Box mt="3" mb="4">
              <Table.Root variant="surface" size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Items</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Result</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rows.map((row) => (
                    <Table.Row key={row.localId}>
                      <Table.Cell>
                        <Text size="2">{formatTime(row.createdAt)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{row.payload.items.length}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">₱{totalAmount(row).toFixed(2)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        {row.rowStatus === "pending" && (
                          <Spinner loading size="1" />
                        )}
                        {row.rowStatus === "synced" && (
                          <Flex align="center" gap="1">
                            <CheckIcon color="green" />
                            <Text size="1" color="green">
                              Synced
                            </Text>
                          </Flex>
                        )}
                        {row.rowStatus === "failed" && (
                          <Flex align="center" gap="1">
                            <Cross2Icon color="red" />
                            <Text size="1" color="red">
                              {row.rowError ?? "Failed"}
                            </Text>
                          </Flex>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
            <Flex justify="end">
              <Button
                disabled={!allFinished}
                onClick={handleClose}
              >
                Done
              </Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};
