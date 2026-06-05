import React from "react";
import {
  FormControl,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
  useTheme,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FieldError } from "../form";

export interface ToggleOption<T = any> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  selectedColor?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  metadata?: Record<string, any>;
}

interface ToggleFieldProps<T extends FieldValues, U = any> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: U;
  options: ToggleOption<U>[];
  label?: string | React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  spacing?: number;
  sx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
  showErrorBelow?: boolean;
  isLoading?: boolean;
  onChange?: (value: U) => void;
  renderOption?: (
    option: ToggleOption<U>,
    isSelected: boolean,
  ) => React.ReactNode;
  "data-testid"?: string;
}

interface ComponentProps<U = any> {
  field: {
    value: U;
    onChange: (value: U) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<any>;
  };
  fieldState: {
    error?: { message?: string };
    invalid: boolean;
  };
  options: ToggleOption<U>[];
  label?: string | React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  spacing?: number;
  sx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
  showErrorBelow?: boolean;
  isLoading?: boolean;
  onChange?: (value: U) => void;
  renderOption?: (
    option: ToggleOption<U>,
    isSelected: boolean,
  ) => React.ReactNode;
  "data-testid"?: string;
  theme: Theme;
}

export const ToggleField = <T extends FieldValues, U = any>({
  name,
  control,
  defaultValue,
  options,
  label,
  required,
  disabled = false,
  orientation = "horizontal",
  spacing = 2,
  sx,
  buttonSx,
  showErrorBelow = false,
  isLoading = false,
  onChange: externalOnChange,
  renderOption,
  "data-testid": dataTestId,
}: ToggleFieldProps<T, U>) => {
  const theme = useTheme();

  return (
    <Controller<T, Path<T>>
      name={name}
      control={control}
      defaultValue={defaultValue as any}
      render={({ field, fieldState }) => (
        <ToggleFieldComponent
          field={field}
          fieldState={fieldState}
          options={options}
          label={label}
          required={required}
          disabled={disabled}
          orientation={orientation}
          spacing={spacing}
          sx={sx}
          buttonSx={buttonSx}
          showErrorBelow={showErrorBelow}
          isLoading={isLoading}
          onChange={externalOnChange}
          renderOption={renderOption}
          data-testid={dataTestId}
          theme={theme}
        />
      )}
    />
  );
};

