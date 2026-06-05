import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { CreateUserParams, RoleDto } from "core-lib/api/commons/types";
import {
  UserCreateForm,
  makeUserCreateFormSchema,
  userCreateFormSchema,
} from "./validation";

interface UserCreateContextValue {
  form: UseFormReturn<UserCreateForm>;
  roles: RoleDto[];
  rolesLoading: boolean;
  submitting: boolean;
  submitted: boolean;
  createdUserName: string | null;
  submit: (values: UserCreateForm) => Promise<boolean>;
  reset: () => void;
}

const Context = createContext<UserCreateContextValue | undefined>(undefined);

export const useUserCreateContext = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("UserCreateContext must be used within its provider");
  return ctx;
};

interface Props {
  onSuccess?: () => void;
}

export const UserCreateProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const { security } = usePublicSettings();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdUserName, setCreatedUserName] = useState<string | null>(null);

  const schema = useMemo(
    () => makeUserCreateFormSchema(security.passwordMinLength),
    [security.passwordMinLength],
  );

  const form = useForm<UserCreateForm>({
    resolver: yupResolver(schema),
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: userCreateFormSchema.getDefault() as UserCreateForm,
  });

  const rolesApi = useApi((api) => api.commons.roleList());
  const [roles, setRoles] = useState<RoleDto[]>([]);

  useEffect(() => {
    const raw = (rolesApi.result?.data.response ?? []) as unknown as Array<
      Record<string, unknown>
    >;
    const seen = new Set<string>();
    const normalized: RoleDto[] = [];
    for (const r of raw) {
      const id =
        (r.roleID as string | undefined) ??
        (r.roleId as string | undefined) ??
        (r.id as string | undefined) ??
        "";
      if (!id || seen.has(id)) continue;
      seen.add(id);
      normalized.push({
        ...(r as unknown as RoleDto),
        roleID: id,
        roleName: (r.roleName as string) ?? (r.name as string) ?? "",
      });
    }
    setRoles(normalized);
  }, [rolesApi.result?.data.response]);

  const createCb = useApiCallback(
    async (api, args: CreateUserParams) => await api.commons.createUser(args),
  );

  const submit = async (values: UserCreateForm): Promise<boolean> => {
    try {
      setSubmitting(true);
      const payload: CreateUserParams = {
        roleID: values.roleID,
        username: values.username.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || undefined,
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        contactNumber: values.contactNumber.trim(),
        licenseNumber: values.licenseNumber?.trim() || undefined,
        imageFile: values.imageFile ?? null,
      };

      const result = await createCb.execute(payload);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        const fullName = `${payload.firstName} ${payload.lastName}`.trim();
        setCreatedUserName(fullName);
        setSubmitted(true);
        showToast(`${fullName} added successfully`, "success");
        onSuccess?.();
        return true;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to create user";
      showToast(message, "error");
      return false;
    } catch (error) {
      console.error("Error creating user:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to create user";
      showToast(fallback, "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    form.reset(userCreateFormSchema.getDefault() as UserCreateForm);
    setSubmitted(false);
    setCreatedUserName(null);
  };

  const value = useMemo<UserCreateContextValue>(
    () => ({
      form,
      roles,
      rolesLoading: rolesApi.loading,
      submitting,
      submitted,
      createdUserName,
      submit,
      reset,
    }),
    [form, roles, rolesApi.loading, submitting, submitted, createdUserName],
  );

  return (
    <FormProvider {...form}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </FormProvider>
  );
};
