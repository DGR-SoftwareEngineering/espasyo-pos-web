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
      defaultValues: { userName: '', password: '' },
    });

  useFormFocusOnError<LoginFormType>(formState.errors, setFocus);
  useKeyDown("Enter", () => handleSubmit(onSubmit)());
  useFormSubmissionBindingHooks({
    key: "espasyo-sign-in-submission",
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    cb: () => handleSubmit(onSubmit)(),
  });

  const inputStyle = {
    borderRadius: "12px",
    height: "56px",
    backgroundColor: "#F9FAFB",
    "& fieldset": {
      borderRadius: "12px",
      borderColor: "#E5E7EB",
    },
    "&:hover fieldset": {
      borderColor: "#7F5100",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#7F5100",
    },
    "& .MuiInputBase-input": {
      paddingLeft: "20px", 
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF]">
      <div className="flex min-h-screen w-full">
        <div className="relative hidden min-h-screen w-1/2 border-r-4 border-[#7F5100] xl:block">
          <img
            src="coffee_bg.jpg"
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

  
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 sm:px-12.5 xl:w-1/2 xl:px-24">
          <div className="w-full max-w-[450px]">
            <div className="mb-10 text-center">
              <Link href="/">
                <img
                  src="new-espasyo.png"
                  alt="Espasyo Logo"
                  className="mx-auto h-[150px] w-[150px] rounded-full object-contain drop-shadow-lg sm:h-[230px] sm:w-[230px]"
                
                />
              </Link>
              <h2 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">
                Espasyo Coffee | POS System
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div>
                <TextField<LoginFormType>
                  data-testid="auth-username"
                  name="userName"
                  control={control}
                  label="Username"
                  placeholder="Enter username"
                  type="text"
                  fullWidth
                  {...({ sx: inputStyle } as any)}
                />
              </div>

              {/* Password Field */}
            
                <TextField<LoginFormType>
                  data-testid="auth-password"
                  name="password"
                  control={control}
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  onBlur={() => clearErrors()}
                  {...({ sx: inputStyle } as any)}
                />
             

              {/* Login Button */}
              <Button
                disabled={submitLoading}
                loading={submitLoading}
                variant="contained"
                type={"submit" as any}
                fullWidth
                sx={{
                  py: 1.75,
                  backgroundColor: "#7F5100",
                  borderRadius: "12px", // Matching the rounded style of inputs
                  fontSize: "1rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#603d00",
                  },
                }}
              >
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;