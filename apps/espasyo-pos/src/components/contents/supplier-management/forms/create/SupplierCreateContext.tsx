import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { CreateSupplierParams, UserDto } from "core-lib/api/commons/types";
import { SupplierCreateForm, supplierCreateFormSchema } from "./validation";

interface SupplierCreateContextValue {
  form: UseFormReturn<SupplierCreateForm>;
  supplierUsers: UserDto[];
  supplierUsersLoading: boolean;
  supplierRoleAvailable: boolean;
  submitting: boolean;
  submitted: boolean;
  createdCompanyName: string | null;
  submit: (values: SupplierCreateForm) => Promise<boolean>;
  reset: () => void;
}

const Context = createContext<SupplierCreateContextValue | undefined>(undefined);

export const useSupplierCreateContext = () => {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error("SupplierCreateContext must be used within its provider");
  return ctx;
};

interface Props {
  onSuccess?: () => void;
}

export const SupplierCreateProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdCompanyName, setCreatedCompanyName] = useState<string | null>(
    null,
  );

  const form = useForm<SupplierCreateForm>({
    resolver: yupResolver(supplierCreateFormSchema),
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: supplierCreateFormSchema.getDefault() as SupplierCreateForm,
  });

  const rolesApi = useApi((api) => api.commons.roleList());
  const supplierRoleID = useMemo(() => {
    const raw = (rolesApi.result?.data.response ?? []) as unknown as Array<
      Record<string, unknown>
    >;
    const match = raw.find((r) => {
      const name =
        (r.roleName as string | undefined) ??
        (r.name as string | undefined) ??
        "";
      return name.toLowerCase() === "supplier";
    });
    if (!match) return undefined;
    return (
      (match.roleID as string | undefined) ??
      (match.roleId as string | undefined) ??
      (match.id as string | undefined)
    );
  }, [rolesApi.result?.data.response]);

  const supplierUsersCb = useApiCallback(
    async (api, roleID: string) => await api.commons.getUsersByRole(roleID),
  );

  const [supplierUsers, setSupplierUsers] = useState<UserDto[]>([]);
  useEffect(() => {
    if (!supplierRoleID) {
      setSupplierUsers([]);
      return;
    }
    supplierUsersCb
      .execute(supplierRoleID)
      .then((result) => {
        setSupplierUsers(result.data.response ?? []);
      })
      .catch(() => {
        setSupplierUsers([]);
      });
  }, [supplierRoleID]);

  const createCb = useApiCallback(
    async (api, args: CreateSupplierParams) =>
      await api.commons.createSupplier(args),
  );

  const submit = async (values: SupplierCreateForm): Promise<boolean> => {
    try {
      setSubmitting(true);
      const trim = (v: string | undefined | null) =>
        v && v.trim() ? v.trim() : undefined;

      const payload: CreateSupplierParams = {
        companyName: values.companyName.trim(),
        contactPersonName: trim(values.contactPersonName),
        email: trim(values.email),
        contactNumber: trim(values.contactNumber),
        address: trim(values.address),
        taxID: trim(values.taxID),
        paymentTerms: trim(values.paymentTerms),
        notes: trim(values.notes),
        userID: values.linkPortalUser ? trim(values.userID) : undefined,
        logoFile: values.logoFile ?? null,
      };

      const result = await createCb.execute(payload);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        setCreatedCompanyName(payload.companyName);
        setSubmitted(true);
        showToast(`${payload.companyName} added successfully`, "success");
        onSuccess?.();
        return true;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to create supplier";
      showToast(message, "error");
      return false;
    } catch (error) {
      console.error("Error creating supplier:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to create supplier";
      showToast(fallback, "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    form.reset(supplierCreateFormSchema.getDefault() as SupplierCreateForm);
    setSubmitted(false);
    setCreatedCompanyName(null);
  };

  const value = useMemo<SupplierCreateContextValue>(
    () => ({
      form,
      supplierUsers,
      supplierUsersLoading: supplierUsersCb.loading || rolesApi.loading,
      supplierRoleAvailable: !!supplierRoleID,
      submitting,
      submitted,
      createdCompanyName,
      submit,
      reset,
    }),
    [
      form,
      supplierUsers,
      supplierUsersCb.loading,
      rolesApi.loading,
      supplierRoleID,
      submitting,
      submitted,
      createdCompanyName,
    ],
  );

  return (
    <FormProvider {...form}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </FormProvider>
  );
};
