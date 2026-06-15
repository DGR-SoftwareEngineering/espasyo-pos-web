import { Box, Button, Callout, Flex, Text } from "@radix-ui/themes";
import { WarningAmberOutlined } from "@mui/icons-material";
import { ProductDataList } from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback, useCriticalDeleteGuard } from "../../../../core/hooks";
import { AdminConfirmDialog } from "../../../radix/security/AdminConfirmDialog";

export const ProductDeleteDialogContent: React.FC<{
  product: ProductDataList;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ product, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const { showAdminConfirm, setShowAdminConfirm, openAdminConfirm, adminConfirmError, setAdminConfirmError, forceLoading, setForceLoading } =
    useCriticalDeleteGuard();

  const checkUsage = useApi((api) => api.commons.checkProductCriticalUsage([product.productID]));
  const usageData = checkUsage.result?.data?.response ?? null;
  const isInUse = usageData?.isInUse === true;

  const deleteProductCb = useApiCallback(
    async (api, args: string[]) => api.commons.deleteProduct(args),
  );
  const forceDeleteProductCb = useApiCallback(
    async (api, args: { ids: string[]; password: string; mpin: string }) =>
      api.commons.forceDeleteProduct(args),
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
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  const handleForceDelete = async ({ password, mpin }: { password: string; mpin: string }) => {
    setForceLoading(true);
    setAdminConfirmError(null);
    try {
      const result = await forceDeleteProductCb.execute({ ids: [product.productID], password, mpin });
      if (result?.data?.success) {
        showToast("Product force-deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        setAdminConfirmError(result?.data?.message ?? "Failed to force-delete product");
      }
    } catch (err: any) {
      const msg = Array.isArray(err) ? err[0] : "Something went wrong. Please try again.";
      setAdminConfirmError(msg);
    } finally {
      setForceLoading(false);
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

      {checkUsage.loading && (
        <Text as="div" size="1" color="gray" mb="3">
          Checking usage…
        </Text>
      )}

      {isInUse && (
        <Callout.Root color="red" variant="soft" mb="4">
          <Callout.Icon>
            <WarningAmberOutlined />
          </Callout.Icon>
          <Callout.Text>
            <Text as="div" weight="bold" mb="1">
              Referenced in {usageData!.totalSaleCount} POS transaction
              {usageData!.totalSaleCount !== 1 ? "s" : ""}.
            </Text>
            <Text as="div" size="1">
              This product has active sales history. You must confirm your identity to force-delete
              it.
            </Text>
          </Callout.Text>
        </Callout.Root>
      )}

      <Flex gap="3" justify="end">
        <Button variant="soft" onClick={onClose}>
          Cancel
        </Button>
        {isInUse ? (
          <Button
            color="red"
            disabled={checkUsage.loading}
            onClick={openAdminConfirm}
          >
            Force Delete Anyway
          </Button>
        ) : (
          <Button
            color="red"
            onClick={handleDelete}
            disabled={deleteProductCb.loading || checkUsage.loading}
          >
            {deleteProductCb.loading ? "Deleting…" : "Delete"}
          </Button>
        )}
      </Flex>

      <AdminConfirmDialog
        open={showAdminConfirm}
        onOpenChange={setShowAdminConfirm}
        title="Force Delete Product"
        description={`You are about to permanently delete "${product.name}". This product has POS transaction history.`}
        warning="This action cannot be undone."
        confirmLabel="Force Delete"
        loading={forceLoading}
        errorMessage={adminConfirmError}
        onConfirm={handleForceDelete}
      />
    </Box>
  );
};
