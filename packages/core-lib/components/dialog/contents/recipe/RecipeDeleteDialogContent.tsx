import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Close,
  Delete,
  KitchenOutlined,
  RestaurantMenuOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { RecipeResponse } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback, useCriticalDeleteGuard } from "../../../../core/hooks";
import { formatCurrency } from "../../../../business";
import { AdminConfirmDialog } from "../../../radix/security/AdminConfirmDialog";

export const RecipeDeleteDialogContent: React.FC<{
  recipe: RecipeResponse;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ recipe, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();
  const { showAdminConfirm, setShowAdminConfirm, openAdminConfirm, adminConfirmError, setAdminConfirmError, forceLoading, setForceLoading } =
    useCriticalDeleteGuard();

  const checkUsage = useApi((api) => api.commons.checkRecipeCriticalUsage(recipe.recipeID));
  const usageData = checkUsage.result?.data?.response ?? null;
  const isInUse = usageData?.isInUse === true;

  const softDeleteRecipeCb = useApiCallback(
    async (api, recipeId: string) => api.commons.softDeleteRecipe(recipeId),
  );
  const forceDeleteRecipeCb = useApiCallback(
    async (api, args: { entityId: string; password: string; mpin: string }) =>
      api.commons.forceDeleteRecipe(args),
  );

  const totalCost = recipe.recipeItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Delete Recipe
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
        Are you sure you want to delete this recipe? This action cannot be undone.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: alpha(theme.palette.error.main, 0.02),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
            }}
          >
            <RestaurantMenuOutlined />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {recipe.menuItemName}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
              <Chip
                label={`Recipe ID: ${recipe.recipeID.substring(0, 8)}...`}
                size="small"
                sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
              />
              <Chip
                label={`${recipe.recipeItems.length} ingredient${recipe.recipeItems.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}
              />
              <Chip
                label={formatCurrency(totalCost)}
                size="small"
                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {recipe.recipeItems.length > 0 && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <KitchenOutlined sx={{ fontSize: 18, color: theme.palette.warning.main }} />
            <span>
              <strong>Note:</strong> This recipe contains {recipe.recipeItems.length} ingredient
              {recipe.recipeItems.length !== 1 ? "s" : ""}. Deleting it will remove all ingredient associations.
            </span>
          </Typography>
        </Box>
      )}

      {checkUsage.loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">Checking usage…</Typography>
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
            Referenced in {usageData!.totalSaleCount} POS transaction
            {usageData!.totalSaleCount !== 1 ? "s" : ""}.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This recipe's menu item has active sales history. Deleting it will remove the recipe
            definition but will not erase transaction records. You must confirm your identity to
            proceed.
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
            disabled={checkUsage.loading || softDeleteRecipeCb.loading}
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
            disabled={softDeleteRecipeCb.loading || checkUsage.loading}
            startIcon={<Delete />}
            sx={{ borderRadius: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}` }}
          >
            {softDeleteRecipeCb.loading ? "Deleting..." : "Delete Recipe"}
          </Button>
        )}
      </Stack>

      <AdminConfirmDialog
        open={showAdminConfirm}
        onOpenChange={setShowAdminConfirm}
        title="Force Delete Recipe"
        description={`You are about to delete the recipe for "${recipe.menuItemName}". This item has POS transaction history.`}
        warning="This action cannot be undone. All ingredient associations will be permanently removed."
        confirmLabel="Force Delete"
        loading={forceLoading}
        errorMessage={adminConfirmError}
        onConfirm={handleForceDelete}
      />
    </Box>
  );

  async function handleDelete() {
    try {
      const result = await softDeleteRecipeCb.execute(recipe.recipeID);
      if (result.data.success) {
        showToast("Recipe deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.data.message || "Failed to delete recipe", "error");
      }
    } catch {
      showToast("Failed to delete recipe", "error");
    }
  }

  async function handleForceDelete({ password, mpin }: { password: string; mpin: string }) {
    setForceLoading(true);
    setAdminConfirmError(null);
    try {
      const result = await forceDeleteRecipeCb.execute({ entityId: recipe.recipeID, password, mpin });
      if (result?.data?.success) {
        showToast("Recipe force-deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        setAdminConfirmError(result?.data?.message ?? "Failed to force-delete recipe");
      }
    } catch (err: any) {
      const msg = Array.isArray(err) ? err[0] : "Something went wrong. Please try again.";
      setAdminConfirmError(msg);
    } finally {
      setForceLoading(false);
    }
  }
};
