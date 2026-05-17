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
import { useSupplierCreateContext } from "../../SupplierCreateContext";
import { SupplierCreateStepProps } from "../SupplierCreateSteps";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";

interface Props extends SupplierCreateStepProps {
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
  const router = useRouter();
  const {
    form,
    submitting,
    submitted,
    createdCompanyName,
    submit,
    reset: resetContext,
    supplierUsers,
  } = useSupplierCreateContext();

  const values = form.watch();

  const handleBack = () => {
    previous();
    previousStep?.();
  };

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
  };

  const handleGoToList = () => {
    router.push("/admin/hub/user-management");
  };

  if (submitted) {
    return (
      <StepShell
        icon={<TaskAltOutlined />}
        title="Supplier Added"
        subtitle="The vendor is now active and can be referenced by future Purchase Orders."
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
            {createdCompanyName ?? "Supplier"} added
          </Heading>
          <Text size="2" color="gray" align="center">
            You can edit details, attach a logo, or link a portal user later
            from the Supplier list.
          </Text>
          <Flex gap="3" mt="3" wrap="wrap" justify="center">
            <Button type="Secondary" onClick={handleAddAnother}>
              <Flex align="center" gap="2">
                <RestartAltOutlined fontSize="small" />
                Add another
              </Flex>
            </Button>
            <Button type="Primary" onClick={handleGoToList}>
              Back to Supplier List
            </Button>
          </Flex>
        </Flex>
      </StepShell>
    );
  }

  const linkedUser = values.linkPortalUser
    ? supplierUsers.find((u) => u.userID === values.userID)
    : undefined;

  return (
    <StepShell
      icon={<CheckCircleOutlineOutlined />}
      title="Review & Create"
      subtitle="Confirm the details before adding this supplier."
      actions={
        <StepNavigation
          onBack={handleBack}
          onContinue={handleSubmit}
          continueText="Create Supplier"
          loading={submitting}
          continueDisabled={submitting}
        />
      }
    >
      <Flex direction="column" gap="4">
        <Flex align="center" gap="4" wrap="wrap">
          <ImageReader
            src={
              values.logoFile instanceof File
                ? URL.createObjectURL(values.logoFile)
                : null
            }
            alt={values.companyName || "New supplier"}
            size={88}
            radius="3"
            border
            fallbackText={values.companyName}
          />
          <Box style={{ flex: 1, minWidth: 200 }}>
            <Heading size="5" weight="bold">
              {values.companyName || "Unnamed supplier"}
            </Heading>
            <Flex align="center" gap="2" mt="1" wrap="wrap">
              <Badge color="amber" variant="soft" radius="full">
                {values.paymentTerms || "No terms"}
              </Badge>
              {values.contactPersonName && (
                <Text size="2" color="gray">
                  {values.contactPersonName}
                </Text>
              )}
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
            <Field label="Address" value={values.address} />
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            BUSINESS
          </Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <Field label="Tax ID" value={values.taxID} />
            <Field label="Payment Terms" value={values.paymentTerms} />
            <Field
              label="Portal User"
              value={linkedUser?.username ?? "Not linked"}
            />
          </Grid>
        </Box>

        {values.notes && (
          <>
            <Separator size="4" />
            <Box>
              <Text size="2" weight="bold" color="gray" as="div" mb="2">
                NOTES
              </Text>
              <Text size="2" as="div" style={{ whiteSpace: "pre-wrap" }}>
                {values.notes}
              </Text>
            </Box>
          </>
        )}

        <Callout.Root color="blue" variant="surface">
          <Callout.Text>
            <strong>Heads up:</strong> Company name must be unique. If the
            backend rejects the name as duplicate, you'll get an inline error
            and the form will stay on this step.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </StepShell>
  );
};
