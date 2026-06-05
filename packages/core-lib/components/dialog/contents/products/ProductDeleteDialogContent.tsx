import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { ProductDataList } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";

export const ProductDeleteDialogContent: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
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
        return;
      }

      showToast("Failed to delete product", "error");
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <Box p="6">
      <Text as="p" size="2" mb="4">
        Are you sure you want to delete this product?
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
          {product.name}
        </Text>
        <Text as="div" size="1" color="gray">
          ID: {product.productID}
        </Text>
      </Box>

      <Flex gap="3" justify="end">
        <Button variant="soft" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={handleDelete}
          disabled={deleteProductCb.loading}
        >
          {deleteProductCb.loading ? "Deleting…" : "Delete"}
        </Button>
      </Flex>
    </Box>
  );
};
