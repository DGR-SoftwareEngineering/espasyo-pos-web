import React from "react";
import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { PRINT_GLOBAL_CSS } from "./printStyles";

export interface PrintableDocumentProps {
  /** Branded company / shop name. Shown top-left. */
  businessName: string;
  /** Optional logo URL. Falls back to a monogram circle. */
  logoUrl?: string | null;
  /** Document kind, e.g. "Purchase Order". Shown top-right. */
  documentLabel: string;
  /** Document number/identifier, e.g. "PO-2026-0042". */
  documentNumber: string;
  /** Optional subtitle below the document number (e.g. status, date issued). */
  documentMeta?: React.ReactNode;
  /** Optional footer text. Default shows generation timestamp. */
  footer?: React.ReactNode;
  /** Main body content. */
  children: React.ReactNode;
}

const monogram = (name: string): string => {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return letters || "E";
};

const formatNow = (): string => {
  const d = new Date();
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
};

/**
 * A4-sized printable document shell. Render inside `PrintPreviewDialog` (or any
 * container) — the print media query in `printStyles.ts` will hide everything
 * else on the page when the user invokes the browser print dialog.
 */
export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  businessName,
  logoUrl,
  documentLabel,
  documentNumber,
  documentMeta,
  footer,
  children,
}) => {
  return (
    <>
      <style>{PRINT_GLOBAL_CSS}</style>
      <Box
        style={{
          background: "#ffffff",
          color: "#111111",
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          padding: "16mm 14mm",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Flex justify="between" align="start" gap="4" wrap="wrap">
          <Flex align="center" gap="3">
            {logoUrl ? (
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "#f5f5f5",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={businessName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            ) : (
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "#111",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                {monogram(businessName)}
              </Box>
            )}
            <Box>
              <Text
                as="div"
                size="4"
                weight="bold"
                style={{ color: "#111", lineHeight: 1.1 }}
              >
                {businessName}
              </Text>
              <Text
                as="div"
                size="1"
                style={{ color: "#666", marginTop: 2 }}
              >
                Generated {formatNow()}
              </Text>
            </Box>
          </Flex>
          <Box style={{ textAlign: "right" }}>
            <Text
              as="div"
              size="1"
              style={{
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontWeight: 600,
              }}
            >
              {documentLabel}
            </Text>
            <Heading
              as="h1"
              size="5"
              style={{ color: "#111", marginTop: 2 }}
            >
              {documentNumber}
            </Heading>
            {documentMeta && (
              <Box mt="1" style={{ color: "#555", fontSize: 12 }}>
                {documentMeta}
              </Box>
            )}
          </Box>
        </Flex>

        <Separator size="4" my="4" style={{ background: "#e5e5e5" }} />

        <Box>{children}</Box>

        <Box
          mt="6"
          pt="3"
          style={{
            borderTop: "1px solid #e5e5e5",
            color: "#888",
            fontSize: 11,
          }}
        >
          {footer ?? (
            <Flex justify="between" gap="2">
              <Text size="1" style={{ color: "#888" }}>
                {businessName} — {documentLabel}
              </Text>
              <Text size="1" style={{ color: "#888" }}>
                {documentNumber}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </>
  );
};
