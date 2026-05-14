import React from "react";
import { Text, Flex, Box } from "@radix-ui/themes";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FieldError } from "../form/FieldError";

type SelectedColor =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning";

export interface ToggleOption<T = unknown> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  selectedColor?: SelectedColor;
}

interface ToggleFieldProps<T extends FieldValues, U = unknown> {
  name: Path<T>;
  control: Control<T>;
  options: ToggleOption<U>[];
  label?: string | React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: "1" | "2" | "3";
  onChange?: (value: U) => void;
  "data-testid"?: string;
}

const COLOR_VARS: Record<SelectedColor, { bg: string; border: string; fg: string }> = {
  primary: { bg: "var(--accent-a3)", border: "var(--accent-9)", fg: "var(--accent-11)" },
  secondary: { bg: "var(--gray-a3)", border: "var(--gray-9)", fg: "var(--gray-12)" },
  success: { bg: "var(--green-a3)", border: "var(--green-9)", fg: "var(--green-11)" },
  error: { bg: "var(--red-a3)", border: "var(--red-9)", fg: "var(--red-11)" },
  info: { bg: "var(--blue-a3)", border: "var(--blue-9)", fg: "var(--blue-11)" },
  warning: { bg: "var(--amber-a3)", border: "var(--amber-9)", fg: "var(--amber-11)" },
};

export const ToggleField = <T extends FieldValues, U = unknown>({
  name,
  control,
  options,
  label,
  required,
  disabled,
  onChange: externalOnChange,
  ...rest
}: ToggleFieldProps<T, U>) => (
  <Controller<T, Path<T>>
    name={name}
    control={control}
    render={({ field, fieldState }) => {
      const hasError = !!fieldState.error?.message;
      const testId = rest["data-testid"] ?? `toggle-${field.name}`;

      return (
        <Flex direction="column" gap="2" width="100%">
          {label && (
            <Text
              as="div"
              size="2"
              weight="medium"
              style={{ color: hasError ? "var(--red-11)" : undefined }}
            >
              {label}
              {required && (
                <Text style={{ color: "var(--red-9)", marginLeft: 4 }}>*</Text>
              )}
            </Text>
          )}

          <Flex gap="2" wrap="wrap" width="100%" data-testid={testId}>
            {options.map((option, index) => {
              const isSelected = field.value === option.value;
              const isDisabled = disabled || option.disabled;
              const color = COLOR_VARS[option.selectedColor ?? "primary"];

              return (
                <Box
                  key={index}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    field.onChange(option.value);
                    externalOnChange?.(option.value);
                  }}
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: "12px 16px",
                    borderRadius: "var(--radius-3)",
                    border: `1px solid ${
                      isSelected ? color.border : "var(--gray-a5)"
                    }`,
                    background: isSelected ? color.bg : "var(--color-panel-solid)",
                    color: isSelected ? color.fg : "var(--gray-12)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: "all 0.15s ease-in-out",
                    userSelect: "none",
                  }}
                >
                  <Flex align="center" gap="3">
                    {option.icon && (
                      <Box
                        style={{
                          display: "inline-flex",
                          color: isSelected ? color.fg : "var(--gray-11)",
                        }}
                      >
                        {option.icon}
                      </Box>
                    )}
                    <Flex direction="column" align="start" gap="1">
                      <Text size="2" weight="bold">
                        {option.label}
                      </Text>
                      {option.description && (
                        <Text
                          size="1"
                          style={{
                            color: isSelected
                              ? color.fg
                              : "var(--gray-11)",
                            opacity: 0.85,
                          }}
                        >
                          {option.description}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Box>
              );
            })}
          </Flex>

          <FieldError message={fieldState.error?.message} />
        </Flex>
      );
    }}
  />
);
