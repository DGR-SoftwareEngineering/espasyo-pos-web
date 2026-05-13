import React from "react";
import { DialogBox } from "../../dialog/DialogBox";
import { useToastContext } from "../../../core/contexts";
import { useApiCallback } from "../../../core/hooks";
import { LookupForm } from "./LookupForm";
import {
  LookupAdminConfig,
  LookupDtoBase,
  LookupFormValues,
} from "./types";

interface Props<TDto extends LookupDtoBase> {
  open: boolean;
  config: LookupAdminConfig<TDto>;
  rows: TDto[];
  editRow?: TDto;
  onClose: () => void;
  onSuccess: () => void;
}

export function LookupFormDialog<TDto extends LookupDtoBase>({
  open,
  config,
  rows,
  editRow,
  onClose,
  onSuccess,
}: Props<TDto>) {
  const { showToast } = useToastContext();
  const isEdit = !!editRow;

  const createCb = useApiCallback(
    async (api, args: LookupFormValues) =>
      await config.selectors.create(api, args),
  );

  const updateCb = useApiCallback(
    async (
      api,
      args: { id: string; values: LookupFormValues },
    ) => await config.selectors.update(api, args.id, args.values),
  );

  const handleSubmit = async (values: LookupFormValues) => {
    try {
      if (isEdit && editRow) {
        const id = editRow[config.idField] as unknown as string;
        const result = await updateCb.execute({ id, values });
        if (
          result.status >= 200 &&
          result.status < 300 &&
          result.data.success
        ) {
          showToast(`${config.entityName} updated successfully`, "success");
          onSuccess();
          onClose();
          return;
        }
        const errMessage = surfaceError(
          result.data,
          `Failed to update ${config.entityName.toLowerCase()}`,
        );
        showToast(errMessage, "error");
        return;
      }

      const result = await createCb.execute(values);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${config.entityName} created successfully`, "success");
        onSuccess();
        onClose();
        return;
      }
      const errMessage = surfaceError(
        result.data,
        `Failed to create ${config.entityName.toLowerCase()}`,
      );
      showToast(errMessage, "error");
    } catch (error) {
      console.error(`Error saving ${config.entityName}:`, error);
      showToast(`Failed to save ${config.entityName.toLowerCase()}`, "error");
    }
  };

  const initialValues = React.useMemo<Partial<LookupFormValues> | undefined>(
    () => {
      if (!editRow) return undefined;
      const parentId = config.parentIdField
        ? (editRow[config.parentIdField] as unknown as string | null)
        : null;
      return {
        name: editRow.name,
        description: editRow.description ?? "",
        displayOrder: editRow.displayOrder ?? 0,
        parentID: parentId ?? null,
      };
    },
    [editRow, config.parentIdField],
  );

  return (
    <DialogBox
      open={open}
      onClose={() => onClose()}
      title={
        isEdit ? `Edit ${config.entityName}` : `Create ${config.entityName}`
      }
      maxWidth="sm"
      loading={createCb.loading || updateCb.loading}
      fullScreenOnMobile
    >
      <div style={{ padding: 24 }}>
        <LookupForm
          config={config}
          rows={rows}
          initialValues={initialValues}
          excludeRowId={
            editRow
              ? (editRow[config.idField] as unknown as string)
              : undefined
          }
          isEdit={isEdit}
          submitLoading={createCb.loading || updateCb.loading}
          onSubmit={handleSubmit}
        />
      </div>
    </DialogBox>
  );
}

function surfaceError(
  data: { errors?: unknown; message?: string | null },
  fallback: string,
): string {
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
  }
  return data.message ?? fallback;
}
