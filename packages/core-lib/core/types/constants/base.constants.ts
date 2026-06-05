export interface IngredientStats {
  min: number;
  max: number;
  avg: number;
}

export interface BaseFilterState {
  searchQuery: string;
  sortBy: string;
}

export interface TableHeader {
  id: string;
  name: string;
  align: "left" | "center" | "right";
  width?: string;
  sortable: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

export const createSubmissionKeys = (featureName: string) =>
  ({
    view: `view-${featureName}-submission`,
    create: `create-${featureName}-submission`,
    edit: `edit-${featureName}-submission`,
    delete: `delete-${featureName}-submission`,
  }) as const;

export const createDialogTitles = (featureName: string) =>
  ({
    view: `View ${featureName}`,
    create: `Create ${featureName}`,
    edit: `Edit ${featureName}`,
    delete: `Delete ${featureName}`,
  }) as const;

export const createDialogTypes = (featureName: string) =>
  ({
    view: `${featureName}View`,
    edit: `${featureName}Edit`,
    delete: `${featureName}Delete`,
    create: `${featureName}Create`,
  }) as const;

// Generic sort function factory
export const createSortFunction = <T>(
  sortStrategies: Record<string, (a: T, b: T) => number>,
) => {
  return (items: T[], filters: BaseFilterState): T[] => {
    const sortStrategy = sortStrategies[filters.sortBy];
    if (!sortStrategy) return [...items];

    return [...items].sort(sortStrategy);
  };
};

export const commonSortStrategies = {
  newest: <T extends { id: string }>(a: T, b: T) => b.id.localeCompare(a.id),
  oldest: <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id),
  alphabetical: <T extends { name: string }>(a: T, b: T) =>
    a.name.localeCompare(b.name),
  numericalDesc: (a: number, b: number) => b - a,
  numericalAsc: (a: number, b: number) => a - b,
};
