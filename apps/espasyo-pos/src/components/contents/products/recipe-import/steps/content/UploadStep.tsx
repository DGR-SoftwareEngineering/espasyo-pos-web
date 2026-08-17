import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
} from "core-lib/components/radix/proxies";
import {
  Callout,
} from "@radix-ui/themes";;
import { UploadIcon, Cross1Icon, InfoCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { useRecipeImportContext } from "../../RecipeImportContext";
import { StepShell } from "./StepShell";
import { StepNavigation } from "./StepNavigation";
import { RecipeImportStepProps } from "../RecipeImportSteps";

const LOADING_MESSAGES = [
  "Reading your Excel file…",
  "Parsing ingredient data…",
  "Analyzing recipe formulas…",
  "Cross-referencing units…",
  "Computing cost estimates…",
  "Almost there…",
];

const LoadingState: React.FC = () => {
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes espasyo-analyze-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.96); }
        }
        @keyframes espasyo-slide-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes espasyo-fade-msg {
          0% { opacity: 0; transform: translateY(4px); }
          15%, 85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>

      <Flex
        direction="column"
        align="center"
        gap="4"
        style={{ padding: "2rem 0" }}
      >
        {/* Animated icon */}
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--accent-a4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            animation: "espasyo-analyze-pulse 1.4s ease-in-out infinite",
          }}
        >
          📊
        </Box>

        {/* Title */}
        <Text weight="bold" size="5">
          Analyzing your file
        </Text>

        {/* Cycling message */}
        <Box style={{ height: 24, position: "relative", textAlign: "center" }}>
          <Text
            size="2"
            color="gray"
            key={msgIdx}
            style={{
              animation: "espasyo-fade-msg 1.4s ease-in-out forwards",
            }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </Text>
        </Box>

        {/* Indeterminate progress bar */}
        <Box
          style={{
            width: "100%",
            maxWidth: 320,
            height: 4,
            background: "var(--accent-a3)",
            borderRadius: 999,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "40%",
              height: "100%",
              background: "var(--accent-9)",
              borderRadius: 999,
              animation: "espasyo-slide-bar 1.4s ease-in-out infinite",
            }}
          />
        </Box>

        <Text size="1" color="gray">
          This usually takes a few seconds
        </Text>
      </Flex>
    </>
  );
};

export const UploadStep: React.FC<RecipeImportStepProps> = ({
  previous,
  reset,
}) => {
  const {
    selectedFile,
    setSelectedFile,
    previewLoading,
    executePreview,
  } = useRecipeImportContext();

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      setUploadError("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
  };

  const handleContinue = async () => {
    if (selectedFile) {
      const err = await executePreview(selectedFile);
      if (err) setUploadError(err);
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
      title="Upload Your File"
      subtitle="Drop your Excel file here to begin"
      actions={
        <StepNavigation
          onBack={previous}
          onContinue={handleContinue}
          continueDisabled={!selectedFile || previewLoading}
          loading={previewLoading}
          continueText={previewLoading ? "Analyzing…" : "Analyze File"}
        />
      }
    >
      <Flex direction="column" gap="5">
        {previewLoading ? (
          <LoadingState />
        ) : selectedFile ? (
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
            <Box style={{ fontSize: 24 }}>📊</Box>
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text weight="medium" size="3">
                {selectedFile.name}
              </Text>
              <Text size="2" color="gray">
                {formatFileSize(selectedFile.size)} · Ready to analyze
              </Text>
            </Flex>
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => { setSelectedFile(null); setUploadError(null); }}
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
              border: isDragOver
                ? "2px solid var(--accent-9)"
                : "2px dashed var(--gray-a6)",
              borderRadius: "12px",
              padding: "3rem 2rem",
              background: isDragOver ? "var(--accent-a3)" : "var(--gray-a2)",
              cursor: "pointer",
              transition: "all 150ms ease",
              textAlign: "center",
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
              <Flex direction="column" align="center" gap="3">
                <Box
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: isDragOver ? "var(--accent-a5)" : "var(--accent-a3)",
                    color: "var(--accent-11)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 150ms ease",
                    fontSize: 26,
                  }}
                >
                  📂
                </Box>
                <Box>
                  <Text
                    as="div"
                    weight="bold"
                    size="4"
                    style={{ marginBottom: 4 }}
                  >
                    {isDragOver ? "Release to upload" : "Drag and drop your Excel file here"}
                  </Text>
                  <Text as="div" color="gray" size="2">
                    or click to browse your files
                  </Text>
                  <Text as="div" color="gray" size="1" mt="1">
                    Supports .xlsx and .xls files
                  </Text>
                </Box>
              </Flex>
            </label>
          </Box>
        )}

        {/* Validation error */}
        {uploadError && !previewLoading && (
          <Callout.Root color="red" variant="surface">
            <Callout.Icon>
              <CrossCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text weight="medium" as="div" mb="1">
                File is not a valid recipe import file
              </Text>
              <Text size="2">{uploadError}</Text>
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Footer: Quick reference callout */}
        {!previewLoading && (
          <Callout.Root color="blue" variant="surface">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              <Text weight="medium" as="div" mb="1">
                Quick column reference
              </Text>
              <Flex direction="column" gap="1">
                <Text size="2">
                  <Text weight="medium">Ingredients sheet:</Text> Name · Package Price ·
                  Qty Per Pack · Unit
                </Text>
                <Text size="2">
                  <Text weight="medium">Recipes sheet:</Text> Menu Item Name · Selling
                  Price · Ingredient Name · Quantity Required · Unit
                </Text>
              </Flex>
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </StepShell>
  );
};
