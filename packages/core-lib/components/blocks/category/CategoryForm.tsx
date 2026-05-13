import React, { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Grid,
  Typography,
  Stack,
  Chip,
  useTheme,
  alpha,
  Avatar,
  CardContent,
  CardActions,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Button, TextField, Card, SelectField } from "core-lib";
import {
  CategoryForm as CategoryFormType,
  categoryFormSchema,
} from "./validation";
import {
  useFormFocusOnError,
  useFormSubmissionBindingHooks,
  useKeyDown,
} from "core-lib/core/hooks";
import { CategoryOutlined, InfoOutlined } from "@mui/icons-material";

interface Props {
  onSubmit: (values: CategoryFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<CategoryFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
}

const categoryTypes = [
  { value: 1, label: "Location", color: "#4caf50" },
  { value: 2, label: "Brand", color: "#2196f3" },
  { value: 3, label: "Unit", color: "#ff9800" },
];

export const CategoryForm: React.FC<Props> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
}) => {
  const theme = useTheme();
  const {
    handleSubmit,
    control,
    formState,
    setFocus,
    clearErrors,
    watch,
    reset,
  } = useForm<CategoryFormType>({
    resolver: yupResolver(categoryFormSchema),
    mode: "onChange",
    defaultValues: {
      ...categoryFormSchema.getDefault(),
      ...initialValues,
    },
  });

  const isDirty = formState.isDirty || isEdit;

  useEffect(() => {
    if (initialValues) {
      reset({
        ...categoryFormSchema.getDefault(),
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  useEffect(() => {
    if (resetForm) {
      reset(categoryFormSchema.getDefault());
    }
  }, [resetForm, reset]);

  const watchType = watch("type");
  const watchName = watch("name");
  const selectedType = categoryTypes.find((t) => t.value === watchType);

  useFormFocusOnError<CategoryFormType>(formState.errors, setFocus);
  useKeyDown("Enter", () => handleSubmit(onSubmit)());

  const submissionKey = isEdit
    ? "edit-category-submission"
    : "create-category-submission";

  if (!isInDialog) {
    useFormSubmissionBindingHooks({
      key: submissionKey,
      isValid: formState.isValid,
      isDirty: isDirty,
      cb: () => handleSubmit(onSubmit)(),
    });
  }

  const handleButtonClick = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Card
      hoverEffect={false}
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.02,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        >
          <CategoryOutlined />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {isEdit ? "Edit Category" : "Create New Category"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit
              ? "Update the category details below"
              : "Fill in the details below to create a new category"}
          </Typography>
        </Box>
      </Box>

      {watchName && selectedType && (
        <Box
          sx={{
            mx: 4,
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: theme.palette.primary.main,
              }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                PREVIEW
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {watchName}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={selectedType.label}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          />
        </Box>
      )}
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              name="name"
              control={control}
              label="Category Name"
              placeholder="e.g., Sako, Bar Ingredients, Jersey"
              onBlur={() => clearErrors()}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              name="description"
              control={control}
              label="Description"
              placeholder="Provide a detailed description of this category..."
              multiline
              rows={4}
              onBlur={() => clearErrors()}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              name="type"
              control={control}
              label="Category Type"
              options={categoryTypes.map((type) => ({
                ...type,
                value: type.value.toString(),
              }))}
              onBlur={() => clearErrors()}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="displayOrder"
              control={control}
              label="Display Order"
              type="number"
              placeholder="e.g., 10, 20, 30"
              onBlur={() => clearErrors()}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.03),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <InfoOutlined
                sx={{ color: theme.palette.info.main, fontSize: 20 }}
              />
              <Typography variant="body2" color="text.secondary">
                <strong>Display Order Tips:</strong> Lower numbers appear first.
                Use multiples of 10 (10, 20, 30) for easy reordering between
                items.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions
        sx={{
          p: 3,
          pt: 0,
          justifyContent: "flex-end",
          gap: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button
          type="Primary"
          loading={submitLoading}
          disabled={!formState.isValid || (!formState.isDirty && !isEdit)}
          {...(isInDialog
            ? { onClick: handleButtonClick }
            : { customActionKey: submissionKey })}
          sx={{
            minWidth: 160,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          {isEdit ? "Update Category" : "Create Category"}
        </Button>
      </CardActions>
    </Card>
  );
};
