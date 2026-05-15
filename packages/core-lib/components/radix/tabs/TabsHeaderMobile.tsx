import React from "react";
import { Box, Select } from "@radix-ui/themes";
import { useTabsContext } from "../../tabs/TabsContextProvider";
import { TabOption } from "../../tabs/types";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
}

export const TabsHeaderMobile: React.FC<Props> = ({
  id,
  tabs,
  ...other
}) => {
  const { activeTabIndex, onTabChanged } = useTabsContext();

  return (
    <Box
      id={id}
      p="3"
      style={{ background: "var(--accent-a2)" }}
      {...other}
    >
      <Select.Root
        size="3"
        value={String(activeTabIndex)}
        onValueChange={(value) => onTabChanged(Number(value))}
      >
        <Select.Trigger
          style={{ width: "100%" }}
          data-testid={`tabs-mobile-trigger`}
        />
        <Select.Content>
          {tabs.map((tab, index) => (
            <Select.Item
              key={`${tab.key}_${index}`}
              value={String(index)}
              data-testid={`tab-${index}`}
              aria-controls={`${tab.key}_tabpanel_${index}`}
              id={`${tab.key}_tab_${index}`}
            >
              {tab.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
};
