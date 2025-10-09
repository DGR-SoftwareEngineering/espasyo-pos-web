import { Grid, OutlinedInputProps, Typography } from "@mui/material";
import { FocusEvent, JSX, useState } from "react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Path,
  UnpackNestedValue,
} from "react-hook-form";
import { Input } from "./Input";
import { InputLoader } from "../loaders/InputLoader";
import { FieldError } from "./FieldError";

interface Props<T extends object> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: UnpackNestedValue<FieldPathValue<T, FieldPath<T>>>;
  label?: string | JSX.Element | null;
  color?: OutlinedInputProps["color"];
  type?: OutlinedInputProps["type"];
  startAdornment?: OutlinedInputProps["startAdornment"];
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

interface ComponentProps<T extends object>
  extends Omit<Props<T>, "name" | "control" | "defaultValue"> {
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
  ...props
}: ComponentProps<T>) => {
  const field = { ...rawField, inputRef: rawField?.ref, ref: undefined };
  const [, setIsFocus] = useState(false); //add state if error tooltip is ready.

  return (
    <Grid container spacing={2} direction="column">
      <Grid>
        {fieldState?.error?.message
          ? showErrorBelowLabelFn()
          : label !== null && renderLabelFn()}
      </Grid>
      <Grid>
        {isLoading ? (
          <InputLoader />
        ) : (
          <>
            <Input
              {...props}
              {...field}
              id={field?.name}
              data-testid={props["data-testid"] || `${field.name}-field`}
              error={!!fieldState?.error?.message}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={field.value ?? ""}
              onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
            />
            {fieldState?.error?.message && !showErrorBelowLabel && (
              <FieldError message={fieldState.error.message} />
            )}
          </>
        )}
      </Grid>
    </Grid>
  );

  function handleFocus(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) {
    setIsFocus(true);
    onFocus?.(e);
  }

  function handleBlur(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
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
        {label ?? "[[label_name]]"}
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
