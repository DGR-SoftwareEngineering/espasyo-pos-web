import React, { useMemo } from "react";
import { Box, Card, Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import {
  PersonIcon,
  CubeIcon,
  ArchiveIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useApi, useResolution } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";

type Accent = "indigo" | "violet" | "teal" | "amber" | "red";

interface Tile {
  label: string;
  value: number | null;
  hint?: string;
  accent: Accent;
  icon: React.ReactNode;
  loading: boolean;
}

const TileCard: React.FC<{ tile: Tile; delay: number }> = ({ tile, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{ minWidth: 0 }}
  >
    <Card
      size="3"
      variant="surface"
      style={{
        background: `var(--${tile.accent}-a2)`,
        borderColor: `var(--${tile.accent}-a5)`,
      }}
    >
      <Flex justify="between" align="start" gap="3">
        <Box style={{ minWidth: 0 }}>
          <Text size="2" color="gray">
            {tile.label}
          </Text>
          <Heading
            size="8"
            weight="bold"
            mt="1"
            style={{ color: `var(--${tile.accent}-11)`, lineHeight: 1 }}
          >
            {tile.loading ? (
              <Skeleton width="80px" height="40px" />
            ) : (
              (tile.value ?? "—").toLocaleString()
            )}
          </Heading>
          {tile.hint && (
            <Text size="1" color="gray" mt="2" as="div">
              {tile.hint}
            </Text>
          )}
        </Box>
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-3)",
            background: `var(--${tile.accent}-a3)`,
            color: `var(--${tile.accent}-11)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {tile.icon}
        </Box>
      </Flex>
    </Card>
  </motion.div>
);

export const AdminKpiRow: React.FC = () => {
  const { isSmallMobile } = useResolution();
  const { inventory } = usePublicSettings();
  const lowStockEnabled = inventory.lowStockAlertEnabled;

  const usersCb = useApi((api) => api.commons.userList(1, 1));
  const suppliersCb = useApi((api) => api.commons.supplierList(1, 1));
  const productsCb = useApi((api) => api.commons.productList());
  const lowStockCb = useApi(
    async (api) => {
      if (!lowStockEnabled) return undefined;
      return api.commons.inventoryLowStock();
    },
    [lowStockEnabled],
  );

  const tiles = useMemo<Tile[]>(() => {
    const userTotal = usersCb.result?.data?.response?.totalItems ?? null;
    const supplierTotal = suppliersCb.result?.data?.response?.totalItems ?? null;
    const productTotal = Array.isArray(productsCb.result?.data?.response)
      ? productsCb.result.data.response.length
      : null;
    const lowStockArr = lowStockCb.result?.data?.response;
    const lowStockTotal = Array.isArray(lowStockArr) ? lowStockArr.length : null;

    const base: Tile[] = [
      {
        label: "Total users",
        value: userTotal,
        hint: "Active + inactive accounts",
        accent: "indigo",
        icon: <PersonIcon width="22" height="22" />,
        loading: usersCb.loading,
      },
      {
        label: "Suppliers",
        value: supplierTotal,
        hint: "Vendors in directory",
        accent: "violet",
        icon: <ArchiveIcon width="22" height="22" />,
        loading: suppliersCb.loading,
      },
      {
        label: "Products",
        value: productTotal,
        hint: "Catalog SKUs",
        accent: "teal",
        icon: <CubeIcon width="22" height="22" />,
        loading: productsCb.loading,
      },
    ];

    if (lowStockEnabled) {
      base.push({
        label: "Low-stock alerts",
        value: lowStockTotal,
        hint:
          lowStockTotal && lowStockTotal > 0
            ? "Action needed"
            : "Inventory healthy",
        accent: lowStockTotal && lowStockTotal > 0 ? "red" : "amber",
        icon: <ExclamationTriangleIcon width="22" height="22" />,
        loading: lowStockCb.loading,
      });
    }

    return base;
  }, [
    usersCb.result,
    usersCb.loading,
    suppliersCb.result,
    suppliersCb.loading,
    productsCb.result,
    productsCb.loading,
    lowStockCb.result,
    lowStockCb.loading,
    lowStockEnabled,
  ]);

  return (
    <Box
      mb="5"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${isSmallMobile ? "160px" : "220px"}, 1fr))`,
        gap: 16,
      }}
    >
      {tiles.map((tile, idx) => (
        <TileCard key={tile.label} tile={tile} delay={idx * 0.05} />
      ))}
    </Box>
  );
};
