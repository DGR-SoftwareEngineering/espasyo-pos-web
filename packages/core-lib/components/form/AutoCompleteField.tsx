"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Grid,
  TextField,
  Typography,
  AutocompleteProps,
} from "@mui/material";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
  ControllerFieldState,
} from "react-hook-form";
import { FieldError } from "./FieldError";
import { InputLoader } from "../loaders/InputLoader";
import { config } from "../../config";

type ReactNode = React.ReactNode;

export type ValueMode = "id" | "option";

type AutoValue<
  TOption,
  TMultiple extends boolean,
  TFreeSolo extends boolean
> = TFreeSolo extends true
  ? TMultiple extends true
    ? Array<string | TOption>
    : string | TOption | null
  : TMultiple extends true
  ? TOption[]
  : TOption | null;

export interface AutocompleteFieldBaseProps<
  TOption,
  TMultiple extends boolean,
  TFreeSolo extends boolean
> {
  label?: ReactNode;
  options?: TOption[];
  loading?: boolean;
  multiple?: boolean;
  freeSolo?: boolean;
  disableClearable?: boolean;
  disablePortal?: boolean;
  noOptionText?: ReactNode;
  placeholder?: string;
  getOptionLabel: (option: TOption) => string;
  getOptionValue?: (option: TOption) => string | number;
  isOptionEqualToValue?: (option: TOption, value: TOption) => boolean;
  valueMode?: ValueMode;
  onSearch?: (query: string) => Promise<TOption[]> | void;
  loadByIds?: (ids: Array<string | number>) => Promise<TOption[]>;
  onSelectOption?: (
    optionOrOptions: TOption | TOption[] | string | (string | TOption)[] | null
  ) => void;
  renderOption?: AutocompleteProps<
    TOption,
    TMultiple,
    boolean,
    TFreeSolo
  >["renderOption"];
  renderTags?: AutocompleteProps<
    TOption,
    TMultiple,
    boolean,
    TFreeSolo
  >["renderTags"];
  filterOptions?: AutocompleteProps<
    TOption,
    TMultiple,
    boolean,
    TFreeSolo
  >["filterOptions"];
  groupBy?: AutocompleteProps<TOption, boolean, boolean, boolean>["groupBy"];
  textFieldProps?: Omit<
    React.ComponentProps<typeof TextField>,
    "label" | "error"
  >;
  debounceMs?: number;
  cacheKey?: string;
  "data-testid"?: string;
}

export type AutocompleteFieldProps<
  TForm extends FieldValues,
  TOption,
  TMultiple extends boolean = false,
  TFreeSolo extends boolean = false
> = AutocompleteFieldBaseProps<TOption, TMultiple, TFreeSolo> & {
  name: Path<TForm>;
  control: Control<TForm>;
};

interface ComponentProps<
  TForm extends FieldValues,
  TOption,
  TMultiple extends boolean,
  TFreeSolo extends boolean
> extends Omit<
    AutocompleteFieldProps<TForm, TOption, TMultiple, TFreeSolo>,
    "name" | "control"
  > {
  field: ControllerRenderProps<TForm, Path<TForm>>;
  fieldState?: ControllerFieldState;
}

export function AutoCompleteField<
  TForm extends FieldValues,
  TOption,
  TMultiple extends boolean = false,
  TFreeSolo extends boolean = false
>(props: AutocompleteFieldProps<TForm, TOption, TMultiple, TFreeSolo>) {
  const { name, control, ...rest } = props;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <AutocompleteComponent<TForm, TOption, TMultiple, TFreeSolo>
          field={field}
          fieldState={fieldState}
          {...(rest as any)}
        />
      )}
    />
  );
}

function useValueMappers<TOption>(
  getOptionValue?: (o: TOption) => string | number,
  isOptionEqualToValue?: (a: TOption, b: TOption) => boolean
) {
  const getValue = React.useMemo(
    () => getOptionValue ?? ((o: any) => o?.id ?? o?.value),
    [getOptionValue]
  );
  const isEqual = React.useMemo(
    () =>
      isOptionEqualToValue ?? ((a: any, b: any) => getValue(a) === getValue(b)),
    [isOptionEqualToValue, getValue]
  );
  return { getValue, isEqual };
}

function AutocompleteComponent<
  TForm extends FieldValues,
  TOption,
  TMultiple extends boolean,
  TFreeSolo extends boolean
