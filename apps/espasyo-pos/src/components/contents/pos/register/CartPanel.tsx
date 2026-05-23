import React, { useRef, useState } from "react";
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
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  ReceiptLongOutlined,
  DeleteSweepOutlined,
  PercentOutlined,
  ArrowForwardOutlined,
  LocalCafeOutlined,
  DeleteOutlined,
  LanguageOutlined,
} from "@mui/icons-material";
import { usePublicSettings } from "core-lib/core/contexts";
import { formatCurrency } from "../format";
import { CartLine, CartTotals, UseCartState } from "./hooks";
import { TargetSalesIndicator } from "./TargetSalesIndicator";

interface Props {
  state: UseCartState;
  totals: CartTotals;
  onClear: () => void;
  onCharge: () => void;
  submitting?: boolean;
  orderSource: 'store' | 'online';
  onOrderSourceChange: (source: 'store' | 'online') => void;
  targetSalesEnabled?: boolean;
  targetSalesCurrentAmount?: number;
  targetSalesTargetAmount?: number;
  targetSalesProgressPct?: number;
  targetSalesReached?: boolean;
}

export const CartPanel: React.FC<Props> = ({
  state,
  totals,
  onClear,
  onCharge,
  submitting,
  orderSource,
  onOrderSourceChange,
  targetSalesEnabled,
  targetSalesCurrentAmount,
  targetSalesTargetAmount,
  targetSalesProgressPct,
  targetSalesReached,
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
            orderSource === 'store'
              ? "linear-gradient(180deg, var(--color-panel-solid) 0%, var(--gray-a2) 100%)"
              : "linear-gradient(180deg, var(--teal-a2) 0%, var(--cyan-a2) 100%)",
          transition: "background 0.2s ease",
        }}
      >
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <OrderSourceTabs
            source={orderSource}
            onSourceChange={onOrderSourceChange}
          />
          <Box>
            <Heading size="3" weight="bold" style={{ lineHeight: 1.1, color: orderSource === 'online' ? 'var(--teal-11)' : 'var(--gray-12)' }}>
              {orderSource === 'store' ? 'Order' : 'Online Orders'}
            </Heading>
            {orderSource === 'store' && (
              <Text size="1" color="gray">
                {hasLines
                  ? `${state.lines.length} ${state.lines.length === 1 ? "line" : "lines"} · ${itemUnits} ${itemUnits === 1 ? "item" : "items"}`
                  : "No items yet"}
              </Text>
            )}
          </Box>
        </Flex>
        {orderSource === 'store' && hasLines && (
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
        {orderSource === 'store' ? (
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
              <Flex direction="column" p="3" gap="1">
                {state.lines.map((line) => (
                  <CartRow
                    key={line.lineId}
                    line={line}
                    currencyCode={currencyCode}
                    allowDiscounts={pos.allowDiscounts}
                    onQuantity={(q) => state.setLineQuantity(line.lineId, q)}
                    onDiscount={(d) => state.setLineDiscount(line.lineId, d)}
                    onRemove={() => state.removeLine(line.lineId)}
                  />
                ))}
              </Flex>
            )}
          </ScrollArea>
        ) : (
          <OnlineOrdersPanel />
        )}
      </Box>

      {orderSource === 'store' && (
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

        {orderSource === 'store' && targetSalesEnabled && (
          <Box px="3" pb="2">
            <TargetSalesIndicator
              currentAmount={targetSalesCurrentAmount ?? 0}
              targetAmount={targetSalesTargetAmount ?? 0}
              progressPct={targetSalesProgressPct ?? 0}
              reached={targetSalesReached ?? false}
              currencyCode={currencyCode}
              loading={false}
            />
          </Box>
        )}

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
      )}
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

