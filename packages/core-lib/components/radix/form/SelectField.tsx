import React, { JSX } from "react";
import { Select, Flex, Text } from "@radix-ui/themes";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { FieldError } from "./FieldError";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T, object>;
  label?: string | JSX.Element;
  options?: SelectOption[];
  placeholder?: string;
  size?: "1" | "2" | "3";
  disabled?: boolean;
  isLoading?: boolean;
  onSelectOption?: (option: SelectOption) => void;
  "data-testid"?: string;
  className?: string;
}

export const SelectField = <T extends FieldValues>({
  name,
  control,
  label,
  options = [],
  placeholder = "Select…",
  size = "2",
  disabled,
  isLoading,
  onSelectOption,
  className,
  ...rest
}: Props<T>) => (
  <Controller<T>
    name={name}
    control={control}
    render={({ field, fieldState }) => {
      const hasError = !!fieldState.error?.message;
      return (
        <Flex direction="column" gap="1" className={className}>
          {label !== undefined && label !== null && (
            <Text
              as="label"
              size="2"
              weight="medium"
              htmlFor={field.name}
              style={{ color: hasError ? "var(--red-11)" : undefined }}
            >
              {label}
            </Text>
          )}
          <Select.Root
            size={size}
            disabled={disabled || isLoading}
            value={field.value ?? undefined}
            onValueChange={(value) => {
              field.onChange(value);
              const selected = options.find((o) => o.value === value);
              if (selected) onSelectOption?.(selected);
            }}
          >
            <Select.Trigger
              id={field.name}
              placeholder={placeholder}
              color={hasError ? "red" : undefined}
              data-testid={rest["data-testid"] ?? `${field.name}-field`}
            />
            <Select.Content position="popper">
              {options.length === 0 ? (
                <Select.Item value="__empty" disabled>
                  No options
                </Select.Item>
              ) : (
                options.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))
              )}
            </Select.Content>
          </Select.Root>
          <FieldError message={fieldState.error?.message} />
        </Flex>
      );
    }}
  />
);
