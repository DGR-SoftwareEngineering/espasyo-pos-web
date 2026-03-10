import { useMemo } from "react";
import {
  menuItems,
  secondaryMenuItems,
  MenuItem,
  NestedMenuItem,
} from "../config/menuConfig";
import { usePermissions } from "./usePermissions";

export const useFilteredMenu = (roleName: string | null, roleData?: any) => {
  const { canView, permissions } = usePermissions(roleName, roleData);

  const filterNestedItems = (
    nestedItems?: NestedMenuItem[],
  ): NestedMenuItem[] | undefined => {
    if (!nestedItems) return undefined;

    return nestedItems.filter((item) => {
      return canView(item.permissionKey);
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
        // Check if parent has view permission
        const hasParentPermission = canView(item.permissionKey);
        // Check if it has visible nested items
        const hasVisibleNested =
          item.nestedItems && item.nestedItems.length > 0;
        // Show if either parent has permission OR has visible nested items
        return hasParentPermission || hasVisibleNested;
      });

    return filtered;
  }, [canView]);

  const filteredSecondaryMenu = useMemo(() => {
    return secondaryMenuItems.filter((item) => canView(item.permissionKey));
  }, [canView]);

  return {
    mainMenu: filteredMainMenu,
    secondaryMenu: filteredSecondaryMenu,
  };
};
