import { useCallback, useMemo, useState } from "react";
import { RoleDto, UserDto } from "core-lib/api/commons/types";
import { useFilters } from "core-lib/core/hooks";

export interface UserFilterState {
  searchTerm: string;
  roleFilter: string | "all";
  sortBy: string;
}

export interface UserStats {
  total: number;
  byRole: Record<string, number>;
  recentlyActive: number;
}

interface Props {
  users: UserDto[];
  roles: RoleDto[];
}

const sortStrategies: Record<
  string,
  (a: UserDto, b: UserDto) => number
> = {
  name: (a, b) =>
    (a.userInfo?.firstName ?? "").localeCompare(b.userInfo?.firstName ?? ""),
  nameDesc: (a, b) =>
    (b.userInfo?.firstName ?? "").localeCompare(a.userInfo?.firstName ?? ""),
  role: (a, b) => (a.roleName ?? "").localeCompare(b.roleName ?? ""),
  newest: (a, b) =>
    new Date(b.createdAt ?? 0).getTime() -
    new Date(a.createdAt ?? 0).getTime(),
  oldest: (a, b) =>
    new Date(a.createdAt ?? 0).getTime() -
    new Date(b.createdAt ?? 0).getTime(),
};

export const useUserFilters = ({ users, roles }: Props) => {
  const [sortBy, setSortBy] = useState("name");

  const {
    filters,
    setFilter,
    resetFilters: resetGeneric,
    filteredItems,
  } = useFilters({
    items: users,
    defaultFilters: {
      searchTerm: "",
      roleFilter: "all",
      sortBy: "name",
    },
    filterFns: {
      searchTerm: (item, value) => {
        if (!value || value === "") return true;
        const q = (value as string).toLowerCase();
        const info = item.userInfo;
        return (
          (info?.firstName ?? "").toLowerCase().includes(q) ||
          (info?.lastName ?? "").toLowerCase().includes(q) ||
          (info?.email ?? "").toLowerCase().includes(q) ||
          (item.username ?? "").toLowerCase().includes(q) ||
          (item.roleName ?? "").toLowerCase().includes(q)
        );
      },
      roleFilter: (item, value) =>
        value === "all" || item.roleID === value,
    },
  });

  const filteredUsers = useMemo(() => {
    const sort = sortStrategies[sortBy] ?? sortStrategies.name;
    return [...filteredItems].sort(sort);
  }, [filteredItems, sortBy]);

  const updateFilter = useCallback(
    <K extends keyof UserFilterState>(key: K, value: UserFilterState[K]) => {
      if (key === "sortBy") {
        setSortBy(value as string);
      } else {
        setFilter(key as keyof typeof filters, value as never);
      }
    },
    [setFilter],
  );

  const resetFilters = useCallback(() => {
    resetGeneric();
    setSortBy("name");
  }, [resetGeneric]);

  const stats: UserStats = useMemo(() => {
    const byRole: Record<string, number> = {};
    roles.forEach((r) => (byRole[r.roleName] = 0));
    users.forEach((u) => {
      const key = u.roleName ?? "Unknown";
      byRole[key] = (byRole[key] ?? 0) + 1;
    });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyActive = users.filter((u) => {
      if (!u.lastLogin) return false;
      return new Date(u.lastLogin).getTime() >= sevenDaysAgo;
    }).length;

    return { total: users.length, byRole, recentlyActive };
  }, [users, roles]);

  return { filters, filteredUsers, stats, updateFilter, resetFilters };
};
