import { useEffect, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  HelpOutlineRounded,
  ReceiptLongOutlined,
  RefreshOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  RemoveShoppingCartOutlined,
  AddCircleOutline,
  AutorenewOutlined,
  DeleteSweepOutlined,
  AssignmentReturnedOutlined,
  SwapHorizOutlined,
  Inventory2Outlined,
  RestaurantMenuOutlined,
} from "@mui/icons-material";
import {
  InventoryDto,
  StockMovementDto,
  StockMovementType,
} from "../../../../api/commons/types";
import { formatNumber } from "../../../../business/number";
import { formatDateTime } from "../../../../business/dates";
import { useApiCallback } from "../../../../core/hooks";

const MOVEMENT_CONFIG: Record<
  StockMovementType,
  {
    label: string;
    color: "primary" | "info" | "success" | "warning" | "error" | "secondary";
    icon: typeof CheckCircleOutlined;
  }
> = {
  [StockMovementType.Sale]: {
    label: "Sale",
    color: "primary",
    icon: RestaurantMenuOutlined,
  },
  [StockMovementType.Return]: {
    label: "Return",
    color: "info",
    icon: AssignmentReturnedOutlined,
  },
  [StockMovementType.Received]: {
    label: "Received",
    color: "success",
    icon: AddCircleOutline,
  },
  [StockMovementType.Wastage]: {
    label: "Wastage",
    color: "error",
    icon: DeleteSweepOutlined,
  },
  [StockMovementType.Adjustment]: {
    label: "Adjustment",
    color: "warning",
    icon: AutorenewOutlined,
  },
  [StockMovementType.Transfer]: {
    label: "Transfer",
    color: "secondary",
    icon: SwapHorizOutlined,
  },
  [StockMovementType.Production]: {
    label: "Production",
    color: "info",
    icon: Inventory2Outlined,
  },
};

const STATUS_BANNER = {
  1: {
    label: "In Stock",
    color: "success" as const,
    icon: CheckCircleOutlined,
  },
  2: {
    label: "Low Stock",
    color: "warning" as const,
    icon: WarningAmberOutlined,
  },
  3: {
    label: "Critical",
    color: "error" as const,
    icon: ErrorOutlineOutlined,
  },
  4: {
    label: "Out of Stock",
    color: "error" as const,
    icon: RemoveShoppingCartOutlined,
  },
};

export const MovementHistoryDialogContent: React.FC<{
  inventory: InventoryDto;
}> = ({ inventory }) => {
  const theme = useTheme();
  const [items, setItems] = useState<StockMovementDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pagedMeta, setPagedMeta] = useState({
    hasNextPage: false,
    totalItems: 0,
  });

  const fetchCb = useApiCallback(
    async (
      api,
      args: { inventoryId: string; pageNumber: number; pageSize: number },
    ) =>
      await api.commons.stockMovementByInventory(
        args.inventoryId,
        args.pageNumber,
        args.pageSize,
      ),
  );

  const load = async (page: number = 1) => {
    try {
      const res = await fetchCb.execute({
        inventoryId: inventory.inventoryID,
        pageNumber: page,
        pageSize: 10,
      });
      const data = res.data.response;
      if (!data) return;
      setItems(page === 1 ? data.items : [...items, ...data.items]);
      setPagedMeta({
        hasNextPage: data.hasNextPage,
        totalItems: data.totalItems,
      });
      setPageNumber(data.pageNumber);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory.inventoryID]);

  const status =
    STATUS_BANNER[inventory.status as keyof typeof STATUS_BANNER] ??
    STATUS_BANNER[4];
  const StatusIcon = status.icon;
  const unitLabel = inventory.stockUnitName ?? "units";

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ReceiptLongOutlined color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {inventory.productName ?? "Inventory"} — Movement History
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current: {formatNumber(inventory.currentQuantity)} {unitLabel} ·
              Total movements: {pagedMeta.totalItems}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<StatusIcon style={{ fontSize: 16 }} />}
            label={status.label}
            color={status.color}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={() => load(1)}
            disabled={fetchCb.loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {fetchCb.loading && items.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="body2">
            No movements recorded yet for this inventory.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 15,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: alpha(theme.palette.divider, 0.5),
            },
          }}
        >
          {items.map((m) => {
            const cfg =
              MOVEMENT_CONFIG[m.movementType as StockMovementType] ?? {
                label: m.movementTypeName ?? "Unknown",
                color: "secondary" as const,
                icon: HelpOutlineRounded,
              };
            const IconCmp = cfg.icon;
            const isIn = m.quantity > 0;
            const arrowColor = isIn
              ? theme.palette.success.main
              : theme.palette.error.main;

            return (
              <Stack
                key={m.stockMovementID}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{ pb: 2, position: "relative", pl: 5 }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 4,
                    top: 4,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: theme.palette.background.paper,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCmp
                    style={{
                      fontSize: 14,
                      color: theme.palette.primary.main,
                    }}
                  />
                </Box>
                <Box
                  flex={1}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={cfg.label}
                        size="small"
                        color={cfg.color}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {isIn ? (
                          <ArrowUpwardRounded
                            style={{ fontSize: 14, color: arrowColor }}
                          />
                        ) : (
                          <ArrowDownwardRounded
                            style={{ fontSize: 14, color: arrowColor }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: arrowColor }}
                        >
                          {isIn ? "+" : ""}
                          {formatNumber(m.quantity)} {m.unitName ?? unitLabel}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Balance: {formatNumber(m.balanceAfter)}
                    </Typography>
                  </Stack>
                  {m.reason && (
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mt: 0.5 }}
                    >
                      {m.reason}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {formatDateTime(m.createdAt)} · by {m.createdBy ?? "system"}
                    {m.referenceType ? ` · ${m.referenceType}` : ""}
                  </Typography>
                </Box>
              </Stack>
            );
          })}

          {pagedMeta.hasNextPage && (
            <Box sx={{ textAlign: "center", py: 1 }}>
              <Button
                size="small"
                onClick={() => load(pageNumber + 1)}
                disabled={fetchCb.loading}
              >
                {fetchCb.loading ? "Loading…" : "Load More"}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
