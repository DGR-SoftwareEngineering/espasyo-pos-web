import { useEffect, useMemo, useRef, useState } from "react";
import { DataTableColumn } from "../../../api/content/types/page";
import { NA_SYMBOL } from "../../../business/constants";
import { formatDate } from "../../../business/dates";
import { formatUrlParameters } from "../../../business/url";
import { ParsedButtonProps, parseButtonProps, DataTableRow } from "./types";
import { useApi, useSessionStorage } from "../../../core/hooks";
import { DataTableHeader } from "../../table/types";
import { PaginatedSortResult, usePaginatedSort } from "./reducer";
import { ApiResponse } from "../../../api/types";

export type UseDataTableParams = {
  sourceUrl: string;
  paramName: string;
  pageSize?: number;
  columns: DataTableColumn[];
  withLabelPrefix: boolean;
  tableKey: string;
  defaultOrderingColumn?: string;
  defaultOrderingOrder?: string;
};

type CachedDataTableRow = {
  [key: string]: DataTableRow;
};

export type UseDataTableParamsResult = {
  columns: {
    name: string;
    dataField?: string;
    align?: DataTableHeader["align"];
    width?: DataTableHeader["width"];
    parseValue: (row?: DataTableRow) => string;
    originalValue: (row?: DataTableRow) => string;
    sort?: {
      sorted: boolean;
      ascending: boolean;
      onClick: () => void;
    };
    actionButton?: ParsedButtonProps;
  }[];
  paginatedSort: PaginatedSortResult;
  rows: DataTableRow[];
  loading: boolean;
  totalRows: number;
  selectedRowIndex: number | null;
  setSelectedRowIndex: (index: number | null) => void;
  selectedRowData: DataTableRow | null;
};

export const useCachedDataTableRow = () =>
  useSessionStorage<CachedDataTableRow>("dataTableRef", {});
export const useCachedSelectedRow = () =>
  useSessionStorage<DataTableRow | undefined>("selectedRow", undefined);

export const DEFAULT_PAGE_SIZE = 10;

export const useDataTableParams = (
  params: Partial<UseDataTableParams>
): UseDataTableParamsResult => {
  const [submittedRow] = useCachedDataTableRow();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<DataTableRow | null>(
    null
  );

  const initializationComplete = useRef(false);

  const paginatedSort = usePaginatedSort(
    params.columns || [],
    params.pageSize || DEFAULT_PAGE_SIZE,
    params.defaultOrderingColumn,
    params.defaultOrderingOrder
  );

  const dataSource = useDataSource<DataTableRow>({
    sourceUrl: params.sourceUrl ?? "no-source-url",
    paramName: params.paramName ?? "no-params",
  });

  const columns =
    params.columns?.map((col) => ({
      name: col.header?.value,
      dataField: col.dataField?.value,
      align:
        (col.alignment.value?.selection.toLowerCase() as DataTableHeader["align"]) ||
        "left",
      width: col.widthPercentage?.value
        ? `${col.widthPercentage.value}%`
        : undefined,
      parseValue: rowValue(col, params.tableKey, params.withLabelPrefix),
      originalValue: rowOriginalValue(col),
      sort: col.enableSortability?.value
        ? {
            sorted: Boolean(
              paginatedSort.sortBy === col.header?.value ||
                (params.defaultOrderingColumn &&
                  col.dataField?.value === params.defaultOrderingColumn)
            ),
            ascending: paginatedSort.ascending,
            onClick: () => paginatedSort.sort(col.header?.value || ""),
          }
        : undefined,
      actionButton: col.actionButton?.value?.elements
        ? { ...parseButtonProps(col.actionButton?.value?.elements) }
        : undefined,
    })) || [];

  const sortedRows = useMemo<DataTableRow[]>(() => {
    const base = (dataSource.result ?? []) as DataTableRow[];

    if (!paginatedSort.sortBy) return base;

    const column = columns.find((col) => col.name === paginatedSort.sortBy);
    if (!column || !column.dataField) return base;

    const get = (row: DataTableRow) => row[column.dataField!];

    const isDate = (value: unknown): value is string => {
      if (typeof value !== "string") return false;
      return !isNaN(Date.parse(value));
    };

    return [...base].sort((a, b) => {
      const aValue = get(a);
      const bValue = get(b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return paginatedSort.ascending ? -1 : 1;
      if (bValue == null) return paginatedSort.ascending ? 1 : -1;

      if (isDate(aValue) && isDate(bValue)) {
        const diff = new Date(aValue).getTime() - new Date(bValue).getTime();
        return paginatedSort.ascending ? diff : -diff;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        const diff = aValue - bValue;
        return paginatedSort.ascending ? diff : -diff;
      }

      const cmp = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
      });
      return paginatedSort.ascending ? cmp : -cmp;
    });
  }, [
    dataSource.result,
    paginatedSort.sortBy,
    paginatedSort.ascending,
    columns,
  ]);

  const startIndex = (paginatedSort.pageNumber - 1) * paginatedSort.pageSize;
  const paginatedRows = sortedRows.slice(
    startIndex,
    startIndex + paginatedSort.pageSize
  );

  useEffect(() => {
    if (
      initializationComplete.current ||
      !dataSource.result ||
      dataSource.result.length === 0 ||
      dataSource.loading ||
      !params.tableKey
    ) {
      return;
    }

    try {
      const selectedData = submittedRow[params.tableKey];

      if (!selectedData) {
        initializationComplete.current = true;
        return;
      }

      const selectedRowIndex = sortedRows.findIndex((row: any) => {
        return Object.entries(selectedData).every(([key, value]) => {
          return row[key] === value;
        });
      });

      if (selectedRowIndex >= 0) {
        setSelectedRowData(sortedRows[selectedRowIndex] ?? null);

        const targetPage =
          Math.floor(selectedRowIndex / paginatedSort.pageSize) + 1;

        if (targetPage !== paginatedSort.pageNumber) {
          paginatedSort.setPage(targetPage);
        }
      }
    } catch (error) {
      console.error("Error processing session storage data:", error as object);
    } finally {
      initializationComplete.current = true;
    }
  }, [
    dataSource.result,
    dataSource.loading,
    params.tableKey,
    sortedRows,
    paginatedSort,
  ]);

  useEffect(() => {
    if (selectedRowData) {
      const indexOnCurrentPage = paginatedRows.findIndex((row) => {
        return Object.keys(selectedRowData).every(
          (key) => selectedRowData[key] === row[key]
        );
      });

      setSelectedRowIndex(indexOnCurrentPage >= 0 ? indexOnCurrentPage : null);
    }
  }, [paginatedRows, selectedRowData]);

  useEffect(() => {
    if (selectedRowData) {
      const globalIndex = sortedRows.findIndex((row) => {
        return Object.keys(selectedRowData).every(
          (key) => selectedRowData[key] === row[key]
        );
      });

      if (globalIndex >= 0) {
        const targetPage = Math.floor(globalIndex / paginatedSort.pageSize) + 1;

        if (targetPage !== paginatedSort.pageNumber) {
          paginatedSort.setPage(targetPage);
        }
      }
    }
  }, [
    sortedRows,
    selectedRowData,
    paginatedSort.sortBy,
    paginatedSort.ascending,
  ]);

  const handleRowSelect = (index: number | null) => {
    setSelectedRowIndex(index);

    if (index !== null && index >= 0 && index < paginatedRows.length) {
      setSelectedRowData(paginatedRows[index] ?? null);
    } else {
      setSelectedRowData(null);
    }
  };

  return {
    columns,
    paginatedSort,
    rows: paginatedRows,
    totalRows: sortedRows.length,
    loading: dataSource.loading,
    selectedRowIndex,
    selectedRowData,
    setSelectedRowIndex: handleRowSelect,
  };
};