>({
  field,
  fieldState,
  label,
  options: optionsProp = [],
  loading: loadingProp,
  multiple = false as TMultiple,
  freeSolo = false as TFreeSolo,
  disableClearable,
  disablePortal,
  noOptionText = "No options",
  placeholder,
  getOptionLabel,
  getOptionValue,
  isOptionEqualToValue,
  valueMode = "id",
  onSearch,
  loadByIds,
  onSelectOption,
  renderOption,
  renderTags,
  filterOptions,
  groupBy,
  textFieldProps,
  ...rest
}: ComponentProps<TForm, TOption, TMultiple, TFreeSolo> & {
  multiple?: TMultiple;
  freeSolo?: TFreeSolo;
}) {
  const { getValue, isEqual } = useValueMappers(
    getOptionValue,
    isOptionEqualToValue
  );
  const [options, setOptions] = useState<TOption[]>(optionsProp);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(!!loadingProp);
  const cacheRef = useRef<Map<string, TOption[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const formValue = field.value;

  if (config.value.NODE_ENV !== "production") {
    if (valueMode === "id" && !getOptionValue) {
      // eslint-disable-next-line no-console
      console.warn(
        `[AutocompleteField] valueMode="id" requires getOptionValue`
      );
    }
  }

  useEffect(() => {
    if (optionsProp?.length) setOptions(optionsProp);
  }, [optionsProp]);

  useEffect(() => {
    if (!onSearch) return;
    const key = `${rest.cacheKey}:${inputValue.trim().toLowerCase()}`;

    let isActive = true;
    const handler = setTimeout(async () => {
      try {
        if (cacheRef.current.has(key)) {
          if (!isActive) return;
          setOptions(cacheRef.current.get(key) || []);
          setLoading(false);
          return;
        }

        setLoading(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const result = await onSearch(inputValue);
        const nextOptions = Array.isArray(result) ? result : options;

        if (!isActive) return;

        cacheRef.current.set(key, nextOptions);
        setOptions(nextOptions);
        setLoading(false);
      } catch {
        if (!isActive) return;
        setLoading(false);
      }
    }, rest.debounceMs);

    return () => {
      isActive = false;
      clearTimeout(handler);
    };
  }, [inputValue, onSearch, rest.debounceMs, rest.cacheKey]);

  const valueFromForm = useMemo(() => {
    if (freeSolo) {
      return (
        (formValue as AutoValue<TOption, TMultiple, TFreeSolo>) ??
        ((multiple ? [] : "") as any)
      );
    }

    if (valueMode === "option") {
      return (
        (formValue as AutoValue<TOption, TMultiple, TFreeSolo>) ??
        ((multiple ? [] : null) as any)
      );
    }

    if (multiple) {
      const ids = (formValue ?? []) as Array<string | number>;
      if (!Array.isArray(ids)) return [];
      const mapped = ids
        .map((id) => options.find((o) => getValue(o) === id))
        .filter(Boolean) as TOption[];
      return mapped;
    } else {
      const id = formValue as string | number | null | undefined;
      if (id == null) return null;
      const matched = options.find((o) => getValue(o) === id) ?? null;
      return matched;
    }
  }, [formValue, multiple, options, valueMode, freeSolo, getValue]);

  useEffect(() => {
    if (!loadByIds || valueMode !== "id" || freeSolo) return;

    const ensureHydrated = async () => {
      if (multiple) {
        const ids = (formValue ?? []) as Array<string | number>;
        if (!Array.isArray(ids) || ids.length === 0) return;

        const missing = ids.filter(
          (id) => !options.some((o) => getValue(o) === id)
        );
        if (missing.length > 0) {
          const hydrated = await loadByIds(missing);
          setOptions((prev) => {
            const existingIds = new Set(prev.map(getValue));
            const merged = [
              ...prev,
              ...hydrated.filter((o) => !existingIds.has(getValue(o))),
            ];
            return merged;
          });
        }
      } else {
        const id = formValue as string | number | null | undefined;
        if (id == null) return;
        if (!options.some((o) => getValue(o) === id)) {
          const hydrated = await loadByIds([id]);
          setOptions((prev) => [...prev, ...hydrated]);
        }
      }
    };

    void ensureHydrated();
  }, [formValue, loadByIds, multiple, options, getValue, valueMode, freeSolo]);

  type ChangeHandler = NonNullable<
    AutocompleteProps<TOption, TMultiple, boolean, TFreeSolo>["onChange"]
  >;

  const handleChange: ChangeHandler = (_event, newValue, _reason, _details) => {
    if (freeSolo) {
      field.onChange(newValue as any);
      onSelectOption?.(newValue as any);
      return;
    }

    if (valueMode === "option") {
      field.onChange(newValue as any);
      onSelectOption?.(newValue as any);
      return;
    }

    if (multiple) {
      const arr = (newValue as TOption[]) ?? [];
      const ids = arr.map(getValue);
      field.onChange(ids);
      onSelectOption?.(arr);
    } else {
      const opt = (newValue as TOption | null) ?? null;
      const id = opt ? getValue(opt) : null;
      field.onChange(id);
      onSelectOption?.(opt);
    }
  };

  return (
    <Grid
      container
      spacing={1}
      direction="column"
      data-testid={rest["data-testid"] ?? `${field.name}-wrapper`}
    >
      <Grid>
        {fieldState?.error?.message ? (
          <FieldError message={fieldState.error.message} />
        ) : (
          <Typography component="label" htmlFor={field.name}>
            {label ?? "Autocomplete"}
          </Typography>
        )}
      </Grid>

      <Grid>
        <Autocomplete<TOption, TMultiple, boolean, TFreeSolo>
          multiple={multiple}
          freeSolo={freeSolo}
          disableClearable={disableClearable}
          disablePortal={disablePortal}
          options={options}
          value={valueFromForm as any}
          loading={loadingProp ?? loading}
          onChange={handleChange}
          inputValue={inputValue}
          onInputChange={(_e, v, reason) => {
            if (reason !== "reset") setInputValue(v);
          }}
          getOptionLabel={(opt) =>
            freeSolo ? String(opt) : getOptionLabel(opt as TOption)
          }
          isOptionEqualToValue={isEqual}
          renderOption={renderOption}
          renderTags={renderTags}
          filterOptions={filterOptions}
          groupBy={groupBy}
          noOptionsText={noOptionText}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              {...textFieldProps}
              placeholder={placeholder}
              error={!!fieldState?.error}
              helperText={
                fieldState?.error?.message ?? textFieldProps?.helperText
              }
              inputProps={{
                ...params.inputProps,
                endadornment: (
                  <>
                    {loadingProp ?? loading ? <InputLoader /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              data-testid={rest["data-testid"] ?? `${field.name}-field`}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
