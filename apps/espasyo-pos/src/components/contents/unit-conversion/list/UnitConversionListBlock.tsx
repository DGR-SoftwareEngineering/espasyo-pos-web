import React, { useState, useMemo, useCallback } from "react";
import {
  Badge,
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  AlertDialog,
  Card,
} from "@radix-ui/themes";;
import {
  ReloadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SwitchIcon,
} from "@radix-ui/react-icons";
import { useApi, useApiCallback, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { useToastContext } from "core-lib";
import { useDialogContext } from "core-lib";
import { registerForm } from "core-lib/components/radix/form/FormRenderer";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { UnitConversionList } from "./UnitConversionList";
import {
  applyUnitConversionSorting,
  sortOptions,
  UnitConversionFilterState,
} from "../constants";
import { UnitConversion, UnitConversionDependenciesDto } from "core-lib/api/commons/types";
import { useUnitConversionStats } from "../hooks/useUnitConversionStats";
import { UnitConversionForm } from "../forms/UnitConversionForm";
import { formatNumber } from "core-lib/business";

registerForm("unit-conversion-form", UnitConversionForm);

export const UnitConversionListBlock: React.FC = () => {
  // openDialog is wired but no actions trigger it for now — preserve future hooks
  useDialogContext();
  const { showToast } = useToastContext();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<UnitConversionFilterState>({
    searchQuery: "",
    sortBy: "fromUnit",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [depsData, setDepsData] = useState<UnitConversionDependenciesDto | null>(null);
  const { isSmallMobile } = useResolution();

  const data = useApi((api) =>
    api.commons.getUnitConversions(pageNumber, pageSize),
  );
  const response = data.result?.data.response;

  const getDependenciesCb = useApiCallback(
    async (api, id: string) =>
      api.commons.getUnitConversionDependencies(id),
  );

  const deleteCb = useApiCallback(
    async (api, id: string) =>
      api.commons.deleteUnitConversion(id),
  );

  const conversions = useMemo((): UnitConversion[] => {
    return response?.items ?? [];
  }, [response]);

  const stats = useUnitConversionStats(conversions);

  const pagination = useMemo(() => {
    if (!response) return undefined;
    return {
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      totalItems: response.totalItems,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }, [response]);

  const filteredConversions = useMemo(() => {
    let filtered = [...conversions];
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conversion) =>
          conversion.fromUnitName.toLowerCase().includes(query) ||
          conversion.toUnitName.toLowerCase().includes(query) ||
          (conversion.notes && conversion.notes.toLowerCase().includes(query)),
      );
    }
    return applyUnitConversionSorting(filtered, filters);
  }, [conversions, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== "fromUnit") count++;
    return count;
  }, [filters]);

  const handleRefresh = useCallback(() => {
    data.execute();
    setFilters({ searchQuery: "", sortBy: "fromUnit" });
    setPageNumber(1);
  }, [data]);

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage) setPageNumber((prev) => prev + 1);
  }, [pagination]);

  const handlePreviousPage = useCallback(() => {
    if (pagination?.hasPreviousPage) setPageNumber((prev) => prev - 1);
  }, [pagination]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
    setPageNumber(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setPageNumber(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ searchQuery: "", sortBy: "fromUnit" });
    setPageNumber(1);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    const result = await getDependenciesCb.execute(id);

    if (result?.data?.success && result.data.response) {
      setDepsData(result.data.response);
    } else {
      setDeletingId(null);
      showToast(
        Array.isArray(result?.data?.errors) ? result.data.errors[0] : result?.data?.message ?? "Failed to load conversion dependencies.",
        "error"
      );
    }
  }, [getDependenciesCb, showToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingId) return;

    const result = await deleteCb.execute(deletingId);

    if (result?.data?.success) {
      showToast("Unit conversion deleted successfully", "success");
      setDeletingId(null);
      setDepsData(null);
      data.execute();
    } else {
      const msg = Array.isArray(result?.data?.errors) ? result.data.errors[0] : result?.data?.message ?? "Failed to delete conversion";
      showToast(msg, "error");
    }
  }, [deletingId, deleteCb, data, showToast]);

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Unit Conversion Management"
          subtitle="Define and manage conversion rates between different units of measurement"
          icon={<SwitchIcon />}
          actionButton={{
            label: "New Conversion",
            onClick: () => {},
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          <StatsCard
            label="Total Conversions"
            value={stats.totalConversions}
            color="primary"
            variant="detailed"
          />
          <StatsCard
            label="Exact Conversions"
            value={stats.exactConversions}
            color="success"
            variant="detailed"
          />
          <StatsCard
            label="Approximate"
            value={stats.approximateConversions}
            color="warning"
            variant="detailed"
          />
          <StatsCard
            label="Avg Rate"
            value={formatNumber(stats.averageRate, 2)}
            color="info"
            variant="detailed"
          />
        </Flex>

        {(stats.highestRate > 0 || stats.lowestRate < Infinity) && (
          <Flex gap="2" mt="3" wrap="wrap">
            <Badge color="green" variant="soft" size="2" radius="full">
              <ArrowUpIcon />
              Highest Rate: 1 unit = {formatNumber(stats.highestRate, 2)} units
            </Badge>
            <Badge color="blue" variant="soft" size="2" radius="full">
              <ArrowDownIcon />
              Lowest Rate: 1 unit = {formatNumber(stats.lowestRate, 2)} units
            </Badge>
            {stats.mostConvertedFromUnit.name && (
              <Badge color="amber" variant="soft" size="2" radius="full">
                <SwitchIcon />
                Most converted from: {stats.mostConvertedFromUnit.name} (
                {stats.mostConvertedFromUnit.count} conversions)
              </Badge>
            )}
          </Flex>
        )}

        <Flex justify="between" align="center" gap="3" mt="4" wrap="wrap">
          <FilterBar
            searchValue={filters.searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by unit names or notes…"
            sortValue={filters.sortBy}
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            resultCount={filteredConversions.length}
            resultLabel="conversions"
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageSizeChange={handlePageSizeChange}
            activeFilterCount={activeFilterCount}
            onClearFilters={handleClearFilters}
            showFilterChip
          />
          <Button
            type="Secondary"
            onClick={handleRefresh}
            disabled={data.loading}
          >
            <Flex align="center" gap="2">
              <ReloadIcon />
              Refresh
            </Flex>
          </Button>
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <UnitConversionList
          data={filteredConversions}
          loading={data.loading}
          pagination={pagination}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onView={() => {}}
          onEdit={() => {}}
          onDelete={handleDelete}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={deletingId !== null} onOpenChange={(open) => {
        if (!open) {
          setDeletingId(null);
          setDepsData(null);
        }
      }}>
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: "500px" }}>
          <AlertDialog.Title>Delete Unit Conversion</AlertDialog.Title>
          {depsData && (
            <Box my="3">
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="2" weight="bold" as="div" mb="2">
                    {depsData.fromUnitName} → {depsData.toUnitName}
                  </Text>
                  <Text size="2" color="gray" as="div">
                    Conversion rate: 1 {depsData.fromUnitName} = {formatNumber(depsData.conversionRate, 4)} {depsData.toUnitName}
                  </Text>
                </Box>

                {depsData.hasDependencies ? (
                  <Box>
                    <Text size="2" weight="bold" color="red" as="div" mb="2">
                      ⚠️ This conversion is used by:
                    </Text>

                    {depsData.affectedProducts.length > 0 && (
                      <Box mb="3">
                        <Text size="1" weight="bold" as="div" mb="1" color="gray">
                          Products ({depsData.affectedProducts.length}):
                        </Text>
                        <Flex direction="column" gap="1">
                          {depsData.affectedProducts.map((p) => (
                            <Text key={p.productID} size="1" color="gray" as="div">
                              • {p.name} ({p.fromUnit} → {p.toUnit})
                            </Text>
                          ))}
                        </Flex>
                      </Box>
                    )}

                    {depsData.affectedRecipes.length > 0 && (
                      <Box>
                        <Text size="1" weight="bold" as="div" mb="1" color="gray">
                          Recipes ({depsData.affectedRecipes.length}):
                        </Text>
                        <Flex direction="column" gap="1">
                          {depsData.affectedRecipes.map((r) => (
                            <Text key={r.recipeID} size="1" color="gray" as="div">
                              • {r.productName} (uses {r.unitName})
                            </Text>
                          ))}
                        </Flex>
                      </Box>
                    )}

                    <Text size="1" color="red" as="div" mt="3">
                      Removing this conversion may cause calculation errors.
                    </Text>
                  </Box>
                ) : (
                  <Box p="3" style={{
                    background: "var(--green-a3)",
                    borderRadius: "var(--radius-3)",
                    border: "1px solid var(--green-a5)",
                  }}>
                    <Text size="2" style={{ color: "var(--green-11)" }}>
                      ✓ No products or recipes depend on this conversion.
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <AlertDialog.Cancel>
              <Button type="Secondary" onClick={() => {
      setDeletingId(null);
      setDepsData(null);
    }}>Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                disabled={deleteCb.loading}
                onClick={handleConfirmDelete}
              >
                {deleteCb.loading ? "Deleting…" : "Delete"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {filteredConversions.length > 0 && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing{" "}
            {filteredConversions.length === 0
              ? 0
              : (pageNumber - 1) * pageSize + 1}{" "}
            to {Math.min(pageNumber * pageSize, filteredConversions.length)} of{" "}
            <Text weight="bold" color="gray">
              {pagination?.totalItems ?? 0}
            </Text>{" "}
            conversions
          </Text>
          <Text size="2" color="gray">
            Page{" "}
            <Text weight="bold" color="gray">
              {pageNumber}
            </Text>{" "}
            of{" "}
            <Text weight="bold" color="gray">
              {pagination?.totalPages ?? 1}
            </Text>
          </Text>
        </Flex>
      )}
    </Box>
  );
};
