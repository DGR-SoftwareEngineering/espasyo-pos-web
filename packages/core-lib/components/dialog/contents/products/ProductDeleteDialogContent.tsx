import { alpha, Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { ProductDataList } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";

export const ProductDeleteDialogContent: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const deleteProductCb = useApiCallback(
    async (api, args: string[]) => await api.commons.deleteProduct(args),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteProductCb.execute([product.productID]);
      if (result.status === 200 && result.data.success) {
        showToast("Product deleted successfully", "success");
        onSuccess();
        onClose();
      }

      showToast("Delete API not ready yet", "info");
      onClose();
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Are you sure you want to delete this product?
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
        <Typography variant="subtitle2" fontWeight={600}>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {product.productID}
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
          loading={deleteProductCb.loading}
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
