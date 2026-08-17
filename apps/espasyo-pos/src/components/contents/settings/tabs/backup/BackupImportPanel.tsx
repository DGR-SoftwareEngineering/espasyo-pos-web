import React, { useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Callout,
  Card,
  RadioGroup,
  Table,
} from "@radix-ui/themes";;
import {
  CloudUploadOutlined,
  WarningAmberOutlined,
  CheckCircleOutlineOutlined,
  InfoOutlined,
  RefreshOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useApiCallback, useLogout, useMpinStatus } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  BackupImportMode,
  ImportPreviewDto,
} from "core-lib/api/commons/types";
import { Button } from "core-lib/components/radix/buttons/Button";
import { AdminConfirmDialog } from "core-lib/components/radix/security";

interface Props {
  onImported?: () => void;
}

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const BackupImportPanel: React.FC<Props> = ({ onImported }) => {
  const { showToast } = useToastContext();
  const mpin = useMpinStatus();
  const { logout } = useLogout();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<BackupImportMode>("replace");
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const previewCb = useApiCallback(
    async (api, args: { file: File; mode: BackupImportMode }) =>
      await api.commons.previewImportBackup(args),
  );
  const importCb = useApiCallback(
    async (
      api,
      args: {
        file: File;
        mode: BackupImportMode;
        password: string;
        mpin: string;
      },
    ) => await api.commons.importBackup(args),
  );

  const hasMpin = mpin.ready && !!mpin.status?.hasMpin;
  const hasBlockingErrors =
    !!preview?.blockingErrors && preview.blockingErrors.length > 0;
  const validationErrorCount =
    preview?.sheets.reduce(
      (acc, s) => acc + (s.validationErrors?.length ?? 0),
      0,
    ) ?? 0;
  const canApply =
    hasMpin &&
    !!file &&
    !!preview &&
    !hasBlockingErrors &&
    validationErrorCount === 0;

  const reset = () => {
    setFile(null);
    setPreview(null);
    setPreviewError(null);
    setConfirmError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validateAndPreview = async (incoming: File) => {
    if (!/\.xlsx$/i.test(incoming.name)) {
      showToast("File must be an .xlsx workbook", "error");
      return;
    }
    if (incoming.size > MAX_BYTES) {
      showToast("File exceeds 20 MB", "error");
      return;
    }
    setFile(incoming);
    setPreview(null);
    setPreviewError(null);
    try {
      const result = await previewCb.execute({ file: incoming, mode });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        setPreview(result.data.response);
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to preview backup file";
      setPreviewError(message);
    } catch (error) {
      console.error("Preview import error:", error);
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to preview backup file";
      setPreviewError(first);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked) validateAndPreview(picked);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndPreview(dropped);
  };

  const handleModeChange = (next: BackupImportMode) => {
    setMode(next);
    if (file) validateAndPreview(file);
  };

  const handleConfirm = async ({
    password,
    mpin: mpinValue,
  }: {
    password: string;
    mpin: string;
  }) => {
    if (!file) return;
    setConfirmError(null);
    try {
      const result = await importCb.execute({
        file,
        mode,
        password,
        mpin: mpinValue,
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        const r = result.data.response;
        const tail =
          mode === "replace"
            ? "Signing you out…"
            : "Reloading…";
        showToast(
          `Restore complete · ${r.totalInserted} added, ${r.totalUpdated} updated, ${r.totalDeleted} removed. ${tail}`,
          "success",
        );
        setConfirmOpen(false);
        reset();
        onImported?.();
        if (mode === "replace") {
          setTimeout(() => {
            void logout();
          }, 1200);
        } else if (typeof window !== "undefined") {
          setTimeout(() => window.location.reload(), 1200);
        }
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to restore backup";
      setConfirmError(message);
    } catch (error) {
      console.error("Import error:", error);
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
      if (status === 413) {
        setConfirmError(
          "The backup file exceeds the 25 MB upload limit.",
        );
        return;
      }
      const first =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to restore backup";
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
              background: "var(--amber-a3)",
              color: "var(--amber-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CloudUploadOutlined style={{ fontSize: 26 }} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Heading size="4">Restore from backup</Heading>
            <Text size="2" color="gray">
              Upload a previously-exported workbook. Preview the import first,
              then apply with your password + MPIN.
            </Text>
          </Box>
        </Flex>

        <Callout.Root color="amber" variant="surface">
          <Callout.Icon>
            <WarningAmberOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            Restoring overwrites operational data. Always export a fresh
            backup first so you can roll back.
          </Callout.Text>
        </Callout.Root>

        {mode === "replace" && (
          <Callout.Root color="red" variant="surface">
            <Callout.Icon>
              <WarningAmberOutlined fontSize="small" />
            </Callout.Icon>
            <Callout.Text>
              <strong>Replace mode ends every active session.</strong> All
              currently signed-in users — including you — will be logged out
              the moment the restore commits. Refresh tokens are wiped to keep
              foreign-key constraints clean during the table swap. You'll need
              to sign in again right after.
            </Callout.Text>
          </Callout.Root>
        )}

        {file ? (
          <Flex
            align="center"
            gap="3"
            p="3"
            style={{
              borderRadius: "var(--radius-3)",
              border: "1px solid var(--gray-a5)",
              background: "var(--gray-a2)",
            }}
          >
            <TableChartOutlined
              style={{ fontSize: 28, color: "var(--accent-11)" }}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2" weight="bold" as="div" truncate>
                {file.name}
              </Text>
              <Text size="1" color="gray" as="div">
                {formatBytes(file.size)} ·{" "}
                {previewCb.loading
                  ? "Analyzing…"
                  : preview
                    ? `${preview.totalRecordCount} record(s) across ${preview.sheets.length} sheet(s)`
                    : previewError
                      ? "Preview failed"
                      : "Ready"}
              </Text>
            </Box>
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              onClick={() => validateAndPreview(file)}
              aria-label="Re-run preview"
              disabled={previewCb.loading}
            >
              <RefreshOutlined fontSize="small" />
            </IconButton>
            <IconButton
              variant="ghost"
              color="red"
              size="2"
              onClick={reset}
              aria-label="Remove file"
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
        ) : (
          <Box
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: 32,
              borderRadius: "var(--radius-3)",
              background: isDragging ? "var(--accent-a3)" : "var(--gray-a2)",
              border: `1.5px ${isDragging ? "solid" : "dashed"} ${
                isDragging ? "var(--accent-9)" : "var(--gray-a6)"
              }`,
              cursor: "pointer",
              transition: "all 120ms ease",
              userSelect: "none",
            }}
          >
            <Flex direction="column" align="center" gap="2">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: isDragging
                    ? "var(--accent-a5)"
                    : "var(--accent-a3)",
                  color: "var(--accent-11)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloudUploadOutlined style={{ fontSize: 24 }} />
              </Box>
              <Text size="2" weight="medium" as="div" align="center">
                {isDragging ? "Drop the backup here" : "Drag & drop a backup file"}
              </Text>
              <Text size="1" color="gray" as="div" align="center">
                or{" "}
                <Text style={{ color: "var(--accent-11)" }}>
                  click to browse
                </Text>{" "}
                · .xlsx · max 20 MB
              </Text>
            </Flex>
          </Box>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: "none" }}
          onChange={handleFileInput}
        />

        {previewError && (
          <Callout.Root color="red" variant="surface">
            <Callout.Icon>
              <WarningAmberOutlined fontSize="small" />
            </Callout.Icon>
            <Callout.Text>{previewError}</Callout.Text>
          </Callout.Root>
        )}

        {preview && (
          <PreviewSummary
            preview={preview}
            blockingErrorsCount={preview.blockingErrors.length}
            validationErrorCount={validationErrorCount}
          />
        )}

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" as="div" mb="2">
            Restore mode
          </Text>
          <RadioGroup.Root
            value={mode}
            onValueChange={(v) => handleModeChange(v as BackupImportMode)}
          >
            <Flex direction="column" gap="2">
              <Flex align="start" gap="2" asChild>
                <label style={{ cursor: "pointer" }}>
                  <RadioGroup.Item value="replace" />
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="2" weight="medium">
                      Replace
                    </Text>
                    <Text size="1" color="gray">
                      Truncate each table, then insert every row from the file.
                      Anything in the DB that isn't in the file is lost.
                      Recommended for full restores after a corruption or
                      rollback.
                    </Text>
                  </Flex>
                </label>
              </Flex>
              <Flex align="start" gap="2" asChild>
                <label style={{ cursor: "pointer" }}>
                  <RadioGroup.Item value="merge" />
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="2" weight="medium">
                      Merge
                    </Text>
                    <Text size="1" color="gray">
                      Upsert by primary key. Rows in the DB that aren't in the
                      file are left alone. Use this when importing additions
                      from another environment.
                    </Text>
                  </Flex>
                </label>
              </Flex>
            </Flex>
          </RadioGroup.Root>
        </Box>

        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex align="center" gap="2">
            {hasBlockingErrors && (
              <Badge color="red" variant="soft" radius="full">
                {preview!.blockingErrors.length} blocking error(s)
              </Badge>
            )}
            {validationErrorCount > 0 && (
              <Badge color="amber" variant="soft" radius="full">
                {validationErrorCount} validation error(s)
              </Badge>
            )}
            {!hasMpin && (
              <Badge color="amber" variant="soft" radius="full">
                Set up an MPIN first
              </Badge>
            )}
          </Flex>
          <Button
            type="Critical"
            size="3"
            disabled={!canApply || importCb.loading}
            loading={importCb.loading}
            onClick={() => {
              setConfirmError(null);
              setConfirmOpen(true);
            }}
          >
            <Flex align="center" gap="2">
              <CloudUploadOutlined fontSize="small" />
              Apply restore
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
        title={`Restore from ${file?.name ?? "backup"}?`}
        description={
          mode === "replace"
            ? "REPLACE mode wipes every operational table and inserts the file's rows. The change runs in a single transaction and rolls back on any error. Every active session — including yours — ends when this commits."
            : "MERGE mode upserts every row in the file by primary key. Existing rows that aren't in the file are left alone. The change runs in a single transaction and rolls back on any error."
        }
        warning={
          mode === "replace"
            ? "There is no undo. You'll be signed out the moment the restore commits — make sure you've exported a fresh backup and have your password handy."
            : "There is no undo. Make sure you've exported a fresh backup before applying."
        }
        confirmLabel="Restore"
        confirmColor="Critical"
        loading={importCb.loading}
        errorMessage={confirmError}
        onConfirm={handleConfirm}
      />
    </Card>
  );
};

const PreviewSummary: React.FC<{
  preview: ImportPreviewDto;
  blockingErrorsCount: number;
  validationErrorCount: number;
}> = ({ preview, blockingErrorsCount, validationErrorCount }) => {
  const exportedDate = preview.exportedAt
    ? new Date(preview.exportedAt).toLocaleString()
    : "unknown";

  return (
    <Flex direction="column" gap="3">
      {blockingErrorsCount > 0 && (
        <Callout.Root color="red" variant="surface">
          <Callout.Icon>
            <WarningAmberOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            <strong>This file cannot be imported.</strong>
            <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
              {preview.blockingErrors.map((err, i) => (
                <li key={i}>
                  <Text size="2">{err}</Text>
                </li>
              ))}
            </ul>
          </Callout.Text>
        </Callout.Root>
      )}

      <Flex
        align="center"
        gap="3"
        p="3"
        wrap="wrap"
        style={{
          borderRadius: "var(--radius-3)",
          background: "var(--green-a2)",
          border: "1px solid var(--green-a5)",
        }}
      >
        <CheckCircleOutlineOutlined
          style={{ fontSize: 28, color: "var(--green-11)" }}
        />
        <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
          <Text size="2" weight="bold">
            Preview · {preview.totalRecordCount} record(s) across{" "}
            {preview.sheets.length} sheet(s)
          </Text>
          <Text size="1" color="gray">
            Schema v{preview.schemaVersion} · exported {exportedDate}
            {preview.exportedByName ? ` by ${preview.exportedByName}` : ""}
          </Text>
        </Flex>
      </Flex>

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Sheet</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Total</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Insert</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Update</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Delete</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Errors</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {preview.sheets.map((sheet) => {
            const errs = sheet.validationErrors?.length ?? 0;
            return (
              <Table.Row key={sheet.sheetName}>
                <Table.RowHeaderCell>
                  <Flex direction="column">
                    <Text size="2" weight="medium">
                      {sheet.sheetName}
                    </Text>
                    <Text size="1" color="gray">
                      {sheet.tableName}
                    </Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell align="right">{sheet.recordCount}</Table.Cell>
                <Table.Cell align="right">
                  <Text color={sheet.willInsert > 0 ? "green" : "gray"}>
                    +{sheet.willInsert}
                  </Text>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text color={sheet.willUpdate > 0 ? "amber" : "gray"}>
                    {sheet.willUpdate}
                  </Text>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text color={sheet.willDelete > 0 ? "red" : "gray"}>
                    -{sheet.willDelete}
                  </Text>
                </Table.Cell>
                <Table.Cell align="right">
                  {errs > 0 ? (
                    <Badge color="red" variant="soft" radius="full" size="1">
                      {errs}
                    </Badge>
                  ) : (
                    <Text color="gray" size="1">
                      —
                    </Text>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      {validationErrorCount > 0 && (
        <Callout.Root color="amber" variant="surface">
          <Callout.Icon>
            <InfoOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            Some rows have validation issues. They will block the restore.
            Inspect the file and fix the rows, then re-upload.
          </Callout.Text>
        </Callout.Root>
      )}

      {blockingErrorsCount === 0 && validationErrorCount === 0 && (
        <Callout.Root color="gray" variant="surface">
          <Callout.Icon>
            <InfoOutlined fontSize="small" />
          </Callout.Icon>
          <Callout.Text>
            Preview checks workbook structure and per-sheet record counts, but
            doesn't catch every per-cell type mismatch. A clean preview can
            still fail at apply time — the whole transaction rolls back if any
            row is rejected.
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
};
