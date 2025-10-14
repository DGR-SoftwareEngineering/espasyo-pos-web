import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { Button, TextField } from "../..";
import { LoginForm as LoginFormType, loginFormSchema } from "./validation";
import { useFormFocusOnError, useKeyDown } from "../../../core/hooks";
import Image from "next/image";
import { AbbottBackground, AbbottLogo } from "../../../assets";

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
  useKeyDown("Enter", () => handleSubmit(onSubmit)());

  return (
    <>
      <div className="flex items-center justify-between w-full h-auto md:h-screen">
        <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden">
          <Box
            component={Image}
            src={AbbottBackground}
            alt="Escreen-tms"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              border: "8px solid white",
              borderRadius: "24px",
              zIndex: -1,
              "@media (max-width: 1600px)": {
                width: "650px",
              },
              "@media (min-width: 1550px)": {
                width: "825px",
              },
            }}
          />
          <Box className="flex z-0 items-center justify-center">
            <div className="flex items-center justify-center h-screen flex-col lg:px-24">
              <h4 className="pt-sans-caption-bold text-[3rem] text-white mb-2 z-1">
                Welcome to <span className="text-yellow">Test EScreen TMS</span>
              </h4>
              <h5 className="pt-sans-regular text-white text-[1.5rem]">
                Test.
              </h5>
            </div>
          </Box>
        </div>

        <div className="flex flex-col justify-center w-full h-auto lg:w-[40rem] xl:w-[68rem] px-12 xl:px-60 lg:px-24 mt-12 md:mt-0">
          <div className="w-full">
            <div className="flex items-center justify-center">
              <Box
                sx={{
                  width: "120px", // smaller size
                  height: "auto",
                  "@media (max-width: 600px)": {
                    width: "90px",
                  },
                }}
              >
                <Image
                  src={AbbottLogo}
                  className=""
                  alt="Abbott"
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                  quality={100}
                />
              </Box>
            </div>
            <div>
              <h5 className="font-ptSans font-bold text-[30px] text-[#232323] lg:text-[40px] mb-2">
                Login
              </h5>
              <p className="font-ptSansNarrow font-light text-[18px] lg:text-[20px] text-darkGray">
                Please login to continue to your account.
              </p>
              <form
                data-testid="authentication_form"
                id="login-form"
                name="login-form"
              >
                <Grid container direction="column" rowSpacing={12}>
                  <Grid item md={6} lg={4}>
                    <TextField<LoginFormType>
                      data-testid="auth-username"
                      name="userName"
                      control={control}
                      label="Username"
                      onBlur={() => clearErrors()}
                    />
                  </Grid>
                  <Grid item md={6} lg={4}>
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
                  <Button
                    disabled={submitLoading}
                    loading={submitLoading}
                    variant="contained"
                    fullWidth
                    sx={{
                      px: 4,
                      py: 2,
                      backgroundColor: "#0F2A71",
                      borderRadius: "10px",
                      "&:hover": {
                        backgroundColor: "#00173F",
                      },
                    }}
                    onClick={handleSubmit(onSubmit)}
                  >
                    <span className="font-ptSansNarrow font-bold text-[18px] lg:text-[20px] normal-case">
                      Sign In
                    </span>
                  </Button>
                </Box>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
