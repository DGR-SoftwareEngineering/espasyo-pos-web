import React, { useMemo } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { AutoCompleteField } from "./form/AutoCompleteField";

export interface LookupOption {
  id: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface LookupPickerProps<TForm extends FieldValues, TOption extends LookupOption> {
  name: Path<TForm>;
  control: Control<TForm>;
  options: TOption[];
  label?: React.ReactNode;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  noOptionText?: React.ReactNode;
  onSelect?: (option: TOption | null) => void;
  "data-testid"?: string;
}

export function LookupPicker<
  TForm extends FieldValues,
  TOption extends LookupOption,
>({
  name,
  control,
  options,
  label,
  placeholder = "Select…",
  loading,
  disabled,
  noOptionText = "No matching options",
  onSelect,
  ...rest
}: LookupPickerProps<TForm, TOption>) {
  const sortedActiveOptions = useMemo(
    () =>
      [...options]
        .filter((o) => o.isActive !== false)
        .sort((a, b) => {
          const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        }),
    [options],
  );

  return (
    <AutoCompleteField<TForm, TOption>
      name={name}
      control={control}
      options={sortedActiveOptions}
      loading={loading}
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      noOptionText={noOptionText}
      getOptionLabel={(opt) => opt.name}
      getOptionValue={(opt) => opt.id}
      onSelectOption={(opt) => onSelect?.(opt as TOption | null)}
      data-testid={rest["data-testid"]}
    />
  );
}
