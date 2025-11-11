import { useCallback, useReducer } from "react";
import { DataTableColumn } from "../../../api/content/types/page";

type State = {
  sortBy: string;
  ascending: boolean;
  pageNumber: number;
  pageSize: number;
};

type Action =
  | { type: "sort"; column: string }
  | { type: "setPage"; pageNumber: number }
  | { type: "setPageSize"; pageSize: number };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "sort":
      const sortBy = action.column;
      const ascending = state.sortBy === sortBy ? !state.ascending : true;
      return { ...state, ascending, sortBy, pageNumber: 1 };
    case "setPage":
      return { ...state, pageNumber: action.pageNumber };
    case "setPageSize":
      return { ...state, setPageSize: action.pageSize, pageNumber: 1 };
    default:
      return state;
  }
};

export const usePaginatedSort = (
  columns: DataTableColumn[],
  pageSize: number,
  defaultOrderingColumn?: string,
  defaultOrderingOrder?: string
) => {
  const defaultColumn = columns.find(
    (col) => col.dataField?.value === defaultOrderingColumn
  );
  const initialSortBy =
    defaultColumn?.header?.value || columns[0]?.header?.value || "";

  const [state, dispatch] = useReducer(reducer, {
    sortBy: initialSortBy,
    ascending: defaultOrderingOrder !== "DESC",
    pageNumber: 1,
    pageSize,
  });

  return {
    ...state,
    setPage: useCallback(
      (pageNumber: number) => dispatch({ type: "setPage", pageNumber }),
      []
    ),
    sort: useCallback(
      (column: string) => dispatch({ type: "sort", column }),
      []
    ),
    setPageSize: useCallback(
      (pageSize: number) => dispatch({ type: "setPageSize", pageSize }),
      []
    ),
  };
};

export type PaginatedSortResult = ReturnType<typeof usePaginatedSort>;
