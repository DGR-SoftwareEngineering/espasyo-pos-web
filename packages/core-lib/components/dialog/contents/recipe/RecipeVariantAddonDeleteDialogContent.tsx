import React, { useState, useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  WarningAmberOutlined,
  DeleteOutlined,
  LocalDiningOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import {
  RecipeResponse,
  VariantRecipeResponse,
  AddOnItemRecipeResponse,
} from "../../../../api/commons/types";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { AdminConfirmDialog } from "../../../radix/security/AdminConfirmDialog";

interface Props {
  recipe: RecipeResponse;
  variantRecipeCount?: number;
  addOnRecipeCount?: number;
  onSuccess: () => void;
  onClose: () => void;
}

const SkeletonRow: React.FC = () => (
  <Box
    style={{
      height: 56,
      background: "var(--gray-a3)",
      borderRadius: "var(--radius-3)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

export const RecipeVariantAddonDeleteDialogContent: React.FC<Props> = ({
  recipe,
  variantRecipeCount,
  addOnRecipeCount,
  onSuccess,
  onClose: _onClose,
}) => {
  const variantData = useApi(
    (api) => api.commons.getVariantRecipesByProduct(recipe.menuItemProductID),
  );
  const addOnData = useApi(
    (api) => api.commons.getAddOnItemRecipesByProduct(recipe.menuItemProductID),
  );
  const productUsageCheck = useApi(
    (api) => api.commons.checkProductCriticalUsage([recipe.menuItemProductID]),
  );
  const productUsage = productUsageCheck.result?.data?.response ?? null;
  const menuItemIsInUse = productUsage?.isInUse === true;

  const [variantList, setVariantList] = useState<VariantRecipeResponse[] | null>(null);
  const [addonList, setAddonList] = useState<AddOnItemRecipeResponse[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingMenuItem, setIsDeletingMenuItem] = useState(false);
  const [showMenuItemAdminConfirm, setShowMenuItemAdminConfirm] = useState(false);
  const [menuItemAdminError, setMenuItemAdminError] = useState<string | null>(null);

  useEffect(() => {
    if (variantData.result?.data?.response) {
      setVariantList(variantData.result.data.response);
    }
  }, [variantData.result]);

  useEffect(() => {
    if (addOnData.result?.data?.response) {
      setAddonList(addOnData.result.data.response);
    }
  }, [addOnData.result]);

  const deleteVariantCb = useApiCallback(
    async (api, id: string) => api.commons.deleteVariantRecipe(id),
  );
  const deleteAddonCb = useApiCallback(
    async (api, id: string) => api.commons.deleteAddOnItemRecipe(id),
  );
  const deleteProductCb = useApiCallback(
    async (api, ids: string[]) => api.commons.deleteProduct(ids),
  );
  const forceDeleteProductCb = useApiCallback(
    async (api, args: { ids: string[]; password: string; mpin: string }) =>
      api.commons.forceDeleteProduct(args),
  );

  const handleDeleteVariant = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteVariantCb.execute(id);
      if (res?.data?.success) {
        setVariantList((prev) => (prev ? prev.filter((v) => v.variantRecipeID !== id) : null));
        onSuccess();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteAddonCb.execute(id);
      if (res?.data?.success) {
        setAddonList((prev) => (prev ? prev.filter((a) => a.addOnItemRecipeID !== id) : null));
        onSuccess();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const executeCascadeDelete = async (password?: string, mpin?: string): Promise<boolean> => {
    setIsDeletingMenuItem(true);
    setMenuItemAdminError(null);
    try {
      for (const vr of [...currentVariants]) {
        await deleteVariantCb.execute(vr.variantRecipeID);
      }
      for (const ar of [...currentAddons]) {
        await deleteAddonCb.execute(ar.addOnItemRecipeID);
      }
      if (password && mpin) {
        const result = await forceDeleteProductCb.execute({
          ids: [recipe.menuItemProductID],
          password,
          mpin,
        });
        if (!result?.data?.success) {
          setMenuItemAdminError(result?.data?.message ?? "Failed to force-delete menu item");
          return false;
        }
      } else {
        await deleteProductCb.execute([recipe.menuItemProductID]);
      }
      onSuccess();
      _onClose();
      return true;
    } catch (err: any) {
      const msg = Array.isArray(err) ? err[0] : "Failed to delete. Please try again.";
      setMenuItemAdminError(msg);
      return false;
    } finally {
      setIsDeletingMenuItem(false);
    }
  };

  const handleDeleteMenuItemClick = () => {
    if (menuItemIsInUse) {
      setMenuItemAdminError(null);
      setShowMenuItemAdminConfirm(true);
    } else {
      executeCascadeDelete();
    }
  };

  const handleMenuItemForceDelete = async ({ password, mpin }: { password: string; mpin: string }) => {
    const success = await executeCascadeDelete(password, mpin);
    if (success) setShowMenuItemAdminConfirm(false);
  };

  const isLoading = variantData.loading || addOnData.loading;
  const currentVariants = variantList ?? (variantData.result?.data?.response ?? []);
  const currentAddons = addonList ?? (addOnData.result?.data?.response ?? []);
  const isBusy = deletingId !== null || isDeletingMenuItem;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Flex direction="column" gap="4">
          {/* Delete Entire Menu Item */}
          <Card
            variant="surface"
            style={{ borderLeft: "3px solid var(--red-9)", padding: "var(--space-3)" }}
          >
            <Flex justify="between" align="center" gap="3">
              <Box>
                <Flex align="center" gap="2" mb="1">
                  <Badge color="red" variant="soft" size="1">
                    Danger
                  </Badge>
                  <Text size="2" weight="medium">
                    Delete Entire Menu Item
                  </Text>
                </Flex>
                <Text size="1" color="gray" as="p">
                  Permanently removes{" "}
                  <Text weight="medium">{recipe.menuItemName}</Text> and all its variant and
                  add-on recipe definitions.
                </Text>
                {productUsageCheck.loading && (
                  <Text size="1" color="gray" as="p" mt="1">
                    Checking usage…
                  </Text>
                )}
                {menuItemIsInUse && !productUsageCheck.loading && (
                  <Flex align="center" gap="1" mt="1">
                    <WarningAmberOutlined style={{ fontSize: 14, color: "var(--red-11)" }} />
                    <Text size="1" color="red">
                      Referenced in {productUsage!.totalSaleCount} POS transaction
                      {productUsage!.totalSaleCount !== 1 ? "s" : ""}. Admin credentials
                      required.
                    </Text>
                  </Flex>
                )}
              </Box>
              <Button
                size="2"
                color="red"
                variant="soft"
                disabled={isBusy || isLoading || productUsageCheck.loading}
                onClick={handleDeleteMenuItemClick}
              >
                <DeleteOutlined style={{ fontSize: 14 }} />
                {isDeletingMenuItem ? "Deleting…" : "Delete Menu Item"}
              </Button>
            </Flex>
          </Card>

          <Separator size="4" />

          {/* Warning callout */}
          <Callout.Root color="amber" variant="soft">
            <Callout.Icon>
              <WarningAmberOutlined />
            </Callout.Icon>
            <Callout.Text>
              Deleting a variant or add-on recipe removes all its ingredient definitions
              permanently. This action cannot be undone.
            </Callout.Text>
          </Callout.Root>

          {/* Variant Recipes */}
          {(variantRecipeCount ?? 0) > 0 && (
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <LocalDiningOutlined style={{ color: "var(--violet-11)" }} />
                <Heading size="3">Variant Recipes</Heading>
                {!isLoading && (
                  <Badge color="violet" variant="soft">
                    {currentVariants.length} remaining
                  </Badge>
                )}
              </Flex>

              {isLoading ? (
                [0, 1].map((i) => <SkeletonRow key={i} />)
              ) : currentVariants.length === 0 ? (
                <Callout.Root color="gray" variant="soft">
                  <Callout.Icon>
                    <InfoOutlined />
                  </Callout.Icon>
                  <Callout.Text>All variant recipes have been deleted.</Callout.Text>
                </Callout.Root>
              ) : (
                currentVariants.map((vr) => (
                  <motion.div
                    key={vr.variantRecipeID}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card variant="surface" style={{ padding: "var(--space-3)" }}>
                      <Flex justify="between" align="center" gap="2">
                        <Flex direction="column" gap="1">
                          <Flex align="center" gap="2">
                            <Badge color="violet" variant="soft" size="1">
                              Variant
                            </Badge>
                            <Text size="2" weight="medium">
                              {vr.variantName}
                            </Text>
                          </Flex>
                          <Text size="1" color="gray">
                            {vr.recipeItems.length} ingredient
                            {vr.recipeItems.length !== 1 ? "s" : ""}
                          </Text>
                        </Flex>
                        <Button
                          size="1"
                          color="red"
                          variant="soft"
                          disabled={isBusy}
                          onClick={() => handleDeleteVariant(vr.variantRecipeID)}
                        >
                          <DeleteOutlined style={{ fontSize: 14 }} />
                          {deletingId === vr.variantRecipeID ? "Deleting…" : "Delete"}
                        </Button>
                      </Flex>
                    </Card>
                  </motion.div>
                ))
              )}
            </Flex>
          )}

          {/* Separator between sections */}
          {(variantRecipeCount ?? 0) > 0 && (addOnRecipeCount ?? 0) > 0 && (
            <Separator size="4" />
          )}

          {/* Add-On Recipes */}
          {(addOnRecipeCount ?? 0) > 0 && (
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <LocalDiningOutlined style={{ color: "var(--orange-11)" }} />
                <Heading size="3">Add-On Recipes</Heading>
                {!isLoading && (
                  <Badge color="orange" variant="soft">
                    {currentAddons.length} remaining
                  </Badge>
                )}
              </Flex>

              {isLoading ? (
                [0, 1].map((i) => <SkeletonRow key={i} />)
              ) : currentAddons.length === 0 ? (
                <Callout.Root color="gray" variant="soft">
                  <Callout.Icon>
                    <InfoOutlined />
                  </Callout.Icon>
                  <Callout.Text>All add-on recipes have been deleted.</Callout.Text>
                </Callout.Root>
              ) : (
                currentAddons.map((ar) => (
                  <motion.div
                    key={ar.addOnItemRecipeID}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card variant="surface" style={{ padding: "var(--space-3)" }}>
                      <Flex justify="between" align="center" gap="2">
                        <Flex direction="column" gap="1">
                          <Flex align="center" gap="2">
                            <Badge color="orange" variant="soft" size="1">
                              Add-On
                            </Badge>
                            <Text size="2" weight="medium">
                              {ar.itemName}
                            </Text>
                          </Flex>
                          <Text size="1" color="gray">
                            {ar.recipeItems.length} ingredient
                            {ar.recipeItems.length !== 1 ? "s" : ""}
                          </Text>
                        </Flex>
                        <Button
                          size="1"
                          color="red"
                          variant="soft"
                          disabled={isBusy}
                          onClick={() => handleDeleteAddon(ar.addOnItemRecipeID)}
                        >
                          <DeleteOutlined style={{ fontSize: 14 }} />
                          {deletingId === ar.addOnItemRecipeID ? "Deleting…" : "Delete"}
                        </Button>
                      </Flex>
                    </Card>
                  </motion.div>
                ))
              )}
            </Flex>
          )}
        </Flex>
      </motion.div>

      <AdminConfirmDialog
        open={showMenuItemAdminConfirm}
        onOpenChange={setShowMenuItemAdminConfirm}
        title="Force Delete Menu Item"
        description={`"${recipe.menuItemName}" has POS transaction history. Removing it will also delete all its variant and add-on recipe definitions.`}
        warning="This action cannot be undone. The product and all recipe definitions will be permanently removed."
        confirmLabel="Force Delete Menu Item"
        loading={isDeletingMenuItem}
        errorMessage={menuItemAdminError}
        onConfirm={handleMenuItemForceDelete}
      />
    </>
  );
};
