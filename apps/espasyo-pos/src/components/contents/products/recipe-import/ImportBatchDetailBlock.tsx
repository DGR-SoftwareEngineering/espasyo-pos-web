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
} from "@radix-ui/themes";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { WarningAmberOutlined } from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { RecipeImportBatchDetailDto, RevertBatchSafetyDto } from "core-lib/api/commons/types";
import { SyncLoadingOverlay } from "./SyncLoadingOverlay";

interface ImportBatchDetailBlockProps {
  batchId: string;
}

export const ImportBatchDetailBlock: React.FC<ImportBatchDetailBlockProps> = ({ batchId }) => {
  const router = useRouter();
  const { showToast } = useToastContext();

  const { result, loading, error } = useApi(
    (api) => api.commons.getImportBatchDetail(batchId),
    [batchId]
  );

  const syncCb = useApiCallback(async (api, id: string) => api.commons.syncImportBatch(id));
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

  const batch = result?.data?.response as RecipeImportBatchDetailDto | undefined;

  useEffect(() => {
    if (batch && localStatus === null) {
      setLocalStatus(batch.status);
    }
  }, [batch]);

  const displayStatus = localStatus ?? batch?.status ?? "";
  const displaySyncedAt = localSyncedAt ?? batch?.syncedAt ?? null;
  const displayRevertedAt = localRevertedAt ?? batch?.revertedAt ?? null;

  const handleSync = async () => {
    setSyncing(true);
    setSyncOverlayVisible(true);
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
        setLocalStatus("Synced");
        setLocalSyncedAt(new Date().toISOString());
        setConfirmDialog(null);
      } else {
        setConfirmError(
          Array.isArray(result?.data?.errors) && result.data.errors[0]
            ? result.data.errors[0]
            : "Sync failed. Please try again."
        );
      }
    } catch (err) {
      const msg =
        Array.isArray(err) && typeof err[0] === "string"
          ? err[0]
          : "Sync failed. Please try again.";
      setConfirmError(msg);
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
                {displayStatus === "Pending" && (
                  <>
                    <Button
                      color="green"
                      size="2"
                      disabled={syncing}
                      onClick={() => {
                        setConfirmError(null);
                        setConfirmDialog("sync");
                      }}
                    >
                      {syncing ? "Syncing..." : "Sync"}
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

        {/* Products & Recipes Section — grouped by menu item, variants shown as tabs */}
        {(() => {
          // Group recipes by menuItemName; detect variants by presence of variantName
          const recipesByMenuName = new Map<string, typeof batch.recipes>();
          batch.recipes.forEach((r) => {
            if (!recipesByMenuName.has(r.menuItemName)) recipesByMenuName.set(r.menuItemName, []);
            recipesByMenuName.get(r.menuItemName)!.push(r);
          });

          return (
            <Card variant="surface" size="2">
              <Heading size="3" mb="3">
                Products & Recipes ({batch.menuItems.length} product{batch.menuItems.length !== 1 ? "s" : ""}, {batch.recipes.length} recipe{batch.recipes.length !== 1 ? "s" : ""})
              </Heading>
              <Flex direction="column" gap="4">
                {batch.menuItems.map((menuItem, mi) => {
                  const relatedRecipes = recipesByMenuName.get(menuItem.menuItemName) ?? [];
                  const isVariantProduct = relatedRecipes.some((r) => r.variantName);

                  return (
                    <Box
                      key={mi}
                      style={{
                        border: `1px solid ${isVariantProduct ? "var(--blue-a4)" : "var(--gray-a4)"}`,
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      {/* Menu item header */}
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="2"
                        style={{ background: isVariantProduct ? "var(--blue-a2)" : "var(--gray-a2)" }}
                      >
                        <Text weight="bold" size="2">{menuItem.menuItemName}</Text>
                        <Badge color={isVariantProduct ? "blue" : "gray"} variant="soft" size="1">
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
                        // Variant product: one section per variant
                        <Box px="3" py="2">
                          <Flex direction="column" gap="3">
                            {relatedRecipes.map((recipe, ri) => (
                              <Box key={ri}>
                                <Flex align="center" gap="2" mb="2">
                                  <Badge color="blue" size="1">{recipe.variantName}</Badge>
                                  {recipe.variantPrice != null && (
                                    <Text size="2" color="gray">{formatCurrency(recipe.variantPrice)}</Text>
                                  )}
                                  <Flex direction="column" gap="3">
                                    <Text size="1" color="gray">
                                      Est. {formatCurrency(recipe.estimatedCostPerServing)}/serving
                                    </Text>
                                    {recipe.items.some(i => i.qtyPerPack <= 1) && (
                                      <Text size="1" color="red">
                                        ⚠ Some ingredients have Purchase Qty = 1 — cost may be inflated
                                      </Text>
                                    )}
                                  </Flex>
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
                                        <Table.Row key={j}>
                                          <Table.Cell><Text size="2">{item.ingredientName}</Text></Table.Cell>
                                          <Table.Cell align="right"><Text size="2">{item.quantityRequired.toFixed(2)}</Text></Table.Cell>
                                          <Table.Cell><Text size="2">{item.unitName}</Text></Table.Cell>
                                          <Table.Cell align="right"><Text size="2" color="gray">{formatCurrency(item.packagePrice)}</Text></Table.Cell>
                                          <Table.Cell align="right"><Text size="2" color={item.qtyPerPack <= 1 ? "red" : "gray"}>{item.qtyPerPack}</Text></Table.Cell>
                                          <Table.Cell align="right"><Text size="2" color="amber">{formatCurrency(item.estimatedIngredientCost)}</Text></Table.Cell>
                                        </Table.Row>
                                      ))}
                                    </Table.Body>
                                  </Table.Root>
                                </Box>
                                {ri < relatedRecipes.length - 1 && <Box my="2" style={{ borderBottom: "1px solid var(--gray-a3)" }} />}
                              </Box>
                            ))}
                          </Flex>
                        </Box>
                      ) : (
                        // Standalone product: single recipe
                        relatedRecipes.length > 0 && (
                          <Box px="3" py="2">
                            <Flex direction="column" gap="3" mb="3">
                              <Text size="1" color="gray">
                                Est. {formatCurrency(relatedRecipes[0].estimatedCostPerServing)}/serving
                              </Text>
                              {relatedRecipes[0].items.some(i => i.qtyPerPack <= 1) && (
                                <Text size="1" color="red">
                                  ⚠ Some ingredients have Purchase Qty = 1 — cost may be inflated
                                </Text>
                              )}
                            </Flex>
                            <Box style={{ overflowX: "auto" }}>
                              <Table.Root size="1" layout="auto">
                                <Table.Header>
                                  <Table.Row>
                                    <Table.ColumnHeaderCell>Ingredient</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell align="right">Qty</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {relatedRecipes[0].items.map((item, j) => (
                                    <Table.Row key={j}>
                                      <Table.Cell><Text size="2">{item.ingredientName}</Text></Table.Cell>
                                      <Table.Cell align="right"><Text size="2">{item.quantityRequired.toFixed(2)}</Text></Table.Cell>
                                      <Table.Cell><Text size="2">{item.unitName}</Text></Table.Cell>
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
          <Dialog.Content>
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
            <Flex gap="2" justify="end" mt="4">
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

      <SyncLoadingOverlay visible={syncOverlayVisible} />
    </>
  );
};
