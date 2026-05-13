import {
  alpha,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  RemoveShoppingCartOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  InventoryDto,
  InventoryStatus,
} from "../../../../api/commons/types";
import { formatNumber } from "../../../../business/number";

const STATUS_VIEW_CONFIG: Record<
  InventoryStatus,
  {
    label: string;
    color: "success" | "warning" | "error" | "default";
    icon: typeof CheckCircleOutlined;
  }
> = {
  [InventoryStatus.InStock]: {
    label: "In Stock",
    color: "success",
    icon: CheckCircleOutlined,
  },
  [InventoryStatus.LowStock]: {
    label: "Low Stock",
    color: "warning",
    icon: WarningAmberOutlined,
  },
  [InventoryStatus.Critical]: {
    label: "Critical",
    color: "error",
    icon: ErrorOutlineOutlined,
  },
  [InventoryStatus.OutOfStock]: {
    label: "Out of Stock",
    color: "error",
    icon: RemoveShoppingCartOutlined,
  },
};

export const InventoryViewDialogContent: React.FC<{
  inventory: InventoryDto;
}> = ({ inventory }) => {
  const theme = useTheme();
  const status =
    STATUS_VIEW_CONFIG[inventory.status as InventoryStatus] ??
    STATUS_VIEW_CONFIG[InventoryStatus.OutOfStock];
  const StatusIcon = status.icon;
  const unitLabel = inventory.stockUnitName ?? "units";

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Inventory2Outlined />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {inventory.productName ?? "Unnamed Inventory"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Stock Unit: {unitLabel}
              </Typography>
            </Box>
          </Stack>
          <Chip
            icon={<StatusIcon style={{ fontSize: 16 }} />}
            label={status.label}
            color={status.color === "default" ? undefined : status.color}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          <MetricCard
            label="Current Stock"
            value={`${formatNumber(inventory.currentQuantity)} ${unitLabel}`}
            color={theme.palette.primary.main}
          />
          <MetricCard
            label="Reorder Level"
            value={`${formatNumber(inventory.reorderLevel)} ${unitLabel}`}
            color={theme.palette.warning.main}
          />
          <MetricCard
            label="Minimum Level"
            value={`${formatNumber(inventory.minimumStockLevel)} ${unitLabel}`}
            color={theme.palette.error.main}
          />
        </Box>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Inventory ID
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, fontFamily: "monospace" }}
          >
            {inventory.inventoryID}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Linked Product
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, fontFamily: "monospace" }}
          >
            {inventory.productID}
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Created By
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {inventory.createdBy ?? "System"}
            </Typography>
            {inventory.createdAt && (
              <Typography variant="caption" color="text.secondary">
                {new Date(inventory.createdAt).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Last Updated By
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {inventory.updatedBy ?? "—"}
            </Typography>
            {inventory.updatedAt && (
              <Typography variant="caption" color="text.secondary">
                {new Date(inventory.updatedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Tip:</strong> Use <em>Adjust Stock</em> to add or remove
            quantity (every change is audited). Use <em>Edit Thresholds</em> to
            change when this inventory is flagged Low or Critical.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(color, 0.06),
        border: `1px solid ${alpha(color, 0.15)}`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color, mt: 0.5 }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", color: theme.palette.text.disabled }}>
        &nbsp;
      </Typography>
    </Box>
  );
};
