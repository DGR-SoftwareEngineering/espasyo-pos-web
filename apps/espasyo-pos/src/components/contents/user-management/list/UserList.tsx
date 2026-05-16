import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { UserDto } from "core-lib/api/commons/types";
import { UserTableRow } from "./UserTableRow";

const TABLE_HEADERS = [
  { id: "user", name: "User", align: "left" as const, width: "32%" },
  { id: "role", name: "Role", align: "center" as const, width: "13%" },
  { id: "contact", name: "Contact", align: "left" as const, width: "22%" },
  {
    id: "lastLogin",
    name: "Last Login",
    align: "center" as const,
    width: "13%",
  },
  { id: "status", name: "Status", align: "center" as const, width: "10%" },
  { id: "actions", name: "Actions", align: "right" as const, width: "10%" },
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
}) => {
  const bodyRowComponent = useCallback(
    (row: UserDto) => (
      <UserTableRow
        key={row.userID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onView, onEdit, onDelete],
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
