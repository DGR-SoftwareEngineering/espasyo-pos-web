import React from "react";
import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import {
  PersonOutlined,
  ContactPageOutlined,
  CakeOutlined,
  LocalOfferOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { useCustomerForm } from "../hooks/useCustomerForm";
import { TagsField } from "./TagsField";
import { CustomerFormProps } from "./types";
import { SUBMISSION_KEYS, SUGGESTED_TAGS } from "../constants";
import { CustomerFormType } from "./validation";

const FIELD_LABELS: Record<keyof CustomerFormType, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  city: "City",
  birthday: "Birthday",
  tags: "Tags",
};

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  submitLoading,
  isEdit,
  isInDialog,
  initialValues,
}) => {
  const {
    control,
    formState,
    isDirty,
    submitForm,
  } = useCustomerForm({
    initialValues,
    isEdit,
    isInDialog,
    onSubmit,
  });

  return (
    <Box>
      <Box p="5">
        <Flex direction="column" gap="5">
          <FormErrorSummary
            errors={formState.errors}
            fieldLabels={FIELD_LABELS as Record<string, string>}
          />

          <FormSection
            icon={<PersonOutlined style={{ color: "var(--indigo-11)" }} />}
            title="Identity"
            description={
              <Text size="2" color="gray">
                Required basics — used on receipts and loyalty cards.
              </Text>
            }
          >
            <Grid columns={{ initial: "1", sm: "2" }} gap="3">
              <TextField
                name="firstName"
                control={control}
                label="First Name *"
                placeholder="Juan"
                size="2"
              />
              <TextField
                name="lastName"
                control={control}
                label="Last Name *"
                placeholder="Dela Cruz"
                size="2"
              />
            </Grid>
          </FormSection>

          <FormSection
            icon={<ContactPageOutlined style={{ color: "var(--cyan-11)" }} />}
            title="Contact"
            description={
              <Text size="2" color="gray">
                Phone is searchable at the POS. Email is unique across active customers.
              </Text>
            }
          >
            <Grid columns={{ initial: "1", sm: "2" }} gap="3">
              <TextField
                name="phone"
                control={control}
                label="Phone"
                placeholder="0917XXXXXXX"
                size="2"
              />
              <TextField
                name="email"
                control={control}
                label="Email"
                placeholder="juan@example.com"
                size="2"
              />
              <TextField
                name="address"
                control={control}
                label="Address"
                placeholder="Street, Barangay…"
                size="2"
              />
              <TextField
                name="city"
                control={control}
                label="City"
                placeholder="Quezon City"
                size="2"
              />
            </Grid>
          </FormSection>

          <FormSection
            icon={<CakeOutlined style={{ color: "var(--pink-11)" }} />}
            title="Birthday"
            description={
              <Text size="2" color="gray">
                Use MM-DD format (e.g. <strong>03-25</strong> for March 25). Year is intentionally not stored.
              </Text>
            }
          >
            <Box style={{ maxWidth: 220 }}>
              <TextField
                name="birthday"
                control={control}
                label="Birthday (MM-DD)"
                placeholder="03-25"
                size="2"
              />
            </Box>
          </FormSection>

          <FormSection
            icon={<LocalOfferOutlined style={{ color: "var(--orange-11)" }} />}
            title="Tags"
            description={
              <Text size="2" color="gray">
                Use tags to label customers (e.g. <strong>VIP</strong>, <strong>Coffee Lover</strong>). Max 10 tags.
              </Text>
            }
          >
            <TagsField
              name="tags"
              control={control}
              suggestions={SUGGESTED_TAGS}
            />
          </FormSection>
        </Flex>
      </Box>

      <FormActions
        isEdit={isEdit}
        isValid={formState.isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create}
        onButtonClick={submitForm}
        buttonText={isEdit ? "Save Changes" : "Create Customer"}
      />
    </Box>
  );
};
