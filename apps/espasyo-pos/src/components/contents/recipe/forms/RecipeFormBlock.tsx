import {
  Box,
  Flex,
  Heading,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  useToastContext } from "core-lib"; import React,
  { useEffect,
  useMemo,
  useState } from "react"; import {   Badge,
  Button,
  Callout,
  Card,
  ScrollArea,
  Select,
  Spinner,
  Tabs,
  TextField,
} from "@radix-ui/themes";;
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  CheckBoxOutlineBlankOutlined,
  CheckBoxOutlined,
  CheckCircleOutlineOutlined,
  ExtensionOutlined,
  LayersOutlined,
  RestaurantMenuOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import { RecipeForm as RecipeFormType } from "./validation";
import { useApiCallback, useApi } from "core-lib/core/hooks";
import { RecipeForm } from "./RecipeForm";
import {
  RecipeGapWarning,
  InventoryGapCallout,
} from "core-lib/components/dialog/contents/recipe";
import type {
  CreateAddOnItemRecipeParams,
  CreateVariantRecipeParams,
  DetectGapDto,
  ProductAddOnGroupDto,
  ProductCategoryDto,
  ProductDataList,
  ProductVariantDto,
  RecipeParams,
  RecipeResponse,
  UnitDto,
  UntrackedSalesGapDto,
} from "core-lib/api/commons/types";
import type { RecipeTarget } from "./types";

// ── Step indicator ─────────────────────────────────────────────────────────────

