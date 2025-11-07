import { CellProps, Column, FilterProps, FilterValue } from "react-table";
import { useMemo } from "react";
import { PaginatedTable } from "../../../../../../table/PaginatedTable";
import { Box, IconButton, Typography } from "@mui/material";
import {
  UserListResponse,
  ActionsCellProps,
  UserInfoValueType,
  User,
} from "./types";
import { EvaIcon } from "../../../../../../EvaIcon";
import { usePaginatedTable } from "../../../../../../table/hooks";
import { formatDate } from "../../../../../../../business/dates";
import { DefaultColumnFilter } from "../../../../../../table/filters/DefaultColumnFilter";
import { DateRangeColumnFilter } from "../../../../../../table/filters/DateRangeColumnFilter";

interface Props {
  tableData: UserListResponse["response"];
  onEdit: (sectionId: string, sectionDataId: string) => void;
  onDelete: (id: string, title: string) => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  userID,
  userInfoID,
  onEdit,
  onDelete,
}) => {
  return (
    <Box className="flex gap-2">
      <IconButton
        data-testid="edit-button"
        onClick={() => onEdit(userID, userInfoID)}
        sx={{
          height: "35px",
          background: "#F4C501",
          borderRadius: "5px",
          "&:hover": { background: "#F7D649" },
        }}
      >
        <EvaIcon name="edit-outline" fill="#ffffff" width={18} height={18} />
      </IconButton>
      <IconButton
        data-testid="delete-button"
        onClick={() => onDelete(userID)}
        sx={{
          height: "35px",
          background: "#D40000",
          borderRadius: "5px",
          "&:hover": { background: "#E56666" },
        }}
      >
        <EvaIcon name="trash-outline" fill="#ffffff" width={18} height={18} />
      </IconButton>
    </Box>
  );
};

export const AccountList: React.FC<Props> = ({
  tableData,
  onEdit,
  onDelete,
}) => {
  const { updateFilters, tableProps } = usePaginatedTable<User>(
    { propertyName: "createdAt" },
    {
      createdAt: (filter: FilterValue) => ({
        receivedDateFrom: formatDate(filter.value[0]),
        receivedDateTo: formatDate(filter.value[1]),
      }),
    }
  );

  const columns = useMemo(
    () =>
      [
        {
          Header: "Name",
          id: "name",
          accessor: (row) =>
            `${row.userInfo.firstName ?? ""} ${row.userInfo.middleName ?? ""} ${
              row.userInfo.lastName ?? ""
            }`
              .replace(/\s+/g, " ")
              .trim(),

          Filter: (props: FilterProps<{}>) =>
            DefaultColumnFilter({
              ...props,
              filterValue: props.column.filterValue,
              onChange: updateFilters,
            }),
          filter: "contains",
          minWidth: 250,
          width: 350,
          maxWidth: 500,
        },
        {
          id: "createdAt",
          Header: "Date Created",
          accessor: (row: User) =>
            formatDate(row.createdAt ?? "", "yyyy-MM-dd HH:mm:ss.SSS"),
          Filter: (props: FilterProps<{}>) =>
            DateRangeColumnFilter({
              ...props,
              filterValue: props.column.filterValue ?? [null, null],
              onChange: updateFilters,
            }),
          filter: "dateBetween",
        },
      ] as Column<User>[],
    [tableData]
  );

  return (
    <PaginatedTable
      columns={columns}
      data={tableData}
      noDataText="No data found"
      noDataFoundText="No data found"
      mobileFiltersConfig={{
        alwaysOnFilters: ["userID"],
        menuFilters: ["roleID", "userID"],
      }}
      hiddenColumns={["userID"]}
      {...tableProps}
    />
  );
};
