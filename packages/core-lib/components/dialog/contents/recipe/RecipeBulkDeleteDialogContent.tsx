import React from "react";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Close,
  Delete,
  RestaurantMenuOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback, useCriticalDeleteGuard } from "../../../../core/hooks";
import { AdminConfirmDialog } from "../../../radix/security/AdminConfirmDialog";

export const RecipeBulkDeleteDialogContent: React.FC<{
  ids: string[];
  count: number;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ ids, count, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();
  const {
    showAdminConfirm,
    setShowAdminConfirm,
    openAdminConfirm,
    adminConfirmError,
    setAdminConfirmError,
    forceLoading,
    setForceLoading,
  } = useCriticalDeleteGuard();

  const checkUsage = useApi((api) => api.commons.checkBulkRecipeCriticalUsage(ids));
  const usageData = checkUsage.result?.data?.response ?? null;
  const isInUse = usageData?.isInUse === true;

  const bulkDeleteCb = useApiCallback(
    async (api, args: string[]) => api.commons.bulkDeleteRecipes(args),
  );
  const forceDeleteBulkCb = useApiCallback(
    async (api, args: { ids: string[]; password: string; mpin: string }) =>
      api.commons.forceDeleteBulkRecipes(args),
  );

  const handleDelete = async () => {
    try {
      const result = await bulkDeleteCb.execute(ids);
      if (result.data.success) {
        showToast(`${count} recipe${count !== 1 ? "s" : ""} deleted successfully`, "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.data.message || "Failed to delete recipes", "error");
      }
    } catch {
      showToast("Failed to delete recipes", "error");
    }
  };

  const handleForceDelete = async ({ password, mpin }: { password: string; mpin: string }) => {
    setForceLoading(true);
    setAdminConfirmError(null);
    try {
      const result = await forceDeleteBulkCb.execute({ ids, password, mpin });
      if (result?.data?.success) {
        showToast(`${count} recipe${count !== 1 ? "s" : ""} force-deleted successfully`, "success");
        onSuccess();
        onClose();
      } else {
        setAdminConfirmError(result?.data?.message ?? "Failed to force-delete recipes");
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
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Delete {count} Recipe{count !== 1 ? "s" : ""}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
        Are you sure you want to delete {count} recipe{count !== 1 ? "s" : ""}? This action cannot
        be undone.
      </Typography>

      <Box
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: alpha(theme.palette.error.main, 0.02),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
            flexShrink: 0,
          }}
        >
          <RestaurantMenuOutlined />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {count} Recipe{count !== 1 ? "s" : ""} Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All ingredient associations will be removed for the selected recipes.
          </Typography>
        </Box>
      </Box>

      {checkUsage.loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            Checking usage across selected recipes…
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
            These recipes are referenced in {usageData!.totalSaleCount} POS transaction
            {usageData!.totalSaleCount !== 1 ? "s" : ""}.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            One or more of the selected menu items have active sales history. Deleting these recipes
            will remove the recipe definitions but will not erase transaction records. You must
            confirm your identity to proceed.
          </Typography>
          {usageData!.details.length > 0 && (
            <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
              {usageData!.details.map((d, i) => (
                <Typography key={i} component="li" variant="caption" color="text.secondary">
                  {d}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Close />}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        {isInUse ? (
          <Button
            variant="contained"
            color="error"
            onClick={openAdminConfirm}
            disabled={checkUsage.loading || bulkDeleteCb.loading}
            startIcon={<WarningAmberOutlined />}
            sx={{
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            Force Delete Anyway
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={bulkDeleteCb.loading || checkUsage.loading}
            startIcon={<Delete />}
            sx={{
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            {bulkDeleteCb.loading
              ? "Deleting…"
              : `Delete ${count} Recipe${count !== 1 ? "s" : ""}`}
          </Button>
        )}
      </Stack>

      <AdminConfirmDialog
        open={showAdminConfirm}
        onOpenChange={setShowAdminConfirm}
        title={`Force Delete ${count} Recipe${count !== 1 ? "s" : ""}`}
        description={`You are about to delete ${count} recipe${count !== 1 ? "s" : ""}. These menu items have POS transaction history.`}
        warning="This action cannot be undone. All ingredient associations will be permanently removed."
        confirmLabel="Force Delete"
        loading={forceLoading}
        errorMessage={adminConfirmError}
        onConfirm={handleForceDelete}
      />
    </Box>
  );
};
