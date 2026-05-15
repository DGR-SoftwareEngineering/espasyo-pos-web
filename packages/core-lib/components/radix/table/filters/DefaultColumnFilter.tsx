import React, { useState } from "react";
import { TextField as RadixTextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { FilterProps } from "react-table";

export function DefaultColumnFilter<T extends Record<string, unknown>>({
  column: { id },
  onChange,
  filterValue = "",
}: FilterProps<T>) {
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
