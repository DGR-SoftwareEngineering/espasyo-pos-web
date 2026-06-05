import React, { useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Checkbox,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  CloudDownloadOutlined,
  InfoOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { useApiCallback, useMpinStatus } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { ExportBackupParams } from "core-lib/api/commons/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { AdminConfirmDialog } from "core-lib/components/radix/security";

interface Props {
  onExported?: () => void;
}

const buildFileName = () => {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "").replace(/Z$/, "Z");
  return `espasyo-backup-${stamp}.xlsx`;
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const BackupExportPanel: React.FC<Props> = ({ onExported }) => {
  const { showToast } = useToastContext();
  const mpin = useMpinStatus();
  const [includeStockMovements, setIncludeStockMovements] = useState(true);
  const [includeAuditLog, setIncludeAuditLog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const exportCb = useApiCallback(
    async (api, args: ExportBackupParams) => await api.commons.exportBackup(args),
  );

  const hasMpin = mpin.ready && !!mpin.status?.hasMpin;

  const handleConfirm = async ({
    password,
    mpin: mpinValue,
  }: {
    password: string;
    mpin: string;
  }) => {
    setConfirmError(null);
    try {
      const result = await exportCb.execute({
        password,
        mpin: mpinValue,
        includeAuditLog,
        includeStockMovements,
      });
      if (result.status >= 200 && result.status < 300 && result.data) {
        const blob =
          result.data instanceof Blob
            ? result.data
            : new Blob([result.data as BlobPart], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
        triggerDownload(blob, buildFileName());
        showToast("Backup file downloaded", "success");
        setConfirmOpen(false);
        onExported?.();
        return;
      }
      setConfirmError("Failed to generate backup. Try again.");
    } catch (error) {
      console.error("Backup export error:", error);
      const status = (error as string[] & { status?: number }).status;
      if (status === 401) {
        setConfirmError("Password or MPIN is incorrect. Try again.");
        return;
      }
      if (status === 409) {
        setConfirmError(
          "Another backup operation is already in flight. Try again in a moment.",
        );
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string" && error[0] !== "something_went_wrong"
          ? (error[0] as string)
          : "Failed to generate backup.";
      setConfirmError(first);
    }
  };

  return (
    <Card variant="surface" size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="3" wrap="wrap">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-3)",
              background: "var(--teal-a3)",
              color: "var(--teal-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CloudDownloadOutlined style={{ fontSize: 26 }} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Heading size="4">Export full database</Heading>
            <Text size="2" color="gray">
              Generate a single Excel workbook containing every operational
              table — settings, content blocks, products, recipes, inventory,
              roles, menu items, users, suppliers, and more.
            </Text>
          </Box>
        </Flex>

        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <InfoOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            Password hashes, MPIN hashes, and refresh tokens are{" "}
            <strong>never</strong> included. New users imported from a backup
            will need an admin to issue a password reset before they can sign
            in.
          </Callout.Text>
        </Callout.Root>

        <Box>
          <Text size="2" weight="bold" as="div" mb="2">
            Options
          </Text>
          <Flex direction="column" gap="2">
            <Flex
              align="center"
              gap="2"
              onClick={() => setIncludeStockMovements((v) => !v)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <Checkbox checked={includeStockMovements} />
              <Flex direction="column">
                <Text size="2" weight="medium">
                  Include stock movements
                </Text>
                <Text size="1" color="gray">
                  The full inventory ledger. Recommended on; flip off only if
                  the table is enormous and you don't need historical movements
                  in this snapshot.
                </Text>
              </Flex>
            </Flex>
            <Flex
              align="center"
              gap="2"
              onClick={() => setIncludeAuditLog((v) => !v)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <Checkbox checked={includeAuditLog} />
              <Flex direction="column">
                <Text size="2" weight="medium">
                  Include audit log
                </Text>
                <Text size="1" color="gray">
                  Append the full audit trail. Off by default — the audit table
                  can grow large quickly.
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>

        <Separator size="4" />

        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex align="center" gap="2">
            <Badge color="gray" variant="surface" radius="full">
              <Flex align="center" gap="1">
                <LockOutlined style={{ fontSize: 14 }} />
                Password + MPIN required
              </Flex>
            </Badge>
            {!hasMpin && (
              <Badge color="amber" variant="soft" radius="full">
                Set up an MPIN first
              </Badge>
            )}
          </Flex>
          <Button
            type="Primary"
            size="3"
            disabled={!hasMpin || exportCb.loading}
            loading={exportCb.loading}
            onClick={() => {
              setConfirmError(null);
              setConfirmOpen(true);
            }}
          >
            <Flex align="center" gap="2">
              <CloudDownloadOutlined fontSize="small" />
              Generate backup
            </Flex>
          </Button>
        </Flex>
      </Flex>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setConfirmError(null);
        }}
        title="Generate backup?"
        description="A full Excel snapshot of the operational database will be downloaded to your computer. This is sensitive data — store it securely."
        warning="Anyone with the file gets the same data the admin sees. Keep it off shared drives."
        confirmLabel="Generate"
        confirmColor="Primary"
        loading={exportCb.loading}
        errorMessage={confirmError}
        onConfirm={handleConfirm}
      />
    </Card>
  );
};
