import React, { useState } from "react";
import { TextField as RadixTextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { FilterProps } from "react-table";

interface DefaultColumnFilterProps<T extends Record<string, unknown>> extends Omit<FilterProps<T>, "column"> {
  onChange: (filter: { id: string; value: string }) => void;
  column: { id: string };
  filterValue?: string;
}

export function DefaultColumnFilter<T extends Record<string, unknown>>({
  column: { id },
  onChange,
  filterValue = "",
}: DefaultColumnFilterProps<T>) {
  const [value, setValue] = useState(filterValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange({ id, value: event.target.value ?? "" });
  };

  return (
    <RadixTextField.Root
      name={id}
      value={value}
      onChange={handleChange}
      placeholder="Search by keyword"
      maxLength={60}
      size="2"
      style={{ width: "100%" }}
    >
      <RadixTextField.Slot side="left">
        <MagnifyingGlassIcon />
      </RadixTextField.Slot>
    </RadixTextField.Root>
  );
}
