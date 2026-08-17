import React, { useCallback } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { UserDto } from "core-lib/api/commons/types";
import { UserTableRow } from "./UserTableRow";

const TABLE_HEADERS = [
  { id: "user", name: "User", align: "left" as const, width: "28%" },
  { id: "role", name: "Role", align: "center" as const, width: "11%" },
  { id: "contact", name: "Contact", align: "left" as const, width: "20%" },
  {
    id: "lastLogin",
    name: "Last Login",
    align: "center" as const,
    width: "12%",
  },
  { id: "status", name: "Status", align: "center" as const, width: "8%" },
  { id: "actions", name: "Actions", align: "right" as const, width: "21%" },
];

interface Props {
  data: UserDto[];
  loading?: boolean;
  pagination?: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    totalItems?: number;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onView: (user: UserDto) => void;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
  onLock: (user: UserDto) => void;
  onUnlock: (user: UserDto) => void;
  onRevokeTokens: (user: UserDto) => void;
}

export const UserList: React.FC<Props> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
  onRevokeTokens,
}) => {
  const bodyRowComponent = useCallback(
    (row: UserDto) => (
      <UserTableRow
        key={row.userID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onLock={onLock}
        onUnlock={onUnlock}
        onRevokeTokens={onRevokeTokens}
      />
    ),
    [onView, onEdit, onDelete, onLock, onUnlock, onRevokeTokens],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="user-list-table"
        data={data}
        loading={loading}
        tableHeaders={TABLE_HEADERS}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
      />
    </Box>
  );
};
