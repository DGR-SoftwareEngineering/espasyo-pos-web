import React, { useEffect, useState } from "react";
import {
  Box,
  Callout,
  Dialog,
  Flex,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  EyeOpenIcon,
  EyeClosedIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import {
  WarningAmberOutlined,
  KeyOutlined,
} from "@mui/icons-material";
import { useResolution } from "../../../core/hooks";
import { Button } from "../buttons/Button";
import { MpinInput, isValidMpin } from "./MpinInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  confirmColor?: "Critical" | "Primary";
  loading?: boolean;
  errorMessage?: string | null;
  onConfirm: (args: { password: string; mpin: string }) => Promise<void> | void;
}

export const AdminConfirmDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  title,
  description,
  warning,
  confirmLabel,
  confirmColor = "Critical",
  loading,
  errorMessage,
  onConfirm,
}) => {
  const { isSmallMobile } = useResolution();
  const isFullScreen = isSmallMobile;
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedMpin, setTouchedMpin] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setMpin("");
      setShowPassword(false);
      setTouchedPassword(false);
      setTouchedMpin(false);
    }
  }, [open]);

  const passwordEmpty = !password.trim();
  const mpinInvalid = !isValidMpin(mpin);
  const canSubmit = !passwordEmpty && !mpinInvalid && !loading;

  const handleConfirm = async () => {
    setTouchedPassword(true);
    setTouchedMpin(true);
    if (!canSubmit) return;
    await onConfirm({ password, mpin });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          ...(isFullScreen
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: "none",
                maxWidth: "100dvw",
                width: "100dvw",
                height: "100dvh",
                maxHeight: "100dvh",
                borderRadius: 0,
                display: "flex",
                flexDirection: "column",
              }
            : { maxWidth: 460 }),
        }}
      >
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Box style={{ color: "var(--red-11)" }}>
              <WarningAmberOutlined fontSize="small" />
            </Box>
            {title}
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="2" color="gray">
          {description}
        </Dialog.Description>

        <Box style={isFullScreen ? { flex: 1, overflowY: "auto", minHeight: 0 } : {}}>
        {warning && (
          <Callout.Root color="amber" variant="surface" mt="3">
            <Callout.Icon>
              <WarningAmberOutlined fontSize="small" />
            </Callout.Icon>
            <Callout.Text>{warning}</Callout.Text>
          </Callout.Root>
        )}

        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              style={{
                color:
                  touchedPassword && passwordEmpty
                    ? "var(--red-11)"
                    : undefined,
              }}
            >
              Your password
            </Text>
            <TextField.Root
              size="3"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loading}
              placeholder="Enter your current password"
              color={touchedPassword && passwordEmpty ? "red" : undefined}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouchedPassword(true)}
              mt="1"
            >
              <TextField.Slot>
                <LockClosedIcon />
              </TextField.Slot>
              <TextField.Slot side="right">
                <IconButton
                  type="button"
                  variant="ghost"
                  color="gray"
                  size="1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </IconButton>
              </TextField.Slot>
            </TextField.Root>
            {touchedPassword && passwordEmpty && (
              <Text size="1" style={{ color: "var(--red-11)" }} mt="1">
                Password is required.
              </Text>
            )}
          </Box>

          <MpinInput
            label="6-digit MPIN"
            description="Enter the MPIN you set up under Profile → Security."
            value={mpin}
            disabled={loading}
            autoFocus={false}
            onChange={(v) => {
              setMpin(v);
              if (!touchedMpin && v.length === 6) setTouchedMpin(true);
            }}
            errorMessage={
              touchedMpin && mpinInvalid
                ? "Enter all 6 digits."
                : null
            }
          />

          {errorMessage && (
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <KeyOutlined fontSize="small" />
              </Callout.Icon>
              <Callout.Text>{errorMessage}</Callout.Text>
            </Callout.Root>
          )}
        </Flex>

        </Box>
        <Flex justify="end" gap="3" mt="4">
          <Button
            type="Secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type={confirmColor}
            loading={loading}
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
