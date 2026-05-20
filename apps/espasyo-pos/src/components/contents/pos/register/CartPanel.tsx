import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  Cross2Icon,
  PlusIcon,
  MinusIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  ReceiptLongOutlined,
  DeleteSweepOutlined,
  PercentOutlined,
  ArrowForwardOutlined,
  LocalCafeOutlined,
} from "@mui/icons-material";
import { usePublicSettings } from "core-lib/core/contexts";
import { formatCurrency } from "../format";
import { CartLine, CartTotals, UseCartState } from "./hooks";

interface Props {
  state: UseCartState;
  totals: CartTotals;
  onClear: () => void;
  onCharge: () => void;
  submitting?: boolean;
}

export const CartPanel: React.FC<Props> = ({
  state,
  totals,
  onClear,
  onCharge,
  submitting,
}) => {
  const { currencyCode, pos } = usePublicSettings();
  const hasLines = state.lines.length > 0;
  const itemUnits = state.lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        minHeight: 0,
        background: "var(--color-panel-solid)",
        borderRadius: 20,
        border: "1px solid var(--gray-a4)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
      }}
    >
      <Flex
        justify="between"
        align="center"
        p="4"
        style={{
          borderBottom: "1px solid var(--gray-a4)",
          background:
            "linear-gradient(180deg, var(--color-panel-solid) 0%, var(--gray-a2) 100%)",
        }}
      >
        <Flex align="center" gap="2">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--indigo-a3) 0%, var(--violet-a3) 100%)",
              color: "var(--indigo-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ReceiptLongOutlined fontSize="small" />
          </Box>
          <Box>
            <Heading size="3" weight="bold" style={{ lineHeight: 1.1 }}>
              Order
            </Heading>
            <Text size="1" color="gray">
              {hasLines
                ? `${state.lines.length} ${state.lines.length === 1 ? "line" : "lines"} · ${itemUnits} ${itemUnits === 1 ? "item" : "items"}`
                : "No items yet"}
            </Text>
          </Box>
        </Flex>
        {hasLines && (
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            onClick={onClear}
            disabled={submitting}
            aria-label="Clear cart"
            title="Clear cart"
          >
            <DeleteSweepOutlined fontSize="small" />
          </IconButton>
        )}
      </Flex>

      <Box style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea type="auto" scrollbars="vertical" style={{ height: "100%" }}>
          {!hasLines ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="2"
              style={{
                height: "100%",
                minHeight: 260,
                padding: 24,
                opacity: 0.6,
              }}
            >
              <Box
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, var(--indigo-a3) 0%, var(--violet-a3) 100%)",
                  color: "var(--indigo-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <LocalCafeOutlined style={{ fontSize: 36 }} />
              </Box>
              <Text size="3" weight="bold">
                Cart is empty
              </Text>
              <Text size="2" color="gray" align="center" style={{ maxWidth: 220 }}>
                Tap a product on the left to start the order.
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" p="3" gap="2">
              {state.lines.map((line) => (
                <CartRow
                  key={line.productID}
                  line={line}
                  currencyCode={currencyCode}
                  allowDiscounts={pos.allowDiscounts}
                  onQuantity={(q) => state.setLineQuantity(line.productID, q)}
                  onDiscount={(d) => state.setLineDiscount(line.productID, d)}
                  onRemove={() => state.removeLine(line.productID)}
                />
              ))}
            </Flex>
          )}
        </ScrollArea>
      </Box>

      <Box
        style={{
          borderTop: "1px solid var(--gray-a4)",
          padding: 16,
          background:
            "linear-gradient(180deg, var(--gray-a2) 0%, var(--color-panel-solid) 100%)",
        }}
      >
        {pos.allowDiscounts && hasLines && (
          <Flex
            align="center"
            gap="2"
            mb="3"
            p="2"
            style={{
              borderRadius: 10,
              background: "var(--color-panel-solid)",
              border: "1px solid var(--gray-a4)",
            }}
          >
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--amber-a3)",
                color: "var(--amber-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PercentOutlined fontSize="small" />
            </Box>
            <Text size="1" color="gray" style={{ flex: 1 }}>
              Order discount
            </Text>
            <TextField.Root
              size="2"
              type="number"
              min={0}
              step="0.01"
              value={state.orderDiscount === 0 ? "" : String(state.orderDiscount)}
              placeholder="0.00"
              onChange={(e) => {
                const v = e.target.value;
                state.setOrderDiscount(v === "" ? 0 : Number(v));
              }}
              disabled={submitting}
              style={{ width: 110 }}
            />
          </Flex>
        )}

        <Flex direction="column" gap="1" mb="2">
          <TotalRow
            label="Subtotal"
            value={formatCurrency(totals.subtotal, currencyCode)}
          />
          {totals.discountTotal > 0 && (
            <TotalRow
              label="Discount"
              value={`− ${formatCurrency(totals.discountTotal, currencyCode)}`}
              valueColor="green"
            />
          )}
          <TotalRow
            label={`Tax (${(state.taxRate * 100).toFixed(0)}%)`}
            value={formatCurrency(totals.taxAmount, currencyCode)}
          />
        </Flex>

        <Separator size="4" mb="3" style={{ background: "var(--gray-a5)" }} />

        <Flex justify="between" align="baseline" mb="3">
          <Text size="2" weight="bold" color="gray">
            TOTAL
          </Text>
          <Heading
            size="7"
            style={{
              background:
                "linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-11) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            {formatCurrency(totals.totalAmount, currencyCode)}
          </Heading>
        </Flex>

        {!pos.allowSales && (
          <Callout.Root color="red" variant="surface" mb="2" size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Sales are disabled by admin settings.
            </Callout.Text>
          </Callout.Root>
        )}

        <button
          type="button"
          onClick={onCharge}
          disabled={!hasLines || submitting || !pos.allowSales}
          style={{
            width: "100%",
            height: 56,
            border: "none",
            borderRadius: 14,
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor:
              !hasLines || submitting || !pos.allowSales
                ? "not-allowed"
                : "pointer",
            opacity: !hasLines || submitting || !pos.allowSales ? 0.55 : 1,
            background:
              "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 100%)",
            boxShadow:
              !hasLines || submitting || !pos.allowSales
                ? "none"
                : "0 8px 20px var(--indigo-a6)",
            transition: "all 0.16s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
          onMouseEnter={(e) => {
            if (hasLines && !submitting && pos.allowSales) {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 12px 28px var(--indigo-a8)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              !hasLines || submitting || !pos.allowSales
                ? "none"
                : "0 8px 20px var(--indigo-a6)";
          }}
        >
          <span>
            {submitting
              ? "Processing…"
              : `Charge ${formatCurrency(totals.totalAmount, currencyCode)}`}
          </span>
          {!submitting && <ArrowForwardOutlined fontSize="small" />}
        </button>
      </Box>
    </Flex>
  );
};

const TotalRow: React.FC<{
  label: string;
  value: string;
  valueColor?: "green" | "red" | undefined;
}> = ({ label, value, valueColor }) => (
  <Flex justify="between" align="baseline">
    <Text size="2" color="gray">
      {label}
    </Text>
    <Text
      size="2"
      weight="medium"
      style={
        valueColor === "green"
          ? { color: "var(--green-11)" }
          : valueColor === "red"
            ? { color: "var(--red-11)" }
            : undefined
      }
    >
      {value}
    </Text>
  </Flex>
);

const CartRow: React.FC<{
  line: CartLine;
  currencyCode: string;
  allowDiscounts: boolean;
  onQuantity: (q: number) => void;
  onDiscount: (d: number) => void;
  onRemove: () => void;
}> = ({ line, currencyCode, allowDiscounts, onQuantity, onDiscount, onRemove }) => {
  const lineTotal = line.quantity * line.unitPrice - line.discount;
  return (
    <Box
      p="3"
      style={{
        borderRadius: 12,
        background: "var(--color-panel-translucent)",
        border: "1px solid var(--gray-a4)",
        transition: "border-color 0.15s ease",
      }}
    >
      <Flex gap="3" align="start">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, var(--gray-a3) 0%, var(--gray-a4) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gray-9)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {line.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={line.imageUrl}
              alt={line.productName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <LocalCafeOutlined fontSize="small" />
          )}
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex justify="between" align="start" gap="2">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="2"
                weight="medium"
                as="div"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {line.productName}
              </Text>
              <Text size="1" color="gray" as="div">
                {formatCurrency(line.unitPrice, currencyCode)} ·{" "}
                {line.unitName}
              </Text>
            </Box>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={onRemove}
              aria-label="Remove line"
            >
              <Cross2Icon />
            </IconButton>
          </Flex>

          <Flex justify="between" align="center" mt="2" gap="2">
            <Flex
              align="center"
              gap="1"
              style={{
                border: "1px solid var(--gray-a5)",
                borderRadius: 999,
                padding: "1px 3px",
                background: "var(--color-panel-solid)",
              }}
            >
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                onClick={() => onQuantity(line.quantity - 1)}
                aria-label="Decrease quantity"
              >
                <MinusIcon />
              </IconButton>
              <Text
                size="2"
                weight="bold"
                style={{
                  minWidth: 28,
                  textAlign: "center",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {line.quantity}
              </Text>
              <IconButton
                variant="solid"
                color="indigo"
                size="1"
                onClick={() => onQuantity(line.quantity + 1)}
                aria-label="Increase quantity"
                radius="full"
              >
                <PlusIcon />
              </IconButton>
            </Flex>

            <Text
              size="3"
              weight="bold"
              style={{
                color: "var(--indigo-11)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatCurrency(lineTotal, currencyCode)}
            </Text>
          </Flex>

          {allowDiscounts && (
            <Flex align="center" gap="2" mt="2">
              <Badge
                color="amber"
                variant="soft"
                radius="full"
                size="1"
                style={{ flexShrink: 0 }}
              >
                Discount
              </Badge>
              <TextField.Root
                size="1"
                type="number"
                min={0}
                step="0.01"
                value={line.discount === 0 ? "" : String(line.discount)}
                placeholder="0.00"
                variant="soft"
                onChange={(e) => {
                  const v = e.target.value;
                  onDiscount(v === "" ? 0 : Number(v));
                }}
                style={{ flex: 1 }}
              />
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
