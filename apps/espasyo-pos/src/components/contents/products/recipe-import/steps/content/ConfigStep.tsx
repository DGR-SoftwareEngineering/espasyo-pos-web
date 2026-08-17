import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Callout,
  RadioGroup,
  Switch,
  TextField as RadixTextField,
  Checkbox,
  Button,
} from "@radix-ui/themes";;
import { MagnifyingGlassIcon, MixerHorizontalIcon, ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";
import type { RecipePreviewItemDto } from "core-lib/api/commons/types";

// Normalize a variant group name to lowercase key for case-insensitive grouping.
// "PURE MATCHA", "Pure Matcha", "pure matcha" → "pure matcha" (same bucket)
function groupKey(name: string) {
  return name.toLowerCase().trim();
}

interface VariantGroupEntry {
  displayName: string;           // first-seen casing, used for display
  variants: RecipePreviewItemDto[];
}

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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedSizes, setExpandedSizes] = useState<Set<string>>(new Set());

  if (!previewData) return null;

  const totalRecipes = previewData.recipes.length;
  const existingFullCount = previewData.recipes.filter(
    (r) => r.menuItemAlreadyExistsInDb && r.hasExistingActiveRecipe
  ).length;

  // Case-insensitive grouping — "PURE MATCHA 22oz" + "Pure Matcha 16oz" → same group
  const variantGroupMap = useMemo(() => {
    const map = new Map<string, VariantGroupEntry>();
    for (const r of previewData.recipes) {
      if (r.variantGroup) {
        const key = groupKey(r.variantGroup);
        if (!map.has(key)) map.set(key, { displayName: r.variantGroup, variants: [] });
        map.get(key)!.variants.push(r);
      }
    }
    return map;
  }, [previewData.recipes]);

  const standaloneRecipes = useMemo(
    () => previewData.recipes.filter((r) => !r.variantGroup),
    [previewData.recipes]
  );

  const filteredStandalone = useMemo(
    () => standaloneRecipes.filter((r) =>
      r.menuItemName.toLowerCase().includes(search.toLowerCase())
    ),
    [standaloneRecipes, search]
  );

  const filteredGroups = useMemo(() => {
    if (!search) return Array.from(variantGroupMap.values());
    return Array.from(variantGroupMap.values()).filter(({ displayName, variants }) =>
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      variants.some(v => v.menuItemName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [variantGroupMap, search]);

  const toggleGroupExpanded = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleSizeExpanded = (key: string) => {
    setExpandedSizes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isGroupFullySelected = (variants: RecipePreviewItemDto[]) =>
    variants.every(v => selectedRecipes.has(v.menuItemName));
  const isGroupPartiallySelected = (variants: RecipePreviewItemDto[]) =>
    variants.some(v => selectedRecipes.has(v.menuItemName)) &&
    !variants.every(v => selectedRecipes.has(v.menuItemName));

  const toggleGroup = (variants: RecipePreviewItemDto[]) => {
    if (isGroupFullySelected(variants)) {
      bulkDeselectRecipes(variants.map(v => v.menuItemName));
    } else {
      bulkSelectRecipes(variants.map(v => v.menuItemName));
    }
  };

  // For bulk select/deselect all visible (covers both groups and standalone)
  const allVisibleNames = useMemo(() => [
    ...filteredGroups.flatMap(g => g.variants.map(v => v.menuItemName)),
    ...filteredStandalone.map(r => r.menuItemName),
  ], [filteredGroups, filteredStandalone]);

  const handleApplyLimit = () => {
    const finalLimit = recLimitMode === "all"
      ? "all"
      : (Math.min(parseInt(recLimitValue) || totalRecipes, totalRecipes) as number);
    setRecipeLimit(finalLimit);
    applyLimitToSelection(finalLimit);
  };

  const handleSelectAllVisible = () => bulkSelectRecipes(allVisibleNames);
  const handleDeselectAllVisible = () => bulkDeselectRecipes(allVisibleNames);
  const handleContinue = () => proceedToPreview(skipExistingFull);
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
          continueText="Continue to Edit Details"
          continueDisabled={!canContinue}
        />
      }
    >
      <Flex direction="column" gap="5">
        <Text as="p" color="gray" size="2">
          Your file contains{" "}
          <Text weight="bold" color="gray">
            {totalRecipes} recipe tab{totalRecipes !== 1 ? "s" : ""}
          </Text>
          {variantGroupMap.size > 0 && (
            <> ({variantGroupMap.size} variant product{variantGroupMap.size !== 1 ? "s" : ""} + {standaloneRecipes.length} standalone)</>
          )}
          . Select which ones to include in this import batch.
        </Text>

        {/* Quick Limit Card */}
        <Card variant="surface" size="2" style={{ maxWidth: 520 }}>
          <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Heading size="3">Quick Selection</Heading>
              <Badge color="violet" variant="soft">{totalRecipes} found</Badge>
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
                <Text as="div" size="2" mb="1" color="gray">Number of items to select</Text>
                <Flex align="center" gap="2">
                  <RadixTextField.Root
                    type="number"
                    placeholder={`1 – ${totalRecipes}`}
                    value={recLimitValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || (parseInt(v) >= 1 && parseInt(v) <= totalRecipes))
                        setRecLimitValue(v);
                    }}
                    style={{ maxWidth: 180 }}
                  />
                  <Button size="2" variant="soft" onClick={handleApplyLimit}>Apply to list</Button>
                </Flex>
              </Box>
            )}

            {recLimitMode === "all" && (
              <Button size="2" variant="soft" onClick={handleApplyLimit} style={{ alignSelf: "flex-start" }}>
                Select all in list
              </Button>
            )}

            <Box style={{ padding: "0.75rem", background: "var(--accent-a2)", borderRadius: 6 }}>
              <Flex justify="between" align="center">
                <Text size="2" color="gray">Currently selected</Text>
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
              <Heading size="3">Select Recipes for Import</Heading>
              <Flex gap="2">
                <Button size="1" variant="soft" onClick={handleSelectAllVisible}>Select all</Button>
                <Button size="1" variant="soft" color="gray" onClick={handleDeselectAllVisible}>Deselect all</Button>
              </Flex>
            </Flex>

            {/* Search */}
            <RadixTextField.Root
              placeholder="Search by product or ingredient name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            >
              <RadixTextField.Slot><MagnifyingGlassIcon /></RadixTextField.Slot>
            </RadixTextField.Root>

            {/* Recipe list */}
            <Box style={{ maxHeight: 480, overflowY: "auto" }}>
              {filteredGroups.length === 0 && filteredStandalone.length === 0 ? (
                <Text size="2" color="gray">No recipes match your search.</Text>
              ) : (
                <>
                  {/* ── Variant groups ────────────────────────── */}
                  {filteredGroups.map(({ displayName, variants }) => {
                    const key = groupKey(displayName);
                    const expanded = expandedGroups.has(key);
                    const fullySelected = isGroupFullySelected(variants);
                    const partial = isGroupPartiallySelected(variants);

                    return (
                      <Box key={key} style={{ borderBottom: "1px solid var(--gray-a3)" }}>
                        {/* Group header */}
                        <Flex
                          align="center"
                          gap="3"
                          py="2"
                          px="2"
                          style={{ cursor: "pointer", background: "var(--blue-a2)" }}
                          onClick={() => toggleGroupExpanded(key)}
                        >
                          <Box onClick={(e) => { e.stopPropagation(); toggleGroup(variants); }}>
                            <Checkbox
                              checked={fullySelected ? true : partial ? "indeterminate" : false}
                              onCheckedChange={() => toggleGroup(variants)}
                            />
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Flex align="center" gap="2">
                              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                              <Text size="2" weight="bold">{displayName}</Text>
                              <Badge color="blue" variant="soft" size="1">
                                {variants.length} size{variants.length !== 1 ? "s" : ""}
                              </Badge>
                            </Flex>
                          </Box>
                          {variants[0]?.menuItemAlreadyExistsInDb && (
                            <Badge color="amber" variant="soft" size="1">Existing</Badge>
                          )}
                        </Flex>

                        {/* Per-size sub-rows with ingredient list */}
                        {expanded && variants.map((v) => {
                          const sizeKey = v.menuItemName;
                          const sizeExpanded = expandedSizes.has(sizeKey);
                          const MAX_SHOWN = 5;

                          return (
                            <Box
                              key={sizeKey}
                              style={{ borderTop: "1px solid var(--gray-a2)", background: "var(--gray-a1)" }}
                            >
                              {/* Size row */}
                              <Flex
                                align="center"
                                gap="3"
                                py="2"
                                px="2"
                                style={{ paddingLeft: "2.5rem", cursor: "pointer" }}
                                onClick={() => toggleRecipe(v.menuItemName)}
                              >
                                <Checkbox
                                  checked={selectedRecipes.has(v.menuItemName)}
                                  onCheckedChange={() => toggleRecipe(v.menuItemName)}
                                />
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                  <Flex align="center" gap="2">
                                    <Text size="2" weight="medium">
                                      {v.variantSize ?? v.menuItemName}
                                    </Text>
                                    <Text
                                      size="1"
                                      color="blue"
                                      style={{ cursor: "pointer", textDecoration: "underline" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSizeExpanded(sizeKey);
                                      }}
                                    >
                                      {v.items?.length ?? 0} ingredient{(v.items?.length ?? 0) !== 1 ? "s" : ""}{" "}
                                      {sizeExpanded ? "▾" : "▸"}
                                    </Text>
                                  </Flex>
                                </Box>
                                {v.hasExistingActiveRecipe && (
                                  <Badge color="red" variant="soft" size="1">Has Recipe</Badge>
                                )}
                              </Flex>

                              {/* Ingredient list */}
                              {sizeExpanded && v.items && v.items.length > 0 && (
                                <Box
                                  style={{
                                    paddingLeft: "4rem",
                                    paddingBottom: "0.5rem",
                                    paddingRight: "1rem",
                                  }}
                                >
                                  {v.items.slice(0, MAX_SHOWN).map((ing, i) => (
                                    <Flex key={i} align="center" gap="2" py="1">
                                      <Text size="1" color="gray">•</Text>
                                      <Text size="1" color="gray">{ing.ingredientName}</Text>
                                      <Text size="1" color="gray" style={{ opacity: 0.6 }}>
                                        {ing.quantityRequired} {ing.unitName}
                                      </Text>
                                      {!ing.ingredientExistsInDb && (
                                        <Badge color="blue" variant="soft" size="1">New</Badge>
                                      )}
                                    </Flex>
                                  ))}
                                  {v.items.length > MAX_SHOWN && (
                                    <Text size="1" color="gray" style={{ fontStyle: "italic" }}>
                                      + {v.items.length - MAX_SHOWN} more…
                                    </Text>
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}

                  {/* ── Standalone items ──────────────────────── */}
                  {filteredStandalone.map((r) => {
                    const sizeKey = r.menuItemName;
                    const sizeExpanded = expandedSizes.has(sizeKey);
                    const MAX_SHOWN = 5;

                    return (
                      <Box key={r.menuItemName} style={{ borderBottom: "1px solid var(--gray-a3)" }}>
                        <Flex
                          align="center"
                          gap="3"
                          py="2"
                          px="2"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleRecipe(r.menuItemName)}
                        >
                          <Checkbox
                            checked={selectedRecipes.has(r.menuItemName)}
                            onCheckedChange={() => toggleRecipe(r.menuItemName)}
                          />
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Flex align="center" gap="2" wrap="wrap">
                              <Text size="2" weight="medium">{r.menuItemName}</Text>
                              <Text
                                size="1"
                                color="blue"
                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSizeExpanded(sizeKey);
                                }}
                              >
                                {r.items?.length ?? 0} ingredient{(r.items?.length ?? 0) !== 1 ? "s" : ""}{" "}
                                {sizeExpanded ? "▾" : "▸"}
                              </Text>
                            </Flex>
                          </Box>
                          {r.menuItemAlreadyExistsInDb && (
                            <Badge color="amber" variant="soft" size="1">Existing</Badge>
                          )}
                          {r.hasExistingActiveRecipe && (
                            <Badge color="red" variant="soft" size="1">Has Recipe</Badge>
                          )}
                        </Flex>

                        {sizeExpanded && r.items && r.items.length > 0 && (
                          <Box style={{ paddingLeft: "3rem", paddingBottom: "0.5rem", paddingRight: "1rem" }}>
                            {r.items.slice(0, MAX_SHOWN).map((ing, i) => (
                              <Flex key={i} align="center" gap="2" py="1">
                                <Text size="1" color="gray">•</Text>
                                <Text size="1" color="gray">{ing.ingredientName}</Text>
                                <Text size="1" color="gray" style={{ opacity: 0.6 }}>
                                  {ing.quantityRequired} {ing.unitName}
                                </Text>
                                {!ing.ingredientExistsInDb && (
                                  <Badge color="blue" variant="soft" size="1">New</Badge>
                                )}
                              </Flex>
                            ))}
                            {r.items.length > MAX_SHOWN && (
                              <Text size="1" color="gray" style={{ fontStyle: "italic" }}>
                                + {r.items.length - MAX_SHOWN} more…
                              </Text>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>

            {search && (
              <Text size="1" color="gray">
                Showing {filteredGroups.length + filteredStandalone.length} result{filteredGroups.length + filteredStandalone.length !== 1 ? "s" : ""} for &quot;{search}&quot;
              </Text>
            )}
          </Flex>
        </Card>

        <Separator />

        {/* What happens next */}
        <Box
          style={{
            padding: "1rem",
            background: "var(--accent-a2)",
            borderRadius: 8,
            border: "1px solid var(--accent-a5)",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">What happens in the next step?</Text>
            <Text size="2" color="gray">
              You&apos;ll fill in complete product information for each selected item — product name,
              category, selling price, description, and full ingredient details (category, purchase
              cost, and units for new ingredients). Everything is editable before staging.
            </Text>
          </Flex>
        </Box>

        <Callout.Root color="blue" variant="surface">
          <Callout.Text size="2">
            Tip: You can import in multiple batches. Select a subset now — remaining items
            can be imported in a new batch at any time.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </StepShell>
  );
};
