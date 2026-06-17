import React, { useMemo } from "react";
import { Box } from "@radix-ui/themes";
import {
  ActivityLogIcon,
  BarChartIcon,
  CubeIcon,
  LayersIcon,
  PieChartIcon,
} from "@radix-ui/react-icons";
import { ChartCard, ProductOption } from "core-lib/components/radix/charts";
import { useApi, useResolution } from "core-lib/core/hooks";

export const AdminChartsRow: React.FC = () => {
  const { isSmallMobile } = useResolution();
  const productsApi = useApi((api) => api.commons.productList());
  const productOptions = useMemo<ProductOption[]>(
    () =>
      Array.isArray(productsApi.result?.data?.response)
        ? productsApi.result.data.response
            .filter((p) => p.isActive)
            .map((p) => ({ id: p.productID, name: p.name }))
        : [],
    [productsApi.result],
  );

  return (
    <Box
      mb="5"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${isSmallMobile ? "280px" : "360px"}, 1fr))`,
        gap: 16,
      }}
    >
      <ChartCard
        chartKey="sales-by-day"
        title="Sales by day"
        description="Daily POS revenue, filterable by product and date range"
        icon={<ActivityLogIcon />}
        showFilters
        productOptions={productOptions}
        initialFilters={{ period: "30d", groupBy: "day" }}
        height={300}
      />
      <ChartCard
        chartKey="top-products"
        title="Top products"
        description="Highest-revenue products in the window"
        icon={<BarChartIcon />}
        showFilters
        productOptions={productOptions}
        initialFilters={{ period: "30d", groupBy: "day" }}
        height={300}
      />
      <ChartCard
        chartKey="stock-movements-by-type"
        title="Stock movements"
        description="Receives, sales, wastage, adjustments"
        icon={<LayersIcon />}
        showFilters
        productOptions={productOptions}
        initialFilters={{ period: "30d", groupBy: "day" }}
        height={300}
      />
      <ChartCard
        chartKey="inventory-by-status"
        title="Inventory by status"
        description="Live snapshot of stock health"
        icon={<CubeIcon />}
        typeOverride="donut"
        height={300}
      />
      <ChartCard
        chartKey="products-by-category"
        title="Catalog mix"
        description="Products by category"
        icon={<PieChartIcon />}
        typeOverride="donut"
        height={300}
      />
    </Box>
  );
};
