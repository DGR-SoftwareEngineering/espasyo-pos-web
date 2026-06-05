import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Dialog,
  Flex,
  IconButton,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  EyeOpenIcon,
  EyeClosedIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import {
  CheckCircleOutlineOutlined,
  InfoOutlined,
  PinOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "../../../core/hooks";
import { useToastContext } from "../../../core/contexts";
import {
  ChangeMpinParams,
  MpinStatusDto,
  SetMpinParams,
} from "../../../api/authentication/types";
import { formatDateTime } from "../../../business/dates";
import { Button } from "../buttons/Button";
import { MpinInput, isValidMpin } from "./MpinInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "view" | "set" | "change";

export const MpinManagementDialog: React.FC<Props> = ({
  open,
  onOpenChange,
}) => {
  const { showToast } = useToastContext();
  const [mode, setMode] = useState<Mode>("view");

  const statusApi = useApi((api) => api.authentication.mpinStatus(), [open]);
  const setCb = useApiCallback(
    async (api, args: SetMpinParams) =>
      await api.authentication.setMpin(args),
  );
  const changeCb = useApiCallback(
    async (api, args: ChangeMpinParams) =>
      await api.authentication.changeMpin(args),
  );

  const status: MpinStatusDto | undefined =
    statusApi.result?.data.response ?? undefined;
  const hasMpin = !!status?.hasMpin;

  useEffect(() => {
    if (!open) return;
    setMode("view");
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 460 }}>
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Box style={{ color: "var(--accent-11)" }}>
              <PinOutlined fontSize="small" />
            </Box>
            MPIN Security
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="2" color="gray">
          Your 6-digit MPIN gates destructive admin actions like resetting
          settings or clearing audit logs.
        </Dialog.Description>

        {statusApi.loading && !status ? (
          <Flex align="center" justify="center" py="6">
            <Text color="gray">Loading MPIN status…</Text>
          </Flex>
        ) : mode === "view" ? (
          <ViewMode
            status={status}
            onSet={() => setMode("set")}
            onChange={() => setMode("change")}
            onClose={() => onOpenChange(false)}
          />
        ) : mode === "set" ? (
          <SetMode
            loading={setCb.loading}
            onCancel={() => setMode("view")}
            onSubmit={async (args) => {
              try {
                const result = await setCb.execute(args);
                if (
                  result.status >= 200 &&
                  result.status < 300 &&
                  result.data.success
                ) {
                  showToast(hasMpin ? "MPIN replaced" : "MPIN set", "success");
                  statusApi.execute();
                  setMode("view");
                  return null;
                }
                const message =
                  (Array.isArray(result.data.errors)
                    ? (result.data.errors as string[])[0]
                    : null) ??
                  result.data.message ??
                  "Failed to set MPIN";
                return message;
              } catch (error) {
                console.error("Error setting MPIN", error);
                const status = (error as string[] & { status?: number }).status;
                if (status === 401) {
                  return "Current password is incorrect.";
                }
                const first =
                  Array.isArray(error) && typeof error[0] === "string"
                    ? (error[0] as string)
                    : "Failed to set MPIN";
                return first;
              }
            }}
            replacingExisting={hasMpin}
          />
        ) : (
          <ChangeMode
            loading={changeCb.loading}
            onCancel={() => setMode("view")}
            onSubmit={async (args) => {
              try {
                const result = await changeCb.execute(args);
                if (
                  result.status >= 200 &&
                  result.status < 300 &&
                  result.data.success
                ) {
                  showToast("MPIN changed", "success");
                  statusApi.execute();
                  setMode("view");
                  return null;
                }
                const message =
                  (Array.isArray(result.data.errors)
                    ? (result.data.errors as string[])[0]
                    : null) ??
                  result.data.message ??
                  "Failed to change MPIN";
                return message;
              } catch (error) {
                console.error("Error changing MPIN", error);
                const status = (error as string[] & { status?: number }).status;
                if (status === 401) {
                  return "Current MPIN is incorrect.";
                }
                const first =
                  Array.isArray(error) && typeof error[0] === "string"
                    ? (error[0] as string)
                    : "Failed to change MPIN";
                return first;
              }
            }}
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};

const ViewMode: React.FC<{
  status?: MpinStatusDto;
  onSet: () => void;
  onChange: () => void;
  onClose: () => void;
}> = ({ status, onSet, onChange, onClose }) => {
  const hasMpin = !!status?.hasMpin;
  return (
    <Box mt="4">
      <Flex
        align="center"
        gap="3"
        p="3"
        style={{
          borderRadius: "var(--radius-3)",
          background: hasMpin ? "var(--green-a2)" : "var(--amber-a2)",
          border: `1px solid ${hasMpin ? "var(--green-a5)" : "var(--amber-a5)"}`,
        }}
      >
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-3)",
            background: hasMpin ? "var(--green-a4)" : "var(--amber-a4)",
            color: hasMpin ? "var(--green-11)" : "var(--amber-11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {hasMpin ? (
            <CheckCircleOutlineOutlined />
          ) : (
            <InfoOutlined />
          )}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2">
            <Text size="3" weight="bold">
              {hasMpin ? "MPIN is set" : "No MPIN yet"}
            </Text>
            <Badge
              variant="soft"
              color={hasMpin ? "green" : "amber"}
              radius="full"
              size="1"
            >
              {hasMpin ? "Active" : "Inactive"}
            </Badge>
          </Flex>
          <Text size="2" color="gray">
            {hasMpin
              ? status?.mpinSetAt
                ? `Last updated ${formatDateTime(status.mpinSetAt)}`
                : "Last update time unknown"
              : "Set an MPIN to enable destructive admin actions."}
          </Text>
        </Box>
      </Flex>

      <Separator size="4" my="3" />

      <Flex justify="end" gap="3">
        <Button type="Secondary" onClick={onClose}>
          Close
        </Button>
        {hasMpin ? (
          <Flex gap="2">
            <Button type="Secondary" onClick={onSet}>
              Replace MPIN
            </Button>
            <Button type="Primary" onClick={onChange}>
              Change MPIN
            </Button>
          </Flex>
        ) : (
          <Button type="Primary" onClick={onSet}>
            Set MPIN
          </Button>
        )}
      </Flex>
    </Box>
  );
};

