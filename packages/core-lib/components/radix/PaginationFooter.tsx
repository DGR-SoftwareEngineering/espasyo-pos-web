import React from "react";
import { Flex, Text } from "@radix-ui/themes";

interface PaginationFooterProps {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  itemLabel?: string;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  pageNumber,
  pageSize,
  totalItems,
  itemLabel = "entries",
}) => {
  if (totalItems === 0) return null;

  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalItems);

  return (
    <Flex justify="between" align="center" mt="3" px="2">
      <Text size="2" color="gray">
        Showing {start} to {end} of {totalItems} {itemLabel}
      </Text>
    </Flex>
  );
};
