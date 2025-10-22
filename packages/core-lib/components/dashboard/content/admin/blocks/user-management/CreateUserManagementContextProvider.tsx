"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useApiCallback,
  useFormDirtyState,
} from "./../../../../../../../core-lib/core/hooks";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { CreateBookingType, createBookingSchema } from "./validation";

export const CreateUserManagementContextProvider: React.FC<
  React.PropsWithChildren<{}>
> = ({ children }) => {

  const form = useForm<CreateBookingType>({
    resolver: yupResolver(createBookingSchema),
    mode: "all",
    criteriaMode: "all",
    defaultValues: createBookingSchema.getDefault(),
  });

  const { isDirty, setIsDirty } = useFormDirtyState(form.formState);

  async function handleSubmission(params: CreateBookingPayload) {}

  return (
    <FormProvider {...form}>
      <CreateBookingWizardFormContext.Provider
        value={useMemo(
          () => ({
            form,
            isDirty,
            setIsDirty,
            loading: false, //add api loading
            onSubmit: handleSubmission,
          }),
          [form, isDirty]
        )}
      >
        {children}
      </CreateBookingWizardFormContext.Provider>
    </FormProvider>
  );
};
