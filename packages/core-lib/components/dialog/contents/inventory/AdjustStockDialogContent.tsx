import {
  AdjustStockParams,
  InventoryDto,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";
import { FormRenderer } from "../../../radix/form/FormRenderer";

type AdjustSubmitValues = {
  direction: "in" | "out";
  amount: number;
  reason: string;
};

export const AdjustStockDialogContent: React.FC<{
  inventory: InventoryDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ inventory, onSuccess, onClose }) => {
  const { showToast } = useToastContext();

  const adjustCb = useApiCallback(
    async (api, args: AdjustStockParams) =>
      await api.commons.adjustInventoryStock(args),
  );

  const handleSubmit = async (values: AdjustSubmitValues) => {
    try {
      const signedDelta =
        values.direction === "out"
          ? -Math.abs(values.amount)
          : Math.abs(values.amount);

      const payload: AdjustStockParams = {
        inventoryID: inventory.inventoryID,
        delta: signedDelta,
        reason: values.reason,
      };

      const result = await adjustCb.execute(payload);

      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast("Stock adjusted successfully", "success");
        onSuccess();
        onClose();
        return;
      }

      const errMessage =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to adjust stock";
      showToast(errMessage, "error");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      showToast("Failed to adjust stock", "error");
    }
  };

  return (
    <FormRenderer
      formKey="adjust-stock-form"
      inventory={inventory}
      onSubmit={handleSubmit}
      submitLoading={adjustCb.loading}
      isInDialog={true}
    />
  );
};
