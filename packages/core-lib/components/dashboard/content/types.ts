import React from "react";

export type Blocks = "HubDashboardBlock" | "BookingBlock";

type BlockProps = {
  HubDashboardBlock: {};
  BookingBlock: {};
};

export type ParseBlocksProps<B extends Blocks = Blocks> = {
  blocks: B;
} & BlockProps[B];
