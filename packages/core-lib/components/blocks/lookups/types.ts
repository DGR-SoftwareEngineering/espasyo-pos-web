import { SvgIconComponent } from "@mui/icons-material";
import { Api } from "../../../api/api";
import { ApiResponse } from "../../../api/types";

/**
 * Minimal shape every lookup DTO must satisfy. All five lookup tables in the
 * backend (`Unit`, `ProductCategory`, `IngredientCategory`, `Location`, `Brand`)
 * share these fields — the entity-specific PK and parent-FK keys are surfaced
 * via the config (see `LookupAdminConfig`).
 */
export interface LookupDtoBase {
  name: string;
  description: string | null;
  displayOrder: number;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface LookupFormValues {
  name: string;
  description: string;
  displayOrder: number;
  parentID: string | null;
}

export interface LookupSelectors<TDto extends LookupDtoBase> {
  list: (api: Api) => Promise<{ data: ApiResponse<TDto[]> }>;
  create: (
    api: Api,
    values: LookupFormValues,
  ) => Promise<{ data: ApiResponse<string>; status: number }>;
  update: (
    api: Api,
    id: string,
    values: LookupFormValues,
  ) => Promise<{ data: ApiResponse<string>; status: number }>;
  delete: (
    api: Api,
    ids: string[],
  ) => Promise<{ data: ApiResponse<string>; status: number }>;
}

export interface LookupAdminConfig<TDto extends LookupDtoBase> {
  /** Singular form, e.g. "Unit". Used in dialog titles + toast messages. */
  entityName: string;
  /** Plural form, e.g. "Units". Used in page headers. */
  entityNamePlural: string;
  /** Subtitle copy for the page header. */
  description: string;
  /** Header icon. */
  icon: SvgIconComponent;
  /** Key on TDto holding the row's primary ID. */
  idField: keyof TDto;
  /** Optional key on TDto holding the parent ID (e.g. "parentUnitID"). */
  parentIdField?: keyof TDto;
  /** Optional key on TDto holding the flattened parent name (e.g. "parentUnitName"). */
  parentNameField?: keyof TDto;
  /** When true and parentIdField is set, render rows as an indented tree (expand/collapse) instead of a flat list. */
  enableTree?: boolean;
  /** API selectors — caller maps the generic LookupFormValues to entity-specific params. */
  selectors: LookupSelectors<TDto>;
}
