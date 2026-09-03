import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  IconButton,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Grid,
  Callout,
  TextField as RadixTextField,
  Tabs,
  Select,
} from "@radix-ui/themes";;
import {
  TableIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { AdminConfirmDialog } from "core-lib/components/radix/security";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { RecipeImportList } from "../../RecipeImportList";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";
import { useApi } from "core-lib/core/hooks";

interface PreviewStepProps extends RecipeImportStepProps {
  onSubmit: (args: { password: string; mpin: string }) => Promise<void>;
}

const RECIPE_PAGE_SIZE = 5;

export const PreviewStep: React.FC<PreviewStepProps> = ({
  previous,
  onSubmit,
}) => {
  const {
    previewData,
    selectedRecipes,
    toggleRecipe,
    updateRecipe,
    importLoading,
  } = useRecipeImportContext();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [recipePage, setRecipePage] = useState(1);
  const [recipeSearch, setRecipeSearch] = useState("");

  if (!previewData) return null;

  const selectedRecipesArray = previewData.recipes.filter((r) =>
    selectedRecipes.has(r.menuItemName)
  );

  // Split selected recipes into variant groups and standalone
  const variantGroupMap = useMemo(() => {
    const map = new Map<string, typeof selectedRecipesArray>();
    for (const r of selectedRecipesArray) {
      if (r.variantGroup) {
        if (!map.has(r.variantGroup)) map.set(r.variantGroup, []);
        map.get(r.variantGroup)!.push(r);
      }
    }
    return map;
  }, [selectedRecipesArray]);

  const standaloneSelectedRecipes = useMemo(
    () => selectedRecipesArray.filter((r) => !r.variantGroup),
    [selectedRecipesArray]
  );

  const newMenuItems = selectedRecipesArray.filter((r) => !r.menuItemAlreadyExistsInDb);
  const existingMenuItems = selectedRecipesArray.filter((r) => r.menuItemAlreadyExistsInDb);

  // For variant groups: count the group as one "recipe to create" (not per-variant)
  const variantGroupsToCreate = Array.from(variantGroupMap.values()).filter(
    variants => variants.some(v => !v.menuItemAlreadyExistsInDb)
  ).length;
  const standaloneToCreate = standaloneSelectedRecipes.filter((r) => !r.menuItemAlreadyExistsInDb && !r.hasExistingActiveRecipe).length;
  const recipesToCreate = variantGroupsToCreate + standaloneToCreate;

  // Validation: variant groups — need a category (synced to all variants)
  const missingVariantGroupCat = Array.from(variantGroupMap.values()).filter(
    variants => variants.some(v => !v.menuItemAlreadyExistsInDb) && !variants[0]?.categoryID
  ).length;

  // Validation: standalone new menu items need a category
  const missingStandaloneCat = standaloneSelectedRecipes.filter(
    (r) => !r.menuItemAlreadyExistsInDb && !r.categoryID
  ).length;

  const missingMenuItemCat = missingVariantGroupCat + missingStandaloneCat;

  // Validation: all new ingredients (within selected recipes) need a category
  const missingIngredientCat = selectedRecipesArray
    .flatMap((r) => r.items.filter((i) => !i.ingredientExistsInDb && !i.ingredientCategoryID))
    .length;

  const allHaveCategory = missingMenuItemCat === 0 && missingIngredientCat === 0;
  const canContinue = recipesToCreate > 0 && allHaveCategory;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("fil-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);

  const filteredStandalone = standaloneSelectedRecipes.filter((r) =>
    r.menuItemName.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const filteredGroups = useMemo(() => {
    if (!recipeSearch) return Array.from(variantGroupMap.entries());
    return Array.from(variantGroupMap.entries()).filter(([groupName]) =>
      groupName.toLowerCase().includes(recipeSearch.toLowerCase())
    );
  }, [variantGroupMap, recipeSearch]);

  // Pagination applies to standalone items only (variant groups are always shown)
  const recipePageCount = Math.ceil(filteredStandalone.length / RECIPE_PAGE_SIZE);
  const paginatedRecipes = filteredStandalone.slice(
    (recipePage - 1) * RECIPE_PAGE_SIZE,
    recipePage * RECIPE_PAGE_SIZE
  );

  const handleConfirmImport = async ({ password, mpin }: { password: string; mpin: string }) => {
    await onSubmit({ password, mpin });
    setShowConfirmDialog(false);
  };

  return (
    <>
      <StepShell
        icon={<TableIcon width={24} height={24} />}
        title="Preview & Assign Categories"
        subtitle="Review each menu item, assign categories, and configure new ingredients before staging"
        actions={
          <StepNavigation
            onBack={previous}
            onContinue={() => setShowConfirmDialog(true)}
            continueText={`Stage ${recipesToCreate} Recipe${recipesToCreate !== 1 ? "s" : ""}`}
            continueDisabled={!canContinue}
            loading={importLoading}
          />
        }
      >
        <Flex direction="column" gap="5">
          {/* Category warning banner */}
          {!allHaveCategory && (
            <Callout.Root color="amber" variant="surface">
              <Callout.Text>
                <Flex align="center" gap="2">
                  <Pencil1Icon />
                  <Flex direction="column" gap="1">
                    {missingMenuItemCat > 0 && (
                      <Text size="2">
                        <Text weight="medium">{missingMenuItemCat} menu item{missingMenuItemCat !== 1 ? "s" : ""}</Text>{" "}
                        still need{missingMenuItemCat === 1 ? "s" : ""} a category.
                      </Text>
                    )}
                    {missingIngredientCat > 0 && (
                      <Text size="2">
                        <Text weight="medium">{missingIngredientCat} new ingredient{missingIngredientCat !== 1 ? "s" : ""}</Text>{" "}
                        still need{missingIngredientCat === 1 ? "s" : ""} a category.
                      </Text>
                    )}
                    <Text size="2" color="gray">
                      Click the <Text weight="medium">pencil icon</Text> on each recipe card to assign categories.
                    </Text>
                  </Flex>
                </Flex>
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Recipes Panel — full width */}
          <Card variant="surface" size="2">
            <Flex justify="between" align="center" mb="3">
              <Heading size="3">Menu Items & Recipes</Heading>
              <Flex gap="2">
                {recipesToCreate > 0 && (
                  <Badge color="green">{recipesToCreate} new</Badge>
                )}
                {existingMenuItems.length > 0 && (
                  <Badge color="blue">{existingMenuItems.length} existing</Badge>
                )}
              </Flex>
            </Flex>

            <Box mb="3">
              <RadixTextField.Root
                placeholder="Search menu items…"
                value={recipeSearch}
                onChange={(e) => {
                  setRecipeSearch(e.target.value);
                  setRecipePage(1);
                }}
              />
            </Box>

            {/* Variant Group Cards */}
            {filteredGroups.map(([groupName, variants]) => (
              <VariantGroupCard
                key={groupName}
                groupName={groupName}
                variants={variants}
                onUpdateRecipe={updateRecipe}
                onRemoveVariant={toggleRecipe}
                formatCurrency={formatCurrency}
              />
            ))}

            {/* Standalone Items */}
            <RecipeImportList
              items={paginatedRecipes}
              onRemove={toggleRecipe}
              onUpdateRecipe={updateRecipe}
            />

            {recipePageCount > 1 && (
              <Flex justify="between" align="center" mt="3">
                <IconButton
                  variant="ghost"
                  size="2"
                  onClick={() => setRecipePage(Math.max(1, recipePage - 1))}
                  disabled={recipePage === 1}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Text size="2" color="gray">
                  Page {recipePage} of {recipePageCount}
                </Text>
                <IconButton
                  variant="ghost"
                  size="2"
                  onClick={() => setRecipePage(Math.min(recipePageCount, recipePage + 1))}
                  disabled={recipePage === recipePageCount}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Flex>
            )}
          </Card>

          <Separator />

          {/* Summary Section */}
          <Box>
            <Heading size="3" mb="3">
              Import Summary
            </Heading>

            <Grid columns={{ initial: "2", md: "3" }} gap="3" mb="4">
              <Card variant="surface" size="1">
                <Flex direction="column" align="center" gap="1">
                  <Text size="1" color="gray">New Recipes</Text>
                  <Text weight="bold" size="6" color="green">
                    {recipesToCreate}
                  </Text>
                  <Text size="1" color="gray">will be created</Text>
                </Flex>
              </Card>
              <Card variant="surface" size="1">
                <Flex direction="column" align="center" gap="1">
                  <Text size="1" color="gray">Total Ingredients</Text>
                  <Text weight="bold" size="6" color="blue">
                    {selectedRecipesArray.reduce((acc, r) => acc + r.items.length, 0)}
                  </Text>
                  <Text size="1" color="gray">across all recipes</Text>
                </Flex>
              </Card>
              <Card variant="surface" size="1">
                <Flex direction="column" align="center" gap="1">
                  <Text size="1" color="gray">New Ingredients</Text>
                  <Text weight="bold" size="6" color="violet">
                    {selectedRecipesArray
                      .flatMap((r) => r.items)
                      .filter((i) => !i.ingredientExistsInDb).length}
                  </Text>
                  <Text size="1" color="gray">will be created</Text>
                </Flex>
              </Card>
            </Grid>

            {/* Plain-language summary */}
            <Box
              style={{
                padding: "1rem",
                background: "var(--accent-a2)",
                borderRadius: 8,
                border: "1px solid var(--accent-a4)",
                marginBottom: "1rem",
              }}
            >
              <Text size="2" style={{ lineHeight: 1.75 }}>
                You're about to stage{" "}
                <Text weight="bold">{recipesToCreate} new recipe{recipesToCreate !== 1 ? "s" : ""}</Text>.
                {existingMenuItems.length > 0 && (
                  <>
                    {" "}<Text weight="bold">{existingMenuItems.length} menu item{existingMenuItems.length !== 1 ? "s" : ""}</Text> already exist and will be skipped.
                  </>
                )}{" "}
                Ingredient products will be created inline when you sync.
              </Text>
            </Box>

            {/* Global Warnings */}
            {previewData.globalWarnings.length > 0 && (
              <Callout.Root color="orange">
                <Callout.Text>
                  <Text weight="medium" as="div" mb="2">
                    {previewData.globalWarnings.length} Global Warning{previewData.globalWarnings.length !== 1 ? "s" : ""}
                  </Text>
                  {previewData.globalWarnings.map((warning, i) => (
                    <Text key={i} as="div" size="2">
                      • {warning}
                    </Text>
                  ))}
                </Callout.Text>
              </Callout.Root>
            )}
          </Box>
        </Flex>
      </StepShell>

      <AdminConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Recipe Import"
        description={`Stage ${recipesToCreate} recipe(s) with inline ingredient creation. An admin can sync or revert this batch from Import History.`}
        confirmLabel="Stage Import"
        confirmColor="Primary"
        loading={importLoading}
        onConfirm={handleConfirmImport}
      />
    </>
  );
};

interface VariantGroupCardProps {
  groupName: string;
  variants: import("core-lib/api/commons/types").RecipePreviewItemDto[];
  onUpdateRecipe: (menuItemName: string, patch: Partial<import("core-lib/api/commons/types").RecipePreviewItemDto>) => void;
  onRemoveVariant: (name: string) => void;
  formatCurrency: (v: number) => string;
}

const VariantGroupCard: React.FC<VariantGroupCardProps> = ({
  groupName,
  variants,
  onUpdateRecipe,
  formatCurrency,
}) => {
  const { result: menuCatResult, loading: menuCatLoading } = useApi(
    (api) => api.commons.productCategoryList(),
    []
  );
  const menuItemCategories = menuCatResult?.data?.response ?? [];
  const sharedCategoryID = variants[0]?.categoryID ?? "";
  const missingCategory = variants.some(v => !v.menuItemAlreadyExistsInDb) && !sharedCategoryID;

  return (
    <Box
      style={{
        border: `1px solid ${missingCategory ? "var(--red-a7)" : "var(--blue-a6)"}`,
        borderRadius: "6px",
        overflow: "hidden",
        marginBottom: "0.5rem",
      }}
    >
      <Box style={{ background: "var(--blue-a2)", padding: "0.75rem 1rem" }}>
        <Flex justify="between" align="center" wrap="wrap" gap="2">
          <Flex align="center" gap="2">
            <Text weight="bold" size="3">{groupName}</Text>
            <Badge color="blue" variant="soft" size="1">
              {variants.length} size variant{variants.length !== 1 ? "s" : ""}
            </Badge>
            {missingCategory && <Badge color="red" size="1">No category</Badge>}
          </Flex>
          <Box style={{ minWidth: 220 }}>
            <Select.Root
              size="2"
              value={sharedCategoryID}
              onValueChange={(val) => {
                if (variants[0]) onUpdateRecipe(variants[0].menuItemName, { categoryID: val });
              }}
              disabled={menuCatLoading || variants[0]?.menuItemAlreadyExistsInDb}
            >
              <Select.Trigger placeholder="Assign product category…" style={{ width: "100%" }} />
              <Select.Content>
                {menuItemCategories.map((c) => (
                  <Select.Item key={c.productCategoryID} value={c.productCategoryID}>
                    {c.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
      </Box>

      <Tabs.Root defaultValue={variants[0]?.menuItemName ?? ""}>
        <Tabs.List style={{ paddingLeft: "0.5rem" }}>
          {variants.map((v) => (
            <Tabs.Trigger key={v.menuItemName} value={v.menuItemName}>
              {v.variantSize ?? v.menuItemName}
              {v.sellingPrice > 0 && (
                <Text size="1" color="gray" ml="1">· {formatCurrency(v.sellingPrice)}</Text>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {variants.map((v) => (
          <Tabs.Content key={v.menuItemName} value={v.menuItemName}>
            <Box style={{ padding: "0.75rem" }}>
              <Box style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--gray-a4)" }}>
                      <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", color: "var(--gray-11)", fontWeight: 500 }}>Ingredient</th>
                      <th style={{ textAlign: "right", padding: "0.35rem 0.5rem", color: "var(--gray-11)", fontWeight: 500 }}>Qty</th>
                      <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", color: "var(--gray-11)", fontWeight: 500 }}>Unit</th>
                      <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", color: "var(--gray-11)", fontWeight: 500 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--gray-a2)" }}>
                        <td style={{ padding: "0.35rem 0.5rem" }}>{item.ingredientName}</td>
                        <td style={{ textAlign: "right", padding: "0.35rem 0.5rem" }}>{item.quantityRequired.toFixed(3)}</td>
                        <td style={{ padding: "0.35rem 0.5rem" }}>{item.unitName || "—"}</td>
                        <td style={{ padding: "0.35rem 0.5rem" }}>
                          {item.ingredientExistsInDb ? (
                            <Badge color="gray" size="1">Exists</Badge>
                          ) : item.ingredientCategoryID ? (
                            <Badge color="green" size="1">Will Create</Badge>
                          ) : (
                            <Badge color="red" size="1">Needs Category</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              {v.items.some(i => !i.ingredientExistsInDb && !i.ingredientCategoryID) && (
                <Callout.Root color="amber" variant="surface" mt="2" size="1">
                  <Callout.Text size="1">
                    <Flex align="center" gap="1">
                      <Pencil1Icon />
                      Some ingredients need a category. Use the pencil icon in the list above to edit.
                    </Flex>
                  </Callout.Text>
                </Callout.Root>
              )}
            </Box>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Box>
  );
};
