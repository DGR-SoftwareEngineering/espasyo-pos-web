import React from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Grid,
} from "@radix-ui/themes";;
import { PersonOutlined, KeyOutlined, BadgeOutlined } from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { useUserCreateContext } from "../../UserCreateContext";
import { UserCreateStepProps } from "../UserCreateSteps";
import { UserCreateForm } from "../../validation";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

const FIELDS_IN_STEP = [
  "roleID",
  "username",
  "password",
  "confirmPassword",
] as const satisfies ReadonlyArray<keyof UserCreateForm>;

export const AccountStep: React.FC<UserCreateStepProps> = ({
  next,
  nextStep,
}) => {
  const { form, roles, rolesLoading } = useUserCreateContext();
  const { control, trigger, getValues } = form;

  const roleOptions = React.useMemo(
    () => toSelectOptionsWithField(roles ?? [], "roleID", "roleName"),
    [roles],
  );

  const handleContinue = async () => {
    const ok = await trigger([...FIELDS_IN_STEP]);
    if (ok) {
      next();
      nextStep?.(getValues());
    }
  };

  return (
    <StepShell
      icon={<BadgeOutlined />}
      title="Account & Role"
      subtitle="Pick the role this user will have, then set their login credentials."
      iconAccent="var(--accent-11)"
      actions={
        <StepNavigation
          hideBack
          onContinue={handleContinue}
          continueText="Continue"
        />
      }
    >
      <Flex direction="column" gap="4">
        <Box>
          <SelectField
            name="roleID"
            control={control}
            options={roleOptions}
            label="Role"
            isLoading={rolesLoading}
            placeholder={rolesLoading ? "Loading roles…" : "Select a role"}
          />
          <Text size="1" color="gray" as="div" mt="1">
            Permissions and menu visibility are driven by this role.
          </Text>
        </Box>

        <Box>
          <TextField
            name="username"
            control={control}
            label="Username"
            placeholder="e.g. cashier1"
            startAdornment={
              <PersonOutlined style={{ fontSize: 16, color: "var(--gray-10)" }} />
            }
          />
          <Text size="1" color="gray" as="div" mt="1">
            3–50 characters. Letters, numbers, dot, underscore, hyphen.
          </Text>
        </Box>

        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          <TextField
            name="password"
            control={control}
            label="Password"
            placeholder="At least 6 characters"
            type="password"
            showPasswordToggle
            startAdornment={
              <KeyOutlined style={{ fontSize: 16, color: "var(--gray-10)" }} />
            }
          />
          <TextField
            name="confirmPassword"
            control={control}
            label="Confirm Password"
            placeholder="Re-enter password"
            type="password"
            showPasswordToggle
            startAdornment={
              <KeyOutlined style={{ fontSize: 16, color: "var(--gray-10)" }} />
            }
          />
        </Grid>
      </Flex>
    </StepShell>
  );
};
