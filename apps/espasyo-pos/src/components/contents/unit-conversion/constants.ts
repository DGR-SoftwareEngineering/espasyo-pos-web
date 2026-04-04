import { ToggleOption } from "core-lib";
import { UnitConversion } from "core-lib/api/commons/types";
import { FeatureConfigBuilder } from "core-lib/core/types/constants/feature-config.builder";
import { commonSortStrategies } from "core-lib/core/types/constants/base.constants";

export const APPROXIMATE_OPTIONS: ToggleOption<boolean>[] = [
  {
    value: true,
    label: "Approximate",
    description:
      "Conversion may vary (e.g., kg to pieces depends on item size)",
    selectedColor: "warning",
  },
  {
    value: false,
    label: "Exact",
    description: "Conversion is exact (e.g., kg to grams, liter to ml)",
    selectedColor: "success",
  },
];

const config = new FeatureConfigBuilder<UnitConversion>("Unit Conversion")
  .setTableHeaders([
    {
      id: "conversion",
      label: "Unit Conversion",
      width: "40%",
      sortable: true,
      align: "left",
    },
    {
      id: "rate",
      label: "Conversion Rate",
      align: "center",
      width: "25%",
      sortable: true,
    },
    {
      id: "type",
      label: "Type",
      align: "center",
      width: "15%",
      sortable: true,
    },
    {
      id: "actions",
      label: "Actions",
      align: "right",
      width: "20%",
      sortable: false,
    },
  ])
  .setSortOptions([
    { value: "fromUnit", label: "From Unit (A-Z)" },
    { value: "toUnit", label: "To Unit (A-Z)" },
    { value: "rate", label: "Highest Rate" },
    { value: "rateLow", label: "Lowest Rate" },
    { value: "approximate", label: "Approximate First" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ])
  .setSortStrategies({
    fromUnit: (a, b) => a.fromUnitName.localeCompare(b.fromUnitName),
    toUnit: (a, b) => a.toUnitName.localeCompare(b.toUnitName),
    rate: (a, b) => b.conversionRate - a.conversionRate,
    rateLow: (a, b) => a.conversionRate - b.conversionRate,
    approximate: (a, b) =>
      a.isApproximate === b.isApproximate ? 0 : a.isApproximate ? -1 : 1,
    newest: commonSortStrategies.newest as any,
    oldest: commonSortStrategies.oldest as any,
  })
  .build();

export const SUBMISSION_KEYS = config.SUBMISSION_KEYS;
export const TABLE_HEADERS = config.TABLE_HEADERS;
export const DIALOG_TITLES = config.DIALOG_TITLES;
export const DIALOG_TYPES = config.DIALOG_TYPES;
export const sortOptions = config.sortOptions;
export const applyUnitConversionSorting = config.applySorting;
export type UnitConversionFilterState = typeof config.FilterState;
