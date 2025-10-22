import React from "react";

export type Blocks = "HubDashboardBlock" | "BookingBlock" | "UserManagementBlock";

type BlockProps = {
  HubDashboardBlock: {};
  BookingBlock: {};
  UserManagementBlock: {};
};

export type ParseBlocksProps<B extends Blocks = Blocks> = {
  blocks: B;
} & BlockProps[B];
