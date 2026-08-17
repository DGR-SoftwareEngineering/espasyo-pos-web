import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Avatar,
  Button,
  Callout,
  Dialog,
  Spinner,
} from "@radix-ui/themes";;
import { AnimatePresence, motion } from "framer-motion";
import { Cross2Icon, ImageIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { mobileDialogStyle, mobileContentStyle, mobileHeaderStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import {
  CreateFacebookPostParams,
  FacebookPageInfoDto,
  FacebookPostDto,
  FacebookPostStatus,
  UpdateFacebookPostParams,
} from "core-lib/api/commons/types";
import { MultiImageUpload } from "./MultiImageUpload";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  editPost: FacebookPostDto | null;
  pageInfo?: FacebookPageInfoDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MIN_SCHEDULED_OFFSET_MS = 11 * 60 * 1000;

const getMinScheduledAt = () => {
  const d = new Date(Date.now() + MIN_SCHEDULED_OFFSET_MS);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const STATUS_OPTIONS = [
  { value: FacebookPostStatus.Published, icon: "🌐", label: "Publish now" },
  { value: FacebookPostStatus.Draft, icon: "📝", label: "Save as draft" },
  { value: FacebookPostStatus.Scheduled, icon: "🗓", label: "Schedule" },
];

const renderWithHashtags = (text: string): React.ReactNode =>
  text.split(/(#\w+)/g).map((part, i) =>
    /^#\w+$/.test(part)
      ? (
        <span key={i} style={{ color: "var(--accent-11)", fontWeight: 600 }}>
          {part}
        </span>
      )
      : part
  );

const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#\w+/g);
  return matches ? [...new Set(matches)] : [];
};

export const FacebookPostComposer: React.FC<Props> = ({
  open,
  editPost,
  pageInfo,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToastContext();
  const { isSmallMobile } = useResolution();
  const isEdit = !!editPost;

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FacebookPostStatus>(FacebookPostStatus.Published);
  const [scheduledAt, setScheduledAt] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removeAllImages, setRemoveAllImages] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiAnchorRef = useRef<HTMLDivElement>(null);

  const createCb = useApiCallback(
    async (api, params: CreateFacebookPostParams) => api.commons.createFacebookPost(params),
  );
  const updateCb = useApiCallback(
    async (api, params: UpdateFacebookPostParams) => api.commons.updateFacebookPost(params),
  );

  // Reset form on open/close
  useEffect(() => {
    if (open) {
      setSubmitError(null);
      setShowEmoji(false);
      if (editPost) {
        setMessage(editPost.message);
        setStatus(editPost.status);
        setScheduledAt(
          editPost.scheduledAt
            ? (() => {
                const d = new Date(editPost.scheduledAt!);
                const pad = (n: number) => n.toString().padStart(2, "0");
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
              })()
            : ""
        );
        setImageFiles([]);
        setRemoveAllImages(false);
        setShowImages(editPost.imageUrls.length > 0);
      } else {
        setMessage("");
        setStatus(FacebookPostStatus.Published);
        setScheduledAt("");
        setImageFiles([]);
        setRemoveAllImages(false);
        setShowImages(false);
      }
    }
  }, [open, editPost]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [message]);

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    const start = ta?.selectionStart ?? message.length;
    const newVal = message.slice(0, start) + emoji + message.slice(start);
    setMessage(newVal);
    setShowEmoji(false);
    requestAnimationFrame(() => {
      if (ta) {
        ta.setSelectionRange(start + emoji.length, start + emoji.length);
        ta.focus();
      }
    });
  };

  const hashtags = extractHashtags(message);
  const canSubmit = message.trim().length > 0 || imageFiles.length > 0;
  const hasExistingImages = isEdit && editPost && editPost.imageUrls.length > 0 && !removeAllImages;

  const handleSubmit = async () => {
    setSubmitError(null);

    if (status === FacebookPostStatus.Scheduled) {
      if (!scheduledAt) {
        setSubmitError("Please pick a scheduled date and time.");
        return;
      }
      const ts = new Date(scheduledAt).getTime();
      if (ts <= Date.now() + MIN_SCHEDULED_OFFSET_MS) {
        setSubmitError("Scheduled time must be at least 10 minutes from now.");
        return;
      }
      if (ts > Date.now() + 30 * 24 * 60 * 60 * 1000) {
        setSubmitError("Scheduled time must be within 30 days.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const isoScheduled =
        status === FacebookPostStatus.Scheduled && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null;

      let result;
      if (isEdit && editPost) {
        const params: UpdateFacebookPostParams = {
          facebookPostID: editPost.facebookPostID,
          message,
          imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
          removeAllImages: removeAllImages && imageFiles.length === 0,
          status,
          scheduledAt: isoScheduled,
        };
        result = await updateCb.execute(params);
      } else {
        const params: CreateFacebookPostParams = {
          message,
          imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
          status,
          scheduledAt: isoScheduled,
        };
        result = await createCb.execute(params);
      }

      if (result?.data?.success) {
        showToast(isEdit ? "Post updated." : "Post created.", "success");
        if (!isEdit && status === FacebookPostStatus.Published) {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        }
        onSuccess();
      } else {
        const msg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Something went wrong.";
        setSubmitError(msg);
      }
    } catch {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = () => {
    if (submitting) return <Spinner />;
    if (status === FacebookPostStatus.Published) return isEdit ? "Save" : "Post";
    if (status === FacebookPostStatus.Draft) return "Save draft";
    return "Schedule";
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v && !submitting) onClose(); }}>
      <Dialog.Content
        style={{
          ...(isSmallMobile
            ? mobileDialogStyle
            : { maxWidth: 560, borderRadius: "var(--radius-5)", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }),
          padding: 0,
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="between"
          px="4"
          py="3"
          style={{
            borderBottom: "1px solid var(--gray-a4)",
            ...(isSmallMobile ? mobileHeaderStyle : {}),
          }}
        >
          <Text size="4" weight="bold">
            {isEdit ? "Edit post" : "Create post"}
          </Text>
          <Button
            variant="ghost"
            color="gray"
            size="2"
            style={{ borderRadius: "50%", padding: 6 }}
            onClick={onClose}
            disabled={submitting}
          >
            <Cross2Icon />
          </Button>
        </Flex>

        {/* User row */}
        <Flex align="center" gap="3" px="4" pt="3" pb="1">
          <Avatar
            size="3"
            src={pageInfo?.pictureUrl ?? undefined}
            fallback={pageInfo?.name?.[0] ?? "F"}
          />
          <Box>
            <Text size="2" weight="bold" as="div">
              {pageInfo?.name ?? "Facebook Page"}
            </Text>
            <Box
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "1px 8px",
                borderRadius: "var(--radius-2)",
                background: "var(--gray-a3)",
                border: "1px solid var(--gray-a5)",
                cursor: "pointer",
                fontSize: "var(--font-size-1)",
              }}
              onClick={() => {
                const opts = STATUS_OPTIONS;
                const next = (opts.findIndex((o) => o.value === status) + 1) % opts.length;
                setStatus(opts[next].value);
              }}
            >
              {STATUS_OPTIONS.find((o) => o.value === status)?.icon ?? "🌐"}
              <Text size="1" weight="medium">
                {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Public"}
              </Text>
            </Box>
          </Box>
        </Flex>

        {/* Body */}
        <Box
          px="4"
          py="2"
          style={{
            ...(isSmallMobile
              ? { flex: 1, overflowY: "auto", minHeight: 0 }
              : { maxHeight: "52vh", overflowY: "auto" }),
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              background: "transparent",
              fontSize: "var(--font-size-4)",
              color: "var(--gray-12)",
              fontFamily: "inherit",
              lineHeight: 1.5,
              overflow: "hidden",
            }}
          />

          {/* Hashtag preview strip */}
          <AnimatePresence>
            {hashtags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ marginBottom: 8 }}
              >
                <Flex gap="1" wrap="wrap">
                  {hashtags.map((tag) => (
                    <Box
                      key={tag}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: "rgba(24,119,242,0.1)",
                        color: "#1877F2",
                        fontSize: "var(--font-size-1)",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scheduled time picker */}
          <AnimatePresence>
            {status === FacebookPostStatus.Scheduled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden" }}
              >
                <Flex
                  align="center"
                  gap="2"
                  mb="3"
                  p="3"
                  style={{
                    borderRadius: "var(--radius-3)",
                    background: "var(--amber-a2)",
                    border: "1px solid var(--amber-a5)",
                  }}
                >
                  <Text size="2">🗓</Text>
                  <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                    Schedule for:
                  </Text>
                  <input
                    type="datetime-local"
                    min={getMinScheduledAt()}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--font-size-2)",
                      color: "var(--gray-12)",
                      outline: "none",
                    }}
                  />
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing images (edit mode) */}
          <AnimatePresence>
            {isEdit && editPost && editPost.imageUrls.length > 0 && !removeAllImages && imageFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: 12 }}
              >
                <Flex align="center" justify="between" mb="2">
                  <Text size="2" weight="medium" color="gray">
                    Current photos ({editPost.imageUrls.length})
                  </Text>
                  <Button
                    variant="soft"
                    color="red"
                    size="1"
                    onClick={() => setRemoveAllImages(true)}
                  >
                    Remove all
                  </Button>
                </Flex>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                    gap: 4,
                  }}
                >
                  {editPost.imageUrls.map((url, i) => (
                    <Box
                      key={i}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "var(--radius-2)",
                        overflow: "hidden",
                        border: "1px solid var(--gray-a4)",
                      }}
                    >
                      <img
                        src={url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remove all notice */}
          <AnimatePresence>
            {isEdit && removeAllImages && imageFiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Flex
                  align="center"
                  justify="between"
                  p="2"
                  mb="2"
                  style={{
                    borderRadius: "var(--radius-3)",
                    background: "var(--red-a2)",
                    border: "1px solid var(--red-a5)",
                  }}
                >
                  <Text size="2" color="red">Photos will be removed on save.</Text>
                  <Button variant="ghost" size="1" color="gray" onClick={() => setRemoveAllImages(false)}>
                    Undo
                  </Button>
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New image upload area */}
          <AnimatePresence>
            {showImages && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden", marginBottom: 8 }}
              >
                <Flex align="center" justify="between" mb="2">
                  <Text size="2" weight="medium" color="gray">
                    {isEdit && hasExistingImages ? "Add more photos" : "Photos"}
                  </Text>
                  <Button
                    variant="ghost"
                    color="gray"
                    size="1"
                    onClick={() => {
                      setShowImages(false);
                      setImageFiles([]);
                    }}
                  >
                    Hide
                  </Button>
                </Flex>
                <MultiImageUpload
                  files={imageFiles}
                  onChange={setImageFiles}
                  maxFiles={isEdit && hasExistingImages ? 10 - (editPost?.imageUrls.length ?? 0) : 10}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Error callout */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <Box px="4" pb="1">
                <Callout.Root color="red" size="1">
                  <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                  <Callout.Text>{submitError}</Callout.Text>
                </Callout.Root>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer toolbar */}
        <Flex
          align="center"
          justify="between"
          px="4"
          py="3"
          style={{
            borderTop: "1px solid var(--gray-a4)",
            ...(isSmallMobile ? mobileFooterStyle : {}),
          }}
        >
          <Flex align="center" gap="1" style={{ position: "relative" }}>
            <Text size="1" color="gray" mr="1" style={{ userSelect: "none" }}>
              Add:
            </Text>

            {/* Photo button */}
            <Button
              variant={showImages ? "soft" : "ghost"}
              color={showImages ? "blue" : "gray"}
              size="2"
              title="Add photos"
              onClick={() => setShowImages((v) => !v)}
              style={{ borderRadius: "var(--radius-3)" }}
            >
              <ImageIcon />
              <Text size="1">Photo</Text>
            </Button>

            {/* Emoji button */}
            <div ref={emojiAnchorRef} style={{ position: "relative" }}>
              <Button
                variant={showEmoji ? "soft" : "ghost"}
                color={showEmoji ? "blue" : "gray"}
                size="2"
                title="Add emoji"
                onClick={() => setShowEmoji((v) => !v)}
                style={{ borderRadius: "var(--radius-3)" }}
              >
                <span style={{ fontSize: 16 }}>😊</span>
                <Text size="1">Emoji</Text>
              </Button>
              <AnimatePresence>
                {showEmoji && (
                  <EmojiPickerPopover
                    onSelect={insertEmoji}
                    onClose={() => setShowEmoji(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </Flex>

          <Flex align="center" gap="2">
            <Button
              variant="soft"
              color="gray"
              size="2"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <motion.button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              whileHover={canSubmit && !submitting ? { scale: 1.03 } : {}}
              whileTap={canSubmit && !submitting ? { scale: 0.97 } : {}}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 20px",
                borderRadius: 20,
                background: canSubmit && !submitting ? "var(--accent-9)" : "var(--gray-a6)",
                color: canSubmit && !submitting ? "#fff" : "var(--gray-8)",
                fontWeight: 700,
                fontSize: "var(--font-size-2)",
                border: "none",
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
                transition: "background 150ms ease",
                minWidth: 80,
              }}
            >
              {submitLabel()}
            </motion.button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
