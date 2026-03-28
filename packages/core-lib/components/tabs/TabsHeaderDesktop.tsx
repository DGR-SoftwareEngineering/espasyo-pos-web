import { Tabs } from "@mui/material";
import { Tab } from "./Tab";
import { useTabsContext } from "./TabsContextProvider";
import { TabOption } from "./types";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
}

export const TabsHeaderDesktop: React.FC<Props> = ({ id, tabs, ...other }) => {
  const { activeTabIndex, onTabChanged } = useTabsContext();

  return (
    <Tabs
      id={id}
      value={activeTabIndex}
      onChange={(_, value) => onTabChanged(value)}
      slotProps={{ indicator: { style: { display: "none" } } }}
      {...other}
    >
      {tabs.map((tab, index) => (
        <Tab
          data-testid={`tab-${index}`}
          id={`${tab.key}_tab_${index}`}
          key={`${tab.key}_${index}`}
          label={tab.label ?? "No Tab Label"}
          aria-controls={`${tab.key}_tabpanel_${index}`}
        />
      ))}
    </Tabs>
  );
};
