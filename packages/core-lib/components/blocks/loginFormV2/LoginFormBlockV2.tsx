import { Box } from "@mui/material";
import { useState } from "react";
import { useAuthContext, useToastContext } from "../../../core/contexts";
import { useRouter } from "next/router";
import { LoginFormV2 } from "./LoginFormV2";
import { LoginFormV2 as LoginFormType } from "./validation";

interface Props {
  id?: string;
  backgroundColor?: string | null;
}

export const LoginFormBlockV2: React.FC<Props> = ({ id, backgroundColor }) => {
  const router = useRouter();
  //   const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  //   const { showToast } = useToastContext();

  return <LoginFormV2 submitLoading={loading} onSubmit={async () => {}} />;
};
