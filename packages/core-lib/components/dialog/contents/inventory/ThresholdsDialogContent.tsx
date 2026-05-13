import { Box } from "@mui/material";
import {
  InventoryDto,
  UpdateInventoryParams,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";
import { FormRenderer } from "../../../form";

type ThresholdsSubmitValues = {
  reorderLevel: number;
  minimumStockLevel: number;
};

export const ThresholdsDialogContent: React.FC<{
  inventory: InventoryDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ inventory, onSuccess, onClose }) => {
  const { showToast } = useToastContext();

  const updateCb = useApiCallback(
    async (api, args: UpdateInventoryParams) =>
      await api.commons.updateInventoryThresholds(args),
  );

  const handleSubmit = async (values: ThresholdsSubmitValues) => {
    try {
      const payload: UpdateInventoryParams = {
        inventoryID: inventory.inventoryID,
        reorderLevel: values.reorderLevel,
        minimumStockLevel: values.minimumStockLevel,
      };

      const result = await updateCb.execute(payload);

      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast("Thresholds updated successfully", "success");
        onSuccess();
        onClose();
        return;
      }

      const errMessage =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to update thresholds";
      showToast(errMessage, "error");
    } catch (error) {
      console.error("Error updating thresholds:", error);
      showToast("Failed to update thresholds", "error");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <FormRenderer
        formKey="thresholds-form"
        inventory={inventory}
        onSubmit={handleSubmit}
        submitLoading={updateCb.loading}
        isInDialog={true}
      />
    </Box>
  );
};
