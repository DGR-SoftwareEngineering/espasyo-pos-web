import React, { useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  TableRow,
  TableCell,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  DragHandleOutlined,
  PersonOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { DataTableV2, DataTableHeader, useDialogContext } from "core-lib";
import { CategoryDataList } from "core-lib/api/commons/types";

interface Props {
  data: CategoryDataList[];
  loading?: boolean;
  pagination?: {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onSuccess?: () => void;
  onReorder?: (categoryId: string, newOrder: number) => void;
}

export const CategoryList: React.FC<Props> = ({
  data,
  loading,
  pagination,
  onNextPage,
  onPreviousPage,
  onSuccess,
  onReorder,
}) => {
  const theme = useTheme();
  const { openDialog } = useDialogContext();

  const handleView = (category: CategoryDataList) => {
    openDialog({
      title: "Category Details",
      dialogContentType: "CategoryView",
      data: category,
    });
  };

  const handleEdit = (category: CategoryDataList) => {
    openDialog({
      title: "Edit Category",
      dialogContentType: "CategoryEdit",
      data: category,
      onSuccess: onSuccess,
    });
  };

  const handleDelete = (category: CategoryDataList) => {
    openDialog({
      title: "Delete Category",
      dialogContentType: "CategoryDelete",
      data: category,
      onSuccess: onSuccess,
    });
  };

  const tableHeaders: DataTableHeader[] = [
    {
      name: "Display Order",
      align: "center",
    },
    { name: "Category Name", align: "left" },
    { name: "Description", align: "left" },
    { name: "Created By", align: "left" },
    { name: "Actions", align: "right" },
  ];

  const bodyRowComponent = (row: CategoryDataList, index: number) => (
    <TableRow
      key={row.categoryID}
      sx={{
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          transition: "background-color 0.2s",
        },
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell align="center">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          {onReorder && (
            <IconButton
              size="small"
              sx={{
                cursor: "grab",
                color: theme.palette.text.secondary,
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <DragHandleOutlined fontSize="small" />
            </IconButton>
          )}
          <Box
            sx={{
              display: "inline-block",
              minWidth: 36,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {row.displayOrder}
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {row.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              ID: {row.categoryID.substring(0, 8)}...
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <DescriptionOutlined
            sx={{ fontSize: 16, color: theme.palette.text.secondary, mt: 0.3 }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 300,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {row.description || "No description provided"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonOutlined
            sx={{ fontSize: 16, color: theme.palette.text.secondary }}
          />
          <Typography variant="body2">{row.createdBy}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleView(row)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.info.main,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(row)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(row)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.error.main,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataTableV2
        data-testid="category-list-table"
        data={data}
        loading={loading}
        tableHeaders={tableHeaders}
        pagination={pagination}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        bodyRowComponent={bodyRowComponent}
        sx={{
          tableHead: {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          headerCell: {
            cell: {
              py: 2,
              fontWeight: 600,
              color: theme.palette.text.primary,
            },
            typography: {
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          },
          bodyCell: {
            cell: {
              py: 1.5,
            },
          },
        }}
      />
    </Box>
  );
};
