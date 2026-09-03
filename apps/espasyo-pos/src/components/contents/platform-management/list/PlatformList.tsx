import React from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { TABLE_HEADERS } from "../constants";
import { PlatformListProps } from "./types";
import { PlatformTableRow } from "./PlatformTableRow";

export const PlatformList: React.FC<PlatformListProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  onManageUsers,
  loading,
}) => {
  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="platform-list-table"
        tableHeaders={TABLE_HEADERS}
        data={data}
        loading={loading}
        bodyRowComponent={(row) => (
          <PlatformTableRow
            row={row}
            onView={() => onView(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
            onManageUsers={() => onManageUsers(row)}
          />
        )}
      />
    </Box>
  );
};