const ToggleFieldComponent = <U,>({
  field,
  fieldState,
  options,
  label,
  required,
  disabled: globalDisabled,
  orientation,
  spacing,
  sx,
  buttonSx,
  showErrorBelow,
  isLoading,
  onChange: externalOnChange,
  renderOption,
  "data-testid": dataTestId,
  theme,
}: ComponentProps<U>) => {
  const hasError = !!fieldState.error?.message;
  const errorMessage = fieldState.error?.message;

  const getStackDirection = (
    orientation?: "horizontal" | "vertical",
  ): "row" | "column" => {
    return orientation === "horizontal" ? "row" : "column";
  };

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: U | null) => {
    if (value !== null) {
      field.onChange(value);
      externalOnChange?.(value);
    }
  };

  const defaultRenderOption = (
    option: ToggleOption<U>,
    isSelected: boolean,
  ) => {
    const color = option.selectedColor || "primary";

    return (
      <Stack
        direction={getStackDirection(orientation)}
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{
          width: "100%",
          textAlign: orientation === "horizontal" ? "left" : "center",
        }}
      >
        {option.icon && (
          <Stack
            sx={{
              color: isSelected ? `${color}.main` : "text.secondary",
              transition: "color 0.2s",
            }}
          >
            {option.icon}
          </Stack>
        )}

        <Stack alignItems="flex-start" spacing={0.5}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              color: isSelected ? `${color}.main` : "text.primary",
              transition: "color 0.2s",
            }}
          >
            {option.label}
          </Typography>

          {option.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {option.description}
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  };

  if (isLoading) {
    return (
      <FormControl component="fieldset" fullWidth disabled>
        <FormLabel
          component="legend"
          sx={{
            mb: 1,
            fontWeight: 500,
            color: theme.palette.text.secondary,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
        </FormLabel>
        <Stack
          direction={getStackDirection(orientation)}
          spacing={spacing}
          sx={{ width: "100%" }}
        >
          {options.map((option, index) => (
            <ToggleButton
              key={index}
              value={option.value ?? ""}
              disabled
              sx={{
                flex: 1,
                py: 1.5,
                opacity: 0.6,
                ...buttonSx,
              }}
            >
              {renderOption
                ? renderOption(option, false)
                : defaultRenderOption(option, false)}
            </ToggleButton>
          ))}
        </Stack>
      </FormControl>
    );
  }

  return (
    <FormControl
      component="fieldset"
      fullWidth
      error={hasError}
      disabled={globalDisabled}
      required={required}
    >
      {/* Label Section */}
      {label && !showErrorBelow && (
        <FormLabel
          component="legend"
          sx={{
            mb: 1,
            fontWeight: 500,
            color: hasError ? theme.palette.error.main : "text.primary",
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
        </FormLabel>
      )}

      {label && showErrorBelow && hasError && (
        <>
          <FormLabel
            component="legend"
            sx={{
              mb: 0.5,
              fontWeight: 500,
              color: theme.palette.error.main,
            }}
          >
            {label}
            {required && (
              <span style={{ color: theme.palette.error.main }}> *</span>
            )}
          </FormLabel>
          <FieldError message={errorMessage!} />
        </>
      )}

      {label && showErrorBelow && !hasError && (
        <FormLabel
          component="legend"
          sx={{
            mb: 1,
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
        </FormLabel>
      )}

      <ToggleButtonGroup
        value={field.value}
        exclusive
        onChange={handleChange}
        onBlur={field.onBlur}
        orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
        aria-label={typeof label === "string" ? label : "toggle field"}
        sx={{
          width: "100%",
          gap: spacing,
          display: "flex",
          flexDirection: orientation === "vertical" ? "column" : "row",
          "& .MuiToggleButton-root": {
            flex: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            py: 1.5,
            px: 2,
            transition: "all 0.2s ease-in-out",
            ...(hasError && {
              borderColor: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.02),
            }),
            "&.Mui-selected": {
              backgroundColor: (t) => {
                const option = options.find((opt) => opt.value === field.value);
                const color = option?.selectedColor || "primary";
                return alpha(t.palette[color].main, 0.1);
              },
              borderColor: (t) => {
                const option = options.find((opt) => opt.value === field.value);
                const color = option?.selectedColor || "primary";
                return t.palette[color].main;
              },
              color: (t) => {
                const option = options.find((opt) => opt.value === field.value);
                const color = option?.selectedColor || "primary";
                return t.palette[color].main;
              },
              "&:hover": {
                backgroundColor: (t) => {
                  const option = options.find(
                    (opt) => opt.value === field.value,
                  );
                  const color = option?.selectedColor || "primary";
                  return alpha(t.palette[color].main, 0.15);
                },
              },
            },
          },
          "&:hover": {
            backgroundColor: (t) => alpha(t.palette.primary.main, 0.04),
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            opacity: 0.6,
            transform: "none",
          },
          ...buttonSx,
        }}
        data-testid={dataTestId || `toggle-${field.name}`}
      >
        {options.map((option, index) => {
          const isSelected = field.value === option.value;
          const isDisabled = globalDisabled || option.disabled;

          return (
            <ToggleButton
              key={index}
              value={option.value as any}
              disabled={isDisabled}
              aria-label={option.label}
              sx={{
                ...(isSelected &&
                  option.selectedColor && {
                    "&.Mui-selected": {
                      backgroundColor: alpha(
                        theme.palette[option.selectedColor].main,
                        0.1,
                      ),
                      borderColor: theme.palette[option.selectedColor].main,
                      color: theme.palette[option.selectedColor].main,
                    },
                  }),
              }}
            >
              {renderOption
                ? renderOption(option, isSelected)
                : defaultRenderOption(option, isSelected)}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {!showErrorBelow && hasError && <FieldError message={errorMessage!} />}
    </FormControl>
  );
};
