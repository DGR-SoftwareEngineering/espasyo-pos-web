import React from "react";
import { useTabsContext } from "./TabsContextProvider";

interface Props {
  index: number;
  id?: string;
  "aria-labelledby"?: string;
  children?: React.ReactNode;
}

export const TabPanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  index,
  ...other
}) => {
  const { activeTabIndex } = useTabsContext();

  return (
    <div role="tabpanel" hidden={activeTabIndex !== index} {...other}>
      {activeTabIndex === index && children}
    </div>
  );
};
