import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Heading,
  Badge,
  Callout,
  RadioGroup,
  Switch,
  TextField as RadixTextField,
  Separator,
  Checkbox,
  Button,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const ConfigStep: React.FC<RecipeImportStepProps> = ({ previous }) => {
  const {
    previewData,
    recipeLimit,
    setRecipeLimit,
    selectedRecipes,
    toggleRecipe,
    bulkSelectRecipes,
    bulkDeselectRecipes,
    applyLimitToSelection,
    proceedToPreview,
  } = useRecipeImportContext();

  const [recLimitMode, setRecLimitMode] = useState<"all" | "limit">(
    recipeLimit === "all" ? "all" : "limit"
  );
  const [recLimitValue, setRecLimitValue] = useState<string>(
    recipeLimit !== "all" ? String(recipeLimit) : ""
  );
  const [skipExistingFull, setSkipExistingFull] = useState(false);
  const [search, setSearch] = useState("");

  if (!previewData) return null;

  const totalRecipes = previewData.recipes.length;
  const existingFullCount = previewData.recipes.filter(
    (r) => r.menuItemAlreadyExistsInDb && r.hasExistingActiveRecipe
  ).length;

  const filteredRecipes = useMemo(
    () =>
      previewData.recipes.filter((r) =>
        r.menuItemName.toLowerCase().includes(search.toLowerCase())
      ),
    [previewData.recipes, search]
  );

  const handleApplyLimit = () => {
    const finalLimit =
      recLimitMode === "all"
        ? "all"
        : (Math.min(parseInt(recLimitValue) || totalRecipes, totalRecipes) as number);
    setRecipeLimit(finalLimit);
    applyLimitToSelection(finalLimit);
  };

  const handleSelectAllVisible = () => {
    bulkSelectRecipes(filteredRecipes.map(r => r.menuItemName));
  };

  const handleDeselectAllVisible = () => {
    bulkDeselectRecipes(filteredRecipes.map(r => r.menuItemName));
  };

  const handleContinue = () => {
    proceedToPreview(skipExistingFull);
  };

  const canContinue = selectedRecipes.size > 0;

  return (
    <StepShell
      icon={<MixerHorizontalIcon width={24} height={24} />}
      title="Configure Import"
      subtitle="Choose which recipes to include in this batch"
      actions={
        <StepNavigation
          onBack={previous}
          onContinue={handleContinue}
          continueText="Continue to Preview"
          continueDisabled={!canContinue}
        />
      }
    >
      <Flex direction="column" gap="5">
        <Text as="p" color="gray" size="2">
          Your file contains{" "}
          <Text weight="bold" color="gray">
            {totalRecipes} menu item{totalRecipes !== 1 ? "s" : ""}
          </Text>
          . You can import all of them now, or pick specific recipes using the list below.
        </Text>

        {/* Quick Limit Card */}
        <Card variant="surface" size="2" style={{ maxWidth: 520 }}>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Quick Selection</Heading>
              <Badge color="violet" variant="soft">
                {totalRecipes} found
              </Badge>
            </Flex>

            <RadioGroup.Root
              value={recLimitMode}
              onValueChange={(v) => setRecLimitMode(v as "all" | "limit")}
            >
              <Flex direction="column" gap="2">
                <RadioGroup.Item value="all">
                  <Text size="2">Select all {totalRecipes} items</Text>
                </RadioGroup.Item>
                <RadioGroup.Item value="limit">
                  <Text size="2">Limit to a specific number</Text>
                </RadioGroup.Item>
              </Flex>
            </RadioGroup.Root>

            {recLimitMode === "limit" && (
              <Box>
                <Text as="div" size="2" mb="1" color="gray">
                  Number of items to select
                </Text>
                <Flex align="center" gap="2">
                  <RadixTextField.Root
                    type="number"
                    placeholder={`1 – ${totalRecipes}`}
                    value={recLimitValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (
                        v === "" ||
                        (parseInt(v) >= 1 && parseInt(v) <= totalRecipes)
                      ) {
                        setRecLimitValue(v);
                      }
                    }}
                    style={{ maxWidth: 180 }}
                  />
                  <Button size="2" variant="soft" onClick={handleApplyLimit}>
                    Apply to list
                  </Button>
                </Flex>
                {recLimitValue && parseInt(recLimitValue) > totalRecipes && (
                  <Text size="1" color="red" as="div" mt="1">
                    Cannot exceed {totalRecipes}
                  </Text>
                )}
              </Box>
            )}

            {recLimitMode === "all" && (
              <Button size="2" variant="soft" onClick={handleApplyLimit} style={{ alignSelf: "flex-start" }}>
                Select all in list
              </Button>
            )}

            <Box
              style={{
                padding: "0.75rem",
                background: "var(--accent-a2)",
                borderRadius: 6,
              }}
            >
              <Flex justify="between" align="center">
                <Text size="2" color="gray">
                  Currently selected
                </Text>
                <Badge color="green" size="2">
                  {selectedRecipes.size} of {totalRecipes} item{totalRecipes !== 1 ? "s" : ""}
                </Badge>
              </Flex>
            </Box>
          </Flex>
        </Card>

        {/* Skip existing items toggle */}
        <Card variant="surface" size="2" style={{ maxWidth: 520 }}>
          <Flex justify="between" align="center">
            <Box>
              <Text size="2" weight="medium">Skip already-existing items</Text>
              <Text as="p" size="1" color="gray" mt="1">
                {existingFullCount > 0
                  ? `${existingFullCount} item${existingFullCount !== 1 ? "s" : ""} already have a product and recipe — they will be excluded`
                  : "No items with existing products and recipes found"}
              </Text>
            </Box>
            <Switch
              checked={skipExistingFull}
              onCheckedChange={setSkipExistingFull}
              disabled={existingFullCount === 0}
            />
          </Flex>
        </Card>

        {/* Manual Recipe Selection List */}
        <Card variant="surface" size="2">
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center" wrap="wrap" gap="2">
              <Heading size="3">Select Recipes for Preview</Heading>
              <Flex gap="2">
                <Button size="1" variant="soft" onClick={handleSelectAllVisible}>
                  Select all
                </Button>
                <Button size="1" variant="soft" color="gray" onClick={handleDeselectAllVisible}>
                  Deselect all
                </Button>
              </Flex>
            </Flex>

            {/* Search */}
            <RadixTextField.Root
              placeholder="Search recipes by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            >
              <RadixTextField.Slot>
                <MagnifyingGlassIcon />
              </RadixTextField.Slot>
            </RadixTextField.Root>

            {/* Recipe list */}
            <Box style={{ maxHeight: 320, overflowY: "auto" }}>
              {filteredRecipes.length === 0 ? (
                <Text size="2" color="gray">No recipes match your search.</Text>
              ) : (
                filteredRecipes.map((r) => (
                  <Flex
                    key={r.menuItemName}
                    align="center"
                    gap="3"
                    py="2"
                    px="1"
                    style={{ borderBottom: "1px solid var(--gray-a3)", cursor: "pointer" }}
                    onClick={() => toggleRecipe(r.menuItemName)}
                  >
                    <Checkbox
                      checked={selectedRecipes.has(r.menuItemName)}
                      onCheckedChange={() => toggleRecipe(r.menuItemName)}
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
                        {r.menuItemName}
                      </Text>
                    </Box>
                    <Text size="1" color="gray" style={{ whiteSpace: "nowrap" }}>
                      {r.items?.length ?? 0} ingredient{(r.items?.length ?? 0) !== 1 ? "s" : ""}
                    </Text>
                    {r.menuItemAlreadyExistsInDb && (
                      <Badge color="amber" variant="soft" size="1">Existing</Badge>
                    )}
                    {r.hasExistingActiveRecipe && (
                      <Badge color="red" variant="soft" size="1">Has Recipe</Badge>
                    )}
                  </Flex>
                ))
              )}
            </Box>

            {search && filteredRecipes.length > 0 && (
              <Text size="1" color="gray">
                Showing {filteredRecipes.length} of {totalRecipes} recipes
              </Text>
            )}
          </Flex>
        </Card>

        <Separator />

        {/* What happens next hint */}
        <Box
          style={{
            padding: "1rem",
            background: "var(--accent-a2)",
            borderRadius: 8,
            border: "1px solid var(--accent-a5)",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              What happens in the next step?
            </Text>
            <Text size="2" color="gray">
              You will review each menu item and assign categories. For new
              ingredients that don&apos;t exist yet, you&apos;ll also set their category,
              package price, and quantity per pack.
            </Text>
          </Flex>
        </Box>

        <Callout.Root color="blue" variant="surface">
          <Callout.Text size="2">
            You can always come back and import remaining items in a new batch.
            Batches are independent — importing in parts is perfectly fine.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </StepShell>
  );
};
