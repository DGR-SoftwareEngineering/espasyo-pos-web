import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  TextField,
  Popover,
} from "@radix-ui/themes";;
import { Anchor as PopoverAnchor } from "@radix-ui/react-popover";
import {
  SearchOutlined,
  CloseRounded,
  EmojiEventsOutlined
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { CustomerSearchResultDto, CustomerSegment, CustomerQueryParams, CustomerDto } from "core-lib/api/crm";
import { SegmentBadge } from "./SegmentBadge";

interface CustomerSearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  /** Called once a customer is picked from the dropdown. */
  onSelect: (customer: CustomerSearchResultDto) => void;
  /** Hide results for IDs that are already selected/attached. */
  excludeIds?: string[];
  /** Render below the input, between input and results. */
  hint?: React.ReactNode;
  disabled?: boolean;
  /** If true, uses the admin list endpoint with full filtering. If false, uses the POS search endpoint. */
  adminMode?: boolean;
  /** Segment filter passed from parent; overrides local segment selection. */
  filterSegment?: string;
}

const DEBOUNCE_MS = 300;

const SEGMENT_OPTIONS = [
  { value: "all", label: "All Segments" },
  { value: String(CustomerSegment.New), label: "New" },
  { value: String(CustomerSegment.Regular), label: "Regular" },
  { value: String(CustomerSegment.VIP), label: "VIP" },
  { value: String(CustomerSegment.Occasional), label: "Occasional" },
  { value: String(CustomerSegment.AtRisk), label: "At Risk" },
];

const mapCustomerDtoToSearchResult = (dto: CustomerDto): CustomerSearchResultDto => ({
  customerID: dto.customerID,
  customerNumber: dto.customerNumber,
  fullName: dto.fullName,
  phone: dto.phone,
  email: dto.email,
  totalStamps: dto.loyaltyStamps ?? 0,
  availableRewards: 0,
  segment: dto.segment,
  hasPhysicalCard: dto.hasPhysicalCard,
});

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  placeholder = "Search by phone, name, or customer #…",
  autoFocus,
  onSelect,
  excludeIds = [],
  hint,
  disabled,
  adminMode = false,
  filterSegment = "all",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerSearchResultDto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const searchCb = useApiCallback(async (api, q: string) => api.crm.search(q));
  const listCb = useApiCallback(async (api, params: CustomerQueryParams) => api.crm.list(params));

  // Store API callbacks in refs to avoid unstable dependencies in useCallback
  const listCbRef = useRef(listCb);
  useEffect(() => {
    listCbRef.current = listCb;
  }, [listCb]);

  const searchCbRef = useRef(searchCb);
  useEffect(() => {
    searchCbRef.current = searchCb;
  }, [searchCb]);

  const runSearch = useCallback(
    async (q: string) => {
      if (adminMode) {
        setLoading(true);
        try {
          const params: CustomerQueryParams = {
            pageNumber: 1,
            pageSize: 10,
            search: q.trim() || undefined,
            segment: filterSegment && filterSegment !== "all" ? (Number(filterSegment) as CustomerSegment) : undefined,
            sortBy: "name",
          };
          const r = await listCbRef.current.execute(params);
          const customers = (r?.data?.response?.items ?? []) as CustomerDto[];
          const mapped = customers.map(mapCustomerDtoToSearchResult);
          setResults(mapped);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        if (q.trim().length < 1) {
          setResults([]);
          return;
        }
        setLoading(true);
        try {
          const r = await searchCbRef.current.execute(q.trim());
          const list = (r?.data?.response ?? []) as CustomerSearchResultDto[];
          setResults(list);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }
    },
    [adminMode, filterSegment],
  );

  // Trigger search when query or filter changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // For non-admin mode, only search if query is non-empty
    if (!adminMode && !query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, runSearch, adminMode]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (customer: CustomerSearchResultDto) => {
    onSelect(customer);
    setOpen(false);
    setQuery("");
    setResults([]);
    setHighlightIndex(-1);
  };

  const filtered = results.filter((r) => !excludeIds.includes(r.customerID));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Box>
          <TextField.Root
            ref={inputRef}
            size="2"
            placeholder={placeholder}
            value={query}
            autoFocus={autoFocus}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              setOpen(true);
              if (adminMode) {
                runSearch(query);
              }
            }}
            onKeyDown={handleKeyDown}
          >
                <TextField.Slot>
                  <SearchOutlined style={{ fontSize: 16, opacity: 0.6 }} />
                </TextField.Slot>
                {query && (
                  <TextField.Slot>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery("");
                        setResults([]);
                        inputRef.current?.focus();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                      aria-label="Clear search"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <CloseRounded style={{ fontSize: 16, opacity: 0.6 }} />
                    </button>
                  </TextField.Slot>
                )}
              </TextField.Root>

          {hint && (
            <Box mt="1">
              <Text size="1" color="gray">
                {hint}
              </Text>
            </Box>
          )}
        </Box>
      </PopoverAnchor>

      <Popover.Content
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        style={{
          width: "var(--radix-popover-trigger-width)",
          padding: 4,
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {loading && (
          <Flex p="3" justify="center">
            <Text size="1" color="gray">
              Searching…
            </Text>
          </Flex>
        )}

        {!loading && filtered.length === 0 && (
          <Flex p="3" justify="center">
            <Text size="1" color="gray">
              No customers match your search
            </Text>
          </Flex>
        )}

        {!loading && filtered.length > 0 && (
          <Box>
            {filtered.map((c, index) => (
              <div
                key={c.customerID}
                role="option"
                aria-selected={index === highlightIndex}
                onClick={() => handleSelect(c)}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: index === highlightIndex ? "var(--accent-a3)" : "transparent",
                  cursor: "pointer",
                  borderRadius: 6,
                  outline: index === highlightIndex ? "2px solid var(--accent-8)" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <Flex justify="between" align="center" gap="2">
                  <Flex direction="column" style={{ minWidth: 0, flex: 1 }}>
                    <Text size="2" weight="medium" truncate>
                      {c.fullName}
                    </Text>
                    <Flex gap="2" align="center">
                      <Text size="1" color="gray">
                        {c.customerNumber}
                      </Text>
                      {c.phone && (
                        <Text size="1" color="gray">
                          · {c.phone}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                  <Flex direction="column" align="end" gap="1">
                    <SegmentBadge segment={c.segment} size="1" />
                    {c.availableRewards > 0 ? (
                      <Badge color="amber" variant="solid" size="1" style={{ gap: 2 }}>
                        <EmojiEventsOutlined style={{ fontSize: 10 }} />
                        {c.availableRewards} reward{c.availableRewards === 1 ? "" : "s"}
                      </Badge>
                    ) : (
                      <Text size="1" color="gray">
                        {c.totalStamps} stamps
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </div>
            ))}
          </Box>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};
