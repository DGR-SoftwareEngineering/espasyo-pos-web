import { AutoCompleteField } from "../../form";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { MapOption } from "../types";
import { isOptionEqualToValue, safeGetOptionLabel } from "../utils";

type Props<TForm extends FieldValues> = {
  name: Path<TForm>;
  control: Control<TForm>;
  options: MapOption[];
  loading?: boolean;
  placeholder?: string;
  onSelect?: (opt: MapOption | null) => void;
};

export function ToField<TForm extends FieldValues>({
  name,
  control,
  options,
  loading,
  placeholder,
  onSelect,
}: Props<TForm>) {
  return (
    <AutoCompleteField<TForm, MapOption>
      name={name}
      control={control}
      options={options}
      loading={loading}
      getOptionLabel={safeGetOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      valueMode="option"
      onSelectOption={(selected) =>
        onSelect && onSelect(selected as MapOption | null)
      }
      placeholder={placeholder}
    />
  );
}
