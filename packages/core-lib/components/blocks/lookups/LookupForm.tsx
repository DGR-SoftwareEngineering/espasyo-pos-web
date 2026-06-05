import React from "react";
import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { TextField } from "../../radix/form/TextField";
import { Button } from "../../radix/buttons/Button";
import { FormErrorSummary } from "../../radix/FormErrorSummary";
import { LookupPicker, LookupOption } from "../../LookupPicker";
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
      <Flex direction="column" gap="4">
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

        <Grid
          columns={{ initial: "1", sm: supportsParent ? "12" : "1" }}
          gap="3"
        >
          <Box style={{ gridColumn: supportsParent ? "span 4" : "auto" }}>
            <TextField
              name="displayOrder"
              control={control}
              label="Display Order"
              type="number"
              placeholder="0"
            />
            <Text size="1" color="gray" as="div" mt="1">
              Lower numbers appear first in dropdowns.
            </Text>
          </Box>

          {supportsParent && (
            <Box style={{ gridColumn: "span 8" }}>
              <LookupPicker<LookupFormValues, LookupOption>
                name="parentID"
                control={control}
                options={parentOptions}
                label="Parent (optional)"
                placeholder={`Pick a parent ${config.entityName.toLowerCase()}…`}
                noOptionText="No matching options"
              />
              <Text size="1" color="gray" as="div" mt="1">
                Use this only if you want a nested taxonomy.
              </Text>
            </Box>
          )}
        </Grid>

        <Flex justify="end" mt="2">
          <Button
            type="Primary"
            onClick={handleSubmit(onSubmit)}
            disabled={submitLoading}
            loading={submitLoading}
          >
            {isEdit
              ? `Update ${config.entityName}`
              : `Create ${config.entityName}`}
          </Button>
        </Flex>
      </Flex>
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
