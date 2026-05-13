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

/**
 * Single-select picker for any of the typed lookup tables (Unit, ProductCategory,
 * IngredientCategory, Location, Brand). Caller normalizes the lookup DTO into a
 * { id, name } shape, then this component handles the rest — sorting by
 * displayOrder, filtering inactive rows, debounced search.
 */
export function LookupPicker<
  TForm extends FieldValues,
  TOption extends LookupOption,
>({
  name,
  control,
  options,
  label,
  placeholder = "Select...",
  loading,
  disabled,
  noOptionText = "No matching options",
  onSelect,
  "data-testid": dataTestId,
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
      label={label}
      placeholder={placeholder}
      noOptionText={noOptionText}
      getOptionLabel={(opt) => opt.name}
      getOptionValue={(opt) => opt.id}
      onSelectOption={(opt) => onSelect?.(opt as TOption | null)}
      textFieldProps={{ size: "small", disabled }}
      data-testid={dataTestId}
    />
  );
}
