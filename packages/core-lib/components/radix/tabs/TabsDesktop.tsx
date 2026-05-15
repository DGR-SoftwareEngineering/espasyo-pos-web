import React from "react";
import { Flex } from "@radix-ui/themes";
import { TabOption } from "../../tabs/types";
import { Tab } from "./Tab";

interface Props {
  id?: string;
  tabs: Array<TabOption>;
  "aria-label"?: string;
  activeIndex?: number;
  onChange?: (index: number) => void;
}

export const TabsDesktop: React.FC<Props> = ({
  id,
  tabs,
  activeIndex = 0,
  onChange,
  ...other
}) => (
  <Flex
    id={id}
    role="tablist"
    align="center"
    gap="1"
    mb="3"
    style={{ borderBottom: "1px solid var(--gray-a4)" }}
    {...other}
  >
    {tabs.map((tab, index) => (
      <Tab
        key={`${tab.key}_${index}`}
        id={`${tab.key}_tab_${index}`}
        label={tab.label ?? tab.key}
        active={activeIndex === index}
        onClick={() => onChange?.(index)}
      />
    ))}
  </Flex>
);
