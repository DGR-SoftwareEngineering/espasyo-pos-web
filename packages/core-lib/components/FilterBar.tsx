import React from "react";
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  TextField as MuiTextField,
  InputAdornment,
  Chip,
  Box,
  Typography,
  alpha,
  IconButton,
  Badge,
  Popover,
  Button,
} from "@mui/material";
import {
  SearchOutlined,
  FilterListOutlined,
  ClearOutlined,
  SortOutlined,
} from "@mui/icons-material";

export interface FilterOption {
  value: string | number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface FilterConfig {
  key: string;
  label: string;
  value: string | number;
  options: FilterOption[];
  onChange: (value: string | number) => void;
}

export interface FilterState {
  searchTerm: string;
  statusFilter: number | "all";
  productTypeFilter: number | "all";
  categoryTypeFilter: number | "all";
}

interface Props {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterState;
  onFilterChange?: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  searchPlaceholder?: string;
  sortValue?: string;
  sortOptions?: FilterOption[];
  onSortChange?: (value: string) => void;
  filterConfigs?: FilterConfig[];
  resultCount: number;
  resultLabel?: string;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange: (size: number) => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  showFilterChip?: boolean;
  loading?: boolean;
}

export const FilterBar: React.FC<Props> = ({
  searchValue,
  onSearchChange,
  filters: filterState,
  onFilterChange,
  searchPlaceholder = "Search...",
  sortValue,
  sortOptions,
  onSortChange,
  filterConfigs = [],
  resultCount,
  resultLabel = "results",
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  activeFilterCount = 0,
  onClearFilters,
  showFilterChip = true,
  loading = false,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const open = Boolean(filterAnchorEl);
  const id = open ? "filter-popover" : undefined;

  const isOldStyle = filterState !== undefined && onFilterChange !== undefined;

  const currentSearchValue =
    searchValue ?? (isOldStyle ? filterState?.searchTerm || "" : "");

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else if (isOldStyle && onFilterChange) {
      onFilterChange("searchTerm", value);
    }
  };

  const filters = React.useMemo(() => {
    if (isOldStyle && filterState) {
      const configs: FilterConfig[] = [];

      configs.push({
        key: "status",
        label: "Status",
        value: filterState.statusFilter,
        options: [
          { value: "all", label: "All" },
          { value: 1, label: "Active", color: "success.main" },
          { value: 0, label: "Inactive", color: "error.main" },
        ],
        onChange: (value) =>
          onFilterChange("statusFilter", value as number | "all"),
      });

      configs.push({
        key: "productType",
        label: "Product Type",
        value: filterState.productTypeFilter,
        options: [
          { value: "all", label: "All" },
          { value: 1, label: "Menu Items" },
          { value: 0, label: "Ingredients" },
        ],
        onChange: (value) =>
          onFilterChange("productTypeFilter", value as number | "all"),
      });

      configs.push({
        key: "categoryType",
        label: "Category Type",
        value: filterState.categoryTypeFilter,
        options: [{ value: "all", label: "All" }],
        onChange: (value) =>
          onFilterChange("categoryTypeFilter", value as number | "all"),
      });

      return configs;
    }

    return filterConfigs;
  }, [isOldStyle, filterState, onFilterChange, filterConfigs]);

  const calculatedActiveCount = React.useMemo(() => {
    if (activeFilterCount > 0) return activeFilterCount;

    if (isOldStyle && filterState) {
      let count = 0;
      if (filterState.searchTerm) count++;
      if (filterState.statusFilter !== "all") count++;
      if (filterState.productTypeFilter !== "all") count++;
      if (filterState.categoryTypeFilter !== "all") count++;
      return count;
    }

    return 0;
  }, [activeFilterCount, isOldStyle, filterState]);

  return (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
      gap={2}
      alignItems="center"
    >
      {/* Search */}
      <MuiTextField
        size="small"
        placeholder={searchPlaceholder}
        value={currentSearchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ minWidth: 250, borderRadius: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: currentSearchValue && (
            <InputAdornment position="end">
              <ClearOutlined
                fontSize="small"
                sx={{
                  cursor: "pointer",
                  opacity: 0.5,
                  "&:hover": { opacity: 1 },
                }}
                onClick={() => handleSearchChange("")}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Sort - only for new style */}
      {sortOptions && onSortChange && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortValue || ""}
            label="Sort by"
            onChange={(e) => onSortChange(e.target.value as string)}
            sx={{ borderRadius: 2 }}
            startAdornment={
              <InputAdornment position="start">
                <SortOutlined fontSize="small" sx={{ ml: 1 }} />
              </InputAdornment>
            }
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {option.icon}
                  <Typography>{option.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <>
          <Badge
            badgeContent={calculatedActiveCount}
            color="primary"
            sx={{ display: { xs: "block", sm: "none" } }}
          >
            <IconButton onClick={handleFilterClick} size="small">
              <FilterListOutlined />
            </IconButton>
          </Badge>

          {/* Desktop Filters */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {filters.map((filter) => (
              <FormControl key={filter.key} size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={filter.value}
                  label={filter.label}
                  onChange={(e: SelectChangeEvent<string | number>) =>
                    filter.onChange(e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {option.color && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: option.color,
                            }}
                          />
                        )}
                        {option.icon}
                        <Typography>{option.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        </>
      )}

      {/* Result Count */}
      {showFilterChip && (
        <Chip
          label={`${resultCount} ${resultLabel}`}
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: (theme) => theme.palette.primary.main,
            fontWeight: 500,
            borderRadius: 2,
          }}
        />
      )}

      {/* Clear Filters */}
      {calculatedActiveCount > 0 && onClearFilters && (
        <Button
          size="small"
          variant="text"
          onClick={onClearFilters}
          startIcon={<ClearOutlined />}
          sx={{ borderRadius: 2 }}
        >
          Clear ({calculatedActiveCount})
        </Button>
      )}

      {/* Page Size */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Show</InputLabel>
        <Select
          value={pageSize}
          label="Show"
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ borderRadius: 2 }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size} items
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Mobile Filter Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filters
          </Typography>
          <Stack spacing={2}>
            {filters.map((filter) => (
              <FormControl key={filter.key} fullWidth size="small">
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={filter.value}
                  label={filter.label}
                  onChange={(e) => {
                    filter.onChange(e.target.value);
                    handleFilterClose();
                  }}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        </Box>
      </Popover>
    </Stack>
  );
};
