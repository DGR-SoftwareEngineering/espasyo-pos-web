import React, { useEffect, useState } from "react";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import { CoffeeOutlined } from "@mui/icons-material";
import { usePublicSettings } from "../../core/contexts";
import { AnimatedBoxSkeleton } from "./animations/AnimatedBoxSkeleton";

interface Props {
  message?: string;
  /** Full-viewport overlay. Default true. */
  fullScreen?: boolean;
  /** Slight blur + accent backdrop. Default true. */
  withBackdrop?: boolean;
}

const useRotatingMessage = (
  pool: string[],
  override?: string,
  intervalMs = 2200,
) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (override || pool.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % pool.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [override, pool.length, intervalMs]);
  return override ?? pool[index] ?? "Loading…";
};

export const BrandedLoader: React.FC<Props> = ({
  message,
  fullScreen = true,
  withBackdrop = true,
}) => {
  const { systemName, theme, loader } = usePublicSettings();
  const brand = systemName || "Espasyo";
  const logoUrl = loader.showLogo ? theme.logoUrl : null;
  const speedSeconds = loader.speedMs / 1000;

  const messagePool =
    loader.variant === "pulse" || loader.variant === "minimal"
      ? [loader.primaryMessage]
      : loader.rotatingMessages.length > 0
        ? loader.rotatingMessages
        : [loader.primaryMessage];

  const animatedMessage = useRotatingMessage(messagePool, message);

  const keyframes = `
    @keyframes branded-loader-pulse {
      0%, 100% { transform: scale(0.92); opacity: 0.6; }
      50%      { transform: scale(1.08); opacity: 1; }
    }
    @keyframes branded-loader-orbit {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes branded-loader-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes branded-loader-rise {
      0%   { transform: translateY(0)   scale(0.6); opacity: 0; }
      50%  { opacity: 0.8; }
      100% { transform: translateY(-28px) scale(1); opacity: 0; }
    }
  `;

  const inner = (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      role="status"
      aria-live="polite"
      style={{ padding: 24, width: "100%" }}
    >
      <style>{keyframes}</style>

      {loader.variant === "skeleton-only" ? (
        <SkeletonContent />
      ) : loader.variant === "minimal" ? (
        <MinimalContent
          brand={brand}
          showBrand={loader.showBrand}
          logoUrl={logoUrl}
          message={animatedMessage}
        />
      ) : (
        <PulseOrBrandedContent
          brand={brand}
          showBrand={loader.showBrand}
          logoUrl={logoUrl}
          message={animatedMessage}
          speedSeconds={speedSeconds}
          showHalo={loader.variant === "branded"}
        />
      )}
    </Flex>
  );

  if (!fullScreen) return inner;

  const backgroundLayer = withBackdrop
    ? `radial-gradient(800px 400px at 50% 40%, var(--accent-a3), transparent 70%), color-mix(in srgb, var(--color-background) ${Math.round(
        loader.backdropOpacity * 100,
      )}%, transparent)`
    : "transparent";

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: backgroundLayer,
        backdropFilter: withBackdrop ? "blur(6px) saturate(120%)" : undefined,
        WebkitBackdropFilter: withBackdrop
          ? "blur(6px) saturate(120%)"
          : undefined,
      }}
    >
      {inner}
    </Box>
  );
};

