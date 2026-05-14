import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Flex,
  Table,
  Text,
} from "@radix-ui/themes";
import {
  SwitchIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { NotesOutlined } from "@mui/icons-material";
import { UnitConversion } from "core-lib/api/commons/types";
import { BaseTableRow } from "core-lib/components/radix/table/BaseTableRow";
import { ActionButtons } from "core-lib/components/radix/buttons/ActionButtons";
import { IDChip } from "core-lib/components/radix/IDChip";
import { MetricDisplay } from "core-lib/components/radix/metric/MetricDisplay";
import { formatNumber } from "core-lib/business";

interface Props {
  row: UnitConversion;
  onView: (conversion: UnitConversion) => void;
  onEdit: (conversion: UnitConversion) => void;
  onDelete: (conversion: UnitConversion) => void;
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
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => setExpanded((prev) => !prev);

  const columns = [
    {
      id: "conversion",
      width: "40%",
      render: () => (
        <Flex align="center" gap="3">
          <Avatar
            size="3"
            radius="medium"
            color="indigo"
            variant="soft"
            fallback={<SwitchIcon />}
          />
          <Box>
            <Text size="2" weight="bold" as="div" style={{ lineHeight: 1.3 }}>
              {row.fromUnitName} → {row.toUnitName}
            </Text>
            <Flex gap="2" mt="1">
              <IDChip id={row.unitConversionID} label="ID" />
              {row.isApproximate ? (
                <Badge color="amber" variant="soft" size="1">
                  <ExclamationTriangleIcon /> Approximate
                </Badge>
              ) : (
                <Badge color="green" variant="soft" size="1">
                  <CheckCircledIcon /> Exact
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
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
          icon={<SwitchIcon />}
          iconColor="var(--green-11)"
        />
      ),
    },
    {
      id: "type",
      align: "center" as const,
      width: "15%",
      render: () => (
        <Badge
          color={row.isApproximate ? "amber" : "green"}
          variant="outline"
          size="2"
        >
          {row.isApproximate ? "Approximate" : "Exact"}
        </Badge>
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
          showView
          showEdit
          showDelete
          showExpand
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

      {expanded && (
        <Table.Row>
          <Table.Cell
            colSpan={totalColumns}
            style={{ padding: 0, background: "var(--gray-2)" }}
          >
            <Box py="4" px="3">
              <Flex direction="column" gap="3">
                <Box
                  p="3"
                  style={{
                    background: "var(--blue-a3)",
                    borderRadius: "var(--radius-3)",
                  }}
                >
                  <Text size="2" weight="bold" as="div" mb="2">
                    Conversion Details
                  </Text>
                  <Flex gap="6" wrap="wrap">
                    <Box>
                      <Text size="1" color="gray" as="div">
                        From Unit ID
                      </Text>
                      <Text size="2">{row.fromUnitID}</Text>
                    </Box>
                    <Box>
                      <Text size="1" color="gray" as="div">
                        To Unit ID
                      </Text>
                      <Text size="2">{row.toUnitID}</Text>
                    </Box>
                    <Box>
                      <Text size="1" color="gray" as="div">
                        Status
                      </Text>
                      <Badge
                        color={row.isActive ? "green" : "gray"}
                        variant="soft"
                        size="1"
                        mt="1"
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Box>
                  </Flex>
                </Box>

                {row.notes && (
                  <Box
                    p="3"
                    style={{
                      background: "var(--amber-a3)",
                      borderRadius: "var(--radius-3)",
                    }}
                  >
                    <Flex gap="2" align="start">
                      <NotesOutlined
                        style={{ fontSize: 20, color: "var(--amber-11)" }}
                      />
                      <Box style={{ flex: 1 }}>
                        <Text size="1" color="gray" as="div">
                          Notes
                        </Text>
                        <Text size="2">{row.notes}</Text>
                      </Box>
                    </Flex>
                  </Box>
                )}
              </Flex>
            </Box>
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
};
