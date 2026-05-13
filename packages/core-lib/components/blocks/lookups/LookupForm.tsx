import React from "react";
import { Box, Grid, Stack, Typography, alpha, useTheme } from "@mui/material";
import { TextField } from "../../form/TextField";
import { LookupPicker, LookupOption } from "../../LookupPicker";
import { FormErrorSummary } from "../../FormErrorSummary";
import { useBaseForm } from "../../../core/hooks/useBaseForm";
import {
  LookupDtoBase,
  LookupFormValues,
  LookupAdminConfig,
} from "./types";
import { lookupFormSchema } from "./validation";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  displayOrder: "Display Order",
  parentID: "Parent",
};

interface Props<TDto extends LookupDtoBase> {
  config: LookupAdminConfig<TDto>;
  rows: TDto[];
  initialValues?: Partial<LookupFormValues>;
  excludeRowId?: string;
  isEdit: boolean;
  onSubmit: (values: LookupFormValues) => void;
  submitLoading: boolean;
  resetForm?: boolean;
}

export function LookupForm<TDto extends LookupDtoBase>({
  config,
  rows,
  initialValues,
  excludeRowId,
  isEdit,
  onSubmit,
  submitLoading,
  resetForm,
}: Props<TDto>) {
  const theme = useTheme();
  const supportsParent = !!config.parentIdField;

  const defaultValues: LookupFormValues = {
    name: "",
    description: "",
    displayOrder: 0,
    parentID: null,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useBaseForm<LookupFormValues>({
    schema: lookupFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit,
    isInDialog: true,
    onSubmit,
    submissionKey: `lookup-${config.entityName.toLowerCase()}-${
      isEdit ? "edit" : "create"
    }`,
  });

  const parentOptions: LookupOption[] = React.useMemo(() => {
    if (!supportsParent) return [];
    return rows
      .filter((r) => {
        const id = r[config.idField] as unknown as string;
        if (excludeRowId && id === excludeRowId) return false;
        return r.isActive !== false;
      })
      .map((r) => ({
        id: r[config.idField] as unknown as string,
        name: r.name,
        description: r.description,
        displayOrder: r.displayOrder,
        isActive: r.isActive,
      }));
  }, [supportsParent, rows, excludeRowId, config.idField]);

  return (
    <Box>
      <Stack spacing={2.5}>
        <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

        <TextField
          name="name"
          control={control}
          label="Name"
          placeholder={`e.g. ${exampleName(config.entityName)}`}
        />

        <TextField
          name="description"
          control={control}
          label="Description (optional)"
          placeholder="Short description for admins"
          multiline
          rows={2}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: supportsParent ? 4 : 12 }}>
            <TextField
              name="displayOrder"
              control={control}
              label="Display Order"
              type="number"
              placeholder="0"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Lower numbers appear first in dropdowns.
            </Typography>
          </Grid>

          {supportsParent && (
            <Grid size={{ xs: 12, sm: 8 }}>
              <LookupPicker<LookupFormValues, LookupOption>
                name="parentID"
                control={control}
                options={parentOptions}
                label="Parent (optional)"
                placeholder={`Pick a parent ${config.entityName.toLowerCase()}…`}
                noOptionText="No matching options"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Use this only if you want a nested taxonomy.
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            disabled={submitLoading}
            onClick={handleSubmit(onSubmit)}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: submitLoading ? "not-allowed" : "pointer",
              opacity: submitLoading ? 0.6 : 1,
              boxShadow: `0 4px 12px ${alpha(
                theme.palette.primary.main,
                0.3,
              )}`,
              minWidth: 160,
              transition: "all 0.15s ease",
            }}
          >
            {submitLoading
              ? "Saving…"
              : isEdit
                ? `Update ${config.entityName}`
                : `Create ${config.entityName}`}
          </button>
        </Box>
      </Stack>
    </Box>
  );
}

function exampleName(entityName: string): string {
  switch (entityName) {
    case "Unit":
      return "kg";
    case "ProductCategory":
      return "Hot Drinks";
    case "IngredientCategory":
      return "Dairy";
    case "Location":
      return "Main Branch";
    case "Brand":
      return "Magnolia";
    default:
      return entityName;
  }
}
