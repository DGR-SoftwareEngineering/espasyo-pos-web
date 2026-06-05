import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";

export const ProductBulkDeleteDialogContent: React.FC<{
  ids: string[];
  count: number;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ ids, count, onSuccess, onClose }) => {
  const { showToast } = useToastContext();

  const deleteProductsCb = useApiCallback(
    async (api, args: string[]) => await api.commons.deleteProduct(args),
  );

  const handleDelete = async () => {
    try {
      const result = await deleteProductsCb.execute(ids);
      if (result.status === 200 && result.data.success) {
        showToast(
          `${count} product${count > 1 ? 's' : ''} deleted successfully`,
          "success"
        );
        onSuccess();
        onClose();
        return;
      }

      showToast("Failed to delete products", "error");
    } catch (error) {
      showToast("Failed to delete products", "error");
    }
  };

  return (
    <Box p="6">
      <Text as="p" size="2" mb="4">
        Are you sure you want to delete {count} product{count > 1 ? 's' : ''}?
      </Text>

      <Box
        p="4"
        mb="4"
        style={{
          borderRadius: "var(--radius-2)",
          border: "1px solid var(--red-a4)",
          background: "var(--red-a2)",
        }}
      >
        <Text as="div" size="2" weight="bold" mb="2">
          Delete Multiple Products
        </Text>
        <Text as="div" size="1" color="gray">
          This action cannot be undone.
        </Text>
      </Box>

      <Flex gap="3" justify="end">
        <Button variant="soft" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={handleDelete}
          disabled={deleteProductsCb.loading}
        >
          {deleteProductsCb.loading ? "Deleting…" : `Delete ${count}`}
        </Button>
      </Flex>
    </Box>
  );
};
