import { Box } from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "../../../core/contexts";
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

  return (
    <Box id={id} sx={{ backgroundColor, width: "100%" }} display="flex">
      <LoginForm submitLoading={loading} onSubmit={handleSubmit} />
    </Box>
  );

  async function handleSubmit({ userName, password }: LoginFormType) {
    try {
    } catch (error) {}
  }
};
