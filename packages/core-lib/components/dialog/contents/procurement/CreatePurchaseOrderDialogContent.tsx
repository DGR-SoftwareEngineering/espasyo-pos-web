import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  IconButton,
  RadioCards,
  Select,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  AddCircleOutlined,
  Close,
  InfoOutlined,
  LocalShippingOutlined,
  StorefrontOutlined,
  AutoAwesomeMosaicOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { useToastContext, usePublicSettings } from "../../../../core/contexts";
import { Button } from "../../../radix/buttons/Button";
import {
  CreatePurchaseOrderItemParams,
  CreatePurchaseOrderParams,
  FulfillmentMethodDto,
  ProductDataList,
  SupplierDto,
  UnitDto,
} from "../../../../api/commons/types";

const PAYMENT_TERMS_PRESETS = [
  "On Receipt",
  "COD",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
];

const formatCurrency = (
  value: number | null | undefined,
  currencyCode: string = "PHP",
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

interface DraftLine {
  id: string;
  productID: string;
  unitID: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  notes: string;
}

const nextId = (() => {
  let n = 0;
  return () => `line-${++n}`;
})();

const emptyLine = (): DraftLine => ({
  id: nextId(),
  productID: "",
  unitID: "",
  quantity: "1",
  unitPrice: "0",
  discount: "",
  notes: "",
});

export const CreatePurchaseOrderDialogContent: React.FC<{
  onSuccess: (purchaseOrderID: string) => void;
  onClose: () => void;
  prefillItems?: Array<{ productID: string; productName: string; quantity: number }>;
}> = ({ onSuccess, onClose, prefillItems }) => {
  const { showToast } = useToastContext();
  const { procurement, currencyCode } = usePublicSettings();

  const [supplierID, setSupplierID] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethodDto>(
      (procurement.defaultFulfillmentMethod as FulfillmentMethodDto) ||
        FulfillmentMethodDto.Delivery,
    );
  const [expectedDate, setExpectedDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    procurement.defaultPaymentTerms,
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(() => {
    if (prefillItems && prefillItems.length > 0) {
      return prefillItems.map((item) => ({
        ...emptyLine(),
        productID: item.productID,
        quantity: String(item.quantity),
        notes: "Auto-filled from promo feasibility check",
      }));
    }
    return [emptyLine()];
  });

  const suppliersApi = useApi((api) => api.commons.supplierList(1, 200));
  const productsApi = useApi((api) => api.commons.productList());
  const unitsApi = useApi((api) => api.commons.unitList());
  const createCb = useApiCallback(
    async (api, args: CreatePurchaseOrderParams) =>
      await api.commons.createPurchaseOrder(args),
  );

  const units: UnitDto[] = useMemo(
    () =>
      Array.isArray(unitsApi.result?.data?.response)
        ? unitsApi.result.data.response.filter((u) => u.isActive)
        : [],
    [unitsApi.result],
  );

  const suppliers: SupplierDto[] = useMemo(
    () => suppliersApi.result?.data?.response?.items ?? [],
    [suppliersApi.result],
  );
  const products: ProductDataList[] = useMemo(
    () =>
      Array.isArray(productsApi.result?.data?.response)
        ? productsApi.result.data.response.filter((p) => p.isActive)
        : [],
    [productsApi.result],
  );

  const productMap = useMemo(() => {
    const m = new Map<string, ProductDataList>();
    products.forEach((p) => m.set(p.productID, p));
    return m;
  }, [products]);

  const handleLineProduct = (lineId: string, productID: string) => {
    const product = productMap.get(productID);
    const resolvedUnitID =
      product?.purchaseUnitID ?? product?.stockUnitID ?? "";
    const resolvedUnitPrice = product
      ? String(product.costPrice ?? product.unitPrice ?? 0)
      : "0";

    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? {
              ...line,
              productID,
              unitID: resolvedUnitID,
              unitPrice: resolvedUnitPrice,
            }
          : line,
      ),
    );
  };

  const setLineField = (
    lineId: string,
    field: keyof Omit<DraftLine, "id">,
    value: string,
  ) =>
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line,
      ),
    );

  const removeLine = (lineId: string) =>
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((line) => line.id !== lineId),
    );

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const lineTotal = (line: DraftLine): number => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unitPrice) || 0;
    const disc = Number(line.discount) || 0;
    return Math.max(0, qty * price - disc);
  };

  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const tax = Number(taxAmount) || 0;
  const discount = Number(discountAmount) || 0;
  const shipping = Number(shippingFee) || 0;
  const total = Math.max(0, subtotal + tax + shipping - discount);

  const handleSubmit = async () => {
    if (!supplierID) {
      showToast("Select a supplier", "error");
      return;
    }
    if (
      fulfillmentMethod === FulfillmentMethodDto.Delivery &&
      !deliveryAddress.trim()
    ) {
      showToast(
        "Delivery address is required when fulfillment is Delivery",
        "error",
      );
      return;
    }
    if (lines.length === 0) {
      showToast("Add at least one line item", "error");
      return;
    }
    const items: CreatePurchaseOrderItemParams[] = [];
    for (const line of lines) {
      if (!line.productID) {
        showToast("Every line needs a product", "error");
        return;
      }
      if (!line.unitID) {
        showToast("Every line needs a unit", "error");
        return;
      }
      const qty = Number(line.quantity);
      const price = Number(line.unitPrice);
      if (!Number.isFinite(qty) || qty <= 0) {
        showToast("Quantity must be a positive number", "error");
        return;
      }
      if (!Number.isFinite(price) || price < 0) {
        showToast("Unit price must be a non-negative number", "error");
        return;
      }
      items.push({
        productID: line.productID,
        quantity: qty,
        unitID: line.unitID,
        unitPrice: price,
        discount: line.discount ? Number(line.discount) : undefined,
        notes: line.notes.trim() || undefined,
      });
    }

    const payload: CreatePurchaseOrderParams = {
      supplierID,
      fulfillmentMethod,
      expectedDate: expectedDate || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      currencyCode,
      taxAmount: tax || undefined,
      discountAmount: discount || undefined,
      shippingFee: shipping || undefined,
      notes: notes.trim() || undefined,
      deliveryAddress:
        fulfillmentMethod === FulfillmentMethodDto.Delivery
          ? deliveryAddress.trim()
          : undefined,
      items,
    };

    try {
      const result = await createCb.execute(payload);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data?.success &&
        result.data.response
      ) {
        showToast(
          `Purchase order ${result.data.response.orderNumber} created`,
          "success",
        );
        onSuccess(result.data.response.purchaseOrderID);
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data?.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data?.message ??
        "Failed to create purchase order";
      showToast(message, "error");
    } catch (error) {
      console.error("PO create error:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to create purchase order";
      showToast(first, "error");
    }
  };

  return (
    <Box p="2">
      <Flex align="center" gap="3" wrap="wrap" mb="3">
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-3)",
            background: "var(--teal-a3)",
            color: "var(--teal-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AutoAwesomeMosaicOutlined fontSize="medium" />
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="2" color="gray">
            Compose line items, set fulfillment, and submit to the supplier.
          </Text>
        </Box>
      </Flex>

      <Flex direction="column" gap="4">
        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Supplier
            </Text>
            <Select.Root
              value={supplierID}
              onValueChange={(v) => {
                setSupplierID(v);
                const supplier = suppliers.find((s) => s.supplierID === v);
                if (supplier?.paymentTerms) {
                  setPaymentTerms(supplier.paymentTerms);
                }
                if (
                  fulfillmentMethod === FulfillmentMethodDto.Delivery &&
                  supplier?.address &&
                  !deliveryAddress.trim()
                ) {
                  setDeliveryAddress(supplier.address);
                }
              }}
              size="3"
            >
              <Select.Trigger
                placeholder="Pick a supplier"
                variant="surface"
                style={{ width: "100%" }}
              />
              <Select.Content>
                {suppliers.length === 0 ? (
                  <Select.Item value="__empty" disabled>
                    No suppliers found
                  </Select.Item>
                ) : (
                  suppliers.map((s) => (
                    <Select.Item key={s.supplierID} value={s.supplierID}>
                      {s.companyName}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Expected date
            </Text>
            <TextField.Root
              size="3"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <Text size="2" weight="medium" as="div" mb="2">
            Fulfillment
          </Text>
          <RadioCards.Root
            value={String(fulfillmentMethod)}
            onValueChange={(v) =>
              setFulfillmentMethod(Number(v) as FulfillmentMethodDto)
            }
            columns={{ initial: "1", sm: "2" }}
            gap="2"
          >
            <RadioCards.Item value={String(FulfillmentMethodDto.Delivery)}>
              <Flex direction="column" gap="1" width="100%">
                <Flex align="center" gap="2">
                  <LocalShippingOutlined fontSize="small" />
                  <Text weight="medium">Delivery</Text>
                </Flex>
                <Text size="1" color="gray">
                  Supplier ships the goods to our address.
                </Text>
              </Flex>
            </RadioCards.Item>
            <RadioCards.Item value={String(FulfillmentMethodDto.Pickup)}>
              <Flex direction="column" gap="1" width="100%">
                <Flex align="center" gap="2">
                  <StorefrontOutlined fontSize="small" />
                  <Text weight="medium">Pickup</Text>
                </Flex>
                <Text size="1" color="gray">
                  We pick up the goods from the supplier.
                </Text>
              </Flex>
            </RadioCards.Item>
          </RadioCards.Root>
        </Box>

        {fulfillmentMethod === FulfillmentMethodDto.Delivery && (
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Delivery address
            </Text>
            <TextArea
              value={deliveryAddress}
              rows={2}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="123 Main St, Quezon City…"
            />
          </Box>
        )}

        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Payment terms
          </Text>
          <Flex gap="2" wrap="wrap" mb="2">
            {PAYMENT_TERMS_PRESETS.map((preset) => (
              <Badge
                key={preset}
                color={paymentTerms === preset ? "indigo" : "gray"}
                variant={paymentTerms === preset ? "solid" : "soft"}
                radius="full"
                onClick={() => setPaymentTerms(preset)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                {preset}
              </Badge>
            ))}
          </Flex>
          <TextField.Root
            size="2"
            value={paymentTerms}
            placeholder="Net 30"
            onChange={(e) => setPaymentTerms(e.target.value)}
          />
        </Box>

        <Separator size="4" />

        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Heading size="3">Line items</Heading>
          <Button type="Secondary" onClick={addLine}>
            <Flex align="center" gap="2">
              <AddCircleOutlined fontSize="small" /> Add line
            </Flex>
          </Button>
        </Flex>

        <Flex direction="column" gap="2">
          {lines.map((line, idx) => {
            const product = productMap.get(line.productID);
            return (
              <Box
                key={line.id}
                p="3"
                style={{
                  borderRadius: "var(--radius-3)",
                  border: "1px solid var(--gray-a4)",
                  background: "var(--gray-a2)",
                }}
              >
                <Flex
                  align="center"
                  justify="between"
                  mb="2"
                  wrap="wrap"
                  gap="2"
                >
                  <Text size="2" weight="medium">
                    Line #{idx + 1}
                  </Text>
                  <Flex align="center" gap="3">
                    <Text size="2" weight="bold">
                      {formatCurrency(lineTotal(line), currencyCode)}
                    </Text>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      aria-label="Remove line"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Flex>
                </Flex>
                <Flex direction="column" gap="2">
                  <Box>
                    <Text size="1" color="gray" as="div" mb="1">
                      Product
                    </Text>
                    <Select.Root
                      value={line.productID}
                      onValueChange={(v) => handleLineProduct(line.id, v)}
                    >
                      <Select.Trigger
                        placeholder="Pick a product"
                        variant="surface"
                        style={{ width: "100%" }}
                      />
                      <Select.Content>
                        {products.length === 0 ? (
                          <Select.Item value="__empty" disabled>
                            No products available
                          </Select.Item>
                        ) : (
                          products.map((p) => (
                            <Select.Item key={p.productID} value={p.productID}>
                              {p.name}
                              {p.productCategoryName
                                ? ` · ${p.productCategoryName}`
                                : ""}
                            </Select.Item>
                          ))
                        )}
                      </Select.Content>
                    </Select.Root>
                    {product && product.costPrice != null && (
                      <Text size="1" color="gray" as="div" mt="1">
                        Listed cost:{" "}
                        {formatCurrency(product.costPrice, currencyCode)}
                      </Text>
                    )}
                  </Box>
                  <Flex direction={{ initial: "column", sm: "row" }} gap="2">
                    <Box style={{ flex: 1 }}>
                      <Text size="1" color="gray" as="div" mb="1">
                        Quantity
                      </Text>
                      <TextField.Root
                        size="2"
                        type="number"
                        min={0}
                        step="any"
                        value={line.quantity}
                        onChange={(e) =>
                          setLineField(line.id, "quantity", e.target.value)
                        }
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="1" color="gray" as="div" mb="1">
                        Unit
                      </Text>
                      <Select.Root
                        size="2"
                        value={line.unitID}
                        onValueChange={(v) =>
                          setLineField(line.id, "unitID", v)
                        }
                      >
                        <Select.Trigger
                          placeholder="Pick a unit"
                          variant="surface"
                          style={{ width: "100%" }}
                        />
                        <Select.Content>
                          {units.length === 0 ? (
                            <Select.Item value="__empty" disabled>
                              No units available
                            </Select.Item>
                          ) : (
                            units.map((u) => (
                              <Select.Item key={u.unitID} value={u.unitID}>
                                {u.name}
                              </Select.Item>
                            ))
                          )}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="1" color="gray" as="div" mb="1">
                        Unit price
                      </Text>
                      <TextField.Root
                        size="2"
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          setLineField(line.id, "unitPrice", e.target.value)
                        }
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="1" color="gray" as="div" mb="1">
                        Discount
                      </Text>
                      <TextField.Root
                        size="2"
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.discount}
                        placeholder="0"
                        onChange={(e) =>
                          setLineField(line.id, "discount", e.target.value)
                        }
                      />
                    </Box>
                  </Flex>
                  <Box>
                    <Text size="1" color="gray" as="div" mb="1">
                      Notes (optional)
                    </Text>
                    <TextField.Root
                      size="2"
                      value={line.notes}
                      onChange={(e) =>
                        setLineField(line.id, "notes", e.target.value)
                      }
                      placeholder="e.g. Brand X preferred"
                    />
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </Flex>

        <Separator size="4" />

        <Heading size="3">Charges + totals</Heading>
        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Tax
            </Text>
            <TextField.Root
              size="3"
              type="number"
              min={0}
              step="0.01"
              value={taxAmount}
              placeholder="0"
              onChange={(e) => setTaxAmount(e.target.value)}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              Shipping
            </Text>
            <TextField.Root
              size="3"
              type="number"
              min={0}
              step="0.01"
              value={shippingFee}
              placeholder="0"
              onChange={(e) => setShippingFee(e.target.value)}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" as="div" mb="1">
              PO-level discount
            </Text>
            <TextField.Root
              size="3"
              type="number"
              min={0}
              step="0.01"
              value={discountAmount}
              placeholder="0"
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
          </Box>
        </Flex>

        <Box>
          <Text size="2" weight="medium" as="div" mb="1">
            Notes
          </Text>
          <TextArea
            value={notes}
            rows={2}
            placeholder="Anything the receiving team should know…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>

        <Box
          p="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: "var(--accent-a2)",
            border: "1px solid var(--accent-a4)",
          }}
        >
          <Flex justify="between" align="center" mb="1">
            <Text size="2" color="gray">
              Subtotal
            </Text>
            <Text size="2" weight="medium">
              {formatCurrency(subtotal, currencyCode)}
            </Text>
          </Flex>
          {tax > 0 && (
            <Flex justify="between" mb="1">
              <Text size="2" color="gray">
                + Tax
              </Text>
              <Text size="2">{formatCurrency(tax, currencyCode)}</Text>
            </Flex>
          )}
          {shipping > 0 && (
            <Flex justify="between" mb="1">
              <Text size="2" color="gray">
                + Shipping
              </Text>
              <Text size="2">{formatCurrency(shipping, currencyCode)}</Text>
            </Flex>
          )}
          {discount > 0 && (
            <Flex justify="between" mb="1">
              <Text size="2" color="gray">
                − Discount
              </Text>
              <Text size="2">{formatCurrency(discount, currencyCode)}</Text>
            </Flex>
          )}
          <Separator size="4" my="2" />
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              Total
            </Text>
            <Heading size="5">{formatCurrency(total, currencyCode)}</Heading>
          </Flex>
        </Box>

        {procurement.requireApproval && (
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <InfoOutlined fontSize="small" />
            </Callout.Icon>
            <Callout.Text>
              Approvals are enabled in settings. Submitting will move the PO to{" "}
              <strong>Submitted</strong>; an admin must approve before receiving
              is possible.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" disabled={createCb.loading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="Primary"
          onClick={handleSubmit}
          loading={createCb.loading}
          disabled={createCb.loading}
        >
          Create draft
        </Button>
      </Flex>
    </Box>
  );
};
