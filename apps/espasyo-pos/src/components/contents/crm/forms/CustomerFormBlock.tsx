import React, { useCallback, useState } from "react";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { extractApiError } from "core-lib/business/errorUtils";
import {
  CreateCustomerParams,
  CustomerDetailDto,
  UpdateCustomerParams,
} from "core-lib/api/crm";
import { CustomerForm } from "./CustomerForm";
import { CustomerFormType } from "./validation";

interface CustomerFormBlockProps {
  /** Provide to switch into edit mode. */
  customer?: CustomerDetailDto | null;
  isInDialog?: boolean;
  onSuccess?: (saved: CustomerDetailDto) => void;
}

const toInitialValues = (
  c: CustomerDetailDto | null | undefined,
): Partial<CustomerFormType> | undefined => {
  if (!c) return undefined;
  return {
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    city: c.city ?? "",
    birthday: c.birthday ?? "",
    tags: c.tags ?? [],
  };
};

const toCreateParams = (v: CustomerFormType): CreateCustomerParams => ({
  firstName: v.firstName.trim(),
  lastName: v.lastName.trim(),
  email: v.email?.trim() ? v.email.trim() : null,
  phone: v.phone?.trim() ? v.phone.trim() : null,
  address: v.address?.trim() ? v.address.trim() : null,
  city: v.city?.trim() ? v.city.trim() : null,
  birthday: v.birthday?.trim() ? v.birthday.trim() : null,
  tags: (v.tags ?? []).filter((t): t is string => !!t),
});

const toUpdateParams = (v: CustomerFormType): UpdateCustomerParams => ({
  firstName: v.firstName.trim(),
  lastName: v.lastName.trim(),
  email: v.email?.trim() ?? "",
  phone: v.phone?.trim() ?? "",
  address: v.address?.trim() ?? "",
  city: v.city?.trim() ?? "",
  birthday: v.birthday?.trim() ?? "",
});

export const CustomerFormBlock: React.FC<CustomerFormBlockProps> = ({
  customer,
  isInDialog = true,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const [submitLoading, setSubmitLoading] = useState(false);
  const isEdit = !!customer;

  const createCb = useApiCallback(async (api, params: CreateCustomerParams) =>
    api.crm.create(params),
  );
  const updateCb = useApiCallback(
    async (api, args: { id: string; params: UpdateCustomerParams }) =>
      api.crm.update(args.id, args.params),
  );
  const updateTagsCb = useApiCallback(
    async (api, args: { id: string; tags: string[] }) =>
      api.crm.updateTags(args.id, { tags: args.tags }),
  );

  const handleSubmit = useCallback(
    async (values: CustomerFormType) => {
      setSubmitLoading(true);
      try {
        let saved: CustomerDetailDto | undefined;

        if (isEdit && customer) {
          const result = await updateCb.execute({
            id: customer.customerID,
            params: toUpdateParams(values),
          });
          if (!result?.data?.success || !result?.data?.response) {
            showToast(extractApiError(result, "Failed to save customer"), "error");
            return;
          }
          saved = result.data.response;

          const originalTags = (customer.tags ?? []).slice().sort().join("|");
          const nextTags = (values.tags ?? []).slice().sort().join("|");
          if (originalTags !== nextTags) {
            const tagResult = await updateTagsCb.execute({
              id: customer.customerID,
              tags: values.tags ?? [],
            });
            if (tagResult?.data?.success && tagResult.data.response) {
              saved = tagResult.data.response;
            }
          }
          showToast("Customer updated", "success");
        } else {
          const result = await createCb.execute(toCreateParams(values));
          if (!result?.data?.success || !result?.data?.response) {
            showToast(extractApiError(result, "Failed to create customer"), "error");
            return;
          }
          saved = result.data.response;
          showToast(`Customer ${saved.customerNumber} created`, "success");
        }

        if (saved) onSuccess?.(saved);
      } catch {
        showToast(
          isEdit ? "Failed to save customer" : "Failed to create customer",
          "error",
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [isEdit, customer, createCb, updateCb, updateTagsCb, showToast, onSuccess],
  );

  return (
    <CustomerForm
      onSubmit={handleSubmit}
      submitLoading={submitLoading}
      isEdit={isEdit}
      isInDialog={isInDialog}
      initialValues={toInitialValues(customer)}
    />
  );
};
