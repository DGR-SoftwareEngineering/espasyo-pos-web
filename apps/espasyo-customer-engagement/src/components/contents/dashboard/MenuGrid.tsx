"use client";
import React, { useMemo, useState } from "react";
import { Badge, Box, Flex, Grid, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { ListLoader } from "core-lib/components/radix";
import { CustomerMenuItemDto } from "core-lib/api/commons/types";
import { MenuItemCard } from "./MenuItemCard";

interface Props {
  menu: CustomerMenuItemDto[];
  loading?: boolean;
}

const ALL = "All";
const ITEMS_PER_PAGE = 8; // Back to original 8 items per page

export const MenuGrid: React.FC<Props> = ({ menu, loading }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [currentPage, setCurrentPage] = useState(1);

  const safeMenu = React.useMemo(() => {
    if (!menu || !Array.isArray(menu)) return [];
    return menu;
  }, [menu]);

  const categories = useMemo(() => {
    const names = new Set<string>();
    safeMenu.forEach((m) => {
      if (m && m.categoryName) names.add(m.categoryName);
    });
    return [ALL, ...Array.from(names)];
  }, [safeMenu]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeMenu.filter((item) => {
      if (!item) return false;
      const matchesCategory = category === ALL || item.categoryName === category;
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [safeMenu, search, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  if (loading) return <ListLoader loadersCount={4} isFullWidth />;

  if (!safeMenu.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          borderRadius: 20,
          border: "1px dashed var(--gray-6)",
          padding: "48px",
          textAlign: "center",
        }}
      >
        <Text size="3" color="gray">
          🍽️ The menu is being prepared — please check back soon.
        </Text>
      </motion.div>
    );
  }

  return (
    <Flex direction="column" gap="4">
      {/* Search */}
      <TextField.Root
        size="3"
        placeholder="Search menu items..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        style={{ borderRadius: 12 }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height={18} width={18} />
        </TextField.Slot>
      </TextField.Root>

      {/* Category chips */}
      {categories.length > 1 && (
        <Flex gap="2" wrap="wrap">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Badge
                color={cat === category ? "orange" : "gray"}
                variant={cat === category ? "solid" : "soft"}
                radius="full"
                size="2"
                onClick={() => handleCategoryChange(cat)}
                style={{
                  cursor: "pointer",
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </Badge>
            </motion.div>
          ))}
        </Flex>
      )}

      {/* Menu Items Grid - Original 4 column layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category + search + currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {paginatedItems.length === 0 ? (
            <Box
              style={{
                borderRadius: 20,
                border: "1px dashed var(--gray-6)",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <Text size="3" color="gray">
                No items match your search.
              </Text>
            </Box>
          ) : (
            <Grid
              columns={{ initial: "1", xs: "2", sm: "3", md: "4" }}
              gap="4"
              width="auto"
            >
              {paginatedItems.map((item, idx) => (
                <motion.div
                  key={item.productID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <MenuItemCard item={item} />
                </motion.div>
              ))}
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" align="center" gap="3" mt="4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge
              color="gray"
              variant="soft"
              radius="full"
              size="2"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                padding: "8px 16px",
              }}
            >
              <ChevronLeftIcon /> Prev
            </Badge>
          </motion.div>
          <Text size="2" weight="medium">
            Page {currentPage} of {totalPages}
          </Text>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge
              color="gray"
              variant="soft"
              radius="full"
              size="2"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                padding: "8px 16px",
              }}
            >
              Next <ChevronRightIcon />
            </Badge>
          </motion.div>
        </Flex>
      )}
    </Flex>
  );
};