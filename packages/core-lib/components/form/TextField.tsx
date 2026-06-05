import {
  Grid,
  OutlinedInputProps,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FocusEvent, JSX, useState } from "react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { Input } from "./Input";
import { InputLoader } from "../loaders/InputLoader";
import { FieldError } from "./FieldError";

interface Props<T extends object> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: PathValue<T, Path<T>>;
  label?: string | JSX.Element | null;
  color?: OutlinedInputProps["color"];
  fullWidth?: boolean;
  type?: OutlinedInputProps["type"];
  startAdornment?: OutlinedInputProps["startAdornment"];
  endAdornment?: OutlinedInputProps["endAdornment"];
  placeholder?: OutlinedInputProps["placeholder"];
  showErrorBelowLabel?: boolean;
  isLoading?: boolean;
  "data-testid"?: string;
  onFocus?: OutlinedInputProps["onFocus"];
  onBlur?: OutlinedInputProps["onBlur"];
  onEnter?(): void;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  tailwindDesign?: boolean;
  className?: string;
  showPasswordToggle?: boolean;
}

export const TextField = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  ...props
}: Props<T>) => (
  <Controller<T>
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ formState: _, ...controllerProps }) => (
      <TextFieldComponent {...controllerProps} {...props} />
    )}
  />
);

interface ComponentProps<T extends object> extends Omit<
  Props<T>,
  "name" | "control" | "defaultValue"
> {
  field?: ControllerRenderProps<T, Path<T>>;
  fieldState?: ControllerFieldState;
}

export const TextFieldComponent = <T extends object>({
  label,
  field: rawField,
  fieldState,
  showErrorBelowLabel,
  onFocus,
  onBlur,
  onEnter,
  isLoading,
  tailwindDesign = false,
  type = "text",
  showPasswordToggle = false,
  ...props
}: ComponentProps<T>) => {
  const field = { ...rawField, inputRef: rawField?.ref, ref: undefined };
  const [, setIsFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <Grid container spacing={2} direction="column">
      <Grid>
        {!tailwindDesign ? (
          fieldState?.error?.message ? (
            showErrorBelowLabelFn()
          ) : (
            label !== null && renderLabelFn()
          )
        ) : (
          <label
            htmlFor={label?.toString().toLowerCase()}
            className="block text-sm/6 font-medium text-gray-100"
          >
            {label}
          </label>
        )}
      </Grid>

      <Grid>
        {isLoading ? (
          <InputLoader />
        ) : (
          <>
            {!tailwindDesign ? (
              <Input
                {...props}
                {...field}
                disabled={props.disabled}
                id="{field?.name}"
                type={inputType}
                data-testid={props["data-testid"] || "${field.name}-field"}
                error={!!fieldState?.error?.message}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={field.value ?? ""}
                onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
                endAdornment={
                  showPasswordToggle && type === "password" ? (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) : (
                    props.endAdornment
                  )
                }
              />
            ) : (
              <div className="relative">
                <input
                  {...field}
                  {...props}
                  disabled={props.disabled}
                  id={field.name}
                  type={inputType}
                  data-testid={props["data-testid"] || "${field.name}-field"}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={field.value ?? ""}
                  onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
                  className={`w-full px-3 py-2 border rounded-md ${
                    showPasswordToggle && type === "password" ? "pr-10" : ""
                  }`}
                />

                {showPasswordToggle && type === "password" && (
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            )}

            {fieldState?.error?.message && !showErrorBelowLabel && (
              <FieldError message={fieldState.error.message} />
            )}
          </>
        )}
      </Grid>
    </Grid>
  );

  function handleFocus(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) {
    setIsFocus(true);

    onFocus?.(e);
  }

  function handleBlur(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) {
    setIsFocus(false);

    onBlur?.(e);
  }

  function renderLabelFn() {
    return (
      <Typography
        component="label"
        htmlFor={field?.name}
        color={fieldState?.error && "error"}
      >
        {label}
      </Typography>
    );
  }

  function showErrorBelowLabelFn() {
    if (showErrorBelowLabel && label) {
      return (
        <>
          {renderLabelFn()}

          <FieldError message={fieldState?.error?.message!} />
        </>
      );
    }

    return renderLabelFn();
  }
};
