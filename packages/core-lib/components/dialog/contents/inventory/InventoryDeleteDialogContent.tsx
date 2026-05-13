import {
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { InventoryDto } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";

export const InventoryDeleteDialogContent: React.FC<{
  inventory: InventoryDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ inventory, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const deleteCb = useApiCallback(
    async (api, id: string) => await api.commons.softDeleteInventory(id),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteCb.execute(inventory.inventoryID);
      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast("Inventory deleted successfully", "success");
        onSuccess();
        onClose();
        return;
      }

      const errMessage =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to delete inventory";
      showToast(errMessage, "error");
    } catch (error) {
      console.error("Error deleting inventory:", error);
      showToast("Failed to delete inventory", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Are you sure you want to delete this inventory record?
      </Typography>

      <Box
        sx={{
          p: 2,
          mb: 3,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {inventory.productName ?? "Unnamed Inventory"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {inventory.inventoryID}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, 0.04),
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <InfoOutlined color="info" sx={{ fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          This is a <strong>soft delete</strong>. The inventory will be marked
          inactive, but its full stock-movement history is preserved for audit.
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          loading={deleteCb.loading}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
};
