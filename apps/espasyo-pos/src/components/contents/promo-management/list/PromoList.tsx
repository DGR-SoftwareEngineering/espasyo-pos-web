import React, { useCallback } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { PromoDto } from "core-lib/api/commons/types";
import { PromoTableRow } from "./PromoTableRow";
import { TABLE_HEADERS } from "../constants";
import { PromoListProps } from "./types";

export const PromoList: React.FC<PromoListProps> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const bodyRowComponent = useCallback(
    (row: PromoDto) => (
      <PromoTableRow
        key={row.promoID}
        row={row}
        onView={onView}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        onDelete={onDelete}
      />
    ),
    [onView, onActivate, onDeactivate, onDelete],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
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
