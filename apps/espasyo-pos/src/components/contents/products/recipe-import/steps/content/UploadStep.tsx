import React, { useState } from "react";
import { Box, Flex, Text, Spinner, IconButton } from "@radix-ui/themes";
import { UploadIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

export const UploadStep: React.FC<RecipeImportStepProps> = ({
  reset,
}) => {
  const {
    selectedFile,
    setSelectedFile,
    previewLoading,
    executePreview,
  } = useRecipeImportContext();

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileSelect(e.target.files[0]);
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }
    setSelectedFile(file);
  };

  const handleContinue = async () => {
    if (selectedFile) {
      await executePreview(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <StepShell
      icon={<UploadIcon width={24} height={24} />}
      title="Upload File"
      actions={
        <StepNavigation
          onContinue={handleContinue}
          continueDisabled={!selectedFile || previewLoading}
          loading={previewLoading}
          hideBack
        />
      }
    >
      <Flex direction="column" gap="5">
        {selectedFile && !previewLoading ? (
          // File selected chip
          <Flex
            align="center"
            gap="3"
            px="3"
            py="3"
            style={{
              border: "1px solid var(--accent-a6)",
              borderRadius: "8px",
              background: "var(--accent-a2)",
            }}
          >
            <Box style={{ color: "var(--accent-9)" }}>
              📊
            </Box>
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text weight="medium" size="3">{selectedFile.name}</Text>
              <Text size="2" color="gray">{formatFileSize(selectedFile.size)}</Text>
            </Flex>
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => setSelectedFile(null)}
              title="Clear file"
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
        ) : (
          // Drop zone
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragOver ? "1.5px solid var(--accent-9)" : "1.5px dashed var(--gray-a6)",
              borderRadius: "8px",
              padding: "2.5rem",
              background: isDragOver ? "var(--accent-a3)" : "var(--gray-a2)",
              cursor: previewLoading ? "wait" : "pointer",
              transition: "all 120ms ease",
              textAlign: "center",
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              disabled={previewLoading}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
              {previewLoading ? (
                <Flex direction="column" align="center" gap="3">
                  <Spinner size="3" />
                  <Text weight="medium" size="4">Analyzing file…</Text>
                </Flex>
              ) : (
                <Flex direction="column" align="center" gap="3">
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--accent-a3)",
                      color: "var(--accent-11)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    📊
                  </Box>
                  <Box>
                    <Text as="div" weight="medium" size="4">
                      Drag and drop your Excel file here
                    </Text>
                    <Text as="div" color="gray" size="2">
                      or click to browse · .xlsx, .xls
                    </Text>
                  </Box>
                </Flex>
              )}
            </label>
          </Box>
        )}
      </Flex>
    </StepShell>
  );
};
