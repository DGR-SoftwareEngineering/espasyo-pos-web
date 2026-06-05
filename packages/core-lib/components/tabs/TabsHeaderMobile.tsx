import { Box, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import { AnimatedArrowIcon } from "../animations";
import { useTabsContext } from "./TabsContextProvider";
import { TabOption } from "./types";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
}

export const TabsHeaderMobile: React.FC<Props> = ({ id, tabs, ...other }) => {
  const { activeTabIndex, onTabChanged } = useTabsContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box p={6} pb={0} bgcolor="appColors.support80.transparentLight" id={id}>
      <Select
        fullWidth
        color="primary"
        onChange={(e) => onTabChanged(+e.target.value)}
        value={activeTabIndex}
        onOpen={() => setMenuOpen(true)}
        onClose={() => setMenuOpen(false)}
        IconComponent={(props) => (
          <AnimatedArrowIcon open={menuOpen} {...props} />
        )}
        {...other}
      >
        {tabs.map((tab, index) => (
          <MenuItem
            data-testid={`tab-${index}`}
            aria-controls={`${tab.key}_tabpanel_${index}`}
            id={`${tab.key}_tab_${index}`}
            key={`${tab.key}_${index}`}
            value={index}
          >
            {tab.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
