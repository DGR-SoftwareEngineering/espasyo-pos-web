import { KeyboardArrowDown } from "@mui/icons-material";
import { FormControl, Grid, MenuItem, Select, Typography } from "@mui/material";
import { SelectProps } from "@mui/material/Select/Select";
import { JSX, useState } from "react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { FieldError } from "./FieldError";
import { InputLoader } from "../loaders/InputLoader";
import {
  DriverSelectionOptions,
  HelperSelectionOptions,
} from "./selection-types";

export interface SelectOption {
  value: string;
  label: string;
  driver?: DriverSelectionOptions;
  helper?: HelperSelectionOptions;
}

type Props<T extends object> = SelectProps & {
  name: Path<T>;
  control: Control<T, object>;
  isLoading?: boolean;
  "data-testid"?: string;
  label?: string | JSX.Element;
  options?: SelectOption[];
  onSelectOption?: (option: SelectOption) => void;
};

export const SelectField = <T extends FieldValues>({
  name,
  control,
  ...props
}: Props<T>) => (
  <Controller<T>
    name={name}
    control={control}
    render={({ formState: _, ...controllerProps }) => (
      <SelectComponent {...controllerProps} {...props} />
    )}
  />
);

interface ComponentProps<T extends FieldValues>
  extends Omit<Props<T>, "name" | "control" | "defaultValue"> {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState?: ControllerFieldState;
}

const SelectComponent = <T extends FieldValues>({
  isLoading,
  field,
  fieldState,
  label,
  options = [],
  onSelectOption,
  ...props
}: ComponentProps<T>) => {
  const [ref, setRef] = useState<HTMLInputElement | null>(null);
  return (
    <Grid container spacing={2} direction="column">
      <Grid>
        {fieldState?.error?.message ? (
          <FieldError message={fieldState.error.message} />
        ) : (
          <Typography component="label" htmlFor={field?.name}>
            {label ?? "[[label_name]]"}
          </Typography>
        )}
      </Grid>
      <Grid>
        {isLoading ? (
          <InputLoader />
        ) : (
          <FormControl sx={{ width: "100%" }}>
            <Select
              {...props}
              {...field}
              fullWidth
              ref={setRef}
              inputRef={setRef}
              color="primary"
              value={field.value ?? ""}
              data-testid={props["data-testid"] || `${field.name}-field`}
              IconComponent={KeyboardArrowDown}
              onChange={(e) => {
                const selectedValue = e.target.value;
                const selectedOption = options.find(
                  (opt) => opt.value === selectedValue
                );

                if (selectedOption && onSelectOption) {
                  onSelectOption(selectedOption);
                }

                field.onChange(selectedValue);
              }}
            >
              {options.map((option, index) => (
                <MenuItem
                  key={`${option.label}_${index}`}
                  value={option.value}
                  selected={option.value == field.value}
                  id={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Grid>
    </Grid>
  );
};
