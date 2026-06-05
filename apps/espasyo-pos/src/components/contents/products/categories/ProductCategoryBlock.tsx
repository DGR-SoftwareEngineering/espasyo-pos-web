import React, { useCallback, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  IconButton,
  Text,
  TextField as RadixTextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  ReloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { CategoryOutlined } from "@mui/icons-material";
import { useApi } from "core-lib/core/hooks";
import {
  LookupDeleteDialog,
  LookupFormDialog,
  PRODUCT_CATEGORY_CONFIG,
} from "core-lib/components/blocks/lookups";
import { ProductCategoryDto } from "core-lib/api/commons/types";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { Button } from "core-lib/components/radix/buttons/Button";

const ACCENT_COLORS = [
  "indigo",
  "violet",
  "teal",
  "orange",
  "crimson",
  "blue",
  "amber",
] as const;
type AccentColor = (typeof ACCENT_COLORS)[number];

export const ProductCategoryBlock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForParentId, setCreateForParentId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<ProductCategoryDto | undefined>();
  const [deleteRow, setDeleteRow] = useState<ProductCategoryDto | undefined>();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const data = useApi((api) => api.commons.productCategoryList());
  const categories = useMemo<ProductCategoryDto[]>(
    () => data.result?.data?.response ?? [],
    [data.result],
  );

  const handleRefresh = useCallback(() => data.execute(), [data]);

  const toggleCollapsed = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const roots = useMemo(
    () =>
      categories
        .filter((c) => !c.parentProductCategoryID && c.isActive !== false)
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
        ),
    [categories],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, ProductCategoryDto[]>();
    for (const c of categories) {
      if (!c.parentProductCategoryID) continue;
      const list = map.get(c.parentProductCategoryID) ?? [];
      list.push(c);
      map.set(c.parentProductCategoryID, list);
    }
    return map;
  }, [categories]);

  const q = searchTerm.trim().toLowerCase();

  const filteredRoots = useMemo(() => {
    if (!q) return roots;
    return roots.filter((root) => {
      const rootMatches =
        root.name.toLowerCase().includes(q) ||
        (root.description ?? "").toLowerCase().includes(q);
      const anyChildMatches = (
        childrenByParent.get(root.productCategoryID) ?? []
      ).some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      );
      return rootMatches || anyChildMatches;
    });
  }, [roots, childrenByParent, q]);

  const getChildrenFor = useCallback(
    (rootId: string): ProductCategoryDto[] => {
      const children = (childrenByParent.get(rootId) ?? [])
        .filter((c) => c.isActive !== false)
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
        );
      if (!q) return children;
      const root = roots.find((r) => r.productCategoryID === rootId);
      const rootNameMatches =
        root &&
        (root.name.toLowerCase().includes(q) ||
          (root.description ?? "").toLowerCase().includes(q));
      if (rootNameMatches) return children;
      return children.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      );
    },
    [childrenByParent, roots, q],
  );

  const stats = useMemo(
    () => ({
      total: categories.filter((c) => c.isActive !== false).length,
      active: categories.filter((c) => c.isActive !== false).length,
      rootCount: categories.filter(
        (c) => !c.parentProductCategoryID && c.isActive !== false,
      ).length,
      subCount: categories.filter(
        (c) => !!c.parentProductCategoryID && c.isActive !== false,
      ).length,
    }),
    [categories],
  );

  const handleAddSub = useCallback((rootId: string) => {
    setCreateForParentId(rootId);
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateForParentId(null);
  }, []);

  return (
    <Box style={{ width: "100%" }}>
      {/* ── Header card ── */}
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Product Categories"
          subtitle="Organize your menu into root categories and sub-categories."
          icon={<CategoryOutlined />}
          actionButton={{
            label: "New Category",
            onClick: () => {
              setCreateForParentId(null);
              setCreateOpen(true);
            },
            icon: <PlusIcon />,
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex mt="4" gap="3" wrap="wrap">
          <StatsCard label="Total" value={stats.total} color="primary" />
          <StatsCard label="Active" value={stats.active} color="success" />
          <StatsCard label="Root" value={stats.rootCount} color="info" />
          <StatsCard label="Sub-categories" value={stats.subCount} color="info" />
        </Flex>

        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "stretch", md: "center" }}
          gap="3"
          mt="4"
        >
          <Box style={{ minWidth: 280, flex: 1, maxWidth: 420 }}>
            <RadixTextField.Root
              size="2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories…"
            >
              <RadixTextField.Slot>
                <MagnifyingGlassIcon height={16} width={16} />
              </RadixTextField.Slot>
            </RadixTextField.Root>
          </Box>
          <Button type="Secondary" onClick={handleRefresh} disabled={data.loading}>
            <Flex align="center" gap="2">
              <ReloadIcon />
              Refresh
            </Flex>
          </Button>
        </Flex>
      </Card>

      {/* ── Category group cards ── */}
      <Flex direction="column" gap="3">
        {data.loading && categories.length === 0 && (
          <Card variant="surface" size="2">
            <Flex align="center" justify="center" py="6">
              <Text color="gray" size="2">Loading categories…</Text>
            </Flex>
          </Card>
        )}

        {!data.loading && filteredRoots.length === 0 && (
          <Card variant="surface" size="2">
            <Flex align="center" justify="center" py="6">
              <Text color="gray" size="2">
                {q
                  ? `No categories match "${searchTerm}"`
                  : "No categories yet. Click \"New Category\" to get started."}
              </Text>
            </Flex>
          </Card>
        )}

        {filteredRoots.map((root, index) => {
          const accentColor: AccentColor =
            ACCENT_COLORS[index % ACCENT_COLORS.length];
          const children = getChildrenFor(root.productCategoryID);
          const totalChildren = (
            childrenByParent.get(root.productCategoryID) ?? []
          ).filter((c) => c.isActive !== false).length;
          const isCollapsed = collapsed.has(root.productCategoryID);

          return (
            <Card
              key={root.productCategoryID}
              variant="surface"
              size="2"
              style={{
                borderLeft: `4px solid var(--${accentColor}-9)`,
                overflow: "hidden",
                padding: 0,
              }}
            >
              {/* Root row */}
              <Flex
                align="center"
                gap="3"
                px="4"
                py="3"
                style={{
                  background: `var(--${accentColor}-a2)`,
                  cursor: totalChildren > 0 ? "pointer" : "default",
                  userSelect: "none",
                }}
                onClick={() =>
                  totalChildren > 0 && toggleCollapsed(root.productCategoryID)
                }
              >
                {/* Chevron */}
                <Box
                  style={{
                    width: 18,
                    flexShrink: 0,
                    color: `var(--${accentColor}-11)`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {totalChildren > 0 ? (
                    isCollapsed ? (
                      <ChevronRightIcon width={16} height={16} />
                    ) : (
                      <ChevronDownIcon width={16} height={16} />
                    )
                  ) : null}
                </Box>

                <Avatar
                  size="2"
                  color={accentColor}
                  variant="soft"
                  fallback={root.name[0]?.toUpperCase() ?? "?"}
                  style={{ flexShrink: 0 }}
                />

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2" wrap="wrap">
                    <Text
                      size="3"
                      weight="bold"
                      style={{ color: `var(--${accentColor}-12)` }}
                    >
                      {root.name}
                    </Text>
                    {root.description && (
                      <Text
                        size="2"
                        color="gray"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 260,
                        }}
                      >
                        {root.description}
                      </Text>
                    )}
                  </Flex>
                  <Flex align="center" gap="2" mt="1">
                    <Badge color={accentColor} variant="soft" size="1">
                      {totalChildren}{" "}
                      {totalChildren === 1 ? "sub-category" : "sub-categories"}
                    </Badge>
                    <Badge color="gray" variant="soft" size="1">
                      Order {root.displayOrder}
                    </Badge>
                  </Flex>
                </Box>

                {/* Root actions */}
                <Flex
                  align="center"
                  gap="1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip content="Add sub-category">
                    <IconButton
                      size="1"
                      variant="soft"
                      color={accentColor}
                      onClick={() => handleAddSub(root.productCategoryID)}
                    >
                      <PlusIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Edit">
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      onClick={() => setEditRow(root)}
                    >
                      <Pencil1Icon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="red"
                      onClick={() => setDeleteRow(root)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Flex>

              {/* Child rows — animated expand/collapse */}
              <AnimatePresence initial={false}>
                {!isCollapsed && children.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    {children.map((child, ci) => {
                      const isLast = ci === children.length - 1;
                      return (
                        <Flex
                          key={child.productCategoryID}
                          align="center"
                          gap="3"
                          px="4"
                          py="2"
                          style={{
                            borderTop: "1px solid var(--gray-a3)",
                            paddingLeft: 52,
                            borderLeft: `2px solid var(--${accentColor}-a5)`,
                            marginLeft: 4,
                          }}
                        >
                          {/* Tree connector */}
                          <Text
                            size="2"
                            style={{
                              color: `var(--${accentColor}-8)`,
                              fontFamily: "monospace",
                              lineHeight: 1,
                              flexShrink: 0,
                              userSelect: "none",
                            }}
                          >
                            {isLast ? "└" : "├"}
                          </Text>

                          <Avatar
                            size="1"
                            color="gray"
                            variant="soft"
                            fallback={child.name[0]?.toUpperCase() ?? "?"}
                            style={{ flexShrink: 0 }}
                          />

                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="2" weight="medium">
                              {child.name}
                            </Text>
                            {child.description && (
                              <Text
                                size="1"
                                color="gray"
                                as="div"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {child.description}
                              </Text>
                            )}
                          </Box>

                          <Badge color="gray" variant="soft" size="1">
                            Order {child.displayOrder}
                          </Badge>

                          <Flex align="center" gap="1">
                            <Tooltip content="Edit">
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="gray"
                                onClick={() => setEditRow(child)}
                              >
                                <Pencil1Icon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete">
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() => setDeleteRow(child)}
                              >
                                <TrashIcon />
                              </IconButton>
                            </Tooltip>
                          </Flex>
                        </Flex>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </Flex>

      {/* ── Dialogs ── */}
      <LookupFormDialog
        open={createOpen}
        config={PRODUCT_CATEGORY_CONFIG}
        rows={categories}
        createInitialValues={
          createForParentId ? { parentID: createForParentId } : undefined
        }
        onClose={handleCloseCreate}
        onSuccess={handleRefresh}
      />

      <LookupFormDialog
        open={!!editRow}
        config={PRODUCT_CATEGORY_CONFIG}
        rows={categories}
        editRow={editRow}
        onClose={() => setEditRow(undefined)}
        onSuccess={handleRefresh}
      />

      <LookupDeleteDialog
        open={!!deleteRow}
        config={PRODUCT_CATEGORY_CONFIG}
        row={deleteRow}
        onClose={() => setDeleteRow(undefined)}
        onSuccess={handleRefresh}
      />
    </Box>
  );
};
