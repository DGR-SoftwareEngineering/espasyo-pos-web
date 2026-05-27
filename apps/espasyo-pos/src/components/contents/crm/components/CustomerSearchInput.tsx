import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge, Box, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { SearchOutlined, CloseRounded, EmojiEventsOutlined } from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { CustomerSearchResultDto } from "core-lib/api/crm";
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
}

const DEBOUNCE_MS = 300;

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  placeholder = "Search by phone, name, or customer #…",
  autoFocus,
  onSelect,
  excludeIds = [],
  hint,
  disabled,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerSearchResultDto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const searchCb = useApiCallback(async (api, q: string) => api.crm.search(q));

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const r = await searchCb.execute(q.trim());
        const list = (r?.data?.response ?? []) as CustomerSearchResultDto[];
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // searchCb identity changes every render; exclude to prevent infinite re-search
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, runSearch]);

  // Close on outside click — check both the input container and the portal dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (
        containerRef.current.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = results.filter((r) => !excludeIds.includes(r.customerID));

  const rect = containerRef.current?.getBoundingClientRect();

  return (
    <Box ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <TextField.Root
        size="2"
        placeholder={placeholder}
        value={query}
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      >
        <TextField.Slot>
          <SearchOutlined style={{ fontSize: 16, opacity: 0.6 }} />
        </TextField.Slot>
        {query && (
          <TextField.Slot>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
              aria-label="Clear search"
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

      {open && query.trim().length > 0 && rect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 9999,
            }}
          >
            <Card
              variant="surface"
              style={{
                padding: 4,
                maxHeight: 320,
                overflowY: "auto",
                boxShadow: "var(--shadow-4)",
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
                    No customers match &quot;{query}&quot;
                  </Text>
                </Flex>
              )}

              {!loading &&
                filtered.map((c) => (
                  <button
                    key={c.customerID}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--accent-a3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
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
                  </button>
                ))}
            </Card>
          </div>,
          document.body,
        )}
    </Box>
  );
};
