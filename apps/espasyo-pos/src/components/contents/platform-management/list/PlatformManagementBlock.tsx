import React, { useCallback, useMemo, useState } from "react";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { useDialogContext } from "core-lib";
import { useApi } from "core-lib/core/hooks";
import type { DialogContentType } from "core-lib/api/content/types/common";
import type { FilterConfig } from "core-lib/components/radix/FilterBar";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { PlatformDto } from "core-lib/api/platform/types";
import { DIALOG_TYPES, DIALOG_TITLES } from "../constants";
import { PlatformList } from "./PlatformList";
import { usePlatformFilters } from "./hooks";

export const PlatformManagementBlock: React.FC = () => {
  const { openDialog } = useDialogContext();
  const platformData = useApi((api) => api.platform.list());
  const platforms = platformData.result?.data.response || [];
  const { filters, filteredItems, updateFilter, resetFilters } =
    usePlatformFilters({ items: platforms });

  const stats = useMemo(() => {
    return {
      total: platforms.length,
      active: platforms.filter((p) => p.isActive).length,
      system: platforms.filter((p) => p.isSystem).length,
      custom: platforms.filter((p) => !p.isSystem).length,
    };
  }, [platforms]);

  const statusFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        value: filters.status as string,
        options: [
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        onChange: (value) => updateFilter("status", value),
      },
    ],
    [filters.status, updateFilter]
  );

  const handleView = useCallback(
    (item: PlatformDto) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: item as any,
      });
    },
    [openDialog]
  );

  const handleEdit = useCallback(
    (item: PlatformDto) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: item as PlatformDto,
        onSuccess: () => platformData.execute(),
      });
    },
    [openDialog, platformData]
  );

  const handleDelete = useCallback(
    (item: PlatformDto) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: item as PlatformDto,
        onSuccess: () => platformData.execute(),
      });
    },
    [openDialog, platformData]
  );

  const handleCreate = useCallback(() => {
    openDialog({
      title: DIALOG_TITLES.create,
      dialogContentType: DIALOG_TYPES.create as unknown as DialogContentType,
      onSuccess: () => platformData.execute(),
    });
  }, [openDialog, platformData]);

  const handleManageUsers = useCallback(
    (item: PlatformDto) => {
      openDialog({
        title: DIALOG_TITLES.manageUsers,
        dialogContentType: DIALOG_TYPES.manageUsers as unknown as DialogContentType,
        data: item as PlatformDto,
        onSuccess: () => platformData.execute(),
      });
    },
    [openDialog, platformData]
  );

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" style={{ marginBottom: "var(--space-4)" }}>
        <HeaderV2
          title="Platform Management"
          subtitle="Manage platform portals and user access"
          actionButton={{
            label: "New Platform",
            onClick: handleCreate,
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Platforms"
            value={stats.total}
            color="primary"
            icon={<Text size="4">📊</Text>}
          />
          <StatsCard
            label="Active"
            value={stats.active}
            color="success"
            icon={<Text size="4">✓</Text>}
          />
          <StatsCard
            label="System"
            value={stats.system}
            color="info"
            icon={<Text size="4">⚙️</Text>}
          />
          <StatsCard
            label="Custom"
            value={stats.custom}
            color="warning"
            icon={<Text size="4">✨</Text>}
          />
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <Box style={{ padding: "var(--space-4)" }}>
          <Flex gap="3" direction="column">
            <FilterBar
              searchValue={filters.search}
              onSearchChange={(value) => updateFilter("search", value)}
              searchPlaceholder="Search platforms..."
              filterConfigs={statusFilterConfig}
              resultCount={filteredItems.length}
              pageSize={10}
              onPageSizeChange={() => {}}
            />

            <Flex gap="2" wrap="wrap">
              {["all", "active", "inactive"].map((status) => (
                <Button
                  key={status}
                  type={filters.status === status ? "Primary" : "Secondary"}
                  onClick={() => updateFilter("status", status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Box>

        <PlatformList
          data={filteredItems}
          loading={platformData.loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageUsers={handleManageUsers}
        />
      </Card>
    </Box>
  );
};
