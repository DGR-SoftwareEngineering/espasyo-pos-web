import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Grid,
  Heading,
  Badge,
  IconButton,
  Callout,
  TextField as RadixTextField,
  Separator,
} from "@radix-ui/themes";
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

  const newMenuItems = selectedRecipesArray.filter((r) => !r.menuItemAlreadyExistsInDb);
  const existingMenuItems = selectedRecipesArray.filter((r) => r.menuItemAlreadyExistsInDb);
  const recipesToCreate = newMenuItems.filter((r) => !r.hasExistingActiveRecipe).length;

  // Validation: all new menu items need a category
  const missingMenuItemCat = newMenuItems.filter((r) => !r.categoryID).length;

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

  const filteredRecipes = selectedRecipesArray.filter((r) =>
    r.menuItemName.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const recipePageCount = Math.ceil(filteredRecipes.length / RECIPE_PAGE_SIZE);
  const paginatedRecipes = filteredRecipes.slice(
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
