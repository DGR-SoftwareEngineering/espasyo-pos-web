import React, { useCallback, useMemo } from "react";
import { Box } from "@radix-ui/themes";
import { DataTableV2 } from "core-lib/components/radix/table/DataTableV2";
import { TABLE_HEADERS } from "../constants";
import { RecipeResponse } from "core-lib/api/commons/types";
import {
  getRecipeIngredientCount,
  getRecipeTotalCost,
} from "core-lib/business/recipe";
import { RecipeTableRow } from "./RecipeTableRow";

interface Props {
  data: RecipeResponse[];
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
  onView: (recipe: RecipeResponse) => void;
  onEdit: (recipe: RecipeResponse) => void;
  onDelete: (recipe: RecipeResponse) => void;
}

type TableRecipe = RecipeResponse & {
  ingredientCount: number;
  totalCost: number;
};

export const RecipeList: React.FC<Props> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onView,
  onEdit,
  onDelete,
}) => {
  const tableData = useMemo((): TableRecipe[] => {
    return data.map((recipe) => ({
      ...recipe,
      ingredientCount: getRecipeIngredientCount(recipe),
      totalCost: getRecipeTotalCost(recipe),
    }));
  }, [data]);

  const bodyRowComponent = useCallback(
    (row: TableRecipe) => (
      <RecipeTableRow
        key={row.recipeID}
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
        data-testid="recipe-list-table"
        data={tableData}
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
