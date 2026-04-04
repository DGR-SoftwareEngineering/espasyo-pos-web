import {
  BaseFilterState,
  TableHeader,
  SortOption,
  createSubmissionKeys,
  createDialogTitles,
  createDialogTypes,
  createSortFunction,
} from "./base.constants";

export interface FeatureConfig<T = any> {
  name: string;
  tableHeaders: TableHeader[];
  sortOptions: SortOption[];
  sortStrategies: Record<string, (a: T, b: T) => number>;
  customPlaceholders?: Record<string, string>;
  customConstants?: Record<string, any>;
}

export class FeatureConfigBuilder<T> {
  private config: Partial<FeatureConfig<T>> = {};

  constructor(private featureName: string) {}

  setTableHeaders(headers: TableHeader[]) {
    this.config.tableHeaders = headers;
    return this;
  }

  setSortOptions(options: SortOption[]) {
    this.config.sortOptions = options;
    return this;
  }

  setSortStrategies(strategies: Record<string, (a: T, b: T) => number>) {
    this.config.sortStrategies = strategies;
    return this;
  }

  setPlaceholders(placeholders: Record<string, string>) {
    this.config.customPlaceholders = placeholders;
    return this;
  }

  setCustomConstants(constants: Record<string, any>) {
    this.config.customConstants = constants;
    return this;
  }

  build() {
    const featureName = this.featureName;

    return {
      SUBMISSION_KEYS: createSubmissionKeys(
        featureName.toLowerCase().replace(/\s/g, "-"),
      ),
      DIALOG_TITLES: createDialogTitles(featureName),
      DIALOG_TYPES: createDialogTypes(featureName.replace(/\s/g, "")),

      TABLE_HEADERS: this.config.tableHeaders || [],
      sortOptions: this.config.sortOptions || [],
      applySorting: createSortFunction<T>(this.config.sortStrategies || {}),

      ...(this.config.customPlaceholders && {
        PLACEHOLDERS: this.config.customPlaceholders,
      }),
      ...(this.config.customConstants && this.config.customConstants),

      FilterState: {} as BaseFilterState,
    };
  }
}
