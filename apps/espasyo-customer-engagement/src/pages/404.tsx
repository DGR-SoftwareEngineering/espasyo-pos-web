import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Flex, Text, Box } from "@radix-ui/themes";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthContext } from "core-lib/core/contexts";

const floatingEmojis = [
  { emoji: "☕", size: 64, top: "16%", left: "8%", delay: 0, duration: 20 },
  { emoji: "🥐", size: 44, top: "68%", left: "12%", delay: 2, duration: 24 },
  { emoji: "⭐", size: 40, top: "22%", right: "10%", delay: 1, duration: 22 },
  { emoji: "🎁", size: 52, bottom: "18%", right: "9%", delay: 3, duration: 26 },
];

export default function NotFoundPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const auth = useAuthContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      try {
        const isAuthed = !!auth.isAuthenticated;
        setIsAuthenticated(isAuthed);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [auth.isAuthenticated]);

  const handleHomeClick = () => {
    // Use window.location for hard navigation to avoid middleware issues
    if (isAuthenticated) {
      window.location.href = "/customer/hub";
    } else {
      window.location.href = "/";
    }
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      window.location.href = "/customer/hub";
    } else {
      window.location.href = "/login";
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background:
            "radial-gradient(1200px 600px at 50% -10%, var(--accent-a3), transparent), var(--gray-1)",
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Text size="6" weight="bold" color="gray">
            Loading...
          </Text>
        </motion.div>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(1200px 600px at 50% -10%, var(--accent-a3), transparent), var(--gray-1)",
        padding: 24,
      }}
    >
      {/* Animated gradient orbs */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              borderRadius: "50%",
              filter: "blur(80px)",
              background: "var(--accent-a5)",
              top: "-120px",
              left: "-100px",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              borderRadius: "50%",
              filter: "blur(80px)",
              background: "var(--orange-a5)",
              bottom: "-120px",
              right: "-80px",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Floating emojis */}
      {!reduce &&
        floatingEmojis.map((el, i) => (
          <motion.div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              fontSize: el.size,
              top: el.top,
              left: el.left,
              right: el.right,
              bottom: el.bottom,
              opacity: 0.18,
              pointerEvents: "none",
            }}
            animate={{ y: [0, -28, 0], x: [0, 16, 0], rotate: [0, 8, 0] }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {el.emoji}
          </motion.div>
        ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Text
            as="div"
            style={{
              fontSize: "clamp(96px, 22vw, 180px)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, var(--accent-11), var(--orange-9))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </Text>
        </motion.div>

        <Text size="6" weight="bold" as="div" mt="2">
          This cup is empty ☕
        </Text>
        
        <Box mt="2" mb="5">
          <Text size="3" color="gray" as="div">
            {isAuthenticated 
              ? "The page you're looking for has wandered off. Let's get you back to your dashboard."
              : "The page you're looking for has wandered off. Let's get you back to something brewing."}
          </Text>
        </Box>

        <Flex gap="3" justify="center" wrap="wrap">
          <Button 
            size="3" 
            variant="soft"
            onClick={handleHomeClick}
          >
            Back to home
          </Button>
          <Button
            size="3"
            onClick={handleDashboardClick}
            style={{
              background: isAuthenticated 
                ? "linear-gradient(135deg, #c2410c, #ea580c)"
                : undefined,
            }}
          >
            {isAuthenticated ? "Go to dashboard" : "Sign in"}
          </Button>
        </Flex>

        {/* Helpful message for authenticated users */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Text size="1" color="gray" mt="4" as="div">
              Need help? Contact support or return to your dashboard to continue ordering.
            </Text>
          </motion.div>
        )}
      </motion.div>
    </Flex>
  );
}