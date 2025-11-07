import React from "react";

export type Blocks =
  | "HubDashboardBlock"
  | "BookingBlock"
  | "AccountManagementBlock";

type BlockProps = {
  HubDashboardBlock: {};
  BookingBlock: {};
  AccountManagementBlock: {};
};

export type ParseBlocksProps<B extends Blocks = Blocks> = {
  blocks: B;
} & BlockProps[B];
