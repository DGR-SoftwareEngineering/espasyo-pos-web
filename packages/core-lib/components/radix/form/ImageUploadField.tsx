import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import {
  Cross1Icon,
  ImageIcon,
  UploadIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { FieldError } from "./FieldError";

const DEFAULT_ACCEPT = "image/*";
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  required?: boolean;
  "data-testid"?: string;
  className?: string;
  defaultValue?: PathValue<T, Path<T>>;
}

interface InternalProps {
  label?: string;
  description?: string;
  accept: string;
  maxSizeBytes: number;
  disabled?: boolean;
  required?: boolean;
  testId: string;
  value: File | null;
  errorMessage?: string;
  onChange: (file: File | null) => void;
  onBlur: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const matchesAccept = (file: File, accept: string): boolean => {
  if (!accept || accept === "*" || accept === "*/*") return true;
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase());
  const fileType = (file.type || "").toLowerCase();
  const fileName = file.name.toLowerCase();
  return tokens.some((token) => {
    if (!token) return false;
    if (token.startsWith(".")) return fileName.endsWith(token);
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      return fileType.startsWith(prefix);
    }
    return fileType === token;
  });
};

export const ImageUploadField = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  label = "Image",
  description,
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_BYTES,
  disabled,
  required,
  "data-testid": dataTestId,
  className,
}: Props<T>) => {
  const testId = dataTestId ?? `${name}-image-field`;

  return (
    <Controller<T>
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const fileValue = (field.value as File | null | undefined) ?? null;
        return (
          <div className={className}>
            <ImageUploadFieldInternal
              label={label}
              description={description}
              accept={accept}
              maxSizeBytes={maxSizeBytes}
              disabled={disabled}
              required={required}
              testId={testId}
              value={fileValue}
              errorMessage={fieldState.error?.message}
              onChange={(file) => field.onChange(file)}
              onBlur={field.onBlur}
            />
          </div>
        );
      }}
    />
  );
};

const ImageUploadFieldInternal: React.FC<InternalProps> = ({
  label,
  description,
  accept,
  maxSizeBytes,
  disabled,
  required,
  testId,
  value,
  errorMessage,
  onChange,
  onBlur,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const acceptHint = useMemo(() => {
    if (!accept || accept === "image/*") return "PNG, JPG, GIF, WebP, SVG";
    return accept;
  }, [accept]);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    if (!value.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const validate = useCallback(
    (file: File): string | null => {
      if (!matchesAccept(file, accept)) {
        return `File type not allowed. Accepted: ${acceptHint}.`;
      }
      if (file.size > maxSizeBytes) {
        return `File is too large. Max size: ${formatBytes(maxSizeBytes)}.`;
      }
      return null;
    },
    [accept, acceptHint, maxSizeBytes],
  );

  const commit = useCallback(
    (file: File | null) => {
      setLocalError(null);
      if (!file) {
        onChange(null);
        return;
      }
      const error = validate(file);
      if (error) {
        setLocalError(error);
        return;
      }
      onChange(file);
    },
    [onChange, validate],
  );

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    commit(file);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    commit(file);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    commit(null);
  };

  const handleReplace = (event: React.MouseEvent) => {
    event.stopPropagation();
    openFilePicker();
  };

  const hasFile = !!value;
  const errorToShow = errorMessage ?? localError ?? undefined;
  const hasError = !!errorToShow;

  return (
    <Flex direction="column" gap="2">
      {label && (
        <Flex align="baseline" gap="1">
          <Text
            as="label"
            size="2"
            weight="medium"
            style={{ color: hasError ? "var(--red-11)" : undefined }}
            onClick={openFilePicker}
          >
            {label}
          </Text>
          {required && <Text style={{ color: "var(--red-9)" }}>*</Text>}
        </Flex>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleFileInputChange}
        onBlur={onBlur}
        style={{ display: "none" }}
        data-testid={`${testId}-input`}
      />

      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={hasFile ? "Replace image" : "Upload image"}
        aria-disabled={disabled}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={testId}
        style={{
          position: "relative",
          display: "block",
          borderRadius: "var(--radius-3)",
          padding: hasFile ? 12 : 24,
          background: hasError
            ? "var(--red-a2)"
            : isDragging
              ? "var(--accent-a3)"
              : hasFile
                ? "var(--color-panel-solid)"
                : "var(--gray-a2)",
          border: `1.5px ${isDragging || hasFile ? "solid" : "dashed"} ${
            hasError
              ? "var(--red-8)"
              : isDragging
                ? "var(--accent-9)"
                : hasFile
                  ? "var(--gray-a5)"
                  : "var(--gray-a6)"
          }`,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "all 120ms ease",
          minHeight: hasFile ? 0 : 160,
          userSelect: "none",
        }}
      >
        {hasFile ? (
          <Flex align="center" gap="3">
            <Box
              style={{
                width: 72,
                height: 72,
                borderRadius: "var(--radius-2)",
                background: "var(--gray-a3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                border: "1px solid var(--gray-a4)",
              }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={value.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <ImageIcon
                  width={28}
                  height={28}
                  style={{ color: "var(--gray-10)" }}
                />
              )}
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="2"
                weight="bold"
                as="div"
                truncate
                style={{ lineHeight: 1.3 }}
              >
                {value.name}
              </Text>
              <Text size="1" color="gray" as="div">
                {formatBytes(value.size)} · {value.type || "unknown"}
              </Text>
            </Box>

            <Flex gap="1" align="center">
              <IconButton
                variant="ghost"
                color="gray"
                size="2"
                aria-label="Replace image"
                onClick={handleReplace}
                disabled={disabled}
                type="button"
              >
                <ReloadIcon />
              </IconButton>
              <IconButton
                variant="ghost"
                color="red"
                size="2"
                aria-label="Remove image"
                onClick={handleRemove}
                disabled={disabled}
                type="button"
              >
                <Cross1Icon />
              </IconButton>
            </Flex>
          </Flex>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="2"
            style={{ pointerEvents: "none" }}
          >
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: isDragging ? "var(--accent-a5)" : "var(--accent-a3)",
                color: "var(--accent-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 120ms ease",
              }}
            >
              <UploadIcon width={22} height={22} />
            </Box>
            <Text size="2" weight="medium" as="div" align="center">
              {isDragging ? "Drop image here" : "Drag & drop an image"}
            </Text>
            <Text size="1" color="gray" as="div" align="center">
              or <Text style={{ color: "var(--accent-11)" }}>click to browse</Text>
            </Text>
            <Text size="1" color="gray" as="div" align="center">
              {acceptHint} · max {formatBytes(maxSizeBytes)}
            </Text>
          </Flex>
        )}
      </Box>

      {description && !hasError && (
        <Text size="1" color="gray">
          {description}
        </Text>
      )}

      <FieldError message={errorToShow} />
    </Flex>
  );
};
