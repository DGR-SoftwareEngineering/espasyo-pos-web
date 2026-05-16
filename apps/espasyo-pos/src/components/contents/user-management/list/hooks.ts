import { useCallback, useEffect, useMemo, useState } from "react";
import { RoleDto, UserDto } from "core-lib/api/commons/types";

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
  const [filters, setFilters] = useState<UserFilterState>({
    searchTerm: "",
    roleFilter: "all",
    sortBy: "name",
  });

  const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);

  useEffect(() => {
    let next = [...users];
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      next = next.filter((u) => {
        const info = u.userInfo;
        return (
          (info?.firstName ?? "").toLowerCase().includes(q) ||
          (info?.middleName ?? "").toLowerCase().includes(q) ||
          (info?.lastName ?? "").toLowerCase().includes(q) ||
          (info?.email ?? "").toLowerCase().includes(q) ||
          (u.username ?? "").toLowerCase().includes(q) ||
          (info?.contactNumber ?? "").toLowerCase().includes(q) ||
          (u.roleName ?? "").toLowerCase().includes(q)
        );
      });
    }
    if (filters.roleFilter !== "all") {
      next = next.filter((u) => u.roleID === filters.roleFilter);
    }
    const sort = sortStrategies[filters.sortBy] ?? sortStrategies.name;
    next.sort(sort);
    setFilteredUsers(next);
  }, [users, filters]);

  const updateFilter = useCallback(
    <K extends keyof UserFilterState>(key: K, value: UserFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({ searchTerm: "", roleFilter: "all", sortBy: "name" });
  }, []);

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
