import React, { useCallback, useMemo } from "react";
import { Box, useTheme, alpha } from "@mui/material";
import { DataTableV2 } from "core-lib";
import { TABLE_HEADERS } from "../constants";
import { RecipeResponse } from "core-lib/api/commons/types";
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
  const theme = useTheme();

  const calculateTotalCost = (recipe: RecipeResponse): number => {
    return recipe.recipeItems.reduce((sum, item) => sum + item.cost, 0);
  };

  const tableData = useMemo((): TableRecipe[] => {
    return data.map((recipe) => ({
      ...recipe,
      ingredientCount: recipe.recipeItems.length,
      totalCost: calculateTotalCost(recipe),
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
        data-testid="recipe-list-table"
        data={tableData}
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
