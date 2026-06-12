import React, { useState } from "react";
import { Box, Flex, Text, Card, Grid, Heading, Badge, IconButton, Callout, Select, TextField } from "@radix-ui/themes";
import { TableIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Dialog, Button } from "@radix-ui/themes";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { IngredientImportTable } from "../../IngredientImportTable";
import { RecipeImportList } from "../../RecipeImportList";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

interface PreviewStepProps extends RecipeImportStepProps {
  onSubmit: () => Promise<void>;
}

const INGREDIENT_PAGE_SIZE = 10;
const RECIPE_PAGE_SIZE = 5;

export const PreviewStep: React.FC<PreviewStepProps> = ({
  previous,
  reset,
  onSubmit,
}) => {
  const {
    previewData,
    selectedIngredients,
    selectedRecipes,
    toggleIngredient,
    toggleRecipe,
    updateIngredient,
    updateRecipeMenuItemName,
    updateRecipeItem,
    importLoading,
    ingredientCategoryId,
    setIngredientCategoryId,
    menuItemCategoryId,
    setMenuItemCategoryId,
    ingredientCategories,
    menuItemCategories,
  } = useRecipeImportContext();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMpin, setAdminMpin] = useState("");
  const [ingPage, setIngPage] = useState(1);
  const [recipePage, setRecipePage] = useState(1);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");

  if (!previewData) {
    return null;
  }

  const selectedIngredientsArray = previewData.ingredients.filter((i) =>
    selectedIngredients.has(i.name)
  );

  const selectedRecipesArray = previewData.recipes.filter((r) =>
    selectedRecipes.has(r.menuItemName)
  );

  const ingredientsToCreate = selectedIngredientsArray.filter(
    (i) => !i.alreadyExistsInDb
  ).length;

  const ingredientsExist = selectedIngredientsArray.filter(
    (i) => i.alreadyExistsInDb
  ).length;

  const recipesToCreate = selectedRecipesArray.filter(
    (r) => !r.menuItemAlreadyExistsInDb && !r.hasExistingActiveRecipe
  ).length;

  // Search filtering
  const filteredIngredients = selectedIngredientsArray.filter((i) =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const filteredRecipes = selectedRecipesArray.filter((r) =>
    r.menuItemName.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  // Pagination
  const ingPageCount = Math.ceil(filteredIngredients.length / INGREDIENT_PAGE_SIZE);
  const recipePageCount = Math.ceil(filteredRecipes.length / RECIPE_PAGE_SIZE);

  const paginatedIngredients = filteredIngredients.slice(
    (ingPage - 1) * INGREDIENT_PAGE_SIZE,
    ingPage * INGREDIENT_PAGE_SIZE
  );

  const paginatedRecipes = filteredRecipes.slice(
    (recipePage - 1) * RECIPE_PAGE_SIZE,
    recipePage * RECIPE_PAGE_SIZE
  );

  const canContinue = ingredientsToCreate + recipesToCreate > 0 && ingredientCategoryId && menuItemCategoryId;

  const handleConfirmImport = async () => {
    await onSubmit();
    setShowConfirmDialog(false);
    setAdminPassword("");
    setAdminMpin("");
  };

  return (
    <>
      <StepShell
        icon={<TableIcon width={24} height={24} />}
        title="Review Import"
        actions={
          <StepNavigation
            onBack={previous}
            onContinue={() => setShowConfirmDialog(true)}
            continueText={`Create ${ingredientsToCreate} Ingredients + ${recipesToCreate} Recipes`}
            continueDisabled={!canContinue}
            loading={importLoading}
          />
        }
      >
        <Flex direction="column" gap="5">
          {/* Category Configuration Row */}
          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <Box>
              <Text as="div" mb="2" size="2" weight="medium">
                Default Ingredient Category
              </Text>
              <Select.Root
                value={ingredientCategoryId}
                onValueChange={setIngredientCategoryId}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Categories</Select.Label>
                    {ingredientCategories.map((cat) => (
                      <Select.Item
                        key={cat.ingredientCategoryID}
                        value={cat.ingredientCategoryID}
                      >
                        {cat.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="div" mb="2" size="2" weight="medium">
                Default Menu Item Category
              </Text>
              <Select.Root
                value={menuItemCategoryId}
                onValueChange={setMenuItemCategoryId}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Categories</Select.Label>
                    {menuItemCategories.map((cat) => (
                      <Select.Item
                        key={cat.productCategoryID}
                        value={cat.productCategoryID}
                      >
                        {cat.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Box>
          </Grid>

          {!ingredientCategoryId || !menuItemCategoryId ? (
            <Callout.Root color="amber">
              <Callout.Text>
                Please select both categories before creating items.
              </Callout.Text>
            </Callout.Root>
          ) : null}

          {/* Split Panel Layout */}
          <Grid columns={{ initial: "1", lg: "2" }} gap="4">
            {/* Ingredients Panel */}
            <Card variant="surface" size="2">
              <Flex justify="between" align="center" mb="3">
                <Heading size="3">Ingredients</Heading>
                <Flex gap="1">
                  {ingredientsToCreate > 0 && (
                    <Badge color="green">{ingredientsToCreate} new</Badge>
                  )}
                  {ingredientsExist > 0 && (
                    <Badge color="amber">{ingredientsExist} exist</Badge>
                  )}
                </Flex>
              </Flex>

              <Box mb="3">
                <TextField.Root
                  placeholder="Search ingredients..."
                  value={ingredientSearch}
                  onChange={(e) => { setIngredientSearch(e.target.value); setIngPage(1); }}
                />
              </Box>

              <IngredientImportTable
                items={paginatedIngredients}
                onRemove={toggleIngredient}
                onUpdate={updateIngredient}
              />

              {ingPageCount > 1 && (
                <Flex justify="between" align="center" mt="3">
                  <IconButton
                    variant="ghost"
                    size="2"
                    onClick={() => setIngPage(Math.max(1, ingPage - 1))}
                    disabled={ingPage === 1}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <Text size="2" color="gray">
                    Page {ingPage} of {ingPageCount}
                  </Text>
                  <IconButton
                    variant="ghost"
                    size="2"
                    onClick={() => setIngPage(Math.min(ingPageCount, ingPage + 1))}
                    disabled={ingPage === ingPageCount}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Flex>
              )}
            </Card>

            {/* Recipes Panel */}
            <Card variant="surface" size="2">
              <Flex justify="between" align="center" mb="3">
                <Heading size="3">Recipes</Heading>
                {recipesToCreate > 0 && (
                  <Badge color="green">{recipesToCreate} new</Badge>
                )}
              </Flex>

              <Box mb="3">
                <TextField.Root
                  placeholder="Search recipes..."
                  value={recipeSearch}
                  onChange={(e) => { setRecipeSearch(e.target.value); setRecipePage(1); }}
                />
              </Box>

              <RecipeImportList
                items={paginatedRecipes}
                onRemove={toggleRecipe}
                onUpdateName={updateRecipeMenuItemName}
                onUpdateItem={updateRecipeItem}
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
          </Grid>

          {/* Global Warnings */}
          {previewData.globalWarnings.length > 0 && (
            <Callout.Root color="orange">
              <Callout.Text weight="medium" mb="2">
                Warnings
              </Callout.Text>
              {previewData.globalWarnings.map((warning, i) => (
                <Callout.Text key={i}>• {warning}</Callout.Text>
              ))}
            </Callout.Root>
          )}
        </Flex>
      </StepShell>

      {/* Admin Confirm Dialog */}
      <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Content>
          <Dialog.Title>Confirm Import</Dialog.Title>
          <Flex direction="column" gap="4">
            <Text>Please enter your admin password and MPIN to proceed.</Text>

            <Box>
              <Text as="div" mb="2" size="2" weight="medium">
                Admin Password
              </Text>
              <input
                type="password"
                value={adminPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--gray-a7)",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              />
            </Box>

            <Box>
              <Text as="div" mb="2" size="2" weight="medium">
                Admin MPIN
              </Text>
              <input
                type="password"
                value={adminMpin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminMpin(e.target.value)}
                placeholder="Enter MPIN"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid var(--gray-a7)",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              />
            </Box>

            <Flex gap="2" justify="end">
              <Dialog.Close>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button
                onClick={handleConfirmImport}
                disabled={importLoading || !adminPassword || !adminMpin}
              >
                Confirm
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
