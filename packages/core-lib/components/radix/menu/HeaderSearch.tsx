import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  EnterIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useAuthContext } from "../../../core/contexts";
import { useRouter } from "../../../core/router";
import { useFilteredMenu } from "../../menu/hooks/useFilteredMenu";
import { MenuItem } from "../../menu/config/menuConfig";

interface SearchEntry {
  id: string;
  text: string;
  path: string;
  icon: React.ReactElement;
  parent?: string;
  group: "main" | "secondary";
}

const flatten = (
  items: MenuItem[],
  group: "main" | "secondary",
): SearchEntry[] => {
  const flat: SearchEntry[] = [];
  for (const item of items) {
    if (item.path) {
      flat.push({
        id: item.id,
        text: item.text,
        path: item.path,
        icon: item.icon,
        group,
      });
    }
    item.nestedItems?.forEach((nested) => {
      flat.push({
        id: nested.id,
        text: nested.text,
        path: nested.path,
        icon: nested.icon,
        parent: item.text,
        group,
      });
    });
  }
  return flat;
};

const MAX_RESULTS = 8;

export const HeaderSearch: React.FC = () => {
  const router = useRouter();
  const { role } = useAuthContext();
  const { mainMenu, secondaryMenu } = useFilteredMenu(role ?? null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const entries = useMemo<SearchEntry[]>(
    () => [
      ...flatten(mainMenu, "main"),
      ...flatten(secondaryMenu, "secondary"),
    ],
    [mainMenu, secondaryMenu],
  );

  const results = useMemo<SearchEntry[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, MAX_RESULTS);
    return entries
      .filter((e) => {
        const haystack = [e.text, e.path, e.parent ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, MAX_RESULTS);
  }, [entries, query]);

  useEffect(() => {
    setHighlighted(0);
  }, [query, results.length]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Cmd/Ctrl+K focuses the input from anywhere.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (entry: SearchEntry) => {
    setOpen(false);
    setQuery("");
    router.push(entry.path);
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) =>
        Math.min(h + 1, Math.max(results.length - 1, 0)),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = results[highlighted];
      if (sel) navigate(sel);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <Box
      ref={wrapperRef}
      style={{
        position: "relative",
        width: 320,
        maxWidth: "100%",
        flexShrink: 0,
      }}
    >
      <TextField.Root
        ref={inputRef}
        size="2"
        placeholder="Search pages… (⌘K)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleInputKeyDown}
        style={{
          width: "100%",
          background: "var(--gray-a3)",
          border: "1px solid var(--gray-a5)",
        }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} />
        </TextField.Slot>
      </TextField.Root>

      {open && (
        <Box
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 320,
            background: "var(--color-panel-solid)",
            border: "1px solid var(--gray-a5)",
            borderRadius: "var(--radius-3)",
            boxShadow: "var(--shadow-4)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {results.length === 0 ? (
            <Box p="4">
              <Text size="2" color="gray" align="center" as="div">
                No pages match &ldquo;{query.trim()}&rdquo;
              </Text>
            </Box>
          ) : (
            <ScrollArea style={{ maxHeight: 360 }}>
              <Flex direction="column" p="1">
                {!query.trim() && (
                  <Box px="3" py="2">
                    <Text
                      size="1"
                      color="gray"
                      weight="medium"
                      as="div"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Suggestions
                    </Text>
                  </Box>
                )}
                {results.map((entry, idx) => {
                  const active = idx === highlighted;
                  return (
                    <Flex
                      key={`${entry.id}-${idx}`}
                      align="center"
                      gap="2"
                      role="option"
                      aria-selected={active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate(entry);
                      }}
                      onMouseEnter={() => setHighlighted(idx)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "var(--radius-2)",
                        cursor: "pointer",
                        background: active ? "var(--accent-a3)" : undefined,
                        color: active
                          ? "var(--accent-11)"
                          : "var(--gray-12)",
                        transition: "background 80ms ease",
                      }}
                    >
                      <Box
                        style={{
                          display: "inline-flex",
                          color: active
                            ? "var(--accent-11)"
                            : "var(--gray-11)",
                          flexShrink: 0,
                        }}
                      >
                        {entry.icon}
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          size="2"
                          weight={active ? "bold" : "regular"}
                          truncate
                        >
                          {entry.text}
                        </Text>
                        {entry.parent && (
                          <Text
                            size="1"
                            color="gray"
                            as="div"
                            truncate
                            style={{ lineHeight: 1.2 }}
                          >
                            in {entry.parent}
                          </Text>
                        )}
                      </Box>
                      {entry.group === "secondary" && (
                        <Badge
                          color="gray"
                          variant="soft"
                          radius="full"
                          size="1"
                        >
                          Settings
                        </Badge>
                      )}
                      {active && (
                        <Box
                          style={{
                            color: "var(--gray-11)",
                            flexShrink: 0,
                          }}
                        >
                          <EnterIcon width={14} height={14} />
                        </Box>
                      )}
                    </Flex>
                  );
                })}
              </Flex>
            </ScrollArea>
          )}
        </Box>
      )}
    </Box>
  );
};
