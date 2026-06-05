import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  useTheme,
  alpha,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CategoryOutlined, RefreshOutlined } from "@mui/icons-material";
import { CategoryList } from "./CategoryList";
import { useApi } from "core-lib/core/hooks";
import { CategoryDataList } from "core-lib/api/commons/types";

export const CategoryListBlock: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<CategoryDataList[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return categories.slice(start, end);
  }, [categories, pageNumber, pageSize]);

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(categories.length / pageSize);
    return {
      pageNumber,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
      pageSize,
    };
  }, [categories.length, pageNumber, pageSize]);

  const data = useApi((api) => api.commons.categoryList());
  useEffect(() => {
    setCategories(data.result?.data.response ?? []);
  }, [data.result?.data.response]);

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(Number(event.target.value));
    setPageNumber(1);
  };

  const handleRefresh = () => {
    data.execute();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CategoryOutlined sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your product categories
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Chip
            label={`${categories.length} Total`}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500,
              borderRadius: 2,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Show</InputLabel>
            <Select
              value={pageSize}
              label="Show"
              onChange={handlePageSizeChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={5}>5 items</MenuItem>
              <MenuItem value={10}>10 items</MenuItem>
              <MenuItem value={25}>25 items</MenuItem>
              <MenuItem value={50}>50 items</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRefresh}
            disabled={data.loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <CategoryList
          data={paginatedData}
          loading={data.loading}
          pagination={pagination}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onSuccess={handleRefresh}
        />
      </Paper>

      {categories.length > 0 && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, categories.length)} of{" "}
            {categories.length} entries
          </Typography>
        </Box>
      )}
    </Box>
  );
};
