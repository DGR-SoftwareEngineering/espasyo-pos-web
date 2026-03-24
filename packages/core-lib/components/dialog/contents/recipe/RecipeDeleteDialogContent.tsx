import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { RecipeResponse } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";
import {
  Close,
  Delete,
  KitchenOutlined,
  RestaurantMenuOutlined,
} from "@mui/icons-material";
import { formatCurrency } from "../../../../business";

export const RecipeDeleteDialogContent: React.FC<{
  recipe: RecipeResponse;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ recipe, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const softDeleteRecipeCb = useApiCallback(
    async (api, recipeId: string) =>
      await api.commons.softDeleteRecipe(recipeId),
  );

  const totalCost = recipe.recipeItems.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Delete Recipe
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Are you sure you want to delete this recipe? This action cannot be
        undone.
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
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1 }}
              flexWrap="wrap"
              gap={1}
            >
              <Chip
                label={`Recipe ID: ${recipe.recipeID.substring(0, 8)}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
              <Chip
                label={`${recipe.recipeItems.length} ingredient${recipe.recipeItems.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                }}
              />
              <Chip
                label={formatCurrency(totalCost)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Warning about ingredient associations */}
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
            <KitchenOutlined
              sx={{ fontSize: 18, color: theme.palette.warning.main }}
            />
            <span>
              <strong>Note:</strong> This recipe contains{" "}
              {recipe.recipeItems.length} ingredient
              {recipe.recipeItems.length !== 1 ? "s" : ""}. Deleting it will
              remove all ingredient associations.
            </span>
          </Typography>
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
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={softDeleteRecipeCb.loading}
          startIcon={<Delete />}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          {softDeleteRecipeCb.loading ? "Deleting..." : "Delete Recipe"}
        </Button>
      </Stack>
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
    } catch (error) {
      console.error("Error deleting recipe:", error);
      showToast("Failed to delete recipe", "error");
    }
  }
};
