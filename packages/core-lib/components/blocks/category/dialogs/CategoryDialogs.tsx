import React from "react";
import { Box, Typography, Stack, useTheme, alpha } from "@mui/material";
import { Button, useToastContext } from "core-lib";
import { CategoryForm } from "../CategoryForm";
import {
  CategoryDataList,
  CreateCategoryParams,
} from "core-lib/api/commons/types";
import { useApiCallback } from "core-lib/core/hooks";

export const CategoryViewDialog: React.FC<{ category: CategoryDataList }> = ({
  category,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Category ID
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
            {category.categoryID}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
            {category.name}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.5 }}>
            {category.description || "No description provided"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Display Order
          </Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
            {category.displayOrder}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Created By
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.5 }}>
            {category.createdBy}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export const CategoryEditDialog: React.FC<{
  category: CategoryDataList;
  onSuccess: () => void;
  onClose: () => void;
  isInDialog: boolean;
}> = ({ category, onSuccess, onClose, isInDialog }) => {
  const { showToast } = useToastContext();
  const updateCategoryCb = useApiCallback(
    async (api, args: CreateCategoryParams & { categoryID: string }) =>
      await api.commons.updateCategory(args),
  );

  const handleSubmit = async (values: CreateCategoryParams) => {
    try {
      const updateData = {
        categoryID: category.categoryID,
        name: values.name,
        description: values.description,
        displayOrder: values.displayOrder,
        type: values.type,
      };
      const result = await updateCategoryCb.execute(updateData);

      if (result.status === 200 && result.data.success) {
        showToast("Category updated successfully", "success");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast("Failed to update category", "error");
    }
  };

  const initialValues = {
    name: category.name,
    description: category.description,
    type: category.type,
    displayOrder: parseInt(category.displayOrder, 10) || 0,
  };

  return (
    <Box sx={{ p: 2 }}>
      <CategoryForm
        onSubmit={handleSubmit}
        submitLoading={updateCategoryCb.loading}
        initialValues={initialValues}
        isInDialog={isInDialog}
        isEdit={true}
      />
    </Box>
  );
};

export const CategoryDeleteDialog: React.FC<{
  category: CategoryDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ category, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const deleteCategoryCb = useApiCallback(
    async (api, args: string[]) => await api.commons.deleteCategory(args),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteCategoryCb.execute([category.categoryID]);
      if (result.status === 200 && result.data.success) {
        showToast("Category deleted successfully", "success");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast("Failed to delete category", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Are you sure you want to delete this category?
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
          {category.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {category.categoryID}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleDelete}
          disabled={deleteCategoryCb.loading}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          {deleteCategoryCb.loading ? "Deleting..." : "Delete"}
        </Button>
      </Stack>
    </Box>
  );
};
