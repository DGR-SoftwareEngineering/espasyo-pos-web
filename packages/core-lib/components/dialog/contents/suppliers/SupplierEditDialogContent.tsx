import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Callout,
  Checkbox,
  Flex,
  Grid,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  AlternateEmailOutlined,
  PhoneOutlined,
  BadgeOutlined,
  BusinessOutlined,
  LocationOnOutlined,
  PaymentsOutlined,
  PhotoCameraOutlined,
  InfoOutlined,
  PersonAddAlt1Outlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import {
  SupplierDto,
  UpdateSupplierParams,
  UserDto,
} from "../../../../api/commons/types";
import { toSelectOptionsWithField } from "../../../../business/array";
import { TextField } from "../../../radix/form/TextField";
import { SelectField } from "../../../radix/form/SelectField";
import { ImageUploadField } from "../../../radix/form/ImageUploadField";
import { ImageReader } from "../../../radix/ImageReader";
import { Button } from "../../../radix/buttons/Button";
import { FormErrorSummary } from "../../../radix/FormErrorSummary";
import { PAYMENT_TERMS_OPTIONS } from "./constants";

const schema = yup.object({
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2)
    .max(200, "Company name must not exceed 200 characters")
    .default(""),
  contactPersonName: yup.string().optional().max(150).default(""),
  email: yup
    .string()
    .optional()
    .test("optional-email", "Enter a valid email", (v) =>
      !v ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    )
    .max(200)
    .default(""),
  contactNumber: yup.string().optional().max(50).default(""),
  address: yup.string().optional().max(500).default(""),
  taxID: yup.string().optional().max(100).default(""),
  paymentTerms: yup.string().optional().max(100).default(""),
  notes: yup.string().optional().max(1000).default(""),
  userID: yup.string().optional().default(""),
  logoFile: yup
    .mixed<File>()
    .optional()
    .nullable()
    .test(
      "is-image",
      "File must be an image",
      (v) => !v || (v instanceof File && v.type.startsWith("image/")),
    )
    .test(
      "max-size",
      "Image must be 5 MB or smaller",
      (v) => !v || (v instanceof File && v.size <= 5 * 1024 * 1024),
    )
    .default(null),
  removeLogo: yup.boolean().optional().default(false),
});

type EditValues = yup.InferType<typeof schema>;

const FIELD_LABELS: Record<string, string> = {
  companyName: "Company Name",
  contactPersonName: "Contact Person",
  email: "Email",
  contactNumber: "Contact Number",
  address: "Address",
  taxID: "Tax ID",
  paymentTerms: "Payment Terms",
  notes: "Notes",
  userID: "Portal User",
  logoFile: "Company Logo",
};

