import React, { JSX, useState } from "react";
import { TextField as RadixTextField, TextArea, Text, Flex, IconButton } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { FieldError } from "./FieldError";

type RadixSize = "1" | "2" | "3";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: PathValue<T, Path<T>>;
  label?: string | JSX.Element | null;
  type?: React.HTMLInputTypeAttribute;
  size?: RadixSize;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  showErrorBelowLabel?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  showPasswordToggle?: boolean;
  className?: string;
  "data-testid"?: string;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onEnter?(): void;
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
    render={({ field, fieldState }) => (
      <TextFieldComponent<T>
        field={field}
        fieldState={fieldState}
        {...props}
      />
    )}
  />
);

interface ComponentProps<T extends FieldValues> extends Omit<
  Props<T>,
  "name" | "control" | "defaultValue"
> {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
}

const TextFieldComponent = <T extends FieldValues>({
  field,
  fieldState,
  label,
  type = "text",
  size = "2",
  placeholder,
  startAdornment,
  endAdornment,
  showErrorBelowLabel,
  isLoading,
  disabled,
  multiline,
  rows = 3,
  showPasswordToggle,
  className,
  onFocus,
  onBlur,
  onEnter,
  ...rest
}: ComponentProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;
  const hasError = !!fieldState.error?.message;
  const errorMessage = fieldState.error?.message;
  const testId = rest["data-testid"] ?? `${field.name}-field`;

  const renderLabel =
    label !== null && label !== undefined ? (
      <Text
        as="label"
        size="2"
        weight="medium"
        htmlFor={field.name}
        style={{ color: hasError ? "var(--red-11)" : undefined }}
      >
        {label}
      </Text>
    ) : null;

  if (multiline) {
    return (
      <Flex direction="column" gap="1" className={className}>
        {renderLabel}
        {showErrorBelowLabel && <FieldError message={errorMessage} />}
        <TextArea
          {...field}
          id={field.name}
          size={size}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={rows}
          color={hasError ? "red" : undefined}
          value={field.value ?? ""}
          onFocus={onFocus}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e);
          }}
          data-testid={testId}
        />
        {!showErrorBelowLabel && <FieldError message={errorMessage} />}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="1" className={className}>
      {renderLabel}
      {showErrorBelowLabel && <FieldError message={errorMessage} />}
      <RadixTextField.Root
        id={field.name}
        size={size}
        placeholder={placeholder}
        type={inputType}
        disabled={disabled || isLoading}
        color={hasError ? "red" : undefined}
        value={field.value ?? ""}
        onChange={(e) => field.onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={(e) => {
          field.onBlur();
          onBlur?.(e);
        }}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        data-testid={testId}
      >
        {startAdornment && (
          <RadixTextField.Slot side="left">{startAdornment}</RadixTextField.Slot>
        )}
        {(endAdornment || (showPasswordToggle && type === "password")) && (
          <RadixTextField.Slot side="right">
            {showPasswordToggle && type === "password" ? (
              <IconButton
                size="1"
                variant="ghost"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </IconButton>
            ) : (
              endAdornment
            )}
          </RadixTextField.Slot>
        )}
      </RadixTextField.Root>
      {!showErrorBelowLabel && <FieldError message={errorMessage} />}
    </Flex>
  );
};
