import { useMemo } from "react";
import { UnitConversion } from "core-lib/api/commons/types";

//TODO: Transfer all calculations to backend when we have the endpoint ready. For now, we can calculate some basic stats on the frontend for display purposes.
export const useUnitConversionStats = (conversions: UnitConversion[]) => {
  const stats = useMemo(() => {
    if (!conversions.length) {
      return {
        totalConversions: 0,
        exactConversions: 0,
        approximateConversions: 0,
        averageRate: 0,
        highestRate: 0,
        lowestRate: 0,
        mostConvertedFromUnit: { name: "", count: 0 },
        mostConvertedToUnit: { name: "", count: 0 },
      };
    }

    const exact = conversions.filter((c) => !c.isApproximate);
    const approximate = conversions.filter((c) => c.isApproximate);
    const averageRate =
      conversions.reduce((sum, c) => sum + c.conversionRate, 0) /
      conversions.length;
    const highestRate = Math.max(...conversions.map((c) => c.conversionRate));
    const lowestRate = Math.min(...conversions.map((c) => c.conversionRate));

    const fromUnitCount: Record<string, { name: string; count: number }> = {};
    conversions.forEach((c) => {
      if (!fromUnitCount[c.fromUnitID]) {
        fromUnitCount[c.fromUnitID] = { name: c.fromUnitName, count: 0 };
      }
      fromUnitCount[c.fromUnitID].count++;
    });

    const toUnitCount: Record<string, { name: string; count: number }> = {};
    conversions.forEach((c) => {
      if (!toUnitCount[c.toUnitID]) {
        toUnitCount[c.toUnitID] = { name: c.toUnitName, count: 0 };
      }
      toUnitCount[c.toUnitID].count++;
    });

    const mostConvertedFromUnit = Object.values(fromUnitCount).reduce(
      (max, unit) => (unit.count > max.count ? unit : max),
      { name: "", count: 0 },
    );

    const mostConvertedToUnit = Object.values(toUnitCount).reduce(
      (max, unit) => (unit.count > max.count ? unit : max),
      { name: "", count: 0 },
    );

    return {
      totalConversions: conversions.length,
      exactConversions: exact.length,
      approximateConversions: approximate.length,
      averageRate,
      highestRate,
      lowestRate,
      mostConvertedFromUnit,
      mostConvertedToUnit,
    };
  }, [conversions]);

  return stats;
};
