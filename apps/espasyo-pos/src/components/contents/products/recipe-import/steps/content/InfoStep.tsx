import React from "react";
import {
  Box,
  Flex,
  Text,
  Card,
  Heading,
  Badge,
  Callout,
  Table,
  Separator,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  CheckCircledIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const InfoStep: React.FC<RecipeImportStepProps> = ({ next }) => {
  return (
    <StepShell
      icon={<InfoCircledIcon width={24} height={24} />}
      title="Recipe Import Guide"
      subtitle="Read this before uploading your file"
      actions={
        <StepNavigation
          onContinue={next}
          continueText="I'm Ready — Start Import"
          hideBack
        />
      }
    >
      <Flex direction="column" gap="5">
        {/* What is Recipe Import */}
        <Card variant="surface" size="2">
          <Flex gap="3" align="start">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--accent-a3)",
                color: "var(--accent-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              📋
            </Box>
            <Box>
              <Heading size="3" mb="2">
                What is Recipe Import?
              </Heading>
              <Text as="p" color="gray" size="2" style={{ lineHeight: 1.7 }}>
                Recipe Import lets you add ingredients, menu items, and their
                recipes in bulk by uploading a structured Excel file. Instead of
                creating each product one by one, you prepare your data in a
                spreadsheet and the system stages everything for review before it
                goes live in the POS.
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Before You Start */}
        <Card variant="surface" size="2">
          <Flex gap="3" align="start">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--green-a3)",
                color: "var(--green-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              ✓
            </Box>
            <Box>
              <Heading size="3" mb="2">
                Before You Start — Checklist
              </Heading>
              <Flex direction="column" gap="2">
                {[
                  'Your Excel file is ready (.xlsx or .xls format)',
                  'Each menu item has its own tab (tab name = menu item name, e.g. "TAPA")',
                  'Row 1 (title) and the column headers row are skipped; ingredient data starts on the row immediately after the column headers',
                  'Each ingredient row has: Name (col B), Qty (col C), Unit (col D)',
                  '"Regular Selling Price" label is in the sheet, with the price in the cell to its right',
                ].map((item, i) => (
                  <Text key={i} size="2" color="gray">
                    ✓ {item}
                  </Text>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Card>

        {/* Excel Format Reference */}
        <Card variant="surface" size="2">
          <Heading size="3" mb="4">
            Expected Excel Format
          </Heading>

          <Flex direction="column" gap="4">
            <Box>
              <Flex align="center" gap="2" mb="2">
                <Badge color="violet" variant="soft">
                  Each product tab (e.g. "TAPA", "AFFOGATO")
                </Badge>
              </Flex>
              <Text size="2" color="gray" as="p" mb="3">
                The tab name becomes the menu item name. Row 1 (title) and the
                column headers row are skipped automatically — blank rows between
                them are ignored. Ingredient data starts on the first row after
                the column headers. A cell containing "Regular Selling Price"
                should have the price in the cell directly to its right.
              </Text>
              <Box style={{ overflowX: "auto" }}>
                <Table.Root size="2" variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Column</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Required</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Example</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {[
                      ["B — Ingredient Name", "Text", "Yes", "All-Purpose Flour"],
                      ["C — Quantity Required", "Number", "Yes", "200"],
                      ["D — Unit", "Text", "Yes", "g"],
                    ].map(([col, type, req, ex]) => (
                      <Table.Row key={col}>
                        <Table.Cell>
                          <Text weight="medium" size="2">
                            {col}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {type}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={req === "Yes" ? "red" : "gray"}
                            variant="soft"
                            size="1"
                          >
                            {req}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" color="gray">
                            {ex}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Box>

            <Separator />

            <Box>
              <Text size="2" color="gray" weight="medium" as="div" mb="2">
                Skipped sheets (ignored automatically):
              </Text>
              <Flex gap="2" wrap="wrap">
                {["START HERE", "Units", "Ingredients", "Other", "OPEX", "Summary", "Copy of Summary"].map((name) => (
                  <Badge key={name} color="gray" variant="soft" size="1">
                    {name}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Flex>
        </Card>

        {/* What happens after import */}
        <Card variant="surface" size="2">
          <Heading size="3" mb="4">
            What Happens After Import?
          </Heading>
          <Flex direction="column" gap="3">
            {[
              {
                step: "1",
                color: "#3b82f6",
                title: "Upload & Analyze",
                desc: "Your file is parsed and validated. Issues are flagged before anything is saved.",
              },
              {
                step: "2",
                color: "#8b5cf6",
                title: "Configure & Preview",
                desc: "Choose how many items to import and assign categories to each new product.",
              },
              {
                step: "3",
                color: "#f59e0b",
                title: "Staged (Pending)",
                desc: "Data is saved as a draft batch — nothing is live yet. You can review it in Import History.",
              },
              {
                step: "4",
                color: "#10b981",
                title: "Sync to POS",
                desc: "An admin clicks Sync from Import History. Products go live in the POS immediately.",
              },
            ].map(({ step, color, title, desc }) => (
              <Flex key={step} gap="3" align="start">
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step}
                </Box>
                <Box>
                  <Text weight="medium" as="div" size="2">
                    {title}
                  </Text>
                  <Text color="gray" as="div" size="2">
                    {desc}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Card>

        {/* Variant Auto-Detection */}
        <Card variant="surface" size="2">
          <Flex gap="3" align="start">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--blue-a3)",
                color: "var(--blue-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              🔍
            </Box>
            <Box style={{ flex: 1 }}>
              <Heading size="3" mb="2">
                Variant Products — Auto-Detection
              </Heading>
              <Text as="p" color="gray" size="2" style={{ lineHeight: 1.7 }} mb="3">
                If your product comes in multiple sizes, name each tab using this format:
              </Text>
              <Box
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--blue-a2)",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  fontSize: 13,
                  marginBottom: "0.75rem",
                }}
              >
                <Text size="2" weight="medium">[size]oz [Product Name]</Text>
                <Text as="p" size="1" color="gray" mt="1">
                  e.g. &nbsp; 12oz PURE MATCHA &nbsp;|&nbsp; 16oz PURE MATCHA &nbsp;|&nbsp; 22oz PURE MATCHA
                </Text>
              </Box>
              <Text as="p" color="gray" size="2" style={{ lineHeight: 1.7 }} mb="2">
                The system will automatically:
              </Text>
              <Flex direction="column" gap="1">
                {[
                  "Create one parent product — PURE MATCHA",
                  "Add size variants: 12oz, 16oz, 22oz with their individual prices",
                  "Create a separate recipe for each size with its own ingredient quantities",
                ].map((item, i) => (
                  <Flex key={i} gap="2" align="center">
                    <CheckCircledIcon color="var(--green-9)" />
                    <Text size="2" color="gray">{item}</Text>
                  </Flex>
                ))}
              </Flex>
              <Callout.Root color="blue" variant="surface" mt="3">
                <Callout.Text size="2">
                  Tabs that do <strong>not</strong> match the size prefix pattern (e.g. "Pepper Beef Tapa", "PLAIN FRIES") are imported as regular standalone menu items — no change to their behaviour.
                </Callout.Text>
              </Callout.Root>
            </Box>
          </Flex>
        </Card>

        {/* Important Notice */}
        <Card variant="surface" size="2" style={{ borderLeft: "4px solid var(--amber-9)" }}>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Box style={{ fontSize: 18 }}>⚠️</Box>
              <Heading size="3">Important</Heading>
            </Flex>
            <Text size="2" color="gray" style={{ lineHeight: 1.7 }}>
              Importing will <strong>NOT</strong> immediately create products. Data
              is staged in a draft batch first. You must go to the{" "}
              <strong>Import History</strong> tab and click <strong>Sync</strong>{" "}
              to make items visible in the POS. You can also <strong>Revert</strong>{" "}
              a batch at any time to undo all staged items.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </StepShell>
  );
};