export const SupplierEditDialogContent: React.FC<{
  supplier: SupplierDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ supplier, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const [linkPortal, setLinkPortal] = useState(!!supplier.userID);
  const [supplierUsers, setSupplierUsers] = useState<UserDto[]>([]);

  const rolesApi = useApi((api) => api.commons.roleList());
  const supplierRoleID = useMemo(() => {
    const raw = (rolesApi.result?.data.response ?? []) as unknown as Array<
      Record<string, unknown>
    >;
    const match = raw.find((r) => {
      const name =
        (r.roleName as string | undefined) ??
        (r.name as string | undefined) ??
        "";
      return name.toLowerCase() === "supplier";
    });
    if (!match) return undefined;
    return (
      (match.roleID as string | undefined) ??
      (match.roleId as string | undefined) ??
      (match.id as string | undefined)
    );
  }, [rolesApi.result?.data.response]);

  const supplierUsersCb = useApiCallback(
    async (api, roleID: string) => await api.commons.getUsersByRole(roleID),
  );

  useEffect(() => {
    if (!supplierRoleID) {
      setSupplierUsers([]);
      return;
    }
    supplierUsersCb
      .execute(supplierRoleID)
      .then((result) => {
        setSupplierUsers(result.data.response ?? []);
      })
      .catch(() => {
        setSupplierUsers([]);
      });
  }, [supplierRoleID]);

  const updateCb = useApiCallback(
    async (api, args: UpdateSupplierParams) =>
      await api.commons.updateSupplier(args),
  );

  const initial: EditValues = useMemo(
    () => ({
      companyName: supplier.companyName ?? "",
      contactPersonName: supplier.contactPersonName ?? "",
      email: supplier.email ?? "",
      contactNumber: supplier.contactNumber ?? "",
      address: supplier.address ?? "",
      taxID: supplier.taxID ?? "",
      paymentTerms: supplier.paymentTerms ?? "",
      notes: supplier.notes ?? "",
      userID: supplier.userID ?? "",
      logoFile: null,
      removeLogo: false,
    }),
    [supplier],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
  } = useForm<EditValues>({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: initial,
  });

  const paymentTermsOptions = useMemo(
    () =>
      PAYMENT_TERMS_OPTIONS.map((value) => ({
        value,
        label: value,
      })),
    [],
  );

  const userOptions = useMemo(
    () => toSelectOptionsWithField(supplierUsers, "userID", "username"),
    [supplierUsers],
  );

  const watchedLogo = watch("logoFile");
  const watchedRemoveLogo = watch("removeLogo");
  const showCurrentLogo = !!supplier.logoUrl && !watchedLogo;

  const onSubmit = async (values: EditValues) => {
    try {
      const payload: UpdateSupplierParams = { supplierID: supplier.supplierID };
      const trim = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
      const diff = (
        next: string | undefined,
        prev: string | null,
      ): string | undefined => {
        const a = next ?? "";
        const b = prev ?? "";
        return a === b ? undefined : a;
      };

      const companyName = trim(values.companyName);
      if (companyName && companyName !== supplier.companyName)
        payload.companyName = companyName;

      const cp = diff(trim(values.contactPersonName), supplier.contactPersonName);
      if (cp !== undefined) payload.contactPersonName = cp;

      const email = diff(trim(values.email), supplier.email);
      if (email !== undefined) payload.email = email;

      const phone = diff(trim(values.contactNumber), supplier.contactNumber);
      if (phone !== undefined) payload.contactNumber = phone;

      const address = diff(trim(values.address), supplier.address);
      if (address !== undefined) payload.address = address;

      const taxID = diff(trim(values.taxID), supplier.taxID);
      if (taxID !== undefined) payload.taxID = taxID;

      const terms = diff(trim(values.paymentTerms), supplier.paymentTerms);
      if (terms !== undefined) payload.paymentTerms = terms;

      const notes = diff(trim(values.notes), supplier.notes);
      if (notes !== undefined) payload.notes = notes;

      if (linkPortal) {
        const userID = trim(values.userID);
        if (userID && userID !== supplier.userID) payload.userID = userID;
      } else if (supplier.userID) {
        payload.userID = "";
      }

      if (values.logoFile instanceof File) {
        payload.logoFile = values.logoFile;
      } else if (values.removeLogo) {
        payload.removeLogo = true;
      }

      if (Object.keys(payload).length === 1) {
        showToast("No changes to save", "info");
        return;
      }

      const result = await updateCb.execute(payload);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast("Supplier updated successfully", "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to update supplier";
      showToast(message, "error");
    } catch (error) {
      console.error("Error updating supplier:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to update supplier";
      showToast(fallback, "error");
    }
  };

  return (
    <Box p="3">
      <Flex direction="column" gap="4">
        <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

        <Box>
          <Flex align="center" gap="2" mb="2">
            <BusinessOutlined
              style={{ fontSize: 18, color: "var(--accent-11)" }}
            />
            <Text size="2" weight="bold" color="gray">
              COMPANY INFO
            </Text>
          </Flex>
          <Grid columns={{ initial: "1", md: "2" }} gap="3">
            <TextField
              name="companyName"
              control={control}
              label="Company Name"
              placeholder="e.g. Acme Foods Inc."
            />
            <TextField
              name="contactPersonName"
              control={control}
              label="Contact Person"
              placeholder="e.g. Jane Smith"
            />
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" gap="2" mb="2">
            <AlternateEmailOutlined
              style={{ fontSize: 18, color: "var(--blue-11)" }}
            />
            <Text size="2" weight="bold" color="gray">
              CONTACT
            </Text>
          </Flex>
          <Grid columns={{ initial: "1", md: "2" }} gap="3">
            <TextField
              name="email"
              control={control}
              label="Email"
              type="email"
              placeholder="vendor@example.com"
              startAdornment={
                <AlternateEmailOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
            <TextField
              name="contactNumber"
              control={control}
              label="Contact Number"
              placeholder="+63 917 ..."
              startAdornment={
                <PhoneOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
          </Grid>
          <Box mt="3">
            <TextField
              name="address"
              control={control}
              label="Address"
              multiline
              rows={2}
              startAdornment={
                <LocationOnOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
          </Box>
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" gap="2" mb="2">
            <PaymentsOutlined
              style={{ fontSize: 18, color: "var(--amber-11)" }}
            />
            <Text size="2" weight="bold" color="gray">
              BUSINESS
            </Text>
          </Flex>
          <Grid columns={{ initial: "1", md: "2" }} gap="3">
            <TextField
              name="taxID"
              control={control}
              label="Tax ID"
              placeholder="e.g. 123-456-789-001"
              startAdornment={
                <BadgeOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
            <SelectField
              name="paymentTerms"
              control={control}
              options={paymentTermsOptions}
              label="Payment Terms"
              placeholder="Select payment terms"
            />
          </Grid>
          <Box mt="3">
            <TextField
              name="notes"
              control={control}
              label="Notes"
              multiline
              rows={3}
              placeholder="Any internal notes about this supplier"
            />
          </Box>
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" gap="2" mb="2">
            <PhotoCameraOutlined
              style={{ fontSize: 18, color: "var(--violet-11)" }}
            />
            <Text size="2" weight="bold" color="gray">
              COMPANY LOGO
            </Text>
          </Flex>
          <Flex direction="column" gap="3">
            {showCurrentLogo && (
              <Flex
                align="center"
                gap="3"
                p="3"
                style={{
                  borderRadius: "var(--radius-3)",
                  border: "1px solid var(--gray-a5)",
                  background: watchedRemoveLogo
                    ? "var(--red-a2)"
                    : "var(--gray-a2)",
                }}
              >
                <ImageReader
                  src={supplier.logoUrl}
                  alt="Current logo"
                  size={64}
                  radius="3"
                  border
                  fallbackText={supplier.companyName}
                  style={{
                    opacity: watchedRemoveLogo ? 0.4 : 1,
                    filter: watchedRemoveLogo ? "grayscale(0.6)" : undefined,
                  }}
                />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    size="2"
                    weight="bold"
                    as="div"
                    style={{
                      textDecoration: watchedRemoveLogo
                        ? "line-through"
                        : undefined,
                    }}
                  >
                    Current logo
                  </Text>
                  <Text size="1" color="gray" as="div">
                    {watchedRemoveLogo
                      ? "Will be removed when you save."
                      : "Drop a new image below to replace it."}
                  </Text>
                </Box>
                {watchedRemoveLogo ? (
                  <Button
                    type="Secondary"
                    onClick={() =>
                      setValue("removeLogo", false, { shouldDirty: true })
                    }
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    type="Critical"
                    onClick={() => {
                      setValue("logoFile", null, { shouldDirty: true });
                      setValue("removeLogo", true, { shouldDirty: true });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Flex>
            )}

            <ImageUploadField
              name="logoFile"
              control={control}
              label=""
              accept="image/*"
              maxSizeBytes={5 * 1024 * 1024}
            />
          </Flex>
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" justify="between" mb="2">
            <Flex align="center" gap="2">
              <PersonAddAlt1Outlined
                style={{ fontSize: 18, color: "var(--indigo-11)" }}
              />
              <Text size="2" weight="bold" color="gray">
                PORTAL ACCESS
              </Text>
            </Flex>
            <Flex
              align="center"
              gap="2"
              onClick={() => {
                const v = !linkPortal;
                setLinkPortal(v);
                if (!v) {
                  setValue("userID", "", { shouldDirty: true });
                }
              }}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              <Checkbox checked={linkPortal} />
              <Text size="2">Link portal user</Text>
            </Flex>
          </Flex>
          {linkPortal ? (
            <>
              <SelectField
                name="userID"
                control={control}
                options={userOptions}
                label="Linked User"
                isLoading={supplierUsersCb.loading || rolesApi.loading}
                placeholder={
                  supplierUsersCb.loading
                    ? "Loading supplier users…"
                    : userOptions.length === 0
                      ? "No supplier-role users available"
                      : "Pick a user"
                }
              />
              <Callout.Root color="blue" variant="surface" mt="2">
                <Callout.Icon>
                  <InfoOutlined style={{ fontSize: 18 }} />
                </Callout.Icon>
                <Callout.Text>
                  Only users with the <strong>Supplier</strong> role can be
                  linked. Create the user first under the User tab.
                </Callout.Text>
              </Callout.Root>
            </>
          ) : (
            <Text size="1" color="gray">
              No portal user linked. Toggle to link a Supplier-role user.
            </Text>
          )}
        </Box>

        <Flex justify="end" gap="3" mt="2">
          <Button
            type="Secondary"
            onClick={onClose}
            disabled={updateCb.loading}
          >
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleSubmit(onSubmit)}
            loading={updateCb.loading}
            disabled={!isValid || !isDirty || updateCb.loading}
          >
            Save Changes
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
