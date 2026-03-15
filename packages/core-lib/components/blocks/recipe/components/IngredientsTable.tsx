import React, { useMemo } from "react";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { PaginatedTable } from "core-lib";

import { UseFieldArrayRemove } from "react-hook-form";
import {
  CategoryDataList,
  ProductDataList,
} from "../../../../api/commons/types";

export interface RecipeItem extends Record<string, unknown> {
  id: string;
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes?: string | null;
}

interface IngredientsTableProps {
  fields: RecipeItem[];
  ingredients: ProductDataList[];
  units: CategoryDataList[];
  onRemove: UseFieldArrayRemove;
  onEdit?: (index: number) => void;
}

export const IngredientsTable: React.FC<IngredientsTableProps> = ({
  fields,
  ingredients,
  units,
  onRemove,
  onEdit,
}) => {
  const theme = useTheme();

  const getIngredientName = (id: string): string => {
    const ingredient = ingredients.find((i) => i.productID === id);
    return ingredient?.name || "Unknown";
  };

  const getUnitName = (id: string): string => {
    const unit = units.find((u) => u.categoryID === id);
    return unit?.name || "Unknown";
  };

  // Define column types properly
  type ColumnAccessor =
    | "ingredientProductID"
    | "quantityRequired"
    | "unitID"
    | "displayOrder"
    | "notes"
    | "actions";

  interface Column {
    Header: string;
    accessor: ColumnAccessor;
    Cell?: (props: {
      value: any;
      row: { index: number; original: RecipeItem };
    }) => React.ReactNode;
  }

  const columns: Column[] = useMemo(
    () => [
      {
        Header: "Ingredient",
        accessor: "ingredientProductID",
        Cell: ({ value, row }) => (
          <Typography variant="body2" fontWeight={500}>
            {getIngredientName(value)}
          </Typography>
        ),
      },
      {
        Header: "Quantity",
        accessor: "quantityRequired",
        Cell: ({ value }) => (
          <Chip
            label={value.toFixed(3)}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        Header: "Unit",
        accessor: "unitID",
        Cell: ({ value }) => (
          <Typography variant="body2">{getUnitName(value)}</Typography>
        ),
      },
      {
        Header: "Order",
        accessor: "displayOrder",
        Cell: ({ value }) => <Typography variant="body2">{value}</Typography>,
      },
      {
        Header: "Notes",
        accessor: "notes",
        Cell: ({ value }) => (
          <Typography variant="caption" color="text.secondary">
            {value || "-"}
          </Typography>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(row.index)}
                sx={{ color: theme.palette.primary.main }}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onRemove(row.index)}
              sx={{ color: theme.palette.error.main }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [
      ingredients,
      units,
      theme,
      onEdit,
      onRemove,
      getIngredientName,
      getUnitName,
    ],
  );

  const tableData = useMemo(
    () => [...fields].sort((a, b) => a.displayOrder - b.displayOrder),
    [fields],
  );

  if (fields.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: alpha(theme.palette.info.main, 0.02),
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">
          No ingredients added yet. Click "Add Ingredient" to start building
          your recipe.
        </Typography>
      </Box>
    );
  }

  return (
    <PaginatedTable
      columns={columns}
      data={tableData}
      noDataText="No ingredients"
      noDataFoundText="No ingredients found"
      mobileFiltersConfig={{
        alwaysOnFilters: [],
      }}
      sx={{
        tableHead: {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    />
  );
};
