import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
  Select,
  Switch,
  TextArea,
  TextField,
} from "@radix-ui/themes";;
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { SystemSettingDto } from "core-lib/api/commons/types";
import {
  AI_MODEL_LABELS,
  AI_PROVIDER_MODELS,
  CLOSED_SET_SETTINGS,
  SETTING_KEYS,
  parseSettingValue,
  serializeSettingValue,
} from "core-lib/business/settings";
import { SETTING_DATA_TYPE } from "core-lib/api/commons/types";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";

interface Props {
  setting: SystemSettingDto;
  value: string;
  onChange: (next: string) => void;
}

const isLongString = (key: string) =>
  /receipt|message|description|note/i.test(key);

const humanizeOption = (option: string): string =>
  option
    .split(/[-_]/g)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(" ");

export const SettingValueEditor: React.FC<Props> = ({
  setting,
  value,
  onChange,
}) => {
  const disabled = !setting.isEditable;
  const closedOptions = CLOSED_SET_SETTINGS[setting.key];

  if (setting.key === SETTING_KEYS.AiModel) {
    return (
      <Select.Root value={value || ""} disabled={disabled} onValueChange={onChange}>
        <Select.Trigger style={{ maxWidth: 280, width: "100%" }} />
        <Select.Content>
          {Object.entries(AI_PROVIDER_MODELS).map(([provider, models]) => (
            <Select.Group key={provider}>
              <Select.Label style={{ textTransform: "capitalize" }}>{provider}</Select.Label>
              {(models as ReadonlyArray<string>).map((model) => (
                <Select.Item key={model} value={model}>
                  {AI_MODEL_LABELS[model] ?? model}
                </Select.Item>
              ))}
            </Select.Group>
          ))}
        </Select.Content>
      </Select.Root>
    );
  }

  if (closedOptions && setting.dataType === 1) {
    return (
      <Select.Root
        value={value || closedOptions[0]}
        disabled={disabled}
        onValueChange={onChange}
      >
        <Select.Trigger style={{ maxWidth: 240, width: "100%" }} />
        <Select.Content>
          {closedOptions.map((option) => (
            <Select.Item key={option} value={option}>
              {humanizeOption(option)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    );
  }

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
    case SETTING_DATA_TYPE.Secret:
      return (
        <SecretEditor
          setting={setting}
          disabled={disabled}
          onChange={onChange}
        />
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

interface SecretEditorProps {
  setting: SystemSettingDto;
  disabled?: boolean;
  onChange: (next: string) => void;
}

const SecretEditor: React.FC<SecretEditorProps> = ({ setting, disabled, onChange }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [pendingConfigured, setPendingConfigured] = useState(false);

  const isConfigured = setting.isConfigured || pendingConfigured;

  const handleConfirm = () => {
    if (!inputValue.trim()) return;
    onChange(inputValue);
    setPendingConfigured(true);
    setOpen(false);
    setInputValue("");
  };

  return (
    <Flex align="center" gap="3" wrap="wrap">
      <Button
        variant="soft"
        size="2"
        disabled={disabled}
        onClick={() => { setInputValue(""); setOpen(true); }}
      >
        {isConfigured ? (
          <><Pencil1Icon /> Edit API Key</>
        ) : (
          <><PlusIcon /> Add API Key</>
        )}
      </Button>
      {isConfigured ? (
        <Text size="2" color="gray">●●●● Configured</Text>
      ) : (
        <Badge color="gray" variant="soft" size="1">Not set</Badge>
      )}
      <DialogBox
        open={open}
        onClose={() => { setOpen(false); setInputValue(""); }}
        title={isConfigured ? "Edit API Key" : "Add API Key"}
        subtitle="The key is encrypted and stored securely. Leave blank to keep the existing key."
        maxWidth="sm"
        actions={
          <Flex gap="2">
            <Button variant="outline" size="2" onClick={() => { setOpen(false); setInputValue(""); }}>
              Cancel
            </Button>
            <Button size="2" disabled={!inputValue.trim()} onClick={handleConfirm}>
              Confirm
            </Button>
          </Flex>
        }
      >
        <Box p="4">
          <TextField.Root
            type="password"
            value={inputValue}
            placeholder="Paste your API key here"
            autoComplete="new-password"
            autoFocus
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
        </Box>
      </DialogBox>
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
