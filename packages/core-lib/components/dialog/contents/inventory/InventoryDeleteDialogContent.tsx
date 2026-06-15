import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { InfoOutlined, WarningAmberOutlined } from "@mui/icons-material";
import { InventoryDto } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback, useCriticalDeleteGuard } from "../../../../core/hooks";
import { AdminConfirmDialog } from "../../../radix/security/AdminConfirmDialog";

export const InventoryDeleteDialogContent: React.FC<{
  inventory: InventoryDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ inventory, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();
  const { showAdminConfirm, setShowAdminConfirm, openAdminConfirm, adminConfirmError, setAdminConfirmError, forceLoading, setForceLoading } =
    useCriticalDeleteGuard();

  const checkUsage = useApi((api) =>
    api.commons.checkInventoryCriticalUsage(inventory.inventoryID),
  );
  const usageData = checkUsage.result?.data?.response ?? null;
  const isInUse = usageData?.isInUse === true;

  const deleteCb = useApiCallback(
    async (api, id: string) => api.commons.softDeleteInventory(id),
  );
  const forceDeleteCb = useApiCallback(
    async (api, args: { entityId: string; password: string; mpin: string }) =>
      api.commons.forceDeleteInventory(args),
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
        (Array.isArray(result.data.errors) ? (result.data.errors as string[])[0] : null) ??
        result.data.message ??
        "Failed to delete inventory";
      showToast(errMessage, "error");
    } catch {
      showToast("Failed to delete inventory", "error");
    }
  };

  const handleForceDelete = async ({ password, mpin }: { password: string; mpin: string }) => {
    setForceLoading(true);
    setAdminConfirmError(null);
    try {
      const result = await forceDeleteCb.execute({
        entityId: inventory.inventoryID,
        password,
        mpin,
      });
      if (result?.data?.success) {
        showToast("Inventory force-deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        setAdminConfirmError(result?.data?.message ?? "Failed to force-delete inventory");
      }
    } catch (err: any) {
      const msg = Array.isArray(err) ? err[0] : "Something went wrong. Please try again.";
      setAdminConfirmError(msg);
    } finally {
      setForceLoading(false);
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
          This is a <strong>soft delete</strong>. The inventory will be marked inactive, but its
          full stock-movement history is preserved for audit.
        </Typography>
      </Box>

      {checkUsage.loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            Checking usage…
          </Typography>
        </Box>
      )}

      {isInUse && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.error.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
          }}
        >
          <Typography
            variant="body2"
            color="error"
            fontWeight={600}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
          >
            <WarningAmberOutlined sx={{ fontSize: 18 }} />
            Used in {usageData!.activeRecipeReferenceCount} active recipe
            {usageData!.activeRecipeReferenceCount !== 1 ? "s" : ""} and{" "}
            {usageData!.totalSaleCount} stock movement
            {usageData!.totalSaleCount !== 1 ? "s" : ""}.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This ingredient is actively referenced. Deleting it may affect recipe availability.
            You must confirm your identity to proceed.
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        {isInUse ? (
          <Button
            variant="contained"
            color="error"
            onClick={openAdminConfirm}
            disabled={checkUsage.loading}
            startIcon={<WarningAmberOutlined />}
            sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}` }}
          >
            Force Delete Anyway
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteCb.loading || checkUsage.loading}
            sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}` }}
          >
            {deleteCb.loading ? "Deleting..." : "Delete"}
          </Button>
        )}
      </Stack>

      <AdminConfirmDialog
        open={showAdminConfirm}
        onOpenChange={setShowAdminConfirm}
        title="Force Delete Inventory"
        description={`You are about to delete the inventory record for "${inventory.productName ?? "this item"}". It is actively referenced in recipes and/or stock movements.`}
        warning="This action cannot be undone. Stock movement history is preserved but the inventory record will be deactivated."
        confirmLabel="Force Delete"
        loading={forceLoading}
        errorMessage={adminConfirmError}
        onConfirm={handleForceDelete}
      />
    </Box>
  );
};
