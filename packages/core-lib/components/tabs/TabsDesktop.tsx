import { Tab } from "./Tab";
import { Tabs, SxProps } from "@mui/material";
import React, { JSX } from "react";
import { TabOption } from "./types";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
  sx?: SxProps;
  indentIndex?: number;
  tabsSx?: SxProps;
  getTabSx?: (index: number) => SxProps;
}

export const TabsDesktop: React.FC<Props> = ({
  id,
  tabs,
  sx,
  tabsSx,
  indentIndex,
  getTabSx,
  ...other
}) => {
  return (
    <Tabs
      id={id}
      value={0}
      onChange={(_, value) => {}}
      sx={{ mb: 3, ...tabsSx }}
      {...other}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={`${index}`}
          label={tab.key}
          sx={{
            ...(getTabSx ? getTabSx(index) : sx),
          }}
        />
      ))}
    </Tabs>
  );
};
