import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { TABLE_HEADERS } from "../constants";
import { UnitConversion } from "core-lib/api/commons/types";
import { UnitConversionTableRow } from "./UnitConversionTableRow";

interface Props {
  data: UnitConversion[];
  loading?: boolean;
  pagination?: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    totalItems: number;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onView: (conversion: UnitConversion) => void;
  onEdit: (conversion: UnitConversion) => void;
  onDelete: (conversion: UnitConversion) => void;
}

export const UnitConversionList: React.FC<Props> = ({
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
    (row: UnitConversion) => (
      <UnitConversionTableRow
        key={row.unitConversionID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onView, onEdit, onDelete],
  );

  return (
    <Box style={{ width: "100%", overflowX: "auto" }}>
      <DataTableV2
        data-testid="unit-conversion-list-table"
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
