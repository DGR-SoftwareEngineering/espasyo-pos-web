import React, { useCallback, useMemo, useState } from "react";
import { Box, Card, Flex, TextField as RadixTextField } from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useApi } from "../../../core/hooks";
import { DataTableV2 } from "../../radix/table/DataTableV2";
import { StatsCard } from "../../radix/StatsCard";
import { HeaderV2 } from "../../radix/header/HeaderV2";
import { Button } from "../../radix/buttons/Button";
import { LookupTableRow } from "./LookupTableRow";
import { LookupFormDialog } from "./LookupFormDialog";
import { LookupDeleteDialog } from "./LookupDeleteDialog";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  config: LookupAdminConfig<TDto>;
}

const TABLE_HEADERS = [
  {
    id: "name",
    name: "Name",
    align: "left" as const,
    sortable: false,
    width: "30%",
  },
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

  const treeEnabled = !!(config.enableTree && config.parentIdField);

  // Build {row, depth, hasChildren} list when tree mode is on.
  const childrenByParent = useMemo(() => {
    if (!treeEnabled) return new Map<string | null, TDto[]>();
    const map = new Map<string | null, TDto[]>();
    for (const r of filteredRows) {
      const pid =
        (r[config.parentIdField!] as unknown as string | null) ?? null;
      const list = map.get(pid) ?? [];
      list.push(r);
      map.set(pid, list);
    }
    return map;
  }, [filteredRows, treeEnabled, config.parentIdField]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  // Auto-expand first two depths when rows first load.
  React.useEffect(() => {
    if (!treeEnabled) return;
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set<string>();
      const seedDepth0 = childrenByParent.get(null) ?? [];
      for (const r of seedDepth0) {
        const id = r[config.idField] as unknown as string;
        next.add(id);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeEnabled, childrenByParent]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  interface FlatTreeNode {
    row: TDto;
    depth: number;
    hasChildren: boolean;
  }

  const treeFlattened = useMemo<FlatTreeNode[]>(() => {
    if (!treeEnabled) return [];
    const out: FlatTreeNode[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = childrenByParent.get(parentId) ?? [];
      for (const r of kids) {
        const id = r[config.idField] as unknown as string;
        const hasChildren = (childrenByParent.get(id)?.length ?? 0) > 0;
        out.push({ row: r, depth, hasChildren });
        if (hasChildren && expanded.has(id)) {
          walk(id, depth + 1);
        }
      }
    };
    walk(null, 0);
    return out;
  }, [treeEnabled, childrenByParent, expanded, config.idField]);

  const displayRows = useMemo<TDto[]>(
    () => (treeEnabled ? treeFlattened.map((n) => n.row) : filteredRows),
    [treeEnabled, treeFlattened, filteredRows],
  );

  const treeMetaById = useMemo(() => {
    if (!treeEnabled) return new Map<string, FlatTreeNode>();
    const m = new Map<string, FlatTreeNode>();
    for (const n of treeFlattened) {
      m.set(n.row[config.idField] as unknown as string, n);
    }
    return m;
  }, [treeEnabled, treeFlattened, config.idField]);

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
    (row: TDto) => {
      const id = row[config.idField] as unknown as string;
      const meta = treeMetaById.get(id);
      return (
        <LookupTableRow<TDto>
          key={id}
          row={row}
          config={config}
          onEdit={(r) => setEditRow(r)}
          onDelete={(r) => setDeleteRow(r)}
          depth={meta?.depth ?? 0}
          hasChildren={meta?.hasChildren ?? false}
          expanded={expanded.has(id)}
          onToggle={() => toggleExpanded(id)}
        />
      );
    },
    [config, treeMetaById, expanded, toggleExpanded],
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title={config.entityNamePlural}
          subtitle={config.description}
          icon={<config.icon />}
          actionButton={{
            label: `New ${config.entityName}`,
            onClick: () => setCreateOpen(true),
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex mt="4" gap="3" wrap="wrap">
          <StatsCard label="Total" value={stats.total} color="primary" />
          <StatsCard label="Active" value={stats.active} color="success" />
          {config.parentIdField && (
            <StatsCard
              label="With Parent"
              value={stats.withParent}
              color="info"
            />
          )}
        </Flex>

        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "stretch", md: "center" }}
          gap="3"
          mt="4"
        >
          <Box style={{ minWidth: 280, flex: 1, maxWidth: 420 }}>
            <RadixTextField.Root
              size="2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${config.entityNamePlural.toLowerCase()}…`}
            >
              <RadixTextField.Slot>
                <MagnifyingGlassIcon height={16} width={16} />
              </RadixTextField.Slot>
            </RadixTextField.Root>
          </Box>

          <Flex direction="row" gap="2" align="center">
            <Button
              type="Secondary"
              onClick={handleRefresh}
              disabled={data.loading}
            >
              <Flex align="center" gap="2">
                <ReloadIcon />
                Refresh
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <DataTableV2
          data={displayRows}
          loading={data.loading}
          tableHeaders={TABLE_HEADERS}
          bodyRowComponent={bodyRowComponent}
        />
      </Card>

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
