import React, { useState } from "react";
import { useRouter } from "core-lib/core/router";
import { useToastContext } from "core-lib";
import { CustomerRegistrationForm } from "./CustomerRegistrationForm";
import { CustomerRegistrationFormType } from "../validation";
import { useApiCallback } from "core-lib/core/hooks";
import { CustomerRegistrationParams } from "core-lib/api/authentication/types";

export const CustomerRegistrationFormBlock: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const createCustomerAuthCb = useApiCallback(
    async (api, args: CustomerRegistrationParams) =>
        await api.authentication.createAuthCustomer(args),
  );

  const handleSubmit = async (values: CustomerRegistrationFormType) => {
    try {
        setLoading(true);
        const payload: CustomerRegistrationParams = {
            username: values.username,
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
        }
        
        const result = await createCustomerAuthCb.execute(payload);
        if (result.status === 201 && result.data.success) {
            showToast("Account created successfully! Please log in with your new account.", "success");
            router.push(router => router.customerLogin);
            setResetForm(true);
            setTimeout(() => setResetForm(false), 100);
        }

    } catch (e) {
        console.error("Customer registration failed", e);
        showToast("Registration failed. Please try again.", "error");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
    } finally {
        setLoading(false);
    }
  };

  const submissionLoading = loading || createCustomerAuthCb.loading;

  return (
    <CustomerRegistrationForm
      onSubmit={handleSubmit}
      submitLoading={submissionLoading}
      resetForm={resetForm}
    />
  );
};