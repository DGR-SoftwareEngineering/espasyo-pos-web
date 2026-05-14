import React from "react";
import { Tabs as RadixTabs, Box } from "@radix-ui/themes";

export interface TabItem {
  /** Unique stable identifier. */
  value: string;
  /** Trigger label. */
  label: React.ReactNode;
  /** Panel contents. */
  content: React.ReactNode;
  disabled?: boolean;
}

interface Props {
  items: TabItem[];
  /** Uncontrolled default selected tab. */
  defaultValue?: string;
  /** Controlled value (use with `onValueChange`). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Radix Themes size: "1" | "2" — controls trigger/text size. */
  size?: "1" | "2";
  className?: string;
}

export const Tabs: React.FC<Props> = ({
  items,
  defaultValue,
  value,
  onValueChange,
  size = "2",
  className,
}) => {
  const initial = defaultValue ?? items[0]?.value;

  return (
    <RadixTabs.Root
      defaultValue={initial}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <RadixTabs.List size={size}>
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value}>
          <Box pt="4">{item.content}</Box>
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
