import { useMemo } from "react";
import {
  menuItems,
  secondaryMenuItems,
  NestedMenuItem,
} from "../config/menuConfig";
import { usePermissions } from "./usePermissions";

export const useFilteredMenu = (roleName: string | null) => {
  const { canView } = usePermissions(roleName);

  const filterNestedItems = (
    nestedItems?: NestedMenuItem[],
  ): NestedMenuItem[] | undefined => {
    if (!nestedItems) return undefined;

    return nestedItems.filter((item) => {
      const hasPermission = canView(item.permissionKey);
      return hasPermission;
    });
  };

  const filteredMainMenu = useMemo(() => {
    const filtered = menuItems
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

    return filtered;
  }, [canView, roleName]);

  const filteredSecondaryMenu = useMemo(() => {
    const filtered = secondaryMenuItems.filter((item) => {
      const hasPermission = canView(item.permissionKey);
      return hasPermission;
    });

    return filtered;
  }, [canView, roleName]);

  return {
    mainMenu: filteredMainMenu,
    secondaryMenu: filteredSecondaryMenu,
  };
};
