import React, { useState } from "react";
import {
  Flex,
  TextField,
  Select,
  Badge,
  IconButton,
  Popover,
  Text,
  Box,
  Button as RadixButton,
  Separator,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";

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

interface Props {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
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
  className?: string;
}

export const FilterBar: React.FC<Props> = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
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
  className,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Flex
      direction="row"
      align="center"
      wrap="wrap"
      gap="3"
      className={className}
    >
      {onSearchChange && (
        <TextField.Root
          size="2"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={loading}
          style={{ minWidth: 240 }}
        >
          <TextField.Slot side="left">
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      )}

      {sortOptions && onSortChange && (
        <Select.Root
          value={sortValue ?? ""}
          onValueChange={onSortChange}
          disabled={loading}
        >
          <Select.Trigger placeholder="Sort by…" />
          <Select.Content position="popper">
            {sortOptions.map((opt) => (
              <Select.Item key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}

      {filterConfigs.length > 0 && (
        <Popover.Root open={filterOpen} onOpenChange={setFilterOpen}>
          <Popover.Trigger>
            <RadixButton variant="outline" size="2" color="indigo">
              <MixerHorizontalIcon />
              Filters
              {showFilterChip && activeFilterCount > 0 && (
                <Badge color="indigo" radius="full" size="1">
                  {activeFilterCount}
                </Badge>
              )}
            </RadixButton>
          </Popover.Trigger>
          <Popover.Content style={{ width: 320 }}>
            <Flex direction="column" gap="3">
              {filterConfigs.map((cfg) => (
                <Box key={cfg.key}>
                  <Text size="2" weight="medium" as="div" mb="1">
                    {cfg.label}
                  </Text>
                  <Select.Root
                    value={String(cfg.value)}
                    onValueChange={(value) => {
                      const parsed = cfg.options.find(
                        (o) => String(o.value) === value,
                      );
                      cfg.onChange(parsed ? parsed.value : value);
                    }}
                  >
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content position="popper">
                      {cfg.options.map((opt) => (
                        <Select.Item
                          key={String(opt.value)}
                          value={String(opt.value)}
                        >
                          <Flex align="center" gap="2">
                            {opt.icon}
                            {opt.label}
                          </Flex>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              ))}

              {onClearFilters && (
                <>
                  <Separator size="4" />
                  <Flex justify="end">
                    <RadixButton
                      variant="soft"
                      color="gray"
                      size="1"
                      onClick={() => {
                        onClearFilters();
                        setFilterOpen(false);
                      }}
                    >
                      <Cross1Icon /> Clear all
                    </RadixButton>
                  </Flex>
                </>
              )}
            </Flex>
          </Popover.Content>
        </Popover.Root>
      )}

      <Flex flexGrow="1" justify="end" align="center" gap="3">
        <Text size="2" color="gray">
          {resultCount} {resultLabel}
        </Text>
        <Select.Root
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <Select.Trigger />
          <Select.Content position="popper">
            {pageSizeOptions.map((n) => (
              <Select.Item key={n} value={String(n)}>
                {n} / page
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </Flex>
  );
};
