import React from "react";
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField as MuiTextField,
  InputAdornment,
  Chip,
  Box,
  Typography,
  alpha,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { FilterState } from "../types";
import {
  STATUS_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from "../constants";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  onPageSizeChange: (size: number) => void;
  resultCount: number;
  pageSize: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onPageSizeChange,
  resultCount,
  pageSize,
}) => {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
      <MuiTextField
        size="small"
        placeholder="Search products..."
        value={filters.searchTerm}
        onChange={(e) => onFilterChange("searchTerm", e.target.value)}
        sx={{ minWidth: 250, borderRadius: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.statusFilter}
          label="Status"
          onChange={(e) =>
            onFilterChange("statusFilter", e.target.value as number | "all")
          }
          sx={{ borderRadius: 2 }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {option.value !== "all" && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: (theme) =>
                        option.color !== "default"
                          ? theme.palette[option.color].main
                          : "transparent",
                    }}
                  />
                )}
                <Typography>{option.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Category Type</InputLabel>
        <Select
          value={filters.categoryTypeFilter}
          label="Category Type"
          onChange={(e) =>
            onFilterChange(
              "categoryTypeFilter",
              e.target.value as number | "all",
            )
          }
          sx={{ borderRadius: 2 }}
        >
          {CATEGORY_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Chip
        label={`${resultCount} results`}
        sx={{
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: (theme) => theme.palette.primary.main,
          fontWeight: 500,
          borderRadius: 2,
        }}
      />

      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Show</InputLabel>
        <Select
          value={pageSize}
          label="Show"
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ borderRadius: 2 }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={size}>
              {size} items
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
