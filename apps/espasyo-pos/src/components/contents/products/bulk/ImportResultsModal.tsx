import React from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Table,
} from "@radix-ui/themes";;
import { CheckIcon } from "@radix-ui/react-icons";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { Button } from "core-lib/components/radix/buttons/Button";
import type { BulkCreateProductResult } from "core-lib/api/commons/types";

interface ImportResultsModalProps {
  open: boolean;
  result: BulkCreateProductResult | null;
  onClose: () => void;
}

export const ImportResultsModal: React.FC<ImportResultsModalProps> = ({
  open,
  result,
  onClose,
}) => {
  const handleClose = () => onClose();

  return (
    <DialogBox
      open={open}
      onClose={handleClose}
      title="Import Results"
      maxWidth="md"
      footer={
        <Button type="Primary" onClick={handleClose}>
          Close
        </Button>
      }
    >
      {result !== null && (
        <Box>
          <Flex gap="3" mb="4" align="center">
            <Badge color="green" size="2">
              <Flex gap="1" align="center">
                <CheckIcon />
                {result.created} created
              </Flex>
            </Badge>
            {result.failed > 0 && (
              <Badge color="red" size="2">
                {result.failed} failed
              </Badge>
            )}
          </Flex>

          {result.failed === 0 && (
            <Text size="2" color="gray">
              All products created successfully.
            </Text>
          )}

          {result.failed > 0 && result.errors.length > 0 && (
            <Box>
              <Text size="2" weight="medium" mb="2" as="p">
                The following rows encountered errors:
              </Text>
              <Table.Root variant="surface" size="1">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Row</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Product Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Errors</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {result.errors.map((err) => (
                    <Table.Row key={err.index}>
                      <Table.Cell>{err.index + 1}</Table.Cell>
                      <Table.Cell>{err.name}</Table.Cell>
                      <Table.Cell>
                        <Text size="2" color="red">
                          {err.messages.join("; ")}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>
      )}
    </DialogBox>
  );
};
