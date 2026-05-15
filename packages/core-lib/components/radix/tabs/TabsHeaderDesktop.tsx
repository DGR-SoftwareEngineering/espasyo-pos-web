import React from "react";
import { Flex } from "@radix-ui/themes";
import { useTabsContext } from "../../tabs/TabsContextProvider";
import { TabOption } from "../../tabs/types";
import { Tab } from "./Tab";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
}

export const TabsHeaderDesktop: React.FC<Props> = ({
  id,
  tabs,
  ...other
}) => {
  const { activeTabIndex, onTabChanged } = useTabsContext();

  return (
    <Flex
      id={id}
      role="tablist"
      align="center"
      gap="1"
      style={{ borderBottom: "1px solid var(--gray-a4)" }}
      {...other}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={`${tab.key}_${index}`}
          id={`${tab.key}_tab_${index}`}
          aria-controls={`${tab.key}_tabpanel_${index}`}
          label={tab.label ?? "No Tab Label"}
          active={activeTabIndex === index}
          onClick={() => onTabChanged(index)}
        />
      ))}
    </Flex>
  );
};
