import React, { useCallback, useMemo } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { TABLE_HEADERS } from "../constants";
import { ProductRecipeSummaryResponse } from "core-lib/api/commons/types";
import { RecipeTableRow } from "./RecipeTableRow";

interface Props {
  data: ProductRecipeSummaryResponse[];
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
  onView: (recipe: ProductRecipeSummaryResponse) => void;
  onEdit: (recipe: ProductRecipeSummaryResponse) => void;
  onDelete: (recipe: ProductRecipeSummaryResponse) => void;
  selectedIds: Set<string>;
  onSelectRecipe: (id: string) => void;
  onSelectAll: () => void;
}

type TableRecipe = ProductRecipeSummaryResponse & { ingredientCount: number; displayCost: number };

export const RecipeList: React.FC<Props> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  onSelectRecipe,
  onSelectAll,
}) => {
  const tableData = useMemo((): TableRecipe[] => {
    return data.map((recipe) => ({
      ...recipe,
      ingredientCount: recipe.totalAllIngredients,
      displayCost: recipe.totalAllCost,
    }));
  }, [data]);

  const selectableRows = tableData.filter((r) => r.recipeID);
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selectedIds.has(r.recipeID!));
  const someSelected = !allSelected && selectableRows.some((r) => selectedIds.has(r.recipeID!));

  const bodyRowComponent = useCallback(
    (row: TableRecipe) => (
      <RecipeTableRow
        key={row.recipeID ?? row.menuItemProductID}
        row={row}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        isSelectable={true}
        isChecked={row.recipeID ? selectedIds.has(row.recipeID) : false}
        onSelect={() => row.recipeID && onSelectRecipe(row.recipeID)}
      />
    ),
    [onView, onEdit, onDelete, selectedIds, onSelectRecipe],
  );

  return (
    <Box style={{ width: "100%" }}>
      <DataTableV2
        data-testid="recipe-list-table"
        data={tableData}
        loading={loading}
        tableHeaders={TABLE_HEADERS}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
        selectable={true}
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={onSelectAll}
      />
    </Box>
  );
};
