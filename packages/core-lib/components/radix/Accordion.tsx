import React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Box, Text } from "@radix-ui/themes";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  /** "single" closes other panels when one opens; "multiple" lets all open. */
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  collapsible?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  type = "single",
  defaultValue,
  collapsible = true,
  className,
}) => {
  const rootProps =
    type === "single"
      ? {
          type: "single" as const,
          defaultValue: defaultValue as string | undefined,
          collapsible,
        }
      : {
          type: "multiple" as const,
          defaultValue: defaultValue as string[] | undefined,
        };

  return (
    <RadixAccordion.Root
      {...rootProps}
      className={className}
      style={{
        border: "1px solid var(--gray-a4)",
        borderRadius: "var(--radius-3)",
        background: "var(--color-panel-solid)",
      }}
    >
      {items.map((item, idx) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id}
          disabled={item.disabled}
          style={{
            borderTop: idx === 0 ? "none" : "1px solid var(--gray-a4)",
          }}
        >
          <RadixAccordion.Header asChild>
            <RadixAccordion.Trigger
              style={{
                all: "unset",
                width: "100%",
                cursor: item.disabled ? "not-allowed" : "pointer",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                opacity: item.disabled ? 0.5 : 1,
              }}
            >
              <Text size="2" weight="medium">
                {item.title}
              </Text>
              <ChevronDownIcon
                aria-hidden
                style={{
                  transition: "transform 0.2s ease",
                }}
                className="accordion-chevron"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content>
            <Box px="4" pb="3">
              {item.content}
            </Box>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}

      {/* Chevron rotates when the parent item is open. */}
      <style>{`
        [data-state="open"] .accordion-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </RadixAccordion.Root>
  );
};