function isApiResponse<T>(data: any): data is ApiResponse<T> {
  return data && typeof data === "object" && "response" in data;
}
function hasItemsArray<T>(data: any): data is { items: T[] } {
  return data && typeof data === "object" && Array.isArray(data.items);
}
function hasNamedArrayKey<T>(
  data: any,
  key?: string
): data is Record<string, T[]> {
  return !!key && data && typeof data === "object" && Array.isArray(data[key]);
}

type UseDataSourceParams<TRow> = Pick<
  UseDataTableParams,
  "sourceUrl" | "paramName"
> & {
  mapToStringRow?: (row: TRow) => DataTableRow;
};

const useDataSource = <TRow = unknown>({
  sourceUrl,
  paramName,
}: UseDataSourceParams<TRow>) =>
  useApi(
    async (api) => {
      if (!sourceUrl) return Promise.reject();

      const [url] = sourceUrl.split("?") ?? [];
      const urlParams = formatUrlParameters(sourceUrl);

      const result = await api.commons.dataSummary<unknown>(
        url ?? "no-url-provided",
        { ...urlParams }
      );

      const data = (result as any)?.data;

      if (isApiResponse<TRow[]>(data)) {
        return data.response ?? [];
      }

      if (hasItemsArray<TRow>(data)) {
        return data.items ?? [];
      }

      if (hasNamedArrayKey<TRow>(data, paramName)) {
        return (data as Record<string, TRow[]>)[paramName!];
      }

      return [];
    },
    [sourceUrl, paramName]
  );

function rowValue(
  col: DataTableColumn,
  tableKey?: string,
  withLabelPrefix?: boolean
) {
  const fieldName = col.dataField.value?.toLowerCase();
  const format = col.dataFormat.value?.selection;

  return (row?: DataTableRow): string => {
    const formattedRow = Object.entries(row || {}).reduce<DataTableRow>(
      (prev, [key, val]) => ({ ...prev, [key.toLowerCase()]: val }),
      {}
    );
    const value = formattedRow[fieldName?.toLowerCase()];

    if (value === undefined || value === null || value === "") {
      return NA_SYMBOL;
    }

    if (format === "Date" && value) {
      return formatDate(value);
    }

    return withLabelPrefix && format === "Label"
      ? `${tableKey}_${value}`
      : value;
  };
}

function rowOriginalValue(col: DataTableColumn) {
  const fieldName = col.dataField.value?.toLowerCase();

  return (row?: DataTableRow): string => {
    const formattedRow = Object.entries(row || {}).reduce<DataTableRow>(
      (prev, [key, val]) => ({ ...prev, [key.toLowerCase()]: val }),
      {}
    );
    return formattedRow[fieldName.toLowerCase()] ?? "no-row-original-value";
  };
}
