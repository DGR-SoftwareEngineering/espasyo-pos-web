import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";
import { PersonSearchOutlined } from "@mui/icons-material";
import { Control, Controller, useWatch } from "react-hook-form";
import { CustomerSegment, CustomerSearchResultDto } from "core-lib/api/crm";
import { useApiCallback } from "core-lib/core/hooks";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { FormSection } from "core-lib/components/radix/FormSection";
import { SegmentBadge } from "../../crm/components/SegmentBadge";
import { CustomerSearchInput } from "../../crm/components/CustomerSearchInput";
import { PromoForm } from "./validation";

const SEGMENT_OPTIONS = [
  { value: "all", label: "All customers (no segment restriction)" },
  { value: String(CustomerSegment.New), label: "New" },
  { value: String(CustomerSegment.Regular), label: "Regular" },
  { value: String(CustomerSegment.VIP), label: "VIP" },
  { value: String(CustomerSegment.Occasional), label: "Occasional" },
  { value: String(CustomerSegment.AtRisk), label: "At Risk" },
];

interface CustomerTargetingSectionProps {
  control: Control<PromoForm>;
  /** Pre-attached customers (loaded server-side when editing). Optional. */
  preloadedAssigned?: CustomerSearchResultDto[];
}

export const CustomerTargetingSection: React.FC<CustomerTargetingSectionProps> = ({
  control,
  preloadedAssigned,
}) => {
  const targetSegment = useWatch({ control, name: "targetSegment" });
  const segmentFilter = targetSegment != null ? String(targetSegment) : "all";

  return (
    <Box mt="4">
      <FormSection
        icon={<PersonSearchOutlined style={{ color: "var(--cyan-11)" }} />}
        title="Customer Targeting"
        description="Optionally restrict this promo to a customer segment, loyalty tier, or specific pinned customers. Leave everything blank for an unrestricted promo."
      >
        <Flex direction="column" gap="3">
          <Flex gap="3" wrap="wrap">
            <Box style={{ flex: "1 1 240px" }}>
              <SelectField
                name="targetSegment"
                control={control}
                label="Target Segment"
                options={SEGMENT_OPTIONS}
              />
            </Box>
            <Box style={{ flex: "1 1 200px" }}>
              <TextField
                name="minLoyaltyStamps"
                control={control}
                label="Min Loyalty Stamps"
                type="number"
                placeholder="e.g. 6"
              />
            </Box>
          </Flex>

          <Controller
            name="assignedCustomerIds"
            control={control}
            render={({ field }) => (
              <AssignedCustomersInput
                value={(field.value as string[]) ?? []}
                onChange={(ids) => field.onChange(ids)}
                preloaded={preloadedAssigned}
                segment={segmentFilter}
              />
            )}
          />
        </Flex>
      </FormSection>
    </Box>
  );
};

interface AssignedCustomersInputProps {
  value: string[];
  onChange: (ids: string[]) => void;
  preloaded?: CustomerSearchResultDto[];
  segment?: string;
}

/**
 * Multi-select customer picker. Tracks displayed customer info locally so
 * we can show chips immediately. The form only stores IDs.
 */
const AssignedCustomersInput: React.FC<AssignedCustomersInputProps> = ({
  value,
  onChange,
  preloaded,
  segment,
}) => {
  const [pinned, setPinned] = useState<CustomerSearchResultDto[]>(
    preloaded ?? [],
  );

  // For edit mode: hydrate display info for any IDs we don't have yet.
  const searchCb = useApiCallback(async (api, q: string) => api.crm.search(q));

  useEffect(() => {
    if (!preloaded) return;
    setPinned(preloaded);
  }, [preloaded]);

  // Ensure value <-> pinned stay in sync if value changes externally.
  useEffect(() => {
    const knownIds = new Set(pinned.map((p) => p.customerID));
    const allKnown = value.every((id) => knownIds.has(id));
    if (allKnown) return;
    // Fetch the unknown ones one-by-one by searching for their IDs is not viable,
    // so we just drop the unknown IDs to display — they remain in `value` so the
    // backend still sees them. The UI will refresh from preloaded on next mount.
    // (No-op intentionally.)
  }, [value, pinned]);

  const handleAdd = (c: CustomerSearchResultDto) => {
    if (value.includes(c.customerID)) return;
    setPinned((prev) => [...prev, c]);
    onChange([...value, c.customerID]);
  };

  const handleRemove = (id: string) => {
    setPinned((prev) => prev.filter((p) => p.customerID !== id));
    onChange(value.filter((v) => v !== id));
  };

  return (
    <Box>
      <Text size="2" weight="medium" as="div" mb="1">
        Pinned Customers <Text as="span" size="1" color="gray">({value.length} selected)</Text>
      </Text>

      <Box
        style={{
          border: "1px solid var(--gray-a6)",
          borderRadius: 8,
          padding: 10,
          background: "var(--color-background)",
        }}
      >
        {pinned.length > 0 && (
          <Flex gap="2" wrap="wrap" mb="2">
            {pinned.map((c) => (
              <Badge key={c.customerID} color="cyan" variant="soft" size="2" style={{ gap: 6 }}>
                {c.fullName}{" "}
                <Text size="1" color="gray">
                  {c.customerNumber}
                </Text>
                <SegmentBadge segment={c.segment} size="1" />
                <Tooltip content="Remove">
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={() => handleRemove(c.customerID)}
                  >
                    <Cross1Icon />
                  </IconButton>
                </Tooltip>
              </Badge>
            ))}
          </Flex>
        )}

        <CustomerSearchInput
          placeholder="Search a customer to pin (phone, name, or customer #)…"
          excludeIds={value}
          onSelect={handleAdd}
          hint="Pinned customers always qualify for this promo, even outside the segment."
          adminMode
          filterSegment={segment}
        />
      </Box>
    </Box>
  );
};
