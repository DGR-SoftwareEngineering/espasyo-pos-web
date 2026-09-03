import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Table,
  Tooltip,
} from "@radix-ui/themes";;
import {
  HistoryToggleOffOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { BackupHistoryDto } from "core-lib/api/commons/types";
import { formatDateTime } from "core-lib/business/dates";

interface Props {
  /** Bump this counter to force a refresh from the parent (after export/import). */
  refreshToken: number;
}

const formatBytes = (bytes: number | null): string => {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const BackupHistoryPanel: React.FC<Props> = ({ refreshToken }) => {
  const [rows, setRows] = useState<BackupHistoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cb = useApiCallback((api) => api.commons.backupHistory(1, 20));

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await cb.execute();
      setRows(result.data.response?.items ?? []);
    } catch (e) {
      console.error("Failed to load backup history", e);
      const first =
        Array.isArray(e) && typeof e[0] === "string"
          ? (e[0] as string)
          : "Failed to load backup history";
      setError(first);
    }
  }, [cb]);

  useEffect(() => {
    load();
  }, [refreshToken]);

  return (
    <Card variant="surface" size="3">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between" wrap="wrap" gap="3">
          <Flex align="center" gap="2">
            <HistoryToggleOffOutlined
              style={{ color: "var(--accent-11)" }}
            />
            <Heading size="3">Recent activity</Heading>
            <Badge color="gray" variant="soft" radius="full">
              {rows.length}
            </Badge>
          </Flex>
          <Tooltip content="Refresh">
            <IconButton
              variant="ghost"
              color="gray"
              onClick={load}
              disabled={cb.loading}
              aria-label="Refresh history"
            >
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Flex>

        {error ? (
          <Box
            p="3"
            style={{
              borderRadius: "var(--radius-3)",
              background: "var(--red-a2)",
              border: "1px solid var(--red-a5)",
            }}
          >
            <Text size="2" style={{ color: "var(--red-11)" }}>
              {error}
            </Text>
          </Box>
        ) : cb.loading && rows.length === 0 ? (
          <Flex align="center" justify="center" py="5">
            <Text color="gray" size="2">
              Loading…
            </Text>
          </Flex>
        ) : rows.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="6"
            gap="2"
          >
            <HistoryToggleOffOutlined
              style={{ fontSize: 40, color: "var(--gray-9)" }}
            />
            <Text size="2" weight="medium">
              No backup activity yet
            </Text>
            <Text size="1" color="gray" align="center">
              Once you export or import a backup, the entry appears here.
            </Text>
          </Flex>
        ) : (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>When</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Operation</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>By</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Size
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Records
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row key={row.backupHistoryID}>
                  <Table.Cell>
                    <Tooltip content={row.performedAt}>
                      <Text size="2">{formatDateTime(row.performedAt)}</Text>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap="2">
                      <Badge
                        color={
                          row.operation === "Export" ? "teal" : "amber"
                        }
                        variant="soft"
                        radius="full"
                      >
                        {row.operation}
                      </Badge>
                      {row.mode && (
                        <Text size="1" color="gray">
                          {row.mode}
                        </Text>
                      )}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">
                      {row.performedByName ?? row.performedBy ?? "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text size="2" color="gray">
                      {formatBytes(row.fileSizeBytes)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text size="2" color="gray">
                      {row.recordsAffected ?? "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={row.status === "Success" ? "green" : "red"}
                      variant="soft"
                      radius="full"
                    >
                      {row.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
    </Card>
  );
};
