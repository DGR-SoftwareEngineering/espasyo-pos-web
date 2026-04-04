import React, { useCallback, useMemo } from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { DataTableV2 } from "core-lib";
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
  const theme = useTheme();

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

  const transformedHeaders = useMemo(() => {
    return TABLE_HEADERS.map((header) => ({
      name: header.id,
      label: header.label,
      align: header.align as "left" | "center" | "right" | undefined,
      width: header.width,
      sortable: header.sortable,
    }));
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        minWidth: "100%",
      }}
    >
      <DataTableV2
        data-testid="unit-conversion-list-table"
        data={data}
        loading={loading}
        tableHeaders={transformedHeaders}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
        sx={{
          tableHead: {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            "& th": {
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
          headerCell: {
            cell: {
              py: 2.5,
              backgroundColor: "transparent",
            },
            typography: {
              fontWeight: 700,
              fontSize: "0.875rem",
            },
          },
          bodyCell: {
            cell: {
              py: 1.5,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            },
          },
        }}
      />
    </Box>
  );
};
