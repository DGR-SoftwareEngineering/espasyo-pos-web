import React from "react";
import { Box, Callout, Checkbox, Flex, Text } from "@radix-ui/themes";
import {
  PersonAddAlt1Outlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useWatch } from "react-hook-form";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { SupplierCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "linkPortalUser",
  "userID",
] as const satisfies ReadonlyArray<keyof SupplierCreateForm>;

export const PortalStep: React.FC<SupplierCreateStepProps> = ({
  next,
  previous,
  nextStep,
  previousStep,
}) => {
  const {
    form,
    supplierUsers,
    supplierUsersLoading,
    supplierRoleAvailable,
  } = useSupplierCreateContext();
  const { control, trigger, getValues, setValue } = form;

  const linkPortalUser =
    useWatch({ control, name: "linkPortalUser" }) ?? false;

  const userOptions = React.useMemo(
    () => toSelectOptionsWithField(supplierUsers ?? [], "userID", "username"),
    [supplierUsers],
  );

  const handleContinue = async () => {
    const ok = await trigger([...FIELDS_IN_STEP]);
    if (ok) {
      next();
      nextStep?.(getValues());
    }
  };

  const handleBack = () => {
    previous();
    previousStep?.();
  };

  return (
    <StepShell
      icon={<PersonAddAlt1Outlined />}
      title="Portal Access"
      subtitle="Most suppliers don't need a login. Skip unless this vendor will sign in to upload invoices or check POs."
      iconAccent="var(--indigo-11)"
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="3">
        <Flex
          align="center"
          gap="2"
          onClick={() => {
            const v = !linkPortalUser;
            setValue("linkPortalUser", v, { shouldDirty: true });
            if (!v) {
              setValue("userID", "", { shouldDirty: true });
            }
          }}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <Checkbox checked={linkPortalUser} />
          <Text size="2" weight="medium">
            Link this supplier to a portal user account
          </Text>
        </Flex>

        {linkPortalUser ? (
          <Box>
            <SelectField
              name="userID"
              control={control}
              options={userOptions}
              label="Linked User"
              isLoading={supplierUsersLoading}
              placeholder={
                supplierUsersLoading
                  ? "Loading supplier users…"
                  : !supplierRoleAvailable
                    ? "Supplier role not configured yet"
                    : userOptions.length === 0
                      ? "No supplier-role users available"
                      : "Pick a user"
              }
              disabled={!supplierRoleAvailable || userOptions.length === 0}
            />
            <Callout.Root color="blue" variant="surface" mt="2">
              <Callout.Icon>
                <InfoOutlined style={{ fontSize: 18 }} />
              </Callout.Icon>
              <Callout.Text>
                Only users with the <strong>Supplier</strong> role can be
                linked. If none exist, create one first under the User tab.
              </Callout.Text>
            </Callout.Root>
          </Box>
        ) : (
          <Callout.Root color="gray" variant="surface">
            <Callout.Icon>
              <InfoOutlined style={{ fontSize: 18 }} />
            </Callout.Icon>
            <Callout.Text>
              You can link a portal user later by editing the supplier.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </StepShell>
  );
};
