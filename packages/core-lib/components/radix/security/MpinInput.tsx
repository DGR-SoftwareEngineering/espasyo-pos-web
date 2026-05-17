import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";

interface Props {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  description?: string;
  errorMessage?: string | null;
  "data-testid"?: string;
}

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "").slice(0, 6);

export const MpinInput: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  autoFocus,
  label,
  description,
  errorMessage,
  "data-testid": dataTestId,
}) => {
  const [masked, setMasked] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const hasError = !!errorMessage;

  return (
    <Flex direction="column" gap="1">
      {label && (
        <Text
          as="label"
          size="2"
          weight="medium"
          style={{ color: hasError ? "var(--red-11)" : undefined }}
        >
          {label}
        </Text>
      )}
      <Box style={{ position: "relative" }}>
        <TextField.Root
          ref={inputRef}
          size="3"
          value={value}
          disabled={disabled}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          color={hasError ? "red" : undefined}
          data-testid={dataTestId}
          onChange={(e) => onChange(onlyDigits(e.target.value))}
          style={{
            letterSpacing: masked ? "0.5em" : "0.4em",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 20,
            textAlign: "center",
            paddingRight: 40,
          }}
        >
          <TextField.Slot side="right">
            <IconButton
              type="button"
              variant="ghost"
              color="gray"
              size="1"
              aria-label={masked ? "Show MPIN" : "Hide MPIN"}
              onClick={() => setMasked((v) => !v)}
              disabled={disabled}
            >
              {masked ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
      </Box>
      {description && !hasError && (
        <Text size="1" color="gray">
          {description}
        </Text>
      )}
      {hasError && (
        <Text size="1" style={{ color: "var(--red-11)" }}>
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
};

export const isValidMpin = (value: string): boolean => /^\d{6}$/.test(value);
