import React from "react";
import { CreateBookingBlock } from "./admin";
import type { ParseBlocksProps } from "./types";

const ParseBlocks: React.FC<ParseBlocksProps> = (props) => {
  const { blocks } = props;

  switch (blocks) {
    case "HubDashboardBlock":
      return <>Hub</>;
    case "BookingBlock":
      return <CreateBookingBlock />;
    case "UserManagementBlock":
      return <>test</>;
  }
};

export default ParseBlocks;
