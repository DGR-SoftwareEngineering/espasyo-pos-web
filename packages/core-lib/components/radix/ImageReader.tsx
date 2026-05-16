import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "@radix-ui/themes";
import { ImageIcon } from "@radix-ui/react-icons";

type RadiusToken = "none" | "1" | "2" | "3" | "4" | "5" | "6" | "full";

const RADIUS_VALUE: Record<RadiusToken, string> = {
  none: "0",
  "1": "var(--radius-1)",
  "2": "var(--radius-2)",
  "3": "var(--radius-3)",
  "4": "var(--radius-4)",
  "5": "var(--radius-5)",
  "6": "var(--radius-6)",
  full: "9999px",
};

export interface ImageReaderProps {
  src?: string | null;
  alt: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  radius?: RadiusToken;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fallback?: React.ReactNode;
  fallbackText?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  onClick?: () => void;
  border?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

const toCssSize = (v: number | string | undefined): string | undefined =>
  typeof v === "number" ? `${v}px` : v;

const initialsFrom = (text?: string): string => {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
};

export const ImageReader: React.FC<ImageReaderProps> = ({
  src,
  alt,
  size,
  width,
  height,
  radius = "2",
  objectFit = "cover",
  fallback,
  fallbackText,
  loading = "lazy",
  decoding = "async",
  onClick,
  border = false,
  className,
  style,
  "data-testid": dataTestId,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    src ? "loading" : "idle",
  );

  useEffect(() => {
    setStatus(src ? "loading" : "idle");
  }, [src]);

  const resolvedWidth = toCssSize(width ?? size) ?? "40px";
  const resolvedHeight = toCssSize(height ?? size) ?? "40px";
  const borderRadius = RADIUS_VALUE[radius];

  const initials = useMemo(() => initialsFrom(fallbackText), [fallbackText]);
  const hasValidSrc = !!src && status !== "error";

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius,
    overflow: "hidden",
    background: "var(--gray-a3)",
    border: border ? "1px solid var(--gray-a5)" : undefined,
    cursor: onClick ? "pointer" : undefined,
    flexShrink: 0,
    display: "inline-block",
    ...style,
  };

  const renderFallback = () => {
    if (fallback) return fallback;
    if (initials) {
      return (
        <Text
          size="2"
          weight="bold"
          style={{
            color: "var(--accent-11)",
            lineHeight: 1,
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </Text>
      );
    }
    return (
      <ImageIcon
        width={Math.max(14, parseInt(String(resolvedWidth), 10) * 0.4 || 16)}
        height={Math.max(14, parseInt(String(resolvedHeight), 10) * 0.4 || 16)}
        style={{ color: "var(--gray-10)" }}
      />
    );
  };

  return (
    <Box
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      data-testid={dataTestId}
      data-state={status}
      className={className}
      style={wrapperStyle}
    >
      {!hasValidSrc && (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: initials ? "var(--accent-a3)" : "var(--gray-a3)",
          }}
        >
          {renderFallback()}
        </Box>
      )}

      {hasValidSrc && status === "loading" && (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, var(--gray-a3), var(--gray-a5), var(--gray-a3))",
            backgroundSize: "200% 100%",
            animation: "image-reader-shimmer 1.2s infinite linear",
          }}
        />
      )}

      {hasValidSrc && (
        <img
          src={src!}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            display: "block",
            opacity: status === "loaded" ? 1 : 0,
            transition: "opacity 180ms ease",
          }}
        />
      )}

      <style>{`
        @keyframes image-reader-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </Box>
  );
};
