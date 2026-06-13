import React, { useState } from "react";
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
} from "@radix-ui/themes";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const ConfigStep: React.FC<RecipeImportStepProps> = ({ previous }) => {
  const {
    previewData,
    recipeLimit,
    setRecipeLimit,
    applyLimitsAndPreview,
  } = useRecipeImportContext();

  const [recLimitMode, setRecLimitMode] = useState<"all" | "limit">(
    recipeLimit === "all" ? "all" : "limit"
  );
  const [recLimitValue, setRecLimitValue] = useState<string>(
    recipeLimit !== "all" ? String(recipeLimit) : ""
  );
  const [skipExistingFull, setSkipExistingFull] = useState(false);

  if (!previewData) return null;

  const totalRecipes = previewData.recipes.length;
  const existingFullCount = previewData.recipes.filter(
    (r) => r.menuItemAlreadyExistsInDb && r.hasExistingActiveRecipe
  ).length;

  const effectiveRecCount =
    recLimitMode === "all"
      ? totalRecipes
      : Math.min(parseInt(recLimitValue) || totalRecipes, totalRecipes);

  const handleContinue = () => {
    const finalRecLimit =
      recLimitMode === "all"
        ? "all"
        : (Math.min(parseInt(recLimitValue) || totalRecipes, totalRecipes) as number);
    setRecipeLimit(finalRecLimit);
    applyLimitsAndPreview(finalRecLimit, skipExistingFull);
  };

  const canContinue = effectiveRecCount > 0;

  return (
    <StepShell
      icon={<MixerHorizontalIcon width={24} height={24} />}
      title="Configure Import"
      subtitle="Choose how many recipes to include in this batch"
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
          . You can import all of them now, or limit how many to include in this
          batch. You can always import the rest in a new batch later.
        </Text>

        {/* Recipes Card */}
        <Card variant="surface" size="2" style={{ maxWidth: 520 }}>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Menu Items & Recipes</Heading>
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
                  <Text size="2">Import all {totalRecipes} items</Text>
                </RadioGroup.Item>
                <RadioGroup.Item value="limit">
                  <Text size="2">Limit to a specific number</Text>
                </RadioGroup.Item>
              </Flex>
            </RadioGroup.Root>

            {recLimitMode === "limit" && (
              <Box>
                <Text as="div" size="2" mb="1" color="gray">
                  Number of items to import
                </Text>
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
                {recLimitValue && parseInt(recLimitValue) > totalRecipes && (
                  <Text size="1" color="red" as="div" mt="1">
                    Cannot exceed {totalRecipes}
                  </Text>
                )}
              </Box>
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
                  Will import
                </Text>
                <Badge color="green" size="2">
                  {effectiveRecCount} item{effectiveRecCount !== 1 ? "s" : ""}
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
              ingredients that don't exist yet, you'll also set their category,
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
