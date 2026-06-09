import React from "react";
import { Avatar, Box, DropdownMenu, Flex, IconButton, Skeleton, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { GearIcon, PlusIcon } from "@radix-ui/react-icons";
import { FacebookPageInfoDto } from "core-lib/api/commons/types";

interface Props {
  pageInfo: FacebookPageInfoDto | null;
  loading: boolean;
  postCount?: number;
  onNewPost: () => void;
  tokenExpired?: boolean;
  onReconnect?: () => void;
  onUpdateToken?: () => void;
  onDisconnect?: () => void;
}

export const FacebookPageInfoBanner: React.FC<Props> = ({
  pageInfo,
  loading,
  postCount,
  onNewPost,
  tokenExpired = false,
  onReconnect,
  onUpdateToken,
  onDisconnect,
}) => {
  const isConnected = !loading && !!pageInfo && !tokenExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 220 }}
    >
      <Box
        style={{
          background: "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-11) 100%)",
          borderRadius: "var(--radius-5)",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 8px 32px var(--accent-a7)",
        }}
      >
        {/* Decorative circles */}
        <Box
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <Box
          style={{
            position: "absolute",
            bottom: -40,
            left: "30%",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        {/* Main row */}
        <Flex
          align="center"
          justify="between"
          gap="4"
          px="5"
          pt="5"
          pb="3"
          wrap="wrap"
          style={{ position: "relative" }}
        >
          <Flex align="center" gap="4">
            {/* Page avatar */}
            {loading ? (
              <Skeleton width="72px" height="72px" style={{ borderRadius: "50%", flexShrink: 0 }} />
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 18 }}
              >
                <Avatar
                  size="6"
                  src={pageInfo?.pictureUrl ?? undefined}
                  fallback={pageInfo?.name?.[0] ?? "F"}
                  style={{
                    border: "3px solid rgba(255,255,255,0.88)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                    flexShrink: 0,
                  }}
                />
              </motion.div>
            )}

            {/* Page name + subtitle */}
            <Box>
              {loading ? (
                <Flex direction="column" gap="2">
                  <Skeleton width="200px" height="22px" />
                  <Skeleton width="140px" height="14px" />
                </Flex>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Text
                    size="5"
                    weight="bold"
                    as="div"
                    style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                  >
                    {pageInfo?.name ?? "Facebook Page"}
                  </Text>
                  <Flex align="center" gap="2" mt="1">
                    <Text size="2" as="span" style={{ color: "rgba(255,255,255,0.78)" }}>
                      facebook.com
                    </Text>
                    <Text size="2" as="span" style={{ color: "rgba(255,255,255,0.45)" }}>·</Text>
                    <Text size="2" as="span" style={{ color: "rgba(255,255,255,0.78)" }}>
                      Page Management
                    </Text>
                    {postCount !== undefined && (
                      <>
                        <Text size="2" as="span" style={{ color: "rgba(255,255,255,0.45)" }}>·</Text>
                        <Text size="2" as="span" style={{ color: "rgba(255,255,255,0.78)" }}>
                          {postCount} {postCount === 1 ? "post" : "posts"}
                        </Text>
                      </>
                    )}
                  </Flex>
                </motion.div>
              )}
            </Box>
          </Flex>

          {/* Right side: connection badge + create button */}
          <Flex align="center" gap="3" style={{ flexShrink: 0 }}>
            {/* Connection status pill / expired badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {tokenExpired ? (
                <motion.button
                  onClick={onReconnect}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "rgba(239,68,68,0.22)",
                    border: "1px solid rgba(239,68,68,0.55)",
                    cursor: "pointer",
                  }}
                >
                  <Text size="1" as="span" style={{ color: "#fca5a5" }}>⚠</Text>
                  <Text size="1" weight="medium" style={{ color: "#fca5a5", whiteSpace: "nowrap" }}>
                    Token Expired · Reconnect
                  </Text>
                </motion.button>
              ) : (
                <Flex align="center" gap="2">
                  <Flex
                    align="center"
                    gap="1"
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      background: isConnected
                        ? "rgba(34,197,94,0.22)"
                        : "rgba(255,255,255,0.12)",
                      border: `1px solid ${isConnected ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.25)"}`,
                    }}
                  >
                    <Box
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: isConnected ? "#22c55e" : "rgba(255,255,255,0.5)",
                        boxShadow: isConnected ? "0 0 6px #22c55e" : "none",
                        flexShrink: 0,
                      }}
                    />
                    <Text size="1" weight="medium" style={{ color: "#fff", whiteSpace: "nowrap" }}>
                      {isConnected ? "Connected" : loading ? "Connecting…" : "Not connected"}
                    </Text>
                  </Flex>

                  {isConnected && (onUpdateToken || onDisconnect) && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <IconButton
                          variant="ghost"
                          size="1"
                          style={{
                            color: "rgba(255,255,255,0.75)",
                            borderRadius: "50%",
                          }}
                        >
                          <GearIcon />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content size="1" align="end">
                        {onUpdateToken && (
                          <DropdownMenu.Item onClick={onUpdateToken}>
                            Update Token
                          </DropdownMenu.Item>
                        )}
                        {onDisconnect && (
                          <DropdownMenu.Item color="red" onClick={onDisconnect}>
                            Disconnect Page
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  )}
                </Flex>
              )}
            </motion.div>

            {/* Create post button */}
            <motion.button
              onClick={onNewPost}
              disabled={loading}
              whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.96)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 24,
                background: "#fff",
                color: "var(--accent-11)",
                fontWeight: 700,
                fontSize: "var(--font-size-2)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                transition: "background 150ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <PlusIcon />
              Create Post
            </motion.button>
          </Flex>
        </Flex>

        {/* Info strip */}
        <Flex
          align="center"
          gap="3"
          px="5"
          py="2"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            background: tokenExpired ? "rgba(239,68,68,0.18)" : "rgba(0,0,0,0.12)",
            position: "relative",
          }}
        >
          {tokenExpired ? (
            <>
              <Text size="1" style={{ color: "#fca5a5" }}>
                ⚠ Your Facebook access token has expired — new posts cannot be published
              </Text>
              <Text size="1" style={{ color: "rgba(252,165,165,0.4)" }}>·</Text>
              <button
                onClick={onReconnect}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fca5a5",
                  fontWeight: 700,
                  fontSize: "var(--font-size-1)",
                  padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Click here to reconnect
              </button>
            </>
          ) : (
            <>
              <Text size="1" style={{ color: "rgba(255,255,255,0.72)" }}>
                🔗 Posts published here appear directly on your Facebook Page
              </Text>
              <Text size="1" style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
              <Text size="1" style={{ color: "rgba(255,255,255,0.72)" }}>
                📡 Changes sync in real time
              </Text>
              <Text size="1" style={{ color: "rgba(255,255,255,0.35)" }}>·</Text>
              <Text size="1" style={{ color: "rgba(255,255,255,0.72)" }}>
                📝 Drafts are stored locally only
              </Text>
            </>
          )}
        </Flex>
      </Box>
    </motion.div>
  );
};