const OrderSourceTabs: React.FC<{
  source: 'store' | 'online';
  onSourceChange: (source: 'store' | 'online') => void;
}> = ({ source, onSourceChange }) => (
  <Flex
    align="center"
    gap="1"
    style={{
      border: "1px solid var(--gray-a4)",
      borderRadius: 999,
      padding: 3,
      background: "var(--gray-a2)",
      width: "fit-content",
    }}
  >
    <button
      type="button"
      onClick={() => onSourceChange('store')}
      style={{
        borderRadius: 999,
        padding: "6px 16px",
        border: "none",
        background: source === 'store' ? 'linear-gradient(135deg, var(--indigo-9), var(--violet-9))' : 'transparent',
        color: source === 'store' ? 'white' : 'var(--gray-11)',
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s ease",
        boxShadow: source === 'store' ? "0 2px 6px rgba(79, 70, 229, 0.3)" : "none",
      }}
      onMouseEnter={(e) => {
        if (source !== 'store') {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-a3)';
        }
      }}
      onMouseLeave={(e) => {
        if (source !== 'store') {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      <ReceiptLongOutlined style={{ fontSize: 16 }} />
      Store
    </button>
    <button
      type="button"
      onClick={() => onSourceChange('online')}
      style={{
        borderRadius: 999,
        padding: "6px 16px",
        border: "none",
        background: source === 'online' ? 'linear-gradient(135deg, var(--teal-9), var(--cyan-9))' : 'transparent',
        color: source === 'online' ? 'white' : 'var(--gray-11)',
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s ease",
        boxShadow: source === 'online' ? "0 2px 6px rgba(13, 148, 136, 0.3)" : "none",
      }}
      onMouseEnter={(e) => {
        if (source !== 'online') {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gray-a3)';
        }
      }}
      onMouseLeave={(e) => {
        if (source !== 'online') {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      <LanguageOutlined style={{ fontSize: 16 }} />
      Online
    </button>
  </Flex>
);

const OnlineOrdersPanel: React.FC = () => (
  <Flex direction="column" style={{ height: "100%", minHeight: 0 }}>
    <Box
      style={{
        borderBottom: "1px solid var(--teal-a4)",
        background: "var(--teal-a2)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Flex align="center" gap="2">
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "var(--teal-9)",
            boxShadow: "0 0 8px var(--teal-9)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <Text size="1" style={{ color: "var(--teal-11)", fontWeight: 500 }}>
          Awaiting orders
        </Text>
      </Flex>
      <IconButton
        variant="ghost"
        color="gray"
        size="1"
        aria-label="Refresh"
        title="Refresh"
      >
        <ReloadIcon width={16} height={16} />
      </IconButton>
    </Box>

    <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1, minHeight: 0 }}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="3"
        style={{
          minHeight: "100%",
          padding: 32,
        }}
      >
        <Box
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--teal-a3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--teal-11)",
          }}
        >
          <LanguageOutlined style={{ fontSize: 36 }} />
        </Box>

        <Box style={{ textAlign: "center" }}>
          <Heading size="3" weight="bold" style={{ color: "var(--gray-12)", marginBottom: 4 }}>
            No online orders yet
          </Heading>
          <Text size="2" color="gray" style={{ maxWidth: 220, lineHeight: 1.5 }}>
            Orders from the Customer Engagement System will appear here in real-time.
          </Text>
        </Box>

        <Box
          style={{
            borderRadius: 999,
            border: "1px solid var(--teal-a6)",
            background: "var(--teal-a2)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--teal-11)",
          }}
        >
          <Box
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--teal-9)",
            }}
          />
          <Text size="1" weight="medium">
            Awaiting Connection
          </Text>
        </Box>
      </Flex>
    </ScrollArea>

    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `}</style>
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
  const [swipeX, setSwipeX] = useState(0);
  const touchAnchorRef = useRef<number | null>(null);
  const mouseAnchorRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchAnchorRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchAnchorRef.current === null) return;
    const delta = e.touches[0].clientX - touchAnchorRef.current;
    setSwipeX(Math.max(-80, Math.min(0, delta)));
  };

  const handleTouchEnd = () => {
    if (swipeX < -55) {
      onRemove();
    } else {
      setSwipeX(0);
    }
    touchAnchorRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseAnchorRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseAnchorRef.current === null) return;
    const delta = e.clientX - mouseAnchorRef.current;
    setSwipeX(Math.max(-80, Math.min(0, delta)));
  };

  const handleMouseUp = () => {
    if (swipeX < -55) {
      onRemove();
    } else {
      setSwipeX(0);
    }
    mouseAnchorRef.current = null;
  };

  return (
    <Box
      p="2"
      style={{
        position: "relative",
        borderRadius: 12,
        background: "var(--color-panel-translucent)",
        border: "1px solid var(--gray-a4)",
        transition: "border-color 0.15s ease",
        overflow: "hidden",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (mouseAnchorRef.current !== null) {
          setSwipeX(0);
          mouseAnchorRef.current = null;
        }
      }}
    >
      {/* Delete reveal layer (behind) */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: Math.abs(swipeX),
          background: "linear-gradient(90deg, var(--red-9), var(--red-10))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.abs(swipeX) / 80,
          transition: swipeX === 0 ? "width 0.15s ease" : "none",
        }}
      >
        <DeleteOutlined style={{ fontSize: 20, color: "white" }} />
      </Box>
      <Flex gap="3" align="start" style={{
        position: "relative",
        transform: `translateX(${swipeX}px)`,
        transition: swipeX === 0 ? "transform 0.15s ease" : "none",
      }}>
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
              <Flex gap="2" align="center" mb="1">
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
                {line.promoLabel && (
                  <Badge color="amber" variant="soft" size="1">
                    🏷️ {line.promoLabel}
                  </Badge>
                )}
              </Flex>
              {line.variantName && (
                <Text size="1" color="indigo" as="div" weight="medium" style={{ marginBottom: 2 }}>
                  {line.variantName}
                </Text>
              )}
              {line.addOnSummary && line.addOnSummary.length > 0 && (
                <Flex direction="column" gap="0" style={{ marginBottom: 2 }}>
                  {line.addOnSummary.map((a, idx) => (
                    <Text key={`${a.productAddOnItemID}-${idx}`} size="1" color="gray" as="div">
                      + {a.itemName}
                      {a.additionalPrice > 0 && (
                        <> ({formatCurrency(a.additionalPrice, currencyCode)})</>
                      )}
                    </Text>
                  ))}
                </Flex>
              )}
              <Text size="1" color="gray" as="div">
                {line.originalPrice && line.originalPrice !== line.unitPrice && (
                  <span style={{ marginRight: 6 }}>
                    <s style={{ color: "var(--gray-8)" }}>
                      {formatCurrency(line.originalPrice, currencyCode)}
                    </s>{" "}
                  </span>
                )}
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
