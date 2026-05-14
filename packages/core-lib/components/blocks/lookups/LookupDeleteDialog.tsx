import React from "react";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { DialogBox } from "../../radix/dialog/DialogBox";
import { Button } from "../../radix/buttons/Button";
import { useToastContext } from "../../../core/contexts";
import { useApiCallback } from "../../../core/hooks";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  open: boolean;
  config: LookupAdminConfig<TDto>;
  row?: TDto;
  onClose: () => void;
  onSuccess: () => void;
}

export function LookupDeleteDialog<TDto extends LookupDtoBase>({
  open,
  config,
  row,
  onClose,
  onSuccess,
}: Props<TDto>) {
  const { showToast } = useToastContext();

  const deleteCb = useApiCallback(
    async (api, ids: string[]) => await config.selectors.delete(api, ids),
  );

  const handleDelete = async () => {
    if (!row) return;
    try {
      const id = row[config.idField] as unknown as string;
      const result = await deleteCb.execute([id]);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${config.entityName} deleted successfully`, "success");
        onSuccess();
        onClose();
        return;
      }
      showToast(
        result.data.message ??
          `Failed to delete ${config.entityName.toLowerCase()}`,
        "error",
      );
    } catch (error) {
      console.error(`Error deleting ${config.entityName}:`, error);
      showToast(`Failed to delete ${config.entityName.toLowerCase()}`, "error");
    }
  };

  return (
    <DialogBox
      open={open}
      onClose={() => onClose()}
      title={`Delete ${config.entityName}`}
      maxWidth="xs"
      loading={deleteCb.loading}
    >
      <Box p="4">
        <Text as="p" size="3" mb="3">
          Are you sure you want to delete this{" "}
          {config.entityName.toLowerCase()}?
        </Text>

        {row && (
          <Box
            mb="3"
            p="3"
            style={{
              background: "var(--red-a3)",
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--red-a5)",
            }}
          >
            <Text as="div" size="2" weight="bold">
              {row.name}
            </Text>
            {row.description && (
              <Text as="div" size="1" color="gray">
                {row.description}
              </Text>
            )}
          </Box>
        )}

        <Callout.Root color="blue" variant="soft" mb="4">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            This is a <strong>soft delete</strong>. The row will be marked
            inactive but historical references stay intact.
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" gap="2">
          <Button type="Secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="Critical"
            onClick={handleDelete}
            loading={deleteCb.loading}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </DialogBox>
  );
}
