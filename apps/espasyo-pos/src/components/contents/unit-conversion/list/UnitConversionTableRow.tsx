import React, { useState } from "react";
import {
  Stack,
  Avatar,
  Typography,
  Box,
  alpha,
  useTheme,
  Collapse,
  Chip,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  SwapHorizOutlined,
  NotesOutlined,
  WarningAmberOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import { UnitConversionResponse } from "core-lib/api/commons/types";
import { BaseTableRow, ActionButtons, IDChip, MetricDisplay } from "core-lib";
import { formatNumber } from "core-lib/business";

interface Props {
  row: UnitConversionResponse;
  onView: (conversion: UnitConversionResponse) => void;
  onEdit: (conversion: UnitConversionResponse) => void;
  onDelete: (conversion: UnitConversionResponse) => void;
  isSelectable?: boolean;
  selectedRowKey?: string | number;
  onSelect?: (rowKey: string | number) => void;
}

export const UnitConversionTableRow: React.FC<Props> = ({
  row,
  onView,
  onEdit,
  onDelete,
  isSelectable,
  selectedRowKey,
  onSelect,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const columns = [
    {
      id: "conversion",
      width: "40%",
      render: () => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              borderRadius: 2,
            }}
          >
            <SwapHorizOutlined />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} lineHeight={1.3}>
              {row.fromUnitName} → {row.toUnitName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <IDChip id={row.unitConversionID} label="ID" />
              {row.isApproximate ? (
                <Chip
                  label="Approximate"
                  size="small"
                  icon={<WarningAmberOutlined />}
                  sx={{
                    height: 20,
                    fontSize: "0.625rem",
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                />
              ) : (
                <Chip
                  label="Exact"
                  size="small"
                  icon={<CheckCircleOutline />}
                  sx={{
                    height: 20,
                    fontSize: "0.625rem",
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      ),
    },
    {
      id: "rate",
      align: "center" as const,
      width: "25%",
      render: () => (
        <MetricDisplay
          label="Conversion Rate"
          value={`1 ${row.fromUnitName} = ${formatNumber(row.conversionRate, 4)} ${row.toUnitName}`}
          icon={<SwapHorizOutlined />}
          iconColor={theme.palette.success.main}
        />
      ),
    },
    {
      id: "type",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Chip
          label={row.isApproximate ? "Approximate" : "Exact"}
          size="medium"
          color={row.isApproximate ? "warning" : "success"}
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      id: "actions",
      align: "right" as const,
      width: "20%",
      render: () => (
        <ActionButtons
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          onExpand={handleToggleExpand}
          viewTooltip="View Conversion Details"
          editTooltip="Edit Conversion"
          deleteTooltip="Delete Conversion"
          expandTooltip={expanded ? "Hide details" : "Show details"}
          showView={true}
          showEdit={true}
          showDelete={true}
          showExpand={true}
          isExpanded={expanded}
        />
      ),
    },
  ];

  const totalColumns = 4 + (isSelectable ? 1 : 0);

  return (
    <>
      <BaseTableRow
        data={row}
        rowKey={row.unitConversionID}
        columns={columns}
        isSelectable={isSelectable}
        selectedRowKey={selectedRowKey}
        onSelect={onSelect}
      />

      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={totalColumns}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3, px: 2 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Conversion Details
                  </Typography>
                  <Stack direction="row" spacing={4} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        From Unit ID
                      </Typography>
                      <Typography variant="body2">{row.fromUnitID}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        To Unit ID
                      </Typography>
                      <Typography variant="body2">{row.toUnitID}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={row.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={row.isActive ? "success" : "default"}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Stack>
                </Box>

                {row.notes && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <NotesOutlined
                        sx={{ fontSize: 20, color: theme.palette.warning.main }}
                      />
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body2">{row.notes}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
