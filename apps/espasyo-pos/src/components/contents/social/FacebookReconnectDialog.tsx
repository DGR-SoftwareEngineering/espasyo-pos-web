import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Separator,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { CheckCircledIcon, Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { FacebookConnectionStatusDto } from "core-lib/api/commons/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "instructions" | "oauth_pending" | "form" | "success";

const StepBadge: React.FC<{ n: number }> = ({ n }) => (
  <Flex
    align="center"
    justify="center"
    style={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "var(--accent-9)",
      color: "#fff",
      fontWeight: 700,
      fontSize: "var(--font-size-2)",
      flexShrink: 0,
    }}
  >
    {n}
  </Flex>
);

export const FacebookReconnectDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const { isSmallMobile } = useResolution();
  const [step, setStep] = useState<Step>("instructions");
  const [token, setToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [connectedPage, setConnectedPage] = useState<FacebookConnectionStatusDto | null>(null);
  const [showToken, setShowToken] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const reconnectCb = useApiCallback(
    async (api, params: { pageAccessToken: string; pageId?: string }) =>
      api.commons.reconnectFacebook(params),
  );

  const getOAuthUrlCb = useApiCallback(async (api) => api.commons.getFacebookOAuthUrl());

  const handleClose = () => {
    setStep("instructions");
    setToken("");
    setPageId("");
    setErrorMsg(null);
    setOauthError(null);
    setConnectedPage(null);
    setShowToken(false);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const handleOAuthMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin || ev.data?.type !== "FACEBOOK_OAUTH_COMPLETE") return;
      window.removeEventListener("message", handleOAuthMessage);

      if (ev.data.error) {
        setOauthError(ev.data.error);
        setStep("instructions");
      } else {
        setConnectedPage({
          isConnected: true,
          pageName: ev.data.pageName,
          pageId: ev.data.pageId,
          pictureUrl: null,
          errorMessage: null,
        });
        setStep("success");
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 2200);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [open, onSuccess]);

  const handleOAuthConnect = async () => {
    setOauthError(null);
    const result = await getOAuthUrlCb.execute();

    if (!result?.data?.success || !result.data.response) {
      setOauthError((result?.data?.errors as string[] | null | undefined)?.[0] ?? "Failed to start OAuth.");
      return;
    }

    const popup = window.open(
      result.data.response.authorizationUrl,
      "facebook-oauth",
      "width=600,height=700,scrollbars=yes"
    );

    if (!popup || popup.closed) {
      setOauthError("Popup was blocked. Please allow popups for this site.");
      return;
    }

    popupRef.current = popup;
    setStep("oauth_pending");
  };

  const handleConnect = async () => {
    if (!token.trim()) {
      setErrorMsg("Please enter a Page Access Token.");
      return;
    }
    setErrorMsg(null);

    const result = await reconnectCb.execute({
      pageAccessToken: token.trim(),
      pageId: pageId.trim() || undefined,
    });

    if (result?.data?.success && result.data.response) {
      const status = result.data.response as FacebookConnectionStatusDto;
      setConnectedPage(status);
      setStep("success");
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2200);
    } else {
      const errs = result?.data?.errors as string[] | null;
      setErrorMsg(
        errs && errs.length > 0
          ? errs[0]
          : result?.data?.message ?? "Failed to connect. Please check your token and try again.",
      );
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Dialog.Content
        style={{
          ...(isSmallMobile
            ? mobileDialogStyle
            : { maxWidth: 520, borderRadius: "var(--radius-5)", overflow: "hidden" }),
          padding: 0,
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="between"
          px="5"
          py="4"
          style={{
            borderBottom: "1px solid var(--gray-a4)",
            ...(isSmallMobile ? { flexShrink: 0 } : {}),
          }}
        >
          <Box>
            <Text size="4" weight="bold" as="div">
              Reconnect Facebook Page
            </Text>
            <Text size="2" color="gray" as="div" mt="1">
              {step === "instructions"
                ? "Follow these steps to get a Page Access Token"
                : step === "oauth_pending"
                ? "Waiting for Facebook authorization…"
                : step === "form"
                ? "Enter your new Page Access Token"
                : "Connected successfully"}
            </Text>
          </Box>
          <Button
            variant="ghost"
            color="gray"
            size="2"
            style={{ borderRadius: "50%", padding: 6, flexShrink: 0 }}
            onClick={handleClose}
          >
            <Cross2Icon />
          </Button>
        </Flex>

        <Box
          style={{
            ...(isSmallMobile
              ? { flex: 1, overflowY: "auto", minHeight: 0 }
              : {}),
          }}
        >
        <AnimatePresence mode="wait">
          {/* Step 1: Instructions */}
          {step === "instructions" && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Box px="5" py="4">
                <Text size="2" color="gray" as="div" mb="4">
                  To keep your Facebook connection alive, you need a{" "}
                  <strong>long-lived Page Access Token</strong> that never expires.
                  Follow the steps below to get one from the Meta Developer Portal.
                </Text>

                <Flex direction="column" gap="3">
                  <Flex align="start" gap="3">
                    <StepBadge n={1} />
                    <Box>
                      <Text size="2" weight="bold" as="div">Open Graph API Explorer</Text>
                      <Text size="2" color="gray" as="div" mt="1">
                        Go to{" "}
                        <Text size="2" style={{ color: "var(--accent-11)", fontWeight: 600 }}>
                          developers.facebook.com/tools/explorer
                        </Text>{" "}
                        and select your app from the dropdown.
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="start" gap="3">
                    <StepBadge n={2} />
                    <Box>
                      <Text size="2" weight="bold" as="div">Generate a User Access Token</Text>
                      <Text size="2" color="gray" as="div" mt="1">
                        Click "Generate Access Token" and grant{" "}
                        <code
                          style={{
                            background: "var(--gray-a3)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          pages_manage_posts
                        </code>
                        {", "}
                        <code
                          style={{
                            background: "var(--gray-a3)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          pages_read_engagement
                        </code>
                        {", and "}
                        <code
                          style={{
                            background: "var(--gray-a3)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                        >
                          pages_show_list
                        </code>{" "}
                        permissions.
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="start" gap="3">
                    <StepBadge n={3} />
                    <Box>
                      <Text size="2" weight="bold" as="div">Exchange for Long-Lived Token</Text>
                      <Text size="2" color="gray" as="div" mt="1">
                        In the explorer, call:{" "}
                        <code
                          style={{
                            background: "var(--gray-a3)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            display: "block",
                            marginTop: 6,
                            wordBreak: "break-all",
                          }}
                        >
                          GET /oauth/access_token?grant_type=fb_exchange_token
                          &client_id={"{appId}"}&client_secret={"{appSecret}"}
                          &fb_exchange_token={"{shortToken}"}
                        </code>
                        This gives you a 60-day user token.
                      </Text>
                    </Box>
                  </Flex>

                  <Flex align="start" gap="3">
                    <StepBadge n={4} />
                    <Box>
                      <Text size="2" weight="bold" as="div">Get the Page Access Token (never expires)</Text>
                      <Text size="2" color="gray" as="div" mt="1">
                        Call:{" "}
                        <code
                          style={{
                            background: "var(--gray-a3)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            display: "block",
                            marginTop: 6,
                            wordBreak: "break-all",
                          }}
                        >
                          GET /{"{pageId}"}?fields=access_token&access_token={"{longLivedUserToken}"}
                        </code>
                        The <code style={{ background: "var(--gray-a3)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>access_token</code>{" "}
                        in the response is your permanent Page Access Token.
                      </Text>
                    </Box>
                  </Flex>
                </Flex>

                {oauthError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Flex
                      align="start"
                      gap="2"
                      p="3"
                      style={{
                        background: "var(--red-a3)",
                        borderRadius: "var(--radius-3)",
                        border: "1px solid var(--red-a5)",
                      }}
                    >
                      <ExclamationTriangleIcon
                        style={{ color: "var(--red-11)", flexShrink: 0, marginTop: 1 }}
                      />
                      <Text size="2" style={{ color: "var(--red-11)" }}>
                        {oauthError}
                      </Text>
                    </Flex>
                  </motion.div>
                )}

                <Box
                  mt="4"
                  p="3"
                  style={{
                    background: "var(--amber-a3)",
                    borderRadius: "var(--radius-3)",
                    border: "1px solid var(--amber-a5)",
                  }}
                >
                  <Text size="2" style={{ color: "var(--amber-11)" }}>
                    💡 Page tokens from a long-lived user token <strong>never expire</strong>, so
                    you won't need to reconnect again.
                  </Text>
                </Box>
              </Box>

              <Separator size="4" />

              <Flex
                align="center"
                justify="between"
                px="5"
                py="3"
                style={isSmallMobile ? mobileFooterStyle : undefined}
              >
                <Button variant="ghost" color="gray" onClick={handleClose}>
                  Cancel
                </Button>
                <Flex direction="column" align="end" gap="2">
                  <Button onClick={handleOAuthConnect} disabled={getOAuthUrlCb.loading}>
                    {getOAuthUrlCb.loading ? "Opening…" : "🔵 Connect with Facebook"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="2"
                    color="gray"
                    onClick={() => setStep("form")}
                  >
                    Or enter token manually →
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          )}

          {/* Step 2: OAuth Pending */}
          {step === "oauth_pending" && (
            <motion.div
              key="oauth_pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap="3"
                px="5"
                py="8"
              >
                <Spinner size="3" />
                <Box style={{ textAlign: "center" }}>
                  <Text size="3" weight="bold" as="div">
                    Waiting for authorization…
                  </Text>
                  <Text size="2" color="gray" as="div" mt="2">
                    A popup window has opened. Please complete the authentication.
                  </Text>
                </Box>
              </Flex>

              <Separator size="4" />

              <Flex
                align="center"
                justify="end"
                gap="3"
                px="5"
                py="3"
                style={isSmallMobile ? mobileFooterStyle : undefined}
              >
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setStep("instructions");
                    if (popupRef.current && !popupRef.current.closed) {
                      popupRef.current.close();
                    }
                  }}
                >
                  Cancel
                </Button>
              </Flex>
            </motion.div>
          )}

          {/* Step 3: Form */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Box px="5" py="4">
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="2" weight="bold" as="div" mb="2">
                      Page Access Token *
                    </Text>
                    <Flex gap="2">
                      <TextField.Root
                        type={showToken ? "text" : "password"}
                        placeholder="Paste your long-lived Page Access Token here…"
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          setErrorMsg(null);
                        }}
                        style={{ flex: 1, fontFamily: token && !showToken ? "monospace" : undefined }}
                      />
                      <Button
                        variant="soft"
                        color="gray"
                        size="2"
                        onClick={() => setShowToken((v) => !v)}
                        style={{ flexShrink: 0 }}
                      >
                        {showToken ? "Hide" : "Show"}
                      </Button>
                    </Flex>
                    <Text size="1" color="gray" mt="1" as="div">
                      This is encrypted and stored securely. It will never be shown again.
                    </Text>
                  </Box>

                  <Box>
                    <Text size="2" weight="bold" as="div" mb="2">
                      Page ID{" "}
                      <Text size="2" color="gray" weight="regular">
                        (optional — leave blank to use current)
                      </Text>
                    </Text>
                    <TextField.Root
                      placeholder="e.g. 816801264840406"
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                    />
                  </Box>

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Flex
                        align="start"
                        gap="2"
                        p="3"
                        style={{
                          background: "var(--red-a3)",
                          borderRadius: "var(--radius-3)",
                          border: "1px solid var(--red-a5)",
                        }}
                      >
                        <ExclamationTriangleIcon
                          style={{ color: "var(--red-11)", flexShrink: 0, marginTop: 1 }}
                        />
                        <Text size="2" style={{ color: "var(--red-11)" }}>
                          {errorMsg}
                        </Text>
                      </Flex>
                    </motion.div>
                  )}
                </Flex>
              </Box>

              <Separator size="4" />

              <Flex
                align="center"
                justify="between"
                px="5"
                py="3"
                style={isSmallMobile ? mobileFooterStyle : undefined}
              >
                <Button
                  variant="ghost"
                  color="gray"
                  onClick={() => {
                    setStep("instructions");
                    setErrorMsg(null);
                  }}
                >
                  ← Back
                </Button>
                <Flex gap="2">
                  <Button variant="soft" color="gray" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={reconnectCb.loading || !token.trim()}
                    style={{ minWidth: 120 }}
                  >
                    {reconnectCb.loading ? "Connecting…" : "Test & Connect"}
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap="4"
                px="5"
                py="8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 260, delay: 0.1 }}
                >
                  <CheckCircledIcon
                    width={52}
                    height={52}
                    style={{ color: "var(--green-9)" }}
                  />
                </motion.div>
                <Box style={{ textAlign: "center" }}>
                  <Text size="4" weight="bold" as="div">
                    Connected!
                  </Text>
                  {connectedPage?.pageName && (
                    <Text size="2" color="gray" as="div" mt="1">
                      Successfully connected to{" "}
                      <strong>{connectedPage.pageName}</strong>
                    </Text>
                  )}
                  <Text size="1" color="gray" as="div" mt="2">
                    Closing automatically…
                  </Text>
                </Box>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};
