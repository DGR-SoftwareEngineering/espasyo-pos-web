import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { ReloadIcon, PlusIcon, PersonIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useDialogContext } from "core-lib";
import type {
  DialogContentType,
  DialogDataType,
} from "core-lib/api/content/types/common";
import type { FilterConfig } from "core-lib/components/radix/FilterBar";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { RoleDto, UserDto } from "core-lib/api/commons/types";
import { UserList } from "./UserList";
import { useUserFilters } from "./hooks";
import {
  DIALOG_TITLES,
  DIALOG_TYPES,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "../constants";
import { useApi } from "core-lib/core/hooks";

export const UserListBlock: React.FC = () => {
  const router = useRouter();
  const { openDialog } = useDialogContext();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const data = useApi((api) => api.commons.userList(pageNumber, pageSize));
  const rolesApi = useApi((api) => api.commons.roleList());

  useEffect(() => {
    const page = data.result?.data.response;
    setUsers(page?.items ?? []);
  }, [data.result?.data.response]);

  useEffect(() => {
    setRoles(rolesApi.result?.data.response ?? []);
  }, [rolesApi.result?.data.response]);

  const { filters, filteredUsers, stats, updateFilter, resetFilters } =
    useUserFilters({ users, roles });

  const serverPagination = data.result?.data.response;
  const pagination = useMemo(
    () => ({
      pageNumber,
      totalPages: serverPagination?.totalPages ?? 1,
      hasNextPage: serverPagination?.hasNextPage ?? false,
      hasPreviousPage: serverPagination?.hasPreviousPage ?? false,
      pageSize,
      totalItems: serverPagination?.totalItems,
    }),
    [pageNumber, pageSize, serverPagination],
  );

  const roleFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "role",
        label: "Role",
        value: filters.roleFilter,
        options: [
          { value: "all", label: "All Roles" },
          ...roles.map((r) => ({ value: r.roleID, label: r.roleName })),
        ],
        onChange: (value) =>
          updateFilter("roleFilter", value === "all" ? "all" : String(value)),
      },
    ],
    [filters.roleFilter, roles, updateFilter],
  );

  const handleRefresh = useCallback(() => {
    data.execute();
    setPageNumber(1);
  }, [data]);

  const handleCreate = () => {
    router.push("/admin/hub/user-management/add-new");
  };

  const handleView = useCallback(
    (user: UserDto) => {
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: user as DialogDataType["UserView"],
      });
    },
    [openDialog],
  );

  const handleEdit = useCallback(
    (user: UserDto) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: user as DialogDataType["UserEdit"],
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleDelete = useCallback(
    (user: UserDto) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: user as DialogDataType["UserDelete"],
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const hasNoUsers =
    !data.loading && (serverPagination?.totalItems ?? users.length) === 0;

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="User Management"
          subtitle="Create staff accounts, assign roles, and keep the team list current."
          icon={<PersonIcon />}
          actionButton={{
            label: "New User",
            onClick: handleCreate,
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Users"
            value={stats.total}
            color="primary"
            variant="detailed"
          />
          <StatsCard
            label="Active Last 7 Days"
            value={stats.recentlyActive}
            color="success"
            variant="detailed"
          />
          {Object.entries(stats.byRole).map(([roleName, count]) => (
            <StatsCard
              key={roleName}
              label={roleName}
              value={count}
              color="info"
              variant="detailed"
            />
          ))}
        </Flex>

        {hasNoUsers && (
          <Box mt="4">
            <MessageBlock
              type={MessageType.Info}
              header="No users yet"
              text="Add the first staff member to get started. Roles are pre-seeded from the lookup tables."
            />
          </Box>
        )}

        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "stretch", md: "center" }}
          gap="3"
          mt="4"
        >
          <FilterBar
            searchValue={filters.searchTerm}
            onSearchChange={(value) => updateFilter("searchTerm", value)}
            searchPlaceholder="Search by name, email, username, contact, role…"
            filterConfigs={roleFilterConfig}
            sortValue={filters.sortBy}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => updateFilter("sortBy", value)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNumber(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            resultCount={filteredUsers.length}
            resultLabel="users"
            pageSize={pageSize}
          />
          <Flex gap="3" align="center">
            <Button
              type="Secondary"
              onClick={() => {
                handleRefresh();
                resetFilters();
              }}
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
        <UserList
          data={filteredUsers}
          loading={data.loading}
          pagination={pagination}
          onNextPage={() => setPageNumber((p) => p + 1)}
          onPreviousPage={() => setPageNumber((p) => Math.max(1, p - 1))}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {filteredUsers.length > 0 && serverPagination && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing{" "}
            <Text weight="bold" color="gray">
              {filteredUsers.length}
            </Text>{" "}
            of{" "}
            <Text weight="bold" color="gray">
              {serverPagination.totalItems ?? users.length}
            </Text>{" "}
            users
          </Text>
          <Text size="2" color="gray">
            Page{" "}
            <Text weight="bold" color="gray">
              {pagination.pageNumber}
            </Text>{" "}
            of{" "}
            <Text weight="bold" color="gray">
              {pagination.totalPages}
            </Text>
          </Text>
        </Flex>
      )}
    </Box>
  );
};
