import { useBaseForm } from "core-lib/core/hooks/useBaseForm";
import { promoFormSchema, PromoForm } from "../forms/validation";
import { SUBMISSION_KEYS } from "../constants";

const defaultValues: PromoForm = {
  title: "",
  description: "",
  imageFile: null,
  type: 1,
  discountPercent: null,
  discountAmount: null,
  buyQuantity: null,
  getQuantity: null,
  bundlePrice: null,
  startDate: null,
  endDate: null,
  reason: null,
  items: [],
  targetSegment: null,
  minLoyaltyStamps: null,
  assignedCustomerIds: [],
};

interface UsePromoFormProps {
  initialValues?: Partial<PromoForm>;
  onSubmit: (values: PromoForm) => void;
}

export const usePromoForm = ({ initialValues, onSubmit }: UsePromoFormProps) => {
  const form = useBaseForm<PromoForm>({
    schema: promoFormSchema,
    defaultValues,
    initialValues,
    isEdit: false,
    isInDialog: true,
    onSubmit,
    submissionKey: SUBMISSION_KEYS.create,
  });

  const promoType = form.watch("type") ?? 1;
  const items = form.watch("items") ?? [];
  const discountPercent = form.watch("discountPercent");
  const discountAmount = form.watch("discountAmount");
  const buyQuantity = form.watch("buyQuantity");
  const getQuantity = form.watch("getQuantity");
  const bundlePrice = form.watch("bundlePrice");

  return {
    ...form,
    watchedValues: {
      promoType,
      items,
      discountPercent,
      discountAmount,
      buyQuantity,
      getQuantity,
      bundlePrice,
    },
  };
};
