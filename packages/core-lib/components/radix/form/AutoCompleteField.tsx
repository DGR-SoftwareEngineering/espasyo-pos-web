import React, { useEffect, useId, useMemo, useState } from "react";
import {
  Popover,
  TextField as RadixTextField,
  Flex,
  Text,
  Box,
  IconButton,
  Spinner,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { FieldError } from "./FieldError";

export type ValueMode = "id" | "option";

export interface AutoCompleteFieldProps<TForm extends FieldValues, TOption> {
  name: Path<TForm>;
  control: Control<TForm>;
  options?: TOption[];
  loading?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  noOptionText?: React.ReactNode;
  getOptionLabel: (option: TOption) => string;
  getOptionValue?: (option: TOption) => string | number;
  isOptionEqualToValue?: (option: TOption, value: TOption) => boolean;
  valueMode?: ValueMode;
  onSearch?: (query: string) => Promise<TOption[]> | TOption[] | void;
  onSelectOption?: (option: TOption | null) => void;
  renderOption?: (option: TOption) => React.ReactNode;
  size?: "1" | "2" | "3";
  disabled?: boolean;
  disableClearable?: boolean;
  debounceMs?: number;
  "data-testid"?: string;
  className?: string;
}

export function AutoCompleteField<
  TForm extends FieldValues,
  TOption,
>(props: AutoCompleteFieldProps<TForm, TOption>) {
  const { name, control, ...rest } = props;
  return (
    <Controller<TForm>
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <AutoCompleteFieldComponent<TForm, TOption>
          field={field}
          fieldState={fieldState}
          {...rest}
        />
      )}
    />
  );
}

interface ComponentProps<TForm extends FieldValues, TOption>
  extends Omit<
    AutoCompleteFieldProps<TForm, TOption>,
    "name" | "control"
  > {
  field: ControllerRenderProps<TForm, Path<TForm>>;
  fieldState: ControllerFieldState;
}

function AutoCompleteFieldComponent<TForm extends FieldValues, TOption>({
  field,
  fieldState,
  options: optionsProp = [],
  loading: loadingProp,
  label,
  placeholder = "Search…",
  noOptionText = "No matching options",
  getOptionLabel,
  getOptionValue,
  valueMode = "id",
  onSearch,
  onSelectOption,
  renderOption,
  size = "2",
  disabled,
  disableClearable,
  debounceMs = 250,
  className,
  ...rest
}: ComponentProps<TForm, TOption>) {
  const isAsyncMode = !!onSearch;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<TOption[]>(optionsProp);
  const [inputValue, setInputValue] = useState("");
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const loading = isAsyncMode ? asyncLoading : !!loadingProp;
  const listboxId = useId();
  const hasError = !!fieldState.error?.message;

  const getValue = useMemo(
    () => getOptionValue ?? ((o: TOption) => (o as Record<string, unknown>).id as string),
    [getOptionValue],
  );

  useEffect(() => {
    setOptions(optionsProp);
  }, [optionsProp]);

  useEffect(() => {
    if (!onSearch) return;
    let cancelled = false;
    const handler = setTimeout(async () => {
      setAsyncLoading(true);
      try {
        const result = await onSearch(inputValue);
        if (cancelled) return;
        if (Array.isArray(result)) setOptions(result);
      } finally {
        if (!cancelled) setAsyncLoading(false);
      }
    }, debounceMs);
    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [inputValue, onSearch, debounceMs]);

  const filteredOptions = useMemo(() => {
    if (onSearch) return options;
    if (!inputValue.trim()) return options;
    const q = inputValue.toLowerCase();
    return options.filter((o) => getOptionLabel(o).toLowerCase().includes(q));
  }, [options, inputValue, onSearch, getOptionLabel]);

  const currentLabel = useMemo(() => {
    if (field.value === null || field.value === undefined || field.value === "") {
      return "";
    }
    if (valueMode === "option") return getOptionLabel(field.value as TOption);
    const match = options.find((o) => getValue(o) === field.value);
    return match ? getOptionLabel(match) : "";
  }, [field.value, valueMode, options, getOptionLabel, getValue]);

  const displayValue = open ? inputValue : currentLabel;

  const commitSelection = (opt: TOption | null) => {
    if (opt === null) {
      field.onChange(null);
      onSelectOption?.(null);
      setInputValue("");
      setOpen(false);
      return;
    }
    field.onChange(valueMode === "option" ? opt : getValue(opt));
    onSelectOption?.(opt);
    setInputValue("");
    setActiveIdx(-1);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(filteredOptions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const opt = filteredOptions[activeIdx];
      if (opt) commitSelection(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Flex direction="column" gap="1" className={className}>
      {label && (
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

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <RadixTextField.Root
            id={field.name}
            size={size}
            placeholder={placeholder}
            disabled={disabled}
            color={hasError ? "red" : undefined}
            value={displayValue}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
              setActiveIdx(0);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open}
            role="combobox"
            data-testid={rest["data-testid"] ?? `${field.name}-field`}
          >
            <RadixTextField.Slot side="left">
              <MagnifyingGlassIcon />
            </RadixTextField.Slot>
            {!disableClearable && field.value && !disabled && (
              <RadixTextField.Slot side="right">
                <IconButton
                  size="1"
                  variant="ghost"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    commitSelection(null);
                  }}
                  aria-label="Clear"
                  tabIndex={-1}
                >
                  <Cross1Icon />
                </IconButton>
              </RadixTextField.Slot>
            )}
          </RadixTextField.Root>
        </Popover.Trigger>

        <Popover.Content
          align="start"
          side="bottom"
          sideOffset={4}
          style={{ width: "var(--radix-popover-trigger-width)", padding: 0 }}
        >
          {loading && (
            <Flex align="center" gap="2" px="3" py="2">
              <Spinner size="1" loading />
              <Text size="1" color="gray">
                Loading…
              </Text>
            </Flex>
          )}

          {!loading && filteredOptions.length === 0 && (
            <Box px="3" py="3">
              <Text size="2" color="gray">
                {noOptionText}
              </Text>
            </Box>
          )}

          {!loading && filteredOptions.length > 0 && (
            <Box
              role="listbox"
              id={listboxId}
              style={{ maxHeight: 280, overflowY: "auto" }}
            >
              {filteredOptions.map((opt, idx) => {
                const isActive = idx === activeIdx;
                const isSelected =
                  field.value !== null &&
                  field.value !== undefined &&
                  (valueMode === "option"
                    ? field.value === opt
                    : field.value === getValue(opt));
                return (
                  <Box
                    key={String(getValue(opt) ?? idx)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => commitSelection(opt)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: isActive
                        ? "var(--accent-a3)"
                        : isSelected
                          ? "var(--accent-a2)"
                          : undefined,
                    }}
                  >
                    {renderOption ? renderOption(opt) : (
                      <Text size="2">{getOptionLabel(opt)}</Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Popover.Content>
      </Popover.Root>

      <FieldError message={fieldState.error?.message} />
    </Flex>
  );
}
