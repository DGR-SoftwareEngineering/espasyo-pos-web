import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Switch, Text, TextArea, TextField } from "@radix-ui/themes";
import { SystemSettingDto } from "core-lib/api/commons/types";
import {
  parseSettingValue,
  serializeSettingValue,
} from "core-lib/business/settings";

interface Props {
  setting: SystemSettingDto;
  value: string;
  onChange: (next: string) => void;
}

const isLongString = (key: string) =>
  /receipt|message|description|note/i.test(key);

export const SettingValueEditor: React.FC<Props> = ({
  setting,
  value,
  onChange,
}) => {
  const disabled = !setting.isEditable;

  switch (setting.dataType) {
    case 2: {
      const checked = value?.toLowerCase() === "true";
      return (
        <Flex align="center" gap="3">
          <Switch
            checked={checked}
            disabled={disabled}
            onCheckedChange={(c) =>
              onChange(serializeSettingValue(2, c === true))
            }
          />
          <Text size="2" color="gray">
            {checked ? "Enabled" : "Disabled"}
          </Text>
        </Flex>
      );
    }
    case 3:
      return (
        <TextField.Root
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ maxWidth: 240 }}
        />
      );
    case 4:
      return (
        <TextField.Root
          type="number"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ maxWidth: 240 }}
        />
      );
    case 5:
      return <JsonEditor value={value} disabled={disabled} onChange={onChange} />;
    case 6:
      return (
        <ColorEditor value={value} disabled={disabled} onChange={onChange} />
      );
    default:
      if (isLongString(setting.key)) {
        return (
          <TextArea
            value={value ?? ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        );
      }
      return (
        <TextField.Root
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

interface SubProps {
  value: string;
  disabled?: boolean;
  onChange: (next: string) => void;
}

const ColorEditor: React.FC<SubProps> = ({ value, disabled, onChange }) => {
  const safe = /^#?[0-9a-f]{0,8}$/i.test(value) ? value : "#000000";
  const hex = safe.startsWith("#") ? safe : `#${safe}`;
  return (
    <Flex align="center" gap="3">
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-3)",
          border: "1px solid var(--gray-a5)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <input
          type="color"
          value={hex.slice(0, 7)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: "absolute",
            inset: -4,
            width: "calc(100% + 8px)",
            height: "calc(100% + 8px)",
            border: "none",
            padding: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            background: "transparent",
          }}
        />
      </Box>
      <TextField.Root
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#1976d2"
        style={{ maxWidth: 160 }}
      />
    </Flex>
  );
};

const JsonEditor: React.FC<SubProps> = ({ value, disabled, onChange }) => {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const lastExternal = useRef(value);

  useEffect(() => {
    if (value !== lastExternal.current) {
      setDraft(value);
      lastExternal.current = value;
    }
  }, [value]);

  return (
    <Flex direction="column" gap="2">
      <TextArea
        value={draft}
        disabled={disabled}
        rows={4}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          try {
            JSON.parse(next);
            setError(null);
            onChange(next);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Invalid JSON",
            );
          }
        }}
        style={{ fontFamily: "monospace" }}
      />
      {error && (
        <Text size="1" style={{ color: "var(--red-11)" }}>
          {error}
        </Text>
      )}
    </Flex>
  );
};

export const previewSettingValue = (s: SystemSettingDto) => {
  try {
    const parsed = parseSettingValue<unknown>(s);
    if (typeof parsed === "boolean") return parsed ? "true" : "false";
    if (Array.isArray(parsed)) return `[${parsed.length} item(s)]`;
    if (typeof parsed === "object" && parsed !== null)
      return JSON.stringify(parsed);
    return String(parsed ?? "");
  } catch {
    return s.value ?? "";
  }
};
