import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Link, TextField } from "core-lib/components";
import { LoginForm as LoginFormType, loginFormSchema } from "./validation";
import {
  useFormFocusOnError,
  useFormSubmissionBindingHooks,
  useKeyDown,
} from "core-lib/core/hooks";
import { LoginSVG } from "../svgs/LoginSVG";

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
  useFormSubmissionBindingHooks({
    key: "espasyo-sign-in-submission",
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    cb: () => handleSubmit(onSubmit)(),
  });

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
      className="rounded-sm h-screen border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div className="flex h-screen flex-wrap items-center">
        <div className="hidden w-full h-screen xl:block xl:w-1/2">
          <div className="py-2 px-26 text-center">
            <Link className="mb-5.5 inline-block" href="/">
              <img
                src="/new-espasyo.png"
                alt="logo"
                style={{
                  borderRadius: "10px",
                  width: "120px",
                  height: "120px",
                }}
              />
            </Link>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Point of Sales & Inventory System
            </h2>
            <p className="2xl:px-20">
              Fueling Smarter Operations at Espasyo Coffee through a Unified POS
              and Inventory Solution.
            </p>
            <span className="mt-15 inline-block">
              <LoginSVG />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">Welcome</span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign In to Espasyo Coffee | POS System
            </h2>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Username
              </label>
              <div className="relative">
                <TextField<LoginFormType>
                  data-testid="auth-username"
                  name="userName"
                  control={control}
                  placeholder="(e.g., JohnDoe)"
                  onBlur={() => clearErrors()}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <TextField<LoginFormType>
                  data-testid="auth-password"
                  name="password"
                  control={control}
                  type="password"
                  onBlur={() => clearErrors()}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>

              <div className="text-sm">
                <Link
                  href={{
                    pathname: "/",
                  }}
                  className="font-medium text-[#8B255B] text-[13px] hover:text-[#5e2855]"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <div className="mb-5">
              <Button
                disabled={submitLoading}
                loading={submitLoading}
                variant="contained"
                customActionKey="espasyo-sign-in-submission"
                fullWidth
                sx={{
                  px: 4,
                  py: 2,
                  backgroundColor: "#0F2A71",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#00173F",
                  },
                  mt: "15px",
                }}
              >
                <span className="font-ptSansNarrow font-bold text-[18px] lg:text-[20px] normal-case">
                  Sign In
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
