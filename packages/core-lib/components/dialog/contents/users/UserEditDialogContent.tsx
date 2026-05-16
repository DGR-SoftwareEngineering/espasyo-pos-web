import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Callout, Flex, Grid, Separator, Text } from "@radix-ui/themes";
import {
  AlternateEmailOutlined,
  PhoneOutlined,
  BadgeOutlined,
  KeyOutlined,
  PersonOutlineOutlined,
  PhotoCameraOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import {
  RoleDto,
  UpdateUserParams,
  UserDto,
} from "../../../../api/commons/types";
import { toSelectOptionsWithField } from "../../../../business/array";
import { TextField } from "../../../radix/form/TextField";
import { SelectField } from "../../../radix/form/SelectField";
import { ImageUploadField } from "../../../radix/form/ImageUploadField";
import { ImageReader } from "../../../radix/ImageReader";
import { Button } from "../../../radix/buttons/Button";
import { FormErrorSummary } from "../../../radix/FormErrorSummary";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const schema = yup.object({
  roleID: yup
    .string()
    .required("Role is required")
    .test("is-uuid", "Invalid role", (v) => !!v && UUID_REGEX.test(v))
    .default(""),
  firstName: yup.string().required("First name is required").max(100).default(""),
  middleName: yup.string().optional().max(100).default(""),
  lastName: yup.string().required("Last name is required").max(100).default(""),
  email: yup.string().required("Email is required").email().max(200).default(""),
  contactNumber: yup
    .string()
    .required("Contact number is required")
    .max(50)
    .default(""),
  licenseNumber: yup.string().optional().max(100).default(""),
  password: yup
    .string()
    .optional()
    .test(
      "min-length-when-set",
      "Password must be at least 6 characters",
      (v) => !v || v.length >= 6,
    )
    .max(100, "Password must not exceed 100 characters")
    .default(""),
  imageFile: yup
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
  removeImage: yup.boolean().optional().default(false),
});

type EditValues = yup.InferType<typeof schema>;

const FIELD_LABELS: Record<string, string> = {
  roleID: "Role",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  contactNumber: "Contact Number",
  password: "Password",
  imageFile: "Profile Photo",
};

export const UserEditDialogContent: React.FC<{
  user: UserDto;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ user, onSuccess, onClose }) => {
  const { showToast } = useToastContext();
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const rolesApi = useApi((api) => api.commons.roleList());
  useEffect(() => {
    const raw = (rolesApi.result?.data.response ?? []) as unknown as Array<
      Record<string, unknown>
    >;
    const seen = new Set<string>();
    const normalized: RoleDto[] = [];
    for (const r of raw) {
      const id =
        (r.roleID as string | undefined) ??
        (r.roleId as string | undefined) ??
        (r.id as string | undefined) ??
        "";
      if (!id || seen.has(id)) continue;
      seen.add(id);
      normalized.push({
        ...(r as unknown as RoleDto),
        roleID: id,
        roleName: (r.roleName as string) ?? (r.name as string) ?? "",
      });
    }
    setRoles(normalized);
  }, [rolesApi.result?.data.response]);

  const updateCb = useApiCallback(
    async (api, args: UpdateUserParams) => await api.commons.updateUser(args),
  );

  const initial: EditValues = useMemo(
    () => ({
      roleID: user.roleID ?? "",
      firstName: user.userInfo?.firstName ?? "",
      middleName: user.userInfo?.middleName ?? "",
      lastName: user.userInfo?.lastName ?? "",
      email: user.userInfo?.email ?? "",
      contactNumber: user.userInfo?.contactNumber ?? "",
      licenseNumber: user.userInfo?.licenseNumber ?? "",
      password: "",
      imageFile: null,
      removeImage: false,
    }),
    [user],
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

  const roleOptions = useMemo(
    () => toSelectOptionsWithField(roles ?? [], "roleID", "roleName"),
    [roles],
  );

  const watchedImage = watch("imageFile");
  const watchedRemoveImage = watch("removeImage");
  const showCurrentImage = !!user.userInfo?.imageUrl && !watchedImage;

  const onSubmit = async (values: EditValues) => {
    try {
      const payload: UpdateUserParams = { userID: user.userID };
      const fmtTrim = (v: string | undefined) =>
        v && v.trim() ? v.trim() : undefined;

      if (values.roleID && values.roleID !== user.roleID) {
        payload.roleID = values.roleID;
      }
      const firstName = fmtTrim(values.firstName);
      if (firstName && firstName !== user.userInfo?.firstName)
        payload.firstName = firstName;
      const middleName = fmtTrim(values.middleName);
      if (
        (middleName ?? "") !== (user.userInfo?.middleName ?? "") &&
        middleName !== undefined
      ) {
        payload.middleName = middleName;
      }
      const lastName = fmtTrim(values.lastName);
      if (lastName && lastName !== user.userInfo?.lastName)
        payload.lastName = lastName;
      const email = fmtTrim(values.email);
      if (email && email !== user.userInfo?.email) payload.email = email;
      const contactNumber = fmtTrim(values.contactNumber);
      if (contactNumber && contactNumber !== user.userInfo?.contactNumber)
        payload.contactNumber = contactNumber;
      const licenseNumber = fmtTrim(values.licenseNumber);
      if (
        (licenseNumber ?? "") !== (user.userInfo?.licenseNumber ?? "") &&
        licenseNumber !== undefined
      ) {
        payload.licenseNumber = licenseNumber;
      }
      const password = fmtTrim(values.password);
      if (password) payload.password = password;
      if (values.imageFile instanceof File) {
        payload.imageFile = values.imageFile;
      } else if (values.removeImage) {
        payload.removeImage = true;
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
        showToast("User updated successfully", "success");
        onSuccess();
        onClose();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to update user";
      showToast(message, "error");
    } catch (error) {
      console.error("Error updating user:", error);
      const fallback =
        Array.isArray(error) && typeof error[0] === "string"
          ? (error[0] as string)
          : "Failed to update user";
      showToast(fallback, "error");
    }
  };

  return (
    <Box p="3">
      <Flex direction="column" gap="4">
        <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            ROLE & ACCOUNT
          </Text>
          <Grid columns={{ initial: "1", md: "2" }} gap="3">
            <SelectField
              name="roleID"
              control={control}
              options={roleOptions}
              label="Role"
              isLoading={rolesApi.loading}
            />
            <Box>
              <Text
                as="label"
                size="2"
                weight="medium"
                style={{ display: "block", marginBottom: 4 }}
              >
                Username
              </Text>
              <Box
                p="2"
                px="3"
                style={{
                  borderRadius: "var(--radius-2)",
                  background: "var(--gray-a2)",
                  border: "1px solid var(--gray-a4)",
                  color: "var(--gray-11)",
                }}
              >
                <Text size="2">@{user.username ?? "—"}</Text>
              </Box>
              <Text size="1" color="gray" as="div" mt="1">
                Usernames are immutable. To rename, create a new account.
              </Text>
            </Box>
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            PERSONAL
          </Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <TextField
              name="firstName"
              control={control}
              label="First Name"
              startAdornment={
                <PersonOutlineOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
            <TextField
              name="middleName"
              control={control}
              label="Middle Name"
            />
            <TextField name="lastName" control={control} label="Last Name" />
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Text size="2" weight="bold" color="gray" as="div" mb="2">
            CONTACT
          </Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <TextField
              name="email"
              control={control}
              label="Email"
              type="email"
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
              startAdornment={
                <PhoneOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
            <TextField
              name="licenseNumber"
              control={control}
              label="License Number"
              startAdornment={
                <BadgeOutlined
                  style={{ fontSize: 16, color: "var(--gray-10)" }}
                />
              }
            />
          </Grid>
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" justify="between" mb="2">
            <Text size="2" weight="bold" color="gray">
              SECURITY
            </Text>
            <Button
              type={showPasswordReset ? "Secondary" : "Primary"}
              size="1"
              onClick={() => {
                if (showPasswordReset) {
                  setValue("password", "", { shouldDirty: true });
                }
                setShowPasswordReset((v) => !v);
              }}
            >
              <Flex align="center" gap="2">
                <KeyOutlined fontSize="small" />
                {showPasswordReset ? "Cancel reset" : "Reset password"}
              </Flex>
            </Button>
          </Flex>
          {showPasswordReset ? (
            <>
              <TextField
                name="password"
                control={control}
                label="New Password"
                placeholder="At least 6 characters"
                type="password"
                showPasswordToggle
              />
              <Callout.Root color="amber" variant="surface" mt="2">
                <Callout.Icon>
                  <InfoOutlined style={{ fontSize: 18 }} />
                </Callout.Icon>
                <Callout.Text>
                  The user will need to sign in with this new password. They
                  won't be notified automatically.
                </Callout.Text>
              </Callout.Root>
            </>
          ) : (
            <Text size="1" color="gray">
              Password unchanged. Toggle to set a new one.
            </Text>
          )}
        </Box>

        <Separator size="4" />

        <Box>
          <Flex align="center" gap="2" mb="2">
            <PhotoCameraOutlined
              style={{ fontSize: 18, color: "var(--violet-11)" }}
            />
            <Text size="2" weight="bold" color="gray">
              PROFILE PHOTO
            </Text>
          </Flex>
          <Flex direction="column" gap="3">
            {showCurrentImage && (
              <Flex
                align="center"
                gap="3"
                p="3"
                style={{
                  borderRadius: "var(--radius-3)",
                  border: "1px solid var(--gray-a5)",
                  background: watchedRemoveImage
                    ? "var(--red-a2)"
                    : "var(--gray-a2)",
                }}
              >
                <ImageReader
                  src={user.userInfo?.imageUrl}
                  alt="Current profile photo"
                  size={56}
                  radius="full"
                  border
                  fallbackText={user.userInfo?.firstName}
                  style={{
                    opacity: watchedRemoveImage ? 0.4 : 1,
                    filter: watchedRemoveImage
                      ? "grayscale(0.6)"
                      : undefined,
                  }}
                />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    size="2"
                    weight="bold"
                    as="div"
                    style={{
                      textDecoration: watchedRemoveImage
                        ? "line-through"
                        : undefined,
                    }}
                  >
                    Current photo
                  </Text>
                  <Text size="1" color="gray" as="div">
                    {watchedRemoveImage
                      ? "Will be removed when you save."
                      : "Drop a new image below to replace it."}
                  </Text>
                </Box>
                {watchedRemoveImage ? (
                  <Button
                    type="Secondary"
                    onClick={() =>
                      setValue("removeImage", false, { shouldDirty: true })
                    }
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    type="Critical"
                    onClick={() => {
                      setValue("imageFile", null, { shouldDirty: true });
                      setValue("removeImage", true, { shouldDirty: true });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Flex>
            )}

            <ImageUploadField
              name="imageFile"
              control={control}
              label=""
              accept="image/*"
              maxSizeBytes={5 * 1024 * 1024}
            />
          </Flex>
        </Box>

        <Flex justify="end" gap="3" mt="2">
          <Button type="Secondary" onClick={onClose} disabled={updateCb.loading}>
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
