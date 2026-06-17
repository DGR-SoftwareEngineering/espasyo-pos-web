import React, { useState, useEffect } from "react";
import { useRouter } from "core-lib/core/router";
import {
  Box,
  Flex,
  Text,
  Card,
  Heading,
  Badge,
  Table,
  Button,
  Dialog,
  Callout,
  Spinner,
  RadioGroup,
  Separator,
  Checkbox,
} from "@radix-ui/themes";
import { ChevronLeftIcon, CheckIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useApi, useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { RecipeImportBatchDetailDto, RevertBatchSafetyDto } from "core-lib/api/commons/types";
import type { RecipeImportStepSyncResultDto } from "core-lib/api/commons/types";
import { SyncLoadingOverlay } from "./SyncLoadingOverlay";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

interface ImportBatchDetailBlockProps {
  batchId: string;
}

export const ImportBatchDetailBlock: React.FC<ImportBatchDetailBlockProps> = ({ batchId }) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const { isSmallMobile } = useResolution();

  const { result, loading, error, execute: refreshBatch } = useApi(
    (api) => api.commons.getImportBatchDetail(batchId),
    [batchId]
  );

  const syncCb = useApiCallback(async (api, id: string) => api.commons.syncImportBatch(id));
  const syncStepCb = useApiCallback(async (api, { id, count }: { id: string; count: number }) =>
    api.commons.syncImportBatchStep(id, count)
  );
  const syncSelectedCb = useApiCallback(async (api, { id, ids }: { id: string; ids: string[] }) =>
    api.commons.syncImportBatchSelected(id, ids)
  );
  const revertCb = useApiCallback(async (api, id: string) => api.commons.revertImportBatch(id));
  const safetyCb = useApiCallback(async (api, id: string) => api.commons.checkRevertBatchSafety(id));

  const [syncing, setSyncing] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [syncOverlayVisible, setSyncOverlayVisible] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<"sync" | "revert" | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localSyncedAt, setLocalSyncedAt] = useState<string | null>(null);
  const [localRevertedAt, setLocalRevertedAt] = useState<string | null>(null);
  const [safetyData, setSafetyData] = useState<RevertBatchSafetyDto | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);

  // Step-sync state
  const [stepSyncDialog, setStepSyncDialog] = useState(false);
  const [chunkSize, setChunkSize] = useState("10");
  const [syncProgress, setSyncProgress] = useState<{ done: number; total: number } | null>(null);

  // Selective sync state
  const [selectedIDs, setSelectedIDs] = useState<Set<string>>(new Set());

  const batch = result?.data?.response as RecipeImportBatchDetailDto | undefined;

  useEffect(() => {
    if (batch && localStatus === null) {
      setLocalStatus(batch.status);
    }
  }, [batch]);

  const displayStatus = localStatus ?? batch?.status ?? "";
  const displaySyncedAt = localSyncedAt ?? batch?.syncedAt ?? null;
  const displayRevertedAt = localRevertedAt ?? batch?.revertedAt ?? null;

  const unsyncedItems = batch?.menuItems?.filter((m) => !m.isSynced) ?? [];

  const toggleSelect = (id: string) => {
    setSelectedIDs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllUnsynced = () => {
    setSelectedIDs(new Set(unsyncedItems.map((m) => m.menuItemStagingID)));
  };

  const deselectAll = () => setSelectedIDs(new Set());

  // Sync only selected items
  const handleSyncSelected = async () => {
    if (selectedIDs.size === 0) return;
    setSyncing(true);
    setSyncOverlayVisible(true);
    try {
      const res = await syncSelectedCb.execute({ id: batchId, ids: [...selectedIDs] });
      if (!res?.data?.success || !res.data.response) {
        const msg = Array.isArray(res?.data?.errors) && res.data.errors[0]
          ? res.data.errors[0]
          : "Sync failed. Please try again.";
        showToast(msg, "error");
        return;
      }
      const step = res.data.response as RecipeImportStepSyncResultDto;
      const summary = `Synced ${step.stepProcessed} product(s): ${step.ingredientsCreated} ingredient(s), ${step.recipesCreated} recipe(s).`;
      if (step.errors?.length > 0) {
        showToast(`${summary} ${step.errors.length} error(s).`, "warning");
      } else {
        showToast(summary, "success");
      }
      if (step.isComplete) {
        setLocalStatus("Synced");
        setLocalSyncedAt(new Date().toISOString());
      }
      setSelectedIDs(new Set());
    } catch (err) {
      const msg = Array.isArray(err) && typeof err[0] === "string"
        ? err[0]
        : "Sync failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSyncing(false);
      setSyncOverlayVisible(false);
      refreshBatch();
    }
  };

  // Step-by-step sync: each call processes `count` products to stay under Heroku's 30s timeout
  const handleStepSync = async () => {
    const count = parseInt(chunkSize, 10) || 10;
    const totalProducts = batch?.menuItems?.length ?? 0;

    setStepSyncDialog(false);
    setSyncing(true);
    setSyncOverlayVisible(true);
    setSyncProgress({ done: 0, total: totalProducts });

    let totalIngredients = 0;
    let totalRecipes = 0;
    const allErrors: string[] = [];

    try {
      let done = 0;
      while (done < totalProducts) {
        const res = await syncStepCb.execute({ id: batchId, count });
        if (!res?.data?.success || !res.data.response) {
          const msg = Array.isArray(res?.data?.errors) && res.data.errors[0]
            ? res.data.errors[0]
            : "Sync step failed. Please try again.";
          showToast(msg, "error");
          break;
        }
        const step = res.data.response as RecipeImportStepSyncResultDto;
        done = step.syncedSoFar;
        totalIngredients += step.ingredientsCreated;
        totalRecipes += step.recipesCreated;
        allErrors.push(...step.errors);
        setSyncProgress({ done, total: totalProducts });

        if (step.isComplete) {
          const summary = `Synced: ${totalIngredients} ingredient(s), ${batch?.menuItems?.length ?? done} product(s), ${totalRecipes} recipe(s).`;
          if (allErrors.length > 0) {
            showToast(`${summary} ${allErrors.length} item(s) had errors.`, "warning");
          } else {
            showToast(summary, "success");
          }
          setLocalStatus("Synced");
          setLocalSyncedAt(new Date().toISOString());
          break;
        }
      }
    } catch (err) {
      const msg = Array.isArray(err) && typeof err[0] === "string"
        ? err[0]
        : "Sync failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSyncing(false);
      setSyncOverlayVisible(false);
      setSyncProgress(null);
      refreshBatch();
    }
  };

  // Legacy single-call sync (kept for small batches if needed)
  const handleSync = async () => {
    setConfirmDialog(null);
    setConfirmError(null);
    setSyncing(true);
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
        setLocalStatus("Synced");
        setLocalSyncedAt(new Date().toISOString());
      } else {
        const msg = Array.isArray(result?.data?.errors) && result.data.errors[0]
          ? result.data.errors[0]
          : "Sync failed. Please try again.";
        showToast(msg, "error");
      }
    } catch (err) {
      const msg = Array.isArray(err) && typeof err[0] === "string"
        ? err[0]
        : "Sync failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSyncing(false);
      setSyncOverlayVisible(false);
    }
  };

  const handleRevert = async () => {
    setReverting(true);
    setConfirmError(null);
    try {
      const result = await revertCb.execute(batchId);
      if (result?.data?.success) {
        showToast("Batch reverted/discarded successfully.", "success");
        setConfirmDialog(null);
        if (displayStatus === "Pending") {
          router.push("/admin/hub/product/import-recipes?tab=history");
        } else {
          setLocalStatus("Reverted");
          setLocalRevertedAt(new Date().toISOString());
        }
      } else {
        setConfirmError(
          Array.isArray(result?.data?.errors) && result.data.errors[0]
            ? result.data.errors[0]
            : "Operation failed. Please try again."
        );
      }
    } catch (err) {
      const msg =
        Array.isArray(err) && typeof err[0] === "string"
          ? err[0]
          : "Operation failed. Please try again.";
      setConfirmError(msg);
    } finally {
      setReverting(false);
    }
  };

  const handleRevertClick = async () => {
    setConfirmError(null);
    if (displayStatus === "Synced") {
      setSafetyLoading(true);
      setSafetyData(null);
      try {
        const res = await safetyCb.execute(batchId);
        setSafetyData(res?.data?.response ?? null);
      } catch {
        setSafetyData(null);
      } finally {
        setSafetyLoading(false);
      }
    } else {
      setSafetyData(null);
    }
    setConfirmDialog("revert");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge color="yellow">Pending Sync</Badge>;
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

  if (loading) {
    return (
      <Box style={{ padding: "2rem", textAlign: "center" }}>
        <Text>Loading batch details...</Text>
      </Box>
    );
  }

  if (error || !batch) {
    return (
      <Box style={{ padding: "2rem" }}>
        <Button
          onClick={() => router.push("/admin/hub/product/import-recipes?tab=history")}
          variant="outline"
          mb="3"
        >
          <ChevronLeftIcon /> Back
        </Button>
        <Card variant="surface" size="2">
          <Heading size="3" color="red">
            Error
          </Heading>
          <Text color="red">Failed to load batch details</Text>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Box style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
        <Button
          onClick={() => router.push("/admin/hub/product/import-recipes?tab=history")}
          variant="outline"
          mb="4"
        >
          <ChevronLeftIcon /> Back to Import History
        </Button>

        {/* Header Card */}
        <Card variant="surface" size="2" mb="4">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="start" wrap="wrap" gap="3">
              <Heading size="4">{batch.batchCode}</Heading>
              <Flex gap="2" align="center" wrap="wrap">
                {displayStatus === "Pending" && selectedIDs.size > 0 && (
                  <Button
                    color="blue"
                    size="2"
                    disabled={syncing}
                    onClick={handleSyncSelected}
                  >
                    {syncing ? "Syncing..." : `Sync Selected (${selectedIDs.size})`}
                  </Button>
                )}
                {displayStatus === "Pending" && (
                  <>
                    <Button
                      color="green"
                      size="2"
                      disabled={syncing}
                      onClick={() => setStepSyncDialog(true)}
                    >
                      {syncing ? "Syncing..." : "Sync All"}
                    </Button>
                    <Button
                      color="red"
                      variant="ghost"
                      size="2"
                      disabled={reverting}
                      onClick={handleRevertClick}
                    >
                      Discard
                    </Button>
                  </>
                )}
                {displayStatus === "Synced" && (
                  <Button
                    color="red"
                    variant="ghost"
                    size="2"
                    disabled={reverting || safetyLoading}
                    onClick={handleRevertClick}
                  >
                    {safetyLoading ? "Checking..." : reverting ? "Reverting..." : "Revert"}
                  </Button>
                )}
              </Flex>
            </Flex>

            <Flex gap="4" wrap="wrap">
              <Box>
                <Text size="2" color="gray">Status</Text>
                <Box mt="1">{getStatusBadge(displayStatus)}</Box>
              </Box>
              <Box>
                <Text size="2" color="gray">Imported At</Text>
                <Text size="2" as="div">{formatDate(batch.importedAt)}</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">Imported By</Text>
                <Text size="2" as="div">{batch.importedByName}</Text>
              </Box>
              {displaySyncedAt && (
                <Box>
                  <Text size="2" color="gray">Synced At</Text>
                  <Text size="2" as="div">{formatDate(displaySyncedAt)}</Text>
                </Box>
              )}
              {displayRevertedAt && (
                <Box>
                  <Text size="2" color="gray">Reverted At</Text>
                  <Text size="2" as="div">{formatDate(displayRevertedAt)}</Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </Card>

        {/* Step-sync progress — shows for Pending batches that have been partially synced */}
        {displayStatus === "Pending" && (batch.syncedMenuItemCount ?? 0) > 0 && (
          <Card variant="surface" size="2" mb="4" style={{ border: "1px solid var(--blue-a5)" }}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">Sync Progress</Text>
                <Badge color="blue">
                  {batch.syncedMenuItemCount} / {batch.menuItems.length} products synced
                </Badge>
              </Flex>
              <Box style={{ height: 8, background: "var(--gray-a4)", borderRadius: 4, overflow: "hidden" }}>
                <Box
                  style={{
                    height: "100%",
                    width: `${Math.round(((batch.syncedMenuItemCount ?? 0) / Math.max(batch.menuItems.length, 1)) * 100)}%`,
                    background: "var(--blue-9)",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
              <Text size="1" color="gray">
                {batch.menuItems.length - (batch.syncedMenuItemCount ?? 0)} products remaining.
                Click <strong>Sync All</strong> to continue, or select specific products below.
              </Text>
            </Flex>
          </Card>
        )}

        {displayStatus === "Synced" && (
          <Callout.Root color="green" mb="4">
            <Flex direction="column" gap="2">
              <Callout.Text weight="medium">
                This batch has already been synced.
              </Callout.Text>
              <Flex gap="2" wrap="wrap">
                <Button
                  variant="soft"
                  color="green"
                  size="1"
                  onClick={() => router.push((r) => r.productList)}
                >
                  View Product List
                </Button>
                <Button
                  variant="soft"
                  color="green"
                  size="1"
                  onClick={() => router.push((r) => r.recipeList)}
                >
                  View Recipe List
                </Button>
              </Flex>
            </Flex>
          </Callout.Root>
        )}

        {/* Sync guide banner — shown only while batch is pending */}
        {displayStatus === "Pending" && (
          <Callout.Root color="blue" variant="surface" mb="4">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text size="2">
              <Text weight="bold" as="div" mb="1">How to sync this batch</Text>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
                <li>
                  <Text weight="medium">Sync All</Text> — automatically syncs all remaining products in small chunks to avoid server timeouts.
                </li>
                <li>
                  <Text weight="medium">Sync Selected</Text> — check specific products below, then click{" "}
                  <Text weight="medium">"Sync Selected"</Text> in the header to process only those items.
                </li>
                <li>
                  <Text color="green" weight="medium">Green items</Text> are already synced and visible in the POS.
                  Progress is saved — you can safely stop and resume at any time.
                </li>
              </ul>
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Products & Recipes Section */}
        {(() => {
          const recipesByMenuName = new Map<string, typeof batch.recipes>();
          batch.recipes.forEach((r) => {
            if (!recipesByMenuName.has(r.menuItemName)) recipesByMenuName.set(r.menuItemName, []);
            recipesByMenuName.get(r.menuItemName)!.push(r);
          });

          const isPending = displayStatus === "Pending";
          const allUnsyncedSelected =
            unsyncedItems.length > 0 && unsyncedItems.every((m) => selectedIDs.has(m.menuItemStagingID));

          return (
            <Card variant="surface" size="2">
              <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
                <Heading size="3">
                  Products &amp; Recipes ({batch.menuItems.length} product{batch.menuItems.length !== 1 ? "s" : ""},{" "}
                  {batch.recipes.length} recipe{batch.recipes.length !== 1 ? "s" : ""})
                </Heading>
                {isPending && unsyncedItems.length > 0 && (
                  <Flex gap="2" align="center">
                    {selectedIDs.size > 0 && (
                      <Text size="1" color="gray">{selectedIDs.size} selected</Text>
                    )}
                    <Button
                      size="1"
                      variant="soft"
                      color="blue"
                      onClick={allUnsyncedSelected ? deselectAll : selectAllUnsynced}
                    >
                      {allUnsyncedSelected ? "Deselect All" : "Select All Unsynced"}
                    </Button>
                  </Flex>
                )}
              </Flex>

              <Flex direction="column" gap="3">
                {batch.menuItems.map((menuItem, mi) => {
                  const relatedRecipes = recipesByMenuName.get(menuItem.menuItemName) ?? [];
                  const isVariantProduct = relatedRecipes.some((r) => r.variantName);
                  const isSelected = selectedIDs.has(menuItem.menuItemStagingID);
                  const isSynced = menuItem.isSynced;

                  // Color scheme: green if synced, blue-tinted if selected, variant/plain otherwise
                  const borderColor = isSynced
                    ? "var(--green-a6)"
                    : isSelected
                    ? "var(--blue-a6)"
                    : isVariantProduct
                    ? "var(--blue-a4)"
                    : "var(--gray-a4)";

                  const headerBg = isSynced
                    ? "var(--green-a3)"
                    : isSelected
                    ? "var(--blue-a3)"
                    : isVariantProduct
                    ? "var(--blue-a2)"
                    : "var(--gray-a2)";

                  return (
                    <Box
                      key={mi}
                      style={{
                        border: `1px solid ${borderColor}`,
                        borderRadius: 6,
                        overflow: "hidden",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                    >
                      {/* Menu item header */}
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="2"
                        style={{ background: headerBg }}
                      >
                        {isPending && (
                          <Box
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: isSynced ? "default" : "pointer", flexShrink: 0 }}
                          >
                            <Checkbox
                              checked={isSynced || isSelected}
                              disabled={isSynced}
                              onCheckedChange={() => {
                                if (!isSynced) toggleSelect(menuItem.menuItemStagingID);
                              }}
                              size="2"
                              color={isSynced ? "green" : "blue"}
                            />
                          </Box>
                        )}
                        {isSynced && (
                          <Badge color="green" variant="solid" size="1">
                            <CheckIcon /> Synced
                          </Badge>
                        )}
                        <Text weight="bold" size="2">{menuItem.menuItemName}</Text>
                        <Badge
                          color={isSynced ? "green" : isVariantProduct ? "blue" : "gray"}
                          variant="soft"
                          size="1"
                        >
                          {isVariantProduct ? `${relatedRecipes.length} variants` : "Standalone"}
                        </Badge>
                        <Badge color="gray" variant="soft" size="1">{menuItem.categoryName}</Badge>
                        {!isVariantProduct && menuItem.sellingPrice > 0 && (
                          <Text size="2" color="gray">{formatCurrency(menuItem.sellingPrice)}</Text>
                        )}
                        {menuItem.description && (
                          <Text size="1" color="gray" style={{ fontStyle: "italic" }}>
                            — {menuItem.description}
                          </Text>
                        )}
                      </Flex>

                      {/* Recipes */}
                      {isVariantProduct ? (
                        <Box px="3" py="2">
                          <Flex direction="column" gap="3">
                            {relatedRecipes.map((recipe, ri) => {
                              const variantSynced = recipe.isSynced;
                              return (
                                <Box key={ri}>
                                  <Flex align="center" gap="2" mb="2">
                                    {variantSynced ? (
                                      <Badge color="green" variant="solid" size="1">
                                        <CheckIcon /> {recipe.variantName}
                                      </Badge>
                                    ) : (
                                      <Badge color="blue" size="1">{recipe.variantName}</Badge>
                                    )}
                                    {recipe.variantPrice != null && (
                                      <Text size="2" color="gray">{formatCurrency(recipe.variantPrice)}</Text>
                                    )}
                                    <Text size="1" color="gray">
                                      Est. {formatCurrency(recipe.estimatedCostPerServing)}/serving
                                    </Text>
                                  </Flex>
                                  <Box style={{ overflowX: "auto" }}>
                                    <Table.Root size="1" layout="auto">
                                      <Table.Header>
                                        <Table.Row>
                                          <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                                          <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
                                          <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                                          <Table.ColumnHeaderCell align="right">Pkg Cost</Table.ColumnHeaderCell>
                                          <Table.ColumnHeaderCell align="right">Pkg Qty</Table.ColumnHeaderCell>
                                          <Table.ColumnHeaderCell align="right">Est. Cost</Table.ColumnHeaderCell>
                                        </Table.Row>
                                      </Table.Header>
                                      <Table.Body>
                                        {recipe.items.map((item, j) => (
                                          <Table.Row
                                            key={j}
                                            style={
                                              item.isIngredientSynced
                                                ? { background: "var(--green-a2)" }
                                                : undefined
                                            }
                                          >
                                            <Table.Cell>
                                              <Flex align="center" gap="1">
                                                {item.isIngredientSynced && (
                                                  <Badge color="green" variant="soft" size="1">
                                                    <CheckIcon />
                                                  </Badge>
                                                )}
                                                <Text size="2">{item.ingredientName}</Text>
                                              </Flex>
                                            </Table.Cell>
                                            <Table.Cell align="right">
                                              <Text size="2">{item.quantityRequired.toFixed(2)}</Text>
                                            </Table.Cell>
                                            <Table.Cell><Text size="2">{item.unitName}</Text></Table.Cell>
                                            <Table.Cell align="right">
                                              <Text size="2" color="gray">{formatCurrency(item.packagePrice)}</Text>
                                            </Table.Cell>
                                            <Table.Cell align="right">
                                              <Text size="2" color="gray">{item.qtyPerPack}</Text>
                                            </Table.Cell>
                                            <Table.Cell align="right">
                                              <Text size="2" color="amber">{formatCurrency(item.estimatedIngredientCost)}</Text>
                                            </Table.Cell>
                                          </Table.Row>
                                        ))}
                                      </Table.Body>
                                    </Table.Root>
                                  </Box>
                                  {ri < relatedRecipes.length - 1 && (
                                    <Box my="2" style={{ borderBottom: "1px solid var(--gray-a3)" }} />
                                  )}
                                </Box>
                              );
                            })}
                          </Flex>
                        </Box>
                      ) : (
                        relatedRecipes.length > 0 && (
                          <Box px="3" py="2">
                            <Flex align="center" gap="2" mb="2">
                              {relatedRecipes[0].isSynced ? (
                                <Badge color="green" variant="soft" size="1">
                                  <CheckIcon /> Recipe Synced
                                </Badge>
                              ) : null}
                              <Text size="1" color="gray">
                                Est. {formatCurrency(relatedRecipes[0].estimatedCostPerServing)}/serving
                              </Text>
                            </Flex>
                            <Box style={{ overflowX: "auto" }}>
                              <Table.Root size="1" layout="auto">
                                <Table.Header>
                                  <Table.Row>
                                    <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Pkg Cost</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Pkg Qty</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Est. Cost</Table.ColumnHeaderCell>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {relatedRecipes[0].items.map((item, j) => (
                                    <Table.Row
                                      key={j}
                                      style={
                                        item.isIngredientSynced
                                          ? { background: "var(--green-a2)" }
                                          : undefined
                                      }
                                    >
                                      <Table.Cell>
                                        <Flex align="center" gap="1">
                                          {item.isIngredientSynced && (
                                            <Badge color="green" variant="soft" size="1">
                                              <CheckIcon />
                                            </Badge>
                                          )}
                                          <Text size="2">{item.ingredientName}</Text>
                                        </Flex>
                                      </Table.Cell>
                                      <Table.Cell align="right">
                                        <Text size="2">{item.quantityRequired.toFixed(2)}</Text>
                                      </Table.Cell>
                                      <Table.Cell><Text size="2">{item.unitName}</Text></Table.Cell>
                                      <Table.Cell align="right">
                                        <Text size="2" color="gray">{formatCurrency(item.packagePrice)}</Text>
                                      </Table.Cell>
                                      <Table.Cell align="right">
                                        <Text size="2" color="gray">{item.qtyPerPack}</Text>
                                      </Table.Cell>
                                      <Table.Cell align="right">
                                        <Text size="2" color="amber">{formatCurrency(item.estimatedIngredientCost)}</Text>
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Root>
                            </Box>
                          </Box>
                        )
                      )}
                    </Box>
                  );
                })}
              </Flex>

              {/* Standalone Ingredients Section */}
              {batch.ingredients.length > 0 && (
                <Box mt="4">
                  <Separator size="4" mb="3" />
                  <Heading size="2" mb="2" color="gray">
                    Standalone Ingredients ({batch.ingredients.length})
                  </Heading>
                  <Box style={{ overflowX: "auto" }}>
                    <Table.Root size="1" variant="surface">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell align="right">Pkg Price</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell align="right">Pkg Qty</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {batch.ingredients.map((ing, i) => (
                          <Table.Row
                            key={i}
                            style={ing.isSynced ? { background: "var(--green-a2)" } : undefined}
                          >
                            <Table.Cell>
                              <Flex align="center" gap="1">
                                {ing.isSynced && (
                                  <Badge color="green" variant="solid" size="1">
                                    <CheckIcon /> Synced
                                  </Badge>
                                )}
                                <Text size="2">{ing.name}</Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell><Text size="2">{ing.categoryName}</Text></Table.Cell>
                            <Table.Cell align="right">
                              <Text size="2">{formatCurrency(ing.packagePrice)}</Text>
                            </Table.Cell>
                            <Table.Cell align="right">
                              <Text size="2">{ing.qtyPerPack}</Text>
                            </Table.Cell>
                            <Table.Cell><Text size="2">{ing.unitName}</Text></Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                </Box>
              )}
            </Card>
          );
        })()}
      </Box>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog.Root
          open={!!confirmDialog}
          onOpenChange={(open) => {
            if (!open) { setConfirmDialog(null); setSafetyData(null); }
          }}
        >
          <Dialog.Content style={isSmallMobile ? mobileDialogStyle : undefined}>
            <Dialog.Title>
              {confirmDialog === "sync" ? "Sync to Products" : displayStatus === "Synced" ? "Revert Batch" : "Discard Batch"}
            </Dialog.Title>
            <Text as="p">
              {confirmDialog === "sync"
                ? "This will create all staged products and recipes in the system. They will be visible in the POS."
                : displayStatus === "Pending"
                ? "This will discard all staged data for this batch. This action cannot be undone."
                : "This will deactivate all products, ingredients, and recipes that were created from this import batch."}
            </Text>
            {confirmDialog === "revert" && displayStatus === "Synced" && safetyData?.hasInventory && (
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
                color={confirmDialog === "sync" ? "green" : "red"}
                disabled={syncing || reverting}
                onClick={() => {
                  if (confirmDialog === "sync") {
                    handleSync();
                  } else {
                    handleRevert();
                  }
                }}
              >
                {confirmDialog === "sync" ? "Sync Now" : displayStatus === "Pending" ? "Discard" : "Revert"}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      <SyncLoadingOverlay visible={syncOverlayVisible} progress={syncProgress} />

      {/* Step-sync dialog: chunk size selection */}
      {stepSyncDialog && (
        <Dialog.Root open={stepSyncDialog} onOpenChange={(open) => { if (!open) setStepSyncDialog(false); }}>
          <Dialog.Content style={{ maxWidth: 460 }}>
            <Dialog.Title>Sync All Products</Dialog.Title>

            {(batch?.menuItems?.length ?? 0) > 10 && (
              <Callout.Root color="amber" variant="surface" mb="3">
                <Callout.Text size="2">
                  This batch has <strong>{batch?.menuItems?.length} products</strong>. Large batches must be synced
                  in steps to avoid server timeouts. Choose how many products to sync per step.
                </Callout.Text>
              </Callout.Root>
            )}

            {(batch?.menuItems?.length ?? 0) <= 10 && (
              <Text as="p" size="2" color="gray" mb="3">
                This will create all staged products and recipes in the system. They will be visible in the POS.
              </Text>
            )}

            <Text size="2" weight="medium" as="div" mb="2">
              Products per step
            </Text>
            <RadioGroup.Root value={chunkSize} onValueChange={setChunkSize}>
              <Flex direction="column" gap="2" mb="4">
                <RadioGroup.Item value="5">
                  <Flex direction="column">
                    <Text size="2">5 products per step</Text>
                    <Text size="1" color="gray">Safest — use if you see repeated timeouts</Text>
                  </Flex>
                </RadioGroup.Item>
                <RadioGroup.Item value="10">
                  <Flex direction="column">
                    <Text size="2">10 products per step (recommended)</Text>
                    <Text size="1" color="gray">Balanced speed and reliability</Text>
                  </Flex>
                </RadioGroup.Item>
                <RadioGroup.Item value="20">
                  <Flex direction="column">
                    <Text size="2">20 products per step</Text>
                    <Text size="1" color="gray">Faster — suitable for simple recipes</Text>
                  </Flex>
                </RadioGroup.Item>
              </Flex>
            </RadioGroup.Root>

            {batch?.menuItems && batch.menuItems.length > 0 && (
              <Box mb="3" style={{ padding: "0.75rem", background: "var(--gray-a2)", borderRadius: 6 }}>
                <Text size="1" color="gray">
                  Estimated steps: <strong>{Math.ceil(batch.menuItems.length / parseInt(chunkSize, 10))}</strong>
                  {" "}× ~{chunkSize} products each
                </Text>
              </Box>
            )}

            <Flex gap="2" justify="end">
              <Dialog.Close>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button color="green" onClick={handleStepSync}>
                Start Syncing
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
};
