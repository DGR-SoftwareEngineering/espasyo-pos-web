import React, { useEffect } from "react";
import {
  Flex,
  Text,
  IconButton,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  useForm,
  useFieldArray,
  Controller } from "react-hook-form"; import { Box,
} from "@radix-ui/themes";;
import { PlusIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  ProductVariantTemplateDto,
  CreateVariantTemplateParams,
  UpdateVariantTemplateParams,
} from "core-lib/api/commons/types";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";

interface VariantTemplateForm {
  name: string;
  description: string;
  items: { name: string; displayOrder: number }[];
}

interface Props {
  open: boolean;
  editTemplate?: ProductVariantTemplateDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VariantTemplateFormDialog: React.FC<Props> = ({
  open,
  editTemplate,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const isEdit = !!editTemplate;

  const { control, handleSubmit, reset } = useForm<VariantTemplateForm>({
    defaultValues: {
      name: "",
      description: "",
      items: [{ name: "", displayOrder: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      if (editTemplate) {
        reset({
          name: editTemplate.name,
          description: editTemplate.description ?? "",
          items: editTemplate.items.map((item, idx) => ({
            name: item.name,
            displayOrder: item.displayOrder ?? idx + 1,
          })),
        });
      } else {
        reset({
          name: "",
          description: "",
          items: [{ name: "", displayOrder: 1 }],
        });
      }
    }
  }, [open, editTemplate, reset]);

  const createCb = useApiCallback(async (api, params: CreateVariantTemplateParams) =>
    api.commons.variantTemplateCreate(params),
  );

  const updateCb = useApiCallback(async (api, params: UpdateVariantTemplateParams) =>
    api.commons.variantTemplateUpdate(params),
  );

  const loading = createCb.loading || updateCb.loading;

  const onSubmit = async (values: VariantTemplateForm) => {
    const mappedItems = values.items.map((item, idx) => ({
      name: item.name,
      defaultPrice: 0,
      displayOrder: idx + 1,
    }));

    try {
      if (isEdit && editTemplate) {
        const updateItems = values.items.map((item, idx) => {
          const existingItem = editTemplate.items[idx];
          return {
            productVariantTemplateItemID: existingItem?.productVariantTemplateItemID,
            name: item.name,
            defaultPrice: 0,
            displayOrder: idx + 1,
            isActive: true,
          };
        });

        await updateCb.execute({
          productVariantTemplateID: editTemplate.productVariantTemplateID,
          name: values.name,
          description: values.description || undefined,
          items: updateItems,
        });
        showToast("Variant template updated successfully", "success");
      } else {
        await createCb.execute({
          name: values.name,
          description: values.description || undefined,
          items: mappedItems,
        });
        showToast("Variant template created successfully", "success");
      }
      onSuccess();
      onClose();
    } catch {
      showToast(isEdit ? "Failed to update template" : "Failed to create template", "error");
    }
  };

  return (
    <DialogBox
      open={open}
      onClose={() => !loading && onClose()}
      title={isEdit ? "Edit Variant Template" : "Create Variant Template"}
      maxWidth="md"
      loading={loading}
      actions={
        <Flex gap="2" justify="end">
          <Button type="Secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
          >
            {isEdit ? "Update Template" : "Create Template"}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="4">
        <TextField
          name="name"
          control={control}
          label="Name"
          placeholder="e.g. Sizes"
        />

        <TextField
          name="description"
          control={control}
          label="Description"
          placeholder="Optional description"
        />

        <Separator size="4" />

        <Box>
          <Flex justify="between" align="center" mb="3">
            <Text size="2" weight="bold">
              Variants / Sizes
            </Text>
            <Text size="1" color="gray">
              {fields.length} item{fields.length !== 1 ? "s" : ""}
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            {fields.map((field, index) => (
              <Flex key={field.id} align="start" gap="2">
                <Box style={{ flex: 1 }}>
                  <Controller
                    name={`items.${index}.name`}
                    control={control}
                    rules={{ required: "Name is required" }}
                    render={({ field: f, fieldState }) => (
                      <Flex direction="column" gap="1">
                        <input
                          {...f}
                          placeholder="Variant name (e.g. Small)"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: "var(--radius-2)",
                            border: fieldState.error
                              ? "1px solid var(--red-9)"
                              : "1px solid var(--gray-7)",
                            background: "var(--color-surface)",
                            color: "var(--gray-12)",
                            fontSize: "14px",
                            boxSizing: "border-box",
                          }}
                        />
                        {fieldState.error && (
                          <Text size="1" color="red">
                            {fieldState.error.message}
                          </Text>
                        )}
                      </Flex>
                    )}
                  />
                </Box>

                <IconButton
                  size="2"
                  variant="ghost"
                  color="red"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  style={{ marginTop: 2 }}
                >
                  <Cross1Icon />
                </IconButton>
              </Flex>
            ))}
          </Flex>

          <Box mt="3">
            <Button
              type="Secondary"
              onClick={() =>
                append({ name: "", displayOrder: fields.length + 1 })
              }
            >
              <Flex align="center" gap="2">
                <PlusIcon />
                Add Size/Variant
              </Flex>
            </Button>
          </Box>
        </Box>
      </Flex>
    </DialogBox>
  );
};