interface StepPillProps {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}
const StepPill: React.FC<StepPillProps> = ({ num, label, active, done }) => (
  <Flex align="center" gap="2">
    <Box
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: done
          ? "var(--green-9)"
          : active
            ? "var(--accent-9)"
            : "var(--gray-4)",
        color: done || active ? "white" : "var(--gray-10)",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {done ? <CheckIcon width={14} height={14} /> : num}
    </Box>
    <Text
      size="2"
      weight={active ? "bold" : "regular"}
      color={done ? "green" : active ? undefined : "gray"}
    >
      {label}
    </Text>
  </Flex>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const RecipeFormBlock: React.FC = () => {
  // ── Wizard state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDataList | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<RecipeTarget[]>([]);
  const [targetQueue, setTargetQueue] = useState<RecipeTarget[]>([]);

  // Step 3 multi-target state
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [perTargetDrafts, setPerTargetDrafts] = useState<(RecipeFormType | null)[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Step 2 data
  const [variants, setVariants] = useState<ProductVariantDto[]>([]);
  const [addOnGroups, setAddOnGroups] = useState<ProductAddOnGroupDto[]>([]);
  const [variantRecipeSet, setVariantRecipeSet] = useState<Set<string>>(new Set());
  const [addOnRecipeSet, setAddOnRecipeSet] = useState<Set<string>>(new Set());
  const [loadingStep2, setLoadingStep2] = useState(false);

  // ── Existing state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [ingredients, setIngredients] = useState<ProductDataList[]>([]);
  const [menuItems, setMenuItems] = useState<ProductDataList[]>([]);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
  const [showGapCallout, setShowGapCallout] = useState(false);
  const [gapData, setGapData] = useState<{
    menuItemName: string;
    gaps: UntrackedSalesGapDto[];
  } | null>(null);
  const [showEarlyWarning, setShowEarlyWarning] = useState(false);
  const [earlyDetectionGap, setEarlyDetectionGap] = useState<DetectGapDto | null>(null);
  const { showToast } = useToastContext();

  // ── API callbacks ───────────────────────────────────────────────────────────
  const recipeCb = useApiCallback(
    async (api, args: RecipeParams) => await api.commons.createRecipe(args),
  );
  const variantRecipeCb = useApiCallback(
    async (api, args: CreateVariantRecipeParams) =>
      await api.commons.createVariantRecipe(args),
  );
  const addOnRecipeCb = useApiCallback(
    async (api, args: CreateAddOnItemRecipeParams) =>
      await api.commons.createAddOnItemRecipe(args),
  );
  const detectGapCb = useApiCallback(
    async (api, id: string) => await api.commons.detectGap(id),
  );
  const variantsCb = useApiCallback(
    async (api, id: string) => await api.commons.productVariantsByProduct(id),
  );
  const addOnGroupsCb = useApiCallback(
    async (api, id: string) => await api.commons.productAddOnGroupsByProduct(id),
  );
  const variantRecipesCb = useApiCallback(
    async (api, id: string) => await api.commons.getVariantRecipesByProduct(id),
  );
  const addOnItemRecipesCb = useApiCallback(
    async (api, id: string) => await api.commons.getAddOnItemRecipesByProduct(id),
  );

  // ── Data loading ────────────────────────────────────────────────────────────
  const getMenuItems = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(true),
  );
  const getIngredients = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );
  const unitData = useApi((api) => api.commons.unitList());
  const categoryData = useApi((api) => api.commons.productCategoryList());

  useEffect(() => {
    setIngredients(getIngredients.result?.data.response ?? []);
  }, [getIngredients.result?.data.response]);

  useEffect(() => {
    setMenuItems(getMenuItems.result?.data.response ?? []);
  }, [getMenuItems.result?.data.response]);

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

  useEffect(() => {
    setCategories(categoryData.result?.data.response ?? []);
  }, [categoryData.result?.data.response]);

  // ── Filtered products ───────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = menuItems;
    if (categoryFilter && categoryFilter !== "all") {
      list = list.filter((p) => p.productCategoryID === categoryFilter);
    }
    if (productSearch.trim()) {
      const lower = productSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(lower));
    }
    return list;
  }, [menuItems, categoryFilter, productSearch]);

  // ── Wizard navigation ───────────────────────────────────────────────────────

  const handleProductSelect = async (product: ProductDataList) => {
    if (loadingStep2) return;
    setSelectedProduct(product);
    setLoadingStep2(true);
    setVariants([]);
    setAddOnGroups([]);
    setVariantRecipeSet(new Set());
    setAddOnRecipeSet(new Set());
    setSelectedTargets([]);

    try {
      const [varRes, addRes, vrRes, adrRes] = await Promise.all([
        variantsCb.execute(product.productID),
        addOnGroupsCb.execute(product.productID),
        variantRecipesCb.execute(product.productID),
        addOnItemRecipesCb.execute(product.productID),
      ]);

      const loadedVariants = (varRes.data.response ?? []).filter((v) => v.isActive);
      const loadedGroups = addRes.data.response ?? [];
      const activeItems = loadedGroups.flatMap((g) => g.items ?? []).filter((i) => i.isActive);

      setVariants(varRes.data.response ?? []);
      setAddOnGroups(loadedGroups);
      setVariantRecipeSet(
        new Set<string>((vrRes.data.response ?? []).map((r) => r.productVariantID)),
      );
      setAddOnRecipeSet(
        new Set<string>((adrRes.data.response ?? []).map((r) => r.productAddOnItemID)),
      );

      if (loadedVariants.length === 0 && activeItems.length === 0) {
        const baseTarget: RecipeTarget = {
          type: "base",
          productId: product.productID,
          productName: product.name,
        };
        setSelectedTargets([baseTarget]);
        setTargetQueue([baseTarget]);
        setActiveTabIndex(0);
        setPerTargetDrafts([null]);
        await triggerGapCheck(product.productID);
        setStep(3);
        return;
      }

      setStep(2);
    } catch {
      setSelectedTargets([{
        type: "base",
        productId: product.productID,
        productName: product.name,
      }]);
      setStep(3);
    } finally {
      setLoadingStep2(false);
    }
  };

  const handleContinueToStep3 = async () => {
    if (selectedTargets.length === 0) return;
    const queue = [...selectedTargets];
    setTargetQueue(queue);
    setActiveTabIndex(0);
    setPerTargetDrafts(new Array(queue.length).fill(null));
    const baseTarget = queue.find((t) => t.type === "base");
    if (baseTarget) {
      await triggerGapCheck(baseTarget.productId);
    }
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setTargetQueue([]);
      setActiveTabIndex(0);
      setPerTargetDrafts([]);
      setSubmitAttempted(false);
      const activeVariants = variants.filter((v) => v.isActive);
      const activeItems = addOnGroups.flatMap((g) => g.items ?? []).filter((i) => i.isActive);
      if (activeVariants.length > 0 || activeItems.length > 0) {
        setStep(2);
      } else {
        setSelectedProduct(null);
        setSelectedTargets([]);
        setStep(1);
      }
      setShowEarlyWarning(false);
      setEarlyDetectionGap(null);
    } else if (step === 2) {
      setSelectedProduct(null);
      setSelectedTargets([]);
      setStep(1);
    }
  };

  // ── Gap detection ───────────────────────────────────────────────────────────

  const triggerGapCheck = async (menuItemId: string) => {
    try {
      const result = await detectGapCb.execute(menuItemId);
      if (result.data.success) {
        const gaps = result.data.response?.gaps ?? [];
        if (gaps.length > 0) {
          setEarlyDetectionGap(gaps[0]);
          setShowEarlyWarning(true);
        } else {
          setShowEarlyWarning(false);
          setEarlyDetectionGap(null);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleGapDismiss = () => {
    setShowGapCallout(false);
    setGapData(null);
    resetWizard();
  };

  const handleEarlyWarningProceed = () => {
    setShowEarlyWarning(false);
    setEarlyDetectionGap(null);
  };

  const handleEarlyWarningCancel = () => {
    setShowEarlyWarning(false);
    setEarlyDetectionGap(null);
    handleBack();
  };

  // ── Wizard reset ────────────────────────────────────────────────────────────

  const resetWizard = () => {
    setStep(1);
    setSelectedProduct(null);
    setSelectedTargets([]);
    setTargetQueue([]);
    setActiveTabIndex(0);
    setPerTargetDrafts([]);
    setSubmitAttempted(false);
    setVariants([]);
    setAddOnGroups([]);
    setVariantRecipeSet(new Set());
    setAddOnRecipeSet(new Set());
    setProductSearch("");
    setResetForm(true);
    setTimeout(() => setResetForm(false), 100);
  };

  // ── Target toggle ───────────────────────────────────────────────────────────

  const toggleTarget = (target: RecipeTarget) => {
    setSelectedTargets((prev) => {
      const alreadySelected = prev.some((t) => targetsMatch(t, target));
      if (alreadySelected) {
        return prev.filter((t) => !targetsMatch(t, target));
      }
      return [...prev, target];
    });
  };

  // ── Single-target submit (no tabs) ──────────────────────────────────────────

  async function handleSingleTargetSubmit(data: RecipeFormType) {
    const target = targetQueue[0];
    if (!target) return;
    setLoading(true);

    const recipeItems = buildRecipeItems(data);
    const notes = data.notes ?? null;

    try {
      let pendingGapData: { menuItemName: string; gaps: UntrackedSalesGapDto[] } | null =
        null;

      if (target.type === "base") {
        const result = await recipeCb.execute({
          menuItemProductID: target.productId,
          notes,
          recipeItems,
        });
        if (!result.data.success) throw new Error(extractErrorMessage(result.data));
        const recipeResp = result.data.response as RecipeResponse | undefined;
        if (recipeResp?.untrackedSalesGap && recipeResp.untrackedSalesGap.length > 0) {
          pendingGapData = {
            menuItemName: recipeResp.menuItemName,
            gaps: recipeResp.untrackedSalesGap,
          };
        }
      } else if (target.type === "variant") {
        const result = await variantRecipeCb.execute({
          productVariantID: target.variantId,
          notes,
          recipeItems,
        });
        if (!result.data.success) throw new Error(extractErrorMessage(result.data));
      } else {
        const result = await addOnRecipeCb.execute({
          productAddOnItemID: target.addOnItemId,
          notes,
          recipeItems,
        });
        if (!result.data.success) throw new Error(extractErrorMessage(result.data));
      }

      showToast(`Recipe created for "${getTargetLabel(target)}"`, "success");

      if (pendingGapData) {
        setGapData(pendingGapData);
        setShowGapCallout(true);
      } else {
        resetWizard();
      }
    } catch (err) {
      showToast(
        extractAxiosErrorMessage(err) || `Failed to create recipe for "${getTargetLabel(target)}"`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Multi-target: save local draft per tab ──────────────────────────────────

  const handleSaveDraft = (data: RecipeFormType) => {
    const updatedDrafts = [...perTargetDrafts];
    updatedDrafts[activeTabIndex] = data;
    setPerTargetDrafts(updatedDrafts);

    // Auto-advance to the next tab that has no draft yet
    const nextEmpty = updatedDrafts.findIndex((d, i) => i !== activeTabIndex && d === null);
    if (nextEmpty !== -1) {
      setActiveTabIndex(nextEmpty);
    }
  };

  // ── Multi-target: final submit (all drafts → backend) ───────────────────────

  async function handleFinalSubmit() {
    const firstEmptyIndex = perTargetDrafts.findIndex((d) => d === null);
    if (firstEmptyIndex !== -1) {
      setSubmitAttempted(true);
      setActiveTabIndex(firstEmptyIndex);
      showToast(
        `Fill ingredients for "${getTargetLabel(targetQueue[firstEmptyIndex])}" before submitting.`,
        "warning",
      );
      return;
    }

    setLoading(true);
    let succeeded = 0;
    const failedNames: string[] = [];
    let pendingGapData: { menuItemName: string; gaps: UntrackedSalesGapDto[] } | null = null;

    for (let i = 0; i < targetQueue.length; i++) {
      const target = targetQueue[i];
      const draft = perTargetDrafts[i]!;
      const recipeItems = buildRecipeItems(draft);
      const notes = draft.notes ?? null;

      try {
        if (target.type === "base") {
          const result = await recipeCb.execute({
            menuItemProductID: target.productId,
            notes,
            recipeItems,
          });
          if (!result.data.success) throw new Error(extractErrorMessage(result.data));
          const recipeResp = result.data.response as RecipeResponse | undefined;
          if (recipeResp?.untrackedSalesGap && recipeResp.untrackedSalesGap.length > 0) {
            pendingGapData = {
              menuItemName: recipeResp.menuItemName,
              gaps: recipeResp.untrackedSalesGap,
            };
          }
          succeeded++;
        } else if (target.type === "variant") {
          const result = await variantRecipeCb.execute({
            productVariantID: target.variantId,
            notes,
            recipeItems,
          });
          if (!result.data.success) throw new Error(extractErrorMessage(result.data));
          succeeded++;
        } else {
          const result = await addOnRecipeCb.execute({
            productAddOnItemID: target.addOnItemId,
            notes,
            recipeItems,
          });
          if (!result.data.success) throw new Error(extractErrorMessage(result.data));
          succeeded++;
        }
      } catch (err) {
        const apiMsg = extractAxiosErrorMessage(err);
        const label = getTargetLabel(target);
        failedNames.push(apiMsg ? `${label} (${apiMsg})` : label);
      }
    }

    setLoading(false);

    if (failedNames.length === 0) {
      showToast(`All ${targetQueue.length} recipes created successfully`, "success");
      if (pendingGapData) {
        setGapData(pendingGapData);
        setShowGapCallout(true);
      } else {
        resetWizard();
      }
    } else if (succeeded > 0) {
      showToast(
        `${succeeded} created, ${failedNames.length} failed: ${failedNames.join(", ")}`,
        "warning",
      );
    } else {
      showToast(`Failed: ${failedNames.join(", ")}`, "error");
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const hasVariantsOrAddOns =
    variants.filter((v) => v.isActive).length > 0 ||
    addOnGroups.flatMap((g) => g.items ?? []).filter((i) => i.isActive).length > 0;

  const totalSteps = hasVariantsOrAddOns ? 3 : 2;

  const isStep3Loading =
    recipeCb.loading ||
    variantRecipeCb.loading ||
    addOnRecipeCb.loading ||
    loading;

  const savedCount = perTargetDrafts.filter(Boolean).length;
  const allDraftsFilled = targetQueue.length > 1 && savedCount === targetQueue.length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Step indicator */}
      <Flex align="center" gap="3" mb="4" wrap="wrap">
        <StepPill
          num={1}
          label="Select Product"
          active={step === 1}
          done={step > 1}
        />
        <Box style={{ width: 24, height: 1, background: "var(--gray-6)" }} />
        {hasVariantsOrAddOns && (
          <>
            <StepPill
              num={2}
              label="Choose Targets"
              active={step === 2}
              done={step > 2}
            />
            <Box style={{ width: 24, height: 1, background: "var(--gray-6)" }} />
          </>
        )}
        <StepPill
          num={totalSteps}
          label="Add Ingredients"
          active={step === 3}
          done={false}
        />
      </Flex>

      {/* Gap warnings (only visible in step 3) */}
      {step === 3 && showEarlyWarning && earlyDetectionGap && (
        <Box mb="4">
          <RecipeGapWarning
            gap={earlyDetectionGap}
            onProceed={handleEarlyWarningProceed}
            onCancel={handleEarlyWarningCancel}
            disabled={detectGapCb.loading}
          />
        </Box>
      )}
      {step === 3 && showGapCallout && gapData && (
        <InventoryGapCallout
          menuItemName={gapData.menuItemName}
          gaps={gapData.gaps}
          onDismiss={handleGapDismiss}
        />
      )}

      {/* ── Step 1: Product Selection ─────────────────────────────────────────── */}
      {step === 1 && (
        <Card variant="surface" size="3" style={{ width: "100%" }}>
          <Flex align="center" gap="2" mb="4">
            <TuneOutlined style={{ color: "var(--accent-11)" }} />
            <Box>
              <Heading size="4" weight="bold">
                Select Menu Item
              </Heading>
              <Text size="2" color="gray">
                Choose the product you want to create a recipe for
              </Text>
            </Box>
          </Flex>

          <Flex direction="column" gap="3">
            {/* Category filter */}
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Filter by Category
              </Text>
              <Select.Root
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <Select.Trigger
                  placeholder="All Categories"
                  style={{ width: "100%" }}
                />
                <Select.Content>
                  <Select.Item value="all">All Categories</Select.Item>
                  {categories
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((c) => (
                      <Select.Item key={c.productCategoryID} value={c.productCategoryID}>
                        {c.name}
                      </Select.Item>
                    ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Product search */}
            <Box>
              <Text size="2" weight="medium" mb="1" as="div">
                Search
              </Text>
              <TextField.Root
                placeholder="Type to search menu items..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </Box>

            {/* Product list */}
            {getMenuItems.loading ? (
              <Flex justify="center" py="6">
                <Spinner size="3" />
              </Flex>
            ) : filteredProducts.length === 0 ? (
              <Box
                py="6"
                style={{ textAlign: "center", color: "var(--gray-10)" }}
              >
                <RestaurantMenuOutlined
                  style={{ fontSize: 40, marginBottom: 8 }}
                />
                <Text as="div" size="2" color="gray">
                  No menu items found
                </Text>
              </Box>
            ) : (
              <ScrollArea style={{ maxHeight: 360 }}>
                <Flex direction="column" gap="1" pr="2">
                  {filteredProducts.map((product) => {
                    const isThisRowLoading =
                      loadingStep2 &&
                      selectedProduct?.productID === product.productID;
                    return (
                      <Box
                        key={product.productID}
                        px="3"
                        py="2"
                        onClick={() => !loadingStep2 && handleProductSelect(product)}
                        style={{
                          borderRadius: "var(--radius-2)",
                          cursor: loadingStep2 ? "default" : "pointer",
                          border: isThisRowLoading
                            ? "1px solid var(--accent-a7)"
                            : "1px solid var(--gray-a4)",
                          background: isThisRowLoading
                            ? "var(--accent-a3)"
                            : "var(--color-panel-solid)",
                          transition: "background 0.1s ease",
                          opacity: loadingStep2 && !isThisRowLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!loadingStep2)
                            (e.currentTarget as HTMLElement).style.background =
                              "var(--accent-a3)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            isThisRowLoading
                              ? "var(--accent-a3)"
                              : "var(--color-panel-solid)";
                        }}
                      >
                        <Flex align="center" justify="between" gap="2">
                          <Box style={{ minWidth: 0 }}>
                            <Flex align="center" gap="2" wrap="wrap">
                              <Text size="2" weight="medium" as="span">
                                {product.name}
                              </Text>
                              {product.productCategoryName && (
                                <Badge color="gray" variant="outline" size="1">
                                  {product.productCategoryName}
                                </Badge>
                              )}
                            </Flex>
                          </Box>
                          <Flex gap="1" wrap="wrap" justify="end" flexShrink="0">
                            {isThisRowLoading ? (
                              <Spinner size="2" />
                            ) : (
                              <>
                                {(product.variantCount ?? 0) > 0 && (
                                  <Badge color="indigo" variant="soft" size="1">
                                    {product.variantCount} variants
                                  </Badge>
                                )}
                                {(product.addOnGroupCount ?? 0) > 0 && (
                                  <Badge color="purple" variant="soft" size="1">
                                    {product.addOnGroupCount} add-ons
                                  </Badge>
                                )}
                                {product.hasActiveRecipe && (
                                  <Badge color="orange" variant="soft" size="1">
                                    Has Recipe
                                  </Badge>
                                )}
                              </>
                            )}
                          </Flex>
                        </Flex>
                      </Box>
                    );
                  })}
                </Flex>
              </ScrollArea>
            )}
          </Flex>
        </Card>
      )}

      {/* ── Step 2: Target Selection ──────────────────────────────────────────── */}
      {step === 2 && selectedProduct && (
        <Card variant="surface" size="3" style={{ width: "100%" }}>
          <Flex align="center" gap="2" mb="2">
            <RestaurantMenuOutlined style={{ color: "var(--accent-11)" }} />
            <Box>
              <Heading size="4" weight="bold">
                Choose Recipe Targets
              </Heading>
              <Text size="2" color="gray">
                Select one or more targets for{" "}
                <strong>{selectedProduct.name}</strong>.{" "}
                Greyed-out targets already have a recipe — use Edit to modify them.
              </Text>
            </Box>
          </Flex>

          {loadingStep2 ? (
            <Flex justify="center" py="8">
              <Spinner size="3" />
            </Flex>
          ) : (
            <Flex direction="column" gap="4">
              {/* Base recipe option */}
              <Box>
                <Text size="1" weight="bold" color="gray" mb="2" as="div">
                  BASE RECIPE
                </Text>
                <TargetCard
                  selected={selectedTargets.some((t) => t.type === "base")}
                  hasRecipe={!!selectedProduct.hasActiveRecipe}
                  disabled={!!selectedProduct.hasActiveRecipe}
                  icon={
                    <RestaurantMenuOutlined
                      style={{ fontSize: 20, color: "var(--accent-11)" }}
                    />
                  }
                  title="Base Recipe"
                  subtitle="Default ingredients for all sales of this product"
                  onClick={() =>
                    toggleTarget({
                      type: "base",
                      productId: selectedProduct.productID,
                      productName: selectedProduct.name,
                    })
                  }
                />
              </Box>

              {/* Variants */}
              {variants.length > 0 && (
                <Box>
                  <Flex align="center" gap="2" mb="2">
                    <LayersOutlined
                      style={{ fontSize: 14, color: "var(--indigo-11)" }}
                    />
                    <Text size="1" weight="bold" color="gray">
                      VARIANTS
                    </Text>
                    <Text size="1" color="gray">
                      — override base recipe per size/type
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="2">
                    {variants
                      .filter((v) => v.isActive)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((v) => {
                        const alreadyHasRecipe = variantRecipeSet.has(v.productVariantID);
                        return (
                          <TargetCard
                            key={v.productVariantID}
                            selected={selectedTargets.some(
                              (t) =>
                                t.type === "variant" &&
                                t.variantId === v.productVariantID,
                            )}
                            hasRecipe={alreadyHasRecipe}
                            disabled={alreadyHasRecipe}
                            icon={
                              <LayersOutlined
                                style={{ fontSize: 20, color: "var(--indigo-11)" }}
                              />
                            }
                            title={v.name}
                            subtitle={`Variant · ₱${v.price.toFixed(2)}`}
                            onClick={() =>
                              toggleTarget({
                                type: "variant",
                                productId: selectedProduct.productID,
                                productName: selectedProduct.name,
                                variantId: v.productVariantID,
                                variantName: v.name,
                              })
                            }
                          />
                        );
                      })}
                  </Flex>
                </Box>
              )}

              {/* Add-on items */}
              {addOnGroups.length > 0 && (
                <Box>
                  <Flex align="center" gap="2" mb="2">
                    <ExtensionOutlined
                      style={{ fontSize: 14, color: "var(--purple-11)" }}
                    />
                    <Text size="1" weight="bold" color="gray">
                      ADD-ON ITEMS
                    </Text>
                    <Text size="1" color="gray">
                      — ingredients deducted when add-on is ordered
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="3">
                    {addOnGroups.map((group) => (
                      <Box key={group.productAddOnGroupID}>
                        <Text
                          size="1"
                          color="gray"
                          weight="medium"
                          mb="1"
                          as="div"
                        >
                          {group.name}
                        </Text>
                        <Flex direction="column" gap="2">
                          {(group.items ?? [])
                            .filter((item) => item.isActive)
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((item) => {
                              const alreadyHasRecipe = addOnRecipeSet.has(
                                item.productAddOnItemID,
                              );
                              return (
                                <TargetCard
                                  key={item.productAddOnItemID}
                                  selected={selectedTargets.some(
                                    (t) =>
                                      t.type === "addon" &&
                                      t.addOnItemId === item.productAddOnItemID,
                                  )}
                                  hasRecipe={alreadyHasRecipe}
                                  disabled={alreadyHasRecipe}
                                  icon={
                                    <ExtensionOutlined
                                      style={{
                                        fontSize: 20,
                                        color: "var(--purple-11)",
                                      }}
                                    />
                                  }
                                  title={item.name}
                                  subtitle={`Add-on · +₱${item.additionalPrice.toFixed(2)}`}
                                  onClick={() =>
                                    toggleTarget({
                                      type: "addon",
                                      productId: selectedProduct.productID,
                                      productName: selectedProduct.name,
                                      addOnItemId: item.productAddOnItemID,
                                      addOnItemName: item.name,
                                    })
                                  }
                                />
                              );
                            })}
                        </Flex>
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </Flex>
          )}

          <Separator size="4" mt="4" mb="3" />

          <Flex justify="between" align="center">
            <Button variant="soft" color="gray" onClick={handleBack}>
              <ArrowLeftIcon />
              Back
            </Button>
            <Button
              disabled={selectedTargets.length === 0 || loadingStep2}
              onClick={handleContinueToStep3}
            >
              Continue{selectedTargets.length > 0 ? ` (${selectedTargets.length})` : ""}
              <ArrowRightIcon />
            </Button>
          </Flex>
        </Card>
      )}

      {/* ── Step 3: Ingredient form(s) ────────────────────────────────────────── */}
      {step === 3 && targetQueue.length > 0 && (
        <Box>
          <Box mb="3">
            <Button variant="ghost" color="gray" size="2" onClick={handleBack}>
              <ArrowLeftIcon />
              Back
            </Button>
          </Box>

          {targetQueue.length > 1 ? (
            /* ── Multi-target: tabbed draft forms ── */
            <>
              {/* Progress summary */}
              <Box mb="3">
                <Callout.Root
                  color={savedCount === targetQueue.length ? "green" : "blue"}
                  variant="soft"
                  size="1"
                >
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <strong>
                      {savedCount} of {targetQueue.length}
                    </strong>{" "}
                    targets have ingredients saved.
                    {savedCount < targetQueue.length &&
                      " Fill each tab and click Save, then click Create All Recipes."}
                    {savedCount === targetQueue.length && " Ready to create all recipes."}
                  </Callout.Text>
                </Callout.Root>
              </Box>

              {/* Tabs */}
              <Tabs.Root
                value={String(activeTabIndex)}
                onValueChange={(v) => setActiveTabIndex(Number(v))}
              >
                <Tabs.List mb="4" style={{ flexWrap: "wrap" }}>
                  {targetQueue.map((t, i) => (
                    <Tabs.Trigger key={i} value={String(i)}>
                      {getTargetLabel(t)}
                      {perTargetDrafts[i] !== null ? (
                        <Badge
                          color="green"
                          variant="soft"
                          size="1"
                          style={{ marginLeft: 4 }}
                        >
                          ✓
                        </Badge>
                      ) : submitAttempted ? (
                        <Badge
                          color="red"
                          variant="soft"
                          size="1"
                          style={{ marginLeft: 4 }}
                        >
                          !
                        </Badge>
                      ) : null}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* Only the active tab's form is rendered (key forces remount on tab switch) */}
                <RecipeForm
                  key={activeTabIndex}
                  onSubmit={handleSaveDraft}
                  submitLoading={false}
                  resetForm={resetForm}
                  isEdit={false}
                  isInDialog={false}
                  ingredients={ingredients}
                  units={units}
                  recipeTarget={targetQueue[activeTabIndex]}
                  initialValues={
                    perTargetDrafts[activeTabIndex] ?? {
                      menuItemProductID: targetQueue[activeTabIndex]?.productId,
                    }
                  }
                  submitLabel={`Save for "${getTargetLabel(targetQueue[activeTabIndex])}"`}
                />
              </Tabs.Root>

              {/* Final submit */}
              <Separator size="4" mt="4" mb="3" />
              <Flex justify="between" align="center">
                <Text size="2" color="gray">
                  {savedCount} of {targetQueue.length} targets ready
                </Text>
                <Button
                  disabled={loading}
                  onClick={handleFinalSubmit}
                >
                  {loading ? <Spinner size="1" /> : <CheckIcon />}
                  Create All Recipes ({targetQueue.length})
                </Button>
              </Flex>
            </>
          ) : (
            /* ── Single target: direct create ── */
            <RecipeForm
              key={0}
              onSubmit={handleSingleTargetSubmit}
              submitLoading={
                isStep3Loading || getIngredients.loading || unitData.loading
              }
              resetForm={resetForm}
              isEdit={false}
              isInDialog={false}
              ingredients={ingredients}
              units={units}
              recipeTarget={targetQueue[0]}
              initialValues={{ menuItemProductID: targetQueue[0]?.productId }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

// ── TargetCard sub-component ───────────────────────────────────────────────────

interface TargetCardProps {
  selected: boolean;
  hasRecipe: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const TargetCard: React.FC<TargetCardProps> = ({
  selected,
  hasRecipe,
  disabled,
  icon,
  title,
  subtitle,
  onClick,
}) => (
  <Box
    px="3"
    py="2"
    onClick={disabled ? undefined : onClick}
    style={{
      borderRadius: "var(--radius-3)",
      border: selected
        ? "2px solid var(--accent-9)"
        : "1px solid var(--gray-a5)",
      background: disabled
        ? "var(--gray-a2)"
        : selected
          ? "var(--accent-a3)"
          : "var(--color-panel-solid)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.12s ease",
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <Flex align="center" gap="3">
      <Box
        style={{
          color: disabled
            ? "var(--gray-8)"
            : selected
              ? "var(--accent-11)"
              : "var(--gray-9)",
        }}
      >
        {selected ? (
          <CheckBoxOutlined style={{ fontSize: 20 }} />
        ) : (
          <CheckBoxOutlineBlankOutlined style={{ fontSize: 20 }} />
        )}
      </Box>
      <Box style={{ flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>{icon}</Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="2"
          weight={selected ? "bold" : "medium"}
          as="div"
          color={disabled ? "gray" : undefined}
        >
          {title}
        </Text>
        <Text size="1" color="gray" as="div">
          {subtitle}
        </Text>
      </Box>
      {hasRecipe && (
        <Flex align="center" gap="1">
          <CheckCircleOutlineOutlined
            style={{ fontSize: 14, color: "var(--amber-10)" }}
          />
          <Badge color="amber" variant="soft" size="1">
            Has Recipe
          </Badge>
        </Flex>
      )}
    </Flex>
  </Box>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildRecipeItems(data: RecipeFormType) {
  return (data.recipeItems ?? []).map((item) => ({
    ingredientProductID: item.ingredientProductID,
    quantityRequired: Number(item.quantityRequired),
    unitID: item.unitID,
    displayOrder: Number(item.displayOrder),
    notes: item.notes ?? null,
  }));
}

function getTargetLabel(t: RecipeTarget): string {
  if (t.type === "base") return "Base Recipe";
  if (t.type === "variant") return t.variantName;
  return t.addOnItemName;
}

function targetsMatch(a: RecipeTarget, b: RecipeTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "base" && b.type === "base") return a.productId === b.productId;
  if (a.type === "variant" && b.type === "variant")
    return a.variantId === b.variantId;
  if (a.type === "addon" && b.type === "addon")
    return a.addOnItemId === b.addOnItemId;
  return false;
}

function extractErrorMessage(data: {
  message?: string | null;
  errors?: unknown;
}): string {
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message?: unknown }).message);
    }
  }
  return data.message ?? "Failed to create recipe";
}

function extractAxiosErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (Array.isArray(error) && error.length > 0) {
    const first = error[0];
    if (typeof first === "string") return first;
  }
  const maybeAxios = error as {
    response?: { data?: { message?: string | null; errors?: unknown } };
  };
  if (maybeAxios.response?.data) {
    return extractErrorMessage(maybeAxios.response.data);
  }
  return null;
}
