import React from "react";
import { useTabsContext } from "../../core/contexts";

interface Props {
  index: number;
  id?: string;
  "aria-labelledby"?: string;
}

export const TabPanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  index,
  ...other
}) => {
  const {} = useTabsContext();

  return (
    <div role="tabpanel" hidden={0 !== index} {...other}>
      {children}
    </div>
  );
};
