import React, { useState } from "react";
import {
  Box,
  Card,
  Flex,
  Text,
  Callout,
  Grid,
  Button,
  Separator,
  Badge,
} from "@radix-ui/themes";
import { CheckCircledIcon, ClipboardIcon, CheckIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext, useGoToHistory } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const ResultStep: React.FC<RecipeImportStepProps> = ({ reset }) => {
  const { resultData } = useRecipeImportContext();
  const goToHistory = useGoToHistory();
  const [copied, setCopied] = useState(false);

  if (!resultData) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultData.batchCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const totalStaged =
    resultData.ingredientsStaged +
    resultData.menuItemsStaged +
    resultData.recipesStaged;

  return (
    <StepShell
      icon={<CheckCircledIcon width={24} height={24} />}
      title="Batch Staged Successfully!"
      subtitle="Your data is in the review queue — ready for sync when you are"
    >
      <Flex direction="column" gap="5">
        {/* Success Banner */}
        <Box
          style={{
            padding: "1.5rem",
            background:
              "linear-gradient(135deg, var(--green-a3) 0%, var(--accent-a2) 100%)",
            borderRadius: 12,
            border: "1px solid var(--green-a5)",
            textAlign: "center",
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--green-a4)",
              color: "var(--green-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <CheckCircledIcon width={28} height={28} />
          </Box>
          <Text weight="bold" size="5" as="div" mb="1">
            {totalStaged} item{totalStaged !== 1 ? "s" : ""} staged
          </Text>
          <Text color="gray" size="2">
            Pending sync to POS
          </Text>
        </Box>

        {/* Batch Code */}
        <Card variant="surface" style={{ background: "var(--accent-a2)", border: "1px solid var(--accent-a5)" }}>
          <Flex justify="between" align="center" gap="3">
            <Box>
              <Text size="1" color="gray" as="div" mb="1" weight="medium">
                BATCH CODE
              </Text>
              <Text
                weight="bold"
                size="5"
                style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
              >
                {resultData.batchCode}
              </Text>
            </Box>
            <Button
              variant="soft"
              size="2"
              onClick={handleCopy}
              style={{ flexShrink: 0 }}
            >
              {copied ? (
                <>
                  <CheckIcon />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon />
                  Copy
                </>
              )}
            </Button>
          </Flex>
        </Card>

        {/* Stat Cards */}
        <Grid columns={{ initial: "3", sm: "3" }} gap="3">
          <Card variant="surface" size="1">
            <Flex direction="column" align="center" gap="1">
              <Text size="1" color="gray">
                Ingredients
              </Text>
              <Text weight="bold" size="6" color="green">
                {resultData.ingredientsStaged}
              </Text>
              <Text size="1" color="gray">
                staged
              </Text>
              {resultData.ingredientsSkipped > 0 && (
                <Badge color="amber" size="1">
                  {resultData.ingredientsSkipped} skipped
                </Badge>
              )}
            </Flex>
          </Card>
          <Card variant="surface" size="1">
            <Flex direction="column" align="center" gap="1">
              <Text size="1" color="gray">
                Menu Items
              </Text>
              <Text weight="bold" size="6" color="green">
                {resultData.menuItemsStaged}
              </Text>
              <Text size="1" color="gray">
                staged
              </Text>
              {resultData.menuItemsSkipped > 0 && (
                <Badge color="amber" size="1">
                  {resultData.menuItemsSkipped} skipped
                </Badge>
              )}
            </Flex>
          </Card>
          <Card variant="surface" size="1">
            <Flex direction="column" align="center" gap="1">
              <Text size="1" color="gray">
                Recipes
              </Text>
              <Text weight="bold" size="6" color="green">
                {resultData.recipesStaged}
              </Text>
              <Text size="1" color="gray">
                staged
              </Text>
              {resultData.recipesSkipped > 0 && (
                <Badge color="amber" size="1">
                  {resultData.recipesSkipped} skipped
                </Badge>
              )}
            </Flex>
          </Card>
        </Grid>

        {/* Warnings */}
        {resultData.warnings.length > 0 && (
          <Callout.Root color="orange" variant="surface">
            <Callout.Text>
              <Text weight="medium" as="div" mb="2">
                {resultData.warnings.length} Warning
                {resultData.warnings.length !== 1 ? "s" : ""}
              </Text>
              {resultData.warnings.map((warning, i) => (
                <Text key={i} as="div" size="2">
                  • {warning}
                </Text>
              ))}
            </Callout.Text>
          </Callout.Root>
        )}

        <Separator />

        {/* What's Next */}
        <Box>
          <Text weight="bold" size="3" as="div" mb="3">
            What's Next
          </Text>
          <Flex direction="column" gap="3">
            {[
              {
                icon: "✅",
                color: "#10b981",
                label: "Done",
                title: "Data is staged in the review queue",
                desc: "Your ingredients and recipes are safely stored as a pending batch.",
              },
              {
                icon: "➡️",
                color: "#3b82f6",
                label: "Next",
                title: "Open Import History",
                desc: `Find batch "${resultData.batchCode}" in the Import History tab.`,
              },
              {
                icon: "▶️",
                color: "#8b5cf6",
                label: "Then",
                title: "Click Sync to go live",
                desc: "Syncing pushes all staged items to the POS immediately.",
              },
              {
                icon: "↩️",
                color: "#f59e0b",
                label: "Or",
                title: "Click Revert to undo",
                desc: "Changed your mind? Revert removes all staged data — no products are created.",
              },
            ].map(({ icon, color, label, title, desc }) => (
              <Flex key={label} gap="3" align="start">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>
                <Box>
                  <Flex align="center" gap="2" mb="1">
                    <Badge
                      size="1"
                      style={{ background: `${color}22`, color }}
                    >
                      {label}
                    </Badge>
                    <Text weight="medium" size="2">
                      {title}
                    </Text>
                  </Flex>
                  <Text size="2" color="gray">
                    {desc}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>

        <Separator />

        {/* Actions */}
        <Flex gap="3" justify="end" wrap="wrap">
          <Button variant="outline" onClick={reset}>
            Import Another File
          </Button>
          <Button
            onClick={() => goToHistory?.()}
          >
            Go to Import History →
          </Button>
        </Flex>
      </Flex>
    </StepShell>
  );
};
