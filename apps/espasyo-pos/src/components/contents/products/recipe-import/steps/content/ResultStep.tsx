import React from "react";
import { Box, Card, Flex, Text, Callout } from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const ResultStep: React.FC<RecipeImportStepProps> = ({ reset }) => {
  const { resultData } = useRecipeImportContext();

  if (!resultData) {
    return null;
  }

  const hasErrors = resultData.warnings.length > 0;

  return (
    <StepShell
      icon={<CheckCircledIcon width={24} height={24} />}
      title="Import Staged Successfully"
      actions={
        <StepNavigation
          onContinue={() => reset()}
          continueText="Import Another File"
          hideBack
        />
      }
    >
      <Flex direction="column" gap="4">
        {/* Batch Code */}
        <Card variant="surface" style={{ background: "var(--accent-a2)" }}>
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">Batch Code</Text>
            <Text weight="bold" size="3">{resultData.batchCode}</Text>
          </Flex>
        </Card>

        {/* Summary Card */}
        <Card variant="surface">
          <Flex direction="column" gap="2">
            <Text weight="bold" size="4" color="amber">
              ✅ Data Staged (Pending Sync)
            </Text>
            <Text color="gray">
              • {resultData.ingredientsStaged} ingredients staged ·{" "}
              {resultData.ingredientsSkipped} skipped
            </Text>
            <Text color="gray">
              • {resultData.menuItemsStaged} menu items staged ·{" "}
              {resultData.menuItemsSkipped} skipped
            </Text>
            <Text color="gray">
              • {resultData.recipesStaged} recipes staged ·{" "}
              {resultData.recipesSkipped} skipped
            </Text>
          </Flex>
        </Card>

        {/* Important Notice */}
        <Callout.Root color="blue">
          <Callout.Text>
            Data has been staged but NOT yet visible in POS. Go to the <strong>Import History</strong> tab and click <strong>Sync</strong> to promote to production.
          </Callout.Text>
        </Callout.Root>

        {/* Warnings List */}
        {resultData.warnings.length > 0 && (
          <Callout.Root color="orange">
            <Callout.Text weight="medium" mb="2">
              Warnings ({resultData.warnings.length})
            </Callout.Text>
            {resultData.warnings.map((warning, i) => (
              <Callout.Text key={i}>• {warning}</Callout.Text>
            ))}
          </Callout.Root>
        )}
      </Flex>
    </StepShell>
  );
};
