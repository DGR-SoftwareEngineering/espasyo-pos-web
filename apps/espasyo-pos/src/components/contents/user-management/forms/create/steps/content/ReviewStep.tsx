import React from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  CheckCircleOutlineOutlined,
  TaskAltOutlined,
  RestartAltOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { Button } from "core-lib/components/radix/buttons/Button";
import { useUserCreateContext } from "../../UserCreateContext";
import { UserCreateStepProps } from "../UserCreateSteps";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

interface Props extends UserCreateStepProps {
  onSave: () => void;
}

const Field: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <Box>
    <Text size="1" color="gray" as="div">
      {label}
    </Text>
    <Text size="2" weight="medium" as="div">
      {value && value.trim() ? value : "—"}
    </Text>
  </Box>
);

export const ReviewStep: React.FC<Props> = ({
  previous,
  resetStep,
  reset,
  previousStep,
}) => {
  const handleBack = () => {
    previous();
    previousStep?.();
  };
  const router = useRouter();
  const {
    form,
    submitting,
    submitted,
    createdUserName,
    submit,
    reset: resetContext,
    roles,
  } = useUserCreateContext();

  const values = form.watch();
  const role = roles.find((r) => r.roleID === values.roleID);
  const fullName = [values.firstName, values.middleName, values.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const ok = await submit(values);
    if (ok) {
      reset();
    }
  };

  const handleAddAnother = () => {
    resetContext();
    resetStep();
    reset();
  };

  const handleGoToList = () => {
    router.push("/admin/hub/user-management");
  };

  if (submitted) {
    return (
      <StepShell
        icon={<TaskAltOutlined />}
        title="User Created"
        subtitle="The new account is active and can sign in immediately."
        iconAccent="var(--green-11)"
      >
        <Flex direction="column" align="center" gap="3" py="4">
          <Box
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "var(--green-a3)",
              color: "var(--green-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleOutlineOutlined style={{ fontSize: 56 }} />
          </Box>
          <Heading size="6" align="center">
            {createdUserName ?? "User"} added
          </Heading>
          <Text size="2" color="gray" align="center">
            They can sign in with username{" "}
            <Text weight="bold" color="gray">
              {values.username}
            </Text>{" "}
            using the password you set.
          </Text>
          <Flex gap="3" mt="3" wrap="wrap" justify="center">
            <Button type="Secondary" onClick={handleAddAnother}>
              <Flex align="center" gap="2">
                <RestartAltOutlined fontSize="small" />
                Add another
              </Flex>
            </Button>
            <Button type="Primary" onClick={handleGoToList}>
              Back to User List
            </Button>
          </Flex>
        </Flex>
      </StepShell>
    );
  }

  return (
    <StepShell
      icon={<CheckCircleOutlineOutlined />}
      title="Review & Create"
      subtitle="One last look before the account is created."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleSubmit}
          continueText="Create User"
          loading={submitting}
          continueDisabled={submitting}
        />
      }
    >
      <Flex direction="column" gap="4">
        <Flex align="center" gap="4" wrap="wrap">
          <ImageReader
            src={
              values.imageFile instanceof File
                ? URL.createObjectURL(values.imageFile)
                : null
            }
            alt={fullName || "New user"}
            size={88}
            radius="3"
            border
            fallbackText={fullName}
          />
          <Box style={{ flex: 1, minWidth: 200 }}>
            <Heading size="5" weight="bold">
              {fullName || "Unnamed user"}
            </Heading>
            <Flex align="center" gap="2" mt="1" wrap="wrap">
              <Badge color="indigo" variant="soft" radius="full">
                {role?.roleName ?? "No role"}
              </Badge>
              <Text size="2" color="gray">
                @{values.username}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            CONTACT
          </Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <Field label="Email" value={values.email} />
            <Field label="Contact Number" value={values.contactNumber} />
            <Field label="License Number" value={values.licenseNumber} />
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            ACCOUNT
          </Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <Field label="Username" value={values.username} />
            <Field label="Role" value={role?.roleName} />
            <Field
              label="Password"
              value={values.password ? "•".repeat(values.password.length) : "—"}
            />
          </Grid>
        </Box>

        <Callout.Root color="blue" variant="surface">
          <Callout.Text>
            <strong>Heads up:</strong> the user can log in immediately after
            creation. You can edit details, reset password, or deactivate the
            account from the User List.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </StepShell>
  );
};