const SetMode: React.FC<{
  loading: boolean;
  replacingExisting: boolean;
  onCancel: () => void;
  onSubmit: (args: SetMpinParams) => Promise<string | null>;
}> = ({ loading, replacingExisting, onCancel, onSubmit }) => {
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordEmpty = !password.trim();
  const mpinInvalid = !isValidMpin(mpin);
  const canSubmit = !passwordEmpty && !mpinInvalid && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setServerError(null);
    const err = await onSubmit({ currentPassword: password, mpin });
    if (err) setServerError(err);
  };

  return (
    <Box mt="4">
      <Flex direction="column" gap="3">
        <Box>
          <Text as="label" size="2" weight="medium">
            Your current password
          </Text>
          <TextField.Root
            size="3"
            type={showPassword ? "text" : "password"}
            value={password}
            disabled={loading}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
              >
                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
        </Box>

        <MpinInput
          label={replacingExisting ? "New 6-digit MPIN" : "6-digit MPIN"}
          description="Numbers only. You'll use this for destructive admin actions."
          value={mpin}
          disabled={loading}
          autoFocus
          onChange={setMpin}
        />

        {serverError && (
          <Callout.Root color="red" variant="surface">
            <Callout.Text>{serverError}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" onClick={onCancel} disabled={loading}>
          Back
        </Button>
        <Button
          type="Primary"
          loading={loading}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {replacingExisting ? "Replace MPIN" : "Set MPIN"}
        </Button>
      </Flex>
    </Box>
  );
};

const ChangeMode: React.FC<{
  loading: boolean;
  onCancel: () => void;
  onSubmit: (args: ChangeMpinParams) => Promise<string | null>;
}> = ({ loading, onCancel, onSubmit }) => {
  const [currentMpin, setCurrentMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const currentInvalid = !isValidMpin(currentMpin);
  const newInvalid = !isValidMpin(newMpin);
  const same = currentMpin === newMpin && !currentInvalid;
  const canSubmit = !currentInvalid && !newInvalid && !same && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setServerError(null);
    const err = await onSubmit({ currentMpin, newMpin });
    if (err) setServerError(err);
  };

  return (
    <Box mt="4">
      <Flex direction="column" gap="3">
        <MpinInput
          label="Current MPIN"
          value={currentMpin}
          disabled={loading}
          autoFocus
          onChange={setCurrentMpin}
        />
        <MpinInput
          label="New MPIN"
          description="Must be different from the current MPIN."
          value={newMpin}
          disabled={loading}
          onChange={setNewMpin}
          errorMessage={same ? "New MPIN must differ from current." : null}
        />

        {serverError && (
          <Callout.Root color="red" variant="surface">
            <Callout.Text>{serverError}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>

      <Flex justify="end" gap="3" mt="4">
        <Button type="Secondary" onClick={onCancel} disabled={loading}>
          Back
        </Button>
        <Button
          type="Primary"
          loading={loading}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Change MPIN
        </Button>
      </Flex>
    </Box>
  );
};