const LogoTile: React.FC<{
  logoUrl: string | null;
  brand: string;
  size?: number;
  animated?: boolean;
  speedSeconds?: number;
}> = ({ logoUrl, brand, size = 60, animated, speedSeconds = 1.4 }) => (
  <Box
    style={{
      width: size,
      height: size,
      borderRadius: "var(--radius-4)",
      background:
        "linear-gradient(135deg, var(--accent-9), var(--accent-11))",
      color: "var(--accent-contrast)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 12px 32px var(--accent-a6)",
      overflow: "hidden",
      animation: animated
        ? `branded-loader-pulse ${speedSeconds * 1.4}s ease-in-out infinite`
        : undefined,
    }}
  >
    {logoUrl ? (
      <img
        src={logoUrl}
        alt={brand}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : (
      <CoffeeOutlined style={{ fontSize: Math.round(size * 0.5) }} />
    )}
  </Box>
);

const BrandCaption: React.FC<{ brand: string; message: string }> = ({
  brand,
  message,
}) => (
  <Flex direction="column" align="center" gap="1">
    <Text
      size="3"
      weight="bold"
      style={{
        background:
          "linear-gradient(90deg, var(--accent-11), var(--accent-9), var(--accent-11))",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "branded-loader-shimmer 2.4s linear infinite",
      }}
    >
      {message}
    </Text>
    <Text size="1" color="gray">
      {brand} · Coffee House
    </Text>
  </Flex>
);

const MessageOnly: React.FC<{ message: string }> = ({ message }) => (
  <Text
    size="3"
    weight="bold"
    style={{
      background:
        "linear-gradient(90deg, var(--accent-11), var(--accent-9), var(--accent-11))",
      backgroundSize: "200% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "branded-loader-shimmer 2.4s linear infinite",
    }}
  >
    {message}
  </Text>
);

const MinimalContent: React.FC<{
  brand: string;
  showBrand: boolean;
  logoUrl: string | null;
  message: string;
}> = ({ brand, showBrand, logoUrl, message }) => (
  <Flex direction="column" align="center" gap="3">
    <Flex align="center" gap="3">
      <LogoTile logoUrl={logoUrl} brand={brand} size={44} />
      <Spinner size="3" loading />
    </Flex>
    {showBrand ? (
      <BrandCaption brand={brand} message={message} />
    ) : (
      <MessageOnly message={message} />
    )}
  </Flex>
);

const PulseOrBrandedContent: React.FC<{
  brand: string;
  showBrand: boolean;
  logoUrl: string | null;
  message: string;
  speedSeconds: number;
  showHalo: boolean;
}> = ({ brand, showBrand, logoUrl, message, speedSeconds, showHalo }) => (
  <>
    <Box
      style={{
        position: "relative",
        width: 96,
        height: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showHalo && (
        <>
          <Box
            aria-hidden
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, var(--accent-9), var(--accent-11), var(--accent-9) 0)",
              filter: "blur(8px)",
              opacity: 0.35,
              animation: `branded-loader-orbit ${speedSeconds * 2}s linear infinite`,
            }}
          />
          <Box
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "var(--accent-9)",
              borderRightColor: "var(--accent-11)",
              animation: `branded-loader-orbit ${speedSeconds}s linear infinite`,
            }}
          />
          <Box
            aria-hidden
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "50%",
              border: "2px dashed var(--accent-a8)",
              animation: `branded-loader-orbit ${speedSeconds * 2.4}s linear infinite reverse`,
              opacity: 0.6,
            }}
          />
        </>
      )}
      <LogoTile
        logoUrl={logoUrl}
        brand={brand}
        size={60}
        animated
        speedSeconds={speedSeconds}
      />
      {showHalo && (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              style={{
                width: 4,
                height: 8,
                borderRadius: 2,
                background:
                  "linear-gradient(180deg, transparent, var(--accent-a9))",
                animation: `branded-loader-rise ${speedSeconds * 2}s ease-out infinite`,
                animationDelay: `${i * 0.25}s`,
                opacity: 0,
              }}
            />
          ))}
        </Box>
      )}
    </Box>

    {showBrand ? (
      <BrandCaption brand={brand} message={message} />
    ) : (
      <MessageOnly message={message} />
    )}
  </>
);

const SkeletonContent: React.FC = () => (
  <Box style={{ width: "100%", maxWidth: 720 }}>
    <Flex direction="column" gap="3">
      <AnimatedBoxSkeleton height={32} />
      <AnimatedBoxSkeleton height={20} light />
      <AnimatedBoxSkeleton height={20} light />
      <Box mt="3">
        <AnimatedBoxSkeleton height={120} />
      </Box>
      <Flex gap="3">
        <Box style={{ flex: 1 }}>
          <AnimatedBoxSkeleton height={80} />
        </Box>
        <Box style={{ flex: 1 }}>
          <AnimatedBoxSkeleton height={80} light />
        </Box>
      </Flex>
    </Flex>
  </Box>
);
