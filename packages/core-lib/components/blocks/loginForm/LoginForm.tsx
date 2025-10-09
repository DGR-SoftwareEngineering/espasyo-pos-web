import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { PrimaryButton, TextField } from "../..";
import { LoginForm as LoginFormType, loginFormSchema } from "./validation";
import { useFormFocusOnError } from "../../../core/hooks";

interface Props {
  onSubmit: (values: LoginFormType) => void;
  submitLoading: boolean;
}

export const LoginForm: React.FC<Props> = ({ onSubmit, submitLoading }) => {
  const { handleSubmit, control, formState, setFocus, clearErrors } =
    useForm<LoginFormType>({
      resolver: yupResolver(loginFormSchema),
      mode: "onChange",
      defaultValues: loginFormSchema.getDefault(),
    });

  useFormFocusOnError<LoginFormType>(formState.errors, setFocus);

  return (
    <>
      <form data-testid="authentication_form" id="login-form" name="login-form">
        <Grid container direction="column" rowSpacing={12}>
          <Grid size={{ md: 6, lg: 4 }}>
            <TextField<LoginFormType>
              data-testid="auth-username"
              name="userName"
              control={control}
              label="Username"
              onBlur={() => clearErrors()}
            />
          </Grid>
          <Grid size={{ md: 6, lg: 4 }}>
            <TextField<LoginFormType>
              data-testid="auth-password"
              name="password"
              control={control}
              label="Password"
              type="password"
              onBlur={() => clearErrors()}
            />
          </Grid>
        </Grid>
        <Box mt={16}>
          <PrimaryButton
            onClick={handleSubmit(onSubmit)}
            loading={submitLoading}
            id="login-button"
            name="login-button"
            data-testid="auth-submit-button"
          >
            Sign in
          </PrimaryButton>
        </Box>
      </form>
    </>
  );
};
