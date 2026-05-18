import React from "react";
import { Box, Flex } from "@radix-ui/themes";
import { usePublicSettings } from "../../core/contexts";
import { LoaderTransitionVariant } from "../../business/settings";

interface Props {
  /** Override the transition message coming from settings. */
  message?: string;
  /** Force a specific variant; otherwise read from settings. */
  variant?: LoaderTransitionVariant;
}

const KEYFRAMES = `
  @keyframes route-transition-progress {
    0%   { transform: translateX(-100%); }
    50%  { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }
  @keyframes route-transition-dots {
    0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
    40%           { opacity: 1;    transform: translateY(-3px); }
  }
  @keyframes route-transition-ring {
    to { transform: rotate(360deg); }
  }
  @keyframes route-transition-shimmer {
    0%   { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%)  skewX(-12deg); }
  }
`;

export const RouteTransitionLoader: React.FC<Props> = ({
  message,
  variant,
}) => {
  const { loader } = usePublicSettings();
  const effectiveVariant = variant ?? loader.transitionVariant;
  const effectiveMessage = message ?? loader.transitionMessage;

  const showBar =
    effectiveVariant === "bar" || effectiveVariant === "bar-and-ring";
  const showRing =
    effectiveVariant === "ring" || effectiveVariant === "bar-and-ring";
  const showShimmer = effectiveVariant === "shimmer";

  return (
    <Box
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(600px 300px at 50% 40%, var(--accent-a3), transparent 70%), color-mix(in srgb, var(--color-background) 70%, transparent)",
        backdropFilter: "blur(4px) saturate(115%)",
        WebkitBackdropFilter: "blur(4px) saturate(115%)",
        pointerEvents: "all",
        overflow: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>

      {showBar && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              width: "40%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, var(--accent-9), var(--accent-11), var(--accent-9), transparent)",
              animation: "route-transition-progress 1.2s ease-in-out infinite",
              boxShadow: "0 0 12px var(--accent-a8)",
            }}
          />
        </Box>
      )}

      {showShimmer && (
        <Box
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              left: 0,
              background:
                "linear-gradient(90deg, transparent, var(--accent-a5) 40%, var(--accent-a7) 50%, var(--accent-a5) 60%, transparent)",
              animation: "route-transition-shimmer 1.8s ease-in-out infinite",
              filter: "blur(2px)",
            }}
          />
        </Box>
      )}

      {showRing && (
        <Box
          style={{
            position: "relative",
            width: 56,
            height: 56,
          }}
        >
          <Box
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid var(--accent-a4)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "var(--accent-9)",
              borderRightColor: "var(--accent-11)",
              animation: "route-transition-ring 0.9s linear infinite",
            }}
          />
          <Box
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "50%",
              background: "var(--accent-a3)",
            }}
          />
        </Box>
      )}

      <Flex align="center" gap="1" mt="3">
        <Box
          style={{
            color: "var(--accent-11)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {effectiveMessage}
        </Box>
        <Flex align="center" gap="1" ml="1">
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--accent-11)",
                animation: "route-transition-dots 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};
