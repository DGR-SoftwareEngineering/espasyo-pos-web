import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  alpha,
  useTheme,
  TextField as MuiTextField,
  InputAdornment,
} from "@mui/material";
import {
  AddOutlined,
  RefreshOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { useApi } from "../../../core/hooks";
import { DataTableV2 } from "../../DataTableV2";
import { StatsCard } from "../../StatsCard";
import { HeaderV2 } from "../../header/HeaderV2";
import { LookupTableRow } from "./LookupTableRow";
import { LookupFormDialog } from "./LookupFormDialog";
import { LookupDeleteDialog } from "./LookupDeleteDialog";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  config: LookupAdminConfig<TDto>;
}

const TABLE_HEADERS = [
  { id: "name", name: "Name", align: "left" as const, sortable: false, width: "30%" },
  {
    id: "description",
    name: "Description",
    align: "left" as const,
    sortable: false,
    width: "30%",
  },
  {
    id: "displayOrder",
    name: "Order",
    align: "center" as const,
    sortable: false,
    width: "10%",
  },
  {
    id: "parent",
    name: "Parent",
    align: "left" as const,
    sortable: false,
    width: "15%",
  },
  {
    id: "updatedAt",
    name: "Last Updated",
    align: "left" as const,
    sortable: false,
    width: "10%",
  },
  {
    id: "actions",
    name: "Actions",
    align: "right" as const,
    sortable: false,
    width: "5%",
  },
];

export function LookupAdminBlock<TDto extends LookupDtoBase>({
  config,
}: Props<TDto>) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<TDto | undefined>(undefined);
  const [deleteRow, setDeleteRow] = useState<TDto | undefined>(undefined);

  const data = useApi((api) => config.selectors.list(api));
  const rows = useMemo<TDto[]>(
    () => data.result?.data.response ?? [],
    [data.result?.data.response],
  );

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const sortedRows = [...rows].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder)
        return a.displayOrder - b.displayOrder;
      return a.name.localeCompare(b.name);
    });
    if (!q) return sortedRows;
    return sortedRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q),
    );
  }, [rows, searchTerm]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.isActive !== false).length,
      withParent: config.parentIdField
        ? rows.filter(
            (r) =>
              (r[config.parentIdField!] as unknown as string | null) != null,
          ).length
        : 0,
    }),
    [rows, config.parentIdField],
  );

  const handleRefresh = useCallback(() => {
    data.execute();
  }, [data]);

  const bodyRowComponent = useCallback(
    (row: TDto) => (
      <LookupTableRow<TDto>
        key={row[config.idField] as unknown as string}
        row={row}
        config={config}
        onEdit={(r) => setEditRow(r)}
        onDelete={(r) => setDeleteRow(r)}
      />
    ),
    [config],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <HeaderV2
          title={config.entityNamePlural}
          subtitle={config.description}
          icon={<config.icon />}
          actionButton={{
            label: `New ${config.entityName}`,
            onClick: () => setCreateOpen(true),
            icon: <AddOutlined />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, flexWrap: "wrap", gap: 2 }}
        >
          <StatsCard label="Total" value={stats.total} color="primary" />
          <StatsCard label="Active" value={stats.active} color="success" />
          {config.parentIdField && (
            <StatsCard
              label="With Parent"
              value={stats.withParent}
              color="info"
            />
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mt: 3 }}
        >
          <MuiTextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            placeholder={`Search ${config.entityNamePlural.toLowerCase()}…`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: "100%", md: 320 } }}
          />
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
              disabled={data.loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <DataTableV2
          data={filteredRows}
          loading={data.loading}
          tableHeaders={TABLE_HEADERS}
          bodyRowComponent={bodyRowComponent}
          sx={{
            tableHead: {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            },
            headerCell: {
              cell: { py: 2, fontWeight: 600 },
              typography: {
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              },
            },
            bodyCell: { cell: { py: 1.5 } },
          }}
        />
      </Paper>

      <LookupFormDialog
        open={createOpen}
        config={config}
        rows={rows}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      <LookupFormDialog
        open={!!editRow}
        config={config}
        rows={rows}
        editRow={editRow}
        onClose={() => setEditRow(undefined)}
        onSuccess={handleRefresh}
      />

      <LookupDeleteDialog
        open={!!deleteRow}
        config={config}
        row={deleteRow}
        onClose={() => setDeleteRow(undefined)}
        onSuccess={handleRefresh}
      />
    </Box>
  );
}
