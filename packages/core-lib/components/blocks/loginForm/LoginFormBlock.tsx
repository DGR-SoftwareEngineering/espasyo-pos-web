import { Box } from "@mui/material";
import { useState } from "react";
import { useAuthContext, useToastContext } from "../../../core/contexts";
import { useRouter } from "../../../core/router";
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

  return (
    <Box id={id} sx={{ backgroundColor, width: "100%" }} display="flex">
      <LoginForm submitLoading={loading} onSubmit={handleSubmit} />
    </Box>
  );

  async function handleSubmit({ userName, password }: LoginFormType) {
    try {
      setLoading(true);
      await login({ userName, password });
      await router.push((router) => router.hub);
      showToast("Success", "success");
    } catch (err) {
      const errors = err as string[];
      console.error(`Problem during login: ${errors}`); //remove in the future.
      showToast("Invalid username or password", "error");
    } finally {
      setLoading(false);
    }
  }
};
