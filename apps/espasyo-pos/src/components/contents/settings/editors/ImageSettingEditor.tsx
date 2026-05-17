import React, { useRef, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { UploadIcon, ImageIcon } from "@radix-ui/react-icons";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { SystemSettingDto } from "core-lib/api/commons/types";
import { ImageReader } from "core-lib/components/radix/ImageReader";
import { Button } from "core-lib/components/radix/buttons/Button";

interface Props {
  setting: SystemSettingDto;
  onUploaded: (updated: SystemSettingDto) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

export const ImageSettingEditor: React.FC<Props> = ({ setting, onUploaded }) => {
  const { showToast } = useToastContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const uploadCb = useApiCallback(
    async (api, args: { key: string; file: File }) =>
      await api.commons.uploadSettingImage(args),
  );

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("File must be an image", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast("Image must be 10 MB or smaller", "error");
      return;
    }
    setPendingFile(file);
    try {
      const result = await uploadCb.execute({ key: setting.key, file });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success &&
        result.data.response
      ) {
        showToast("Image uploaded", "success");
        onUploaded(result.data.response);
        setPendingFile(null);
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to upload image";
      showToast(message, "error");
      setPendingFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image", "error");
      setPendingFile(null);
    }
  };

  return (
    <Flex align="center" gap="3" wrap="wrap">
      <Box
        style={{
          width: 64,
          height: 64,
          borderRadius: "var(--radius-3)",
          background: "var(--gray-a3)",
          border: "1px solid var(--gray-a4)",
          overflow: "hidden",
        }}
      >
        {setting.value ? (
          <ImageReader
            src={setting.value}
            alt={setting.key}
            size={64}
            radius="3"
          />
        ) : (
          <Flex
            align="center"
            justify="center"
            style={{ width: 64, height: 64, color: "var(--gray-10)" }}
          >
            <ImageIcon width={28} height={28} />
          </Flex>
        )}
      </Box>

      <Flex direction="column" gap="1" style={{ minWidth: 0, flex: 1 }}>
        <Text size="2" truncate>
          {setting.value || "No image set"}
        </Text>
        {pendingFile && (
          <Text size="1" color="gray">
            Uploading {pendingFile.name}…
          </Text>
        )}
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <Button
        type="Secondary"
        onClick={handlePick}
        disabled={uploadCb.loading}
        loading={uploadCb.loading}
      >
        <Flex align="center" gap="2">
          <UploadIcon />
          {setting.value ? "Replace" : "Upload"}
        </Flex>
      </Button>
    </Flex>
  );
};
