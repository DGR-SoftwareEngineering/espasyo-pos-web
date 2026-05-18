import React, { useMemo } from "react";
import { useAccessContext } from "../../../core/contexts/AccessContext";
import { MenuItemDto } from "../../../api/access/types";
import { resolveIcon } from "../icons";
import {
  menuItems,
  secondaryMenuItems,
  MenuItem,
  NestedMenuItem,
} from "../config/menuConfig";
import { usePermissions } from "./usePermissions";

const dtoToNested = (dto: MenuItemDto): NestedMenuItem => {
  const Icon = resolveIcon(dto.iconName);
  return {
    id: dto.permissionKey,
    text: dto.label,
    icon: React.createElement(Icon),
    path: dto.path ?? "",
    permissionKey: dto.permissionKey,
  };
};

const dtoToParent = (
  dto: MenuItemDto,
  children: MenuItemDto[],
): MenuItem => {
  const Icon = resolveIcon(dto.iconName);
  return {
    id: dto.permissionKey,
    text: dto.label,
    icon: React.createElement(Icon),
    path: dto.path ?? undefined,
    permissionKey: dto.permissionKey,
    nestedItems: children.length ? children.map(dtoToNested) : undefined,
  };
};

const buildFromDtos = (dtos: MenuItemDto[]) => {
  const sorted = [...dtos].sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
  );
  const byParent = new Map<string | null, MenuItemDto[]>();
  for (const dto of sorted) {
    const key = dto.parentMenuItemID;
    const list = byParent.get(key) ?? [];
    list.push(dto);
    byParent.set(key, list);
  }
  const roots = byParent.get(null) ?? [];
  const main: MenuItem[] = [];
  const secondary: MenuItem[] = [];
  for (const root of roots) {
    const children = byParent.get(root.menuItemID) ?? [];
    const built = dtoToParent(root, children);
    if (root.group === "secondary") secondary.push(built);
    else main.push(built);
  }
  return { main, secondary };
};

export const useFilteredMenu = (roleName: string | null) => {
  const { canView } = usePermissions(roleName);
  const access = useAccessContext();

  const dynamic = useMemo(() => {
    if (!access.ready || access.menu.length === 0) return null;
    return buildFromDtos(access.menu);
  }, [access.ready, access.menu]);

  const filterNestedItems = (
    nestedItems?: NestedMenuItem[],
  ): NestedMenuItem[] | undefined => {
    if (!nestedItems) return undefined;
    return nestedItems.filter((item) => canView(item.permissionKey));
  };

  const fallbackMain = useMemo(() => {
    return menuItems
      .map((item) => ({
        ...item,
        nestedItems: item.nestedItems
          ? filterNestedItems(item.nestedItems)
          : undefined,
      }))
      .filter((item) => {
        const hasParentPermission = canView(item.permissionKey);
        const hasVisibleNested =
          item.nestedItems && item.nestedItems.length > 0;
        return hasParentPermission || hasVisibleNested;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, roleName]);

  const fallbackSecondary = useMemo(() => {
    return secondaryMenuItems.filter((item) => canView(item.permissionKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, roleName]);

  return {
    mainMenu: dynamic?.main ?? fallbackMain,
    secondaryMenu: dynamic?.secondary ?? fallbackSecondary,
  };
};
