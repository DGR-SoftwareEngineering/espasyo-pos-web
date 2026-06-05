import { PlatformDto } from "core-lib/api/platform/types";

export interface PlatformListProps {
  data: PlatformDto[];
  onView: (item: PlatformDto) => void;
  onEdit: (item: PlatformDto) => void;
  onDelete: (item: PlatformDto) => void;
  onManageUsers: (item: PlatformDto) => void;
  loading?: boolean;
}

export interface PlatformFilters {
  search: string;
  status: "all" | "active" | "inactive";
}
