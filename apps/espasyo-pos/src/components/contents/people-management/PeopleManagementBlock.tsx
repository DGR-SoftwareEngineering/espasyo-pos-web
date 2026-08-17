import React, { useMemo } from "react";
import {
  Box,
} from "core-lib/components/radix/proxies";;
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { useResolution } from "core-lib/core/hooks";
import { UserListBlock } from "../user-management/list/UserListBlock";
import { SupplierListBlock } from "../supplier-management/list/SupplierListBlock";

export const PeopleManagementBlock: React.FC = () => {
  const { isMobile } = useResolution();

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "user_management",
        label: "User Management",
        content: <UserListBlock />,
      },
      {
        key: "supplier_management",
        label: "Supplier Management",
        content: <SupplierListBlock />,
      },
    ],
    [],
  );

  return (
    <TabsContextProvider>
      {isMobile ? (
        <TabsHeaderMobile id="people_management_mobile" tabs={tabs} />
      ) : (
        <TabsHeaderDesktop id="people_management_desktop" tabs={tabs} />
      )}
      {tabs.map((tab, index) => (
        <TabPanel
          index={index}
          id={`${tab.key}_tabpanel_${index}`}
          aria-labelledby={`${tab.key}_tab_${index}`}
          key={`${tab.key}_${index}`}
        >
          <Box pt="4">{tab.content}</Box>
        </TabPanel>
      ))}
    </TabsContextProvider>
  );
};
