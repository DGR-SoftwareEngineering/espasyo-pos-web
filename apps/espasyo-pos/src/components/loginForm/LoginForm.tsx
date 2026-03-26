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
    <div className="h-screen w-full overflow-hidden bg-[#FFFFFF]">
      <div className="flex h-full w-full">
        {/* Left Side: Branding/Image */}
        <div className="relative hidden h-full w-1/2 border-r-4 border-[#7F5100] xl:block">
          <img
            src="espasyo_bg.jpg"
            alt="Espasyo Coffee Interior"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 p-12">
            <div className="rounded-2xl border border-white/20 bg-black/40 p-10 backdrop-blur-md">
              <h2 className="mb-4 text-5xl font-bold leading-tight text-[#D3A970]">
                Point of Sales & <br /> Inventory System
              </h2>
              <p className="text-xl leading-relaxed text-white/90">
                Fueling Smarter Operations at Espasyo Coffee through a <br />
                Unified POS and Inventory Solution.
              </p>
            </div>
          </div>
        </div>


        <div className="flex h-full w-full flex-col items-center justify-center px-8 sm:px-12.5 xl:w-1/2 xl:px-24">
          <div className="w-full max-w-[450px]">
            <div className="mb-10 text-center">
              <Link href="/">
                <img
                  src="new-espasyo.png"
                  alt="Espasyo Logo"
                  className="mx-auto h-[230px] w-[230px] rounded-full object-contain drop-shadow-lg"
                />
              </Link>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Espasyo Coffee | POS System
              </h2>
            </div>

            <div className="space-y-6">
            
              <TextField<LoginFormType>
                data-testid="auth-username"
                name="userName"
                control={control}
                label="Username"
                placeholder="Enter username"
                fullWidth 
                className="h-[56px] rounded-[12px] bg-[#F9FAFB]"
                
              />

              <TextField<LoginFormType>
                data-testid="auth-password"
                name="password"
                control={control}
                label="Password"
                placeholder="Enter password"
                fullWidth
                showPasswordToggle={true}
                type="password"
                onBlur={() => clearErrors()}
                className="h-[56px] rounded-[12px] bg-[#F9FAFB]"
              />

              <Button
                disabled={submitLoading}
                loading={submitLoading}
                onClick={() => handleSubmit(onSubmit)()}
                variant="contained"
                fullWidth
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;