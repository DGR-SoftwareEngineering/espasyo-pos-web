import React, { useState } from "react";
import { useAuthContext, useToastContext } from "core-lib";
import { useRouter } from "core-lib/core/router";
import { LoginForm } from "./LoginForm";
import { LoginForm as LoginFormType } from "./validation";

interface Props {
  id?: string;
  backgroundColor?: string | null;
}

export const LoginFormBlock: React.FC<Props> = ({ id, backgroundColor }) => {
  const router = useRouter();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToastContext();

  return <LoginForm submitLoading={loading} onSubmit={handleSubmit} />;

  async function handleSubmit({ userName, password }: LoginFormType) {
    try {
      setLoading(true);
      await login({ userName, password });
      await router.push((router) => router.hub);
      showToast("Successfully Logged in", "success");
    } catch (error) {
      const errors = error as string[];
      console.error(`Problem during login: ${errors}`);
      showToast("Invalid username or password", "error");
    } finally {
      setLoading(false);
    }
  }
};
