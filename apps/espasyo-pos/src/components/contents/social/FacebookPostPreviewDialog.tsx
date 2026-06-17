import React, { useState } from "react";
import {
  AlertDialog,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Cross2Icon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileContentStyle, mobileHeaderStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { FacebookPageInfoDto, FacebookPostDto, FacebookPostStatus } from "core-lib/api/commons/types";

interface Props {
  post: FacebookPostDto | null;
  pageInfo?: FacebookPageInfoDto | null;
  onClose: () => void;
  onEdit: (post: FacebookPostDto) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<FacebookPostStatus, { label: string; color: "green" | "gray" | "amber" }> = {
  [FacebookPostStatus.Published]: { label: "Published", color: "green" },
  [FacebookPostStatus.Draft]: { label: "Draft", color: "gray" },
  [FacebookPostStatus.Scheduled]: { label: "Scheduled", color: "amber" },
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const relativeTime = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};

const renderWithHashtags = (text: string): React.ReactNode =>
  text.split(/(#\w+)/g).map((part, i) =>
    /^#\w+$/.test(part)
      ? <span key={i} style={{ color: "var(--accent-11)", fontWeight: 600 }}>{part}</span>
      : part
  );

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const ImageGallery: React.FC<{ urls: string[] }> = ({ urls }) => {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <Box style={{ borderRadius: "var(--radius-3)", overflow: "hidden", aspectRatio: "16/9", background: "var(--gray-a3)" }}>
        <img src={urls[0]} alt="" style={{ ...imgStyle }} />
      </Box>
    );
  }

  if (urls.length === 2) {
    return (
      <Box style={{ borderRadius: "var(--radius-3)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, aspectRatio: "16/9" }}>
        {urls.map((u, i) => <img key={i} src={u} alt="" style={imgStyle} />)}
      </Box>
    );
  }

  if (urls.length === 3) {
    return (
      <Box style={{ borderRadius: "var(--radius-3)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, aspectRatio: "16/9" }}>
        <img src={urls[0]} alt="" style={{ ...imgStyle, gridRow: "1 / 3" }} />
        <img src={urls[1]} alt="" style={imgStyle} />
        <img src={urls[2]} alt="" style={imgStyle} />
      </Box>
    );
  }

  const remaining = urls.length - 4;
  return (
    <Box style={{ borderRadius: "var(--radius-3)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, aspectRatio: "1" }}>
      {urls.slice(0, 4).map((u, i) => (
        <Box key={i} style={{ position: "relative" }}>
          <img src={u} alt="" style={imgStyle} />
          {i === 3 && remaining > 0 && (
            <Flex align="center" justify="center" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "var(--font-size-5)", fontWeight: 700 }}>
              +{remaining}
            </Flex>
          )}
        </Box>
      ))}
    </Box>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Flex justify="between" align="start" gap="4" py="1">
    <Text size="1" color="gray" style={{ flexShrink: 0, minWidth: 120 }}>
      {label}
    </Text>
    <Text size="1" style={{ textAlign: "right", wordBreak: "break-all" }}>
      {value}
    </Text>
  </Flex>
);

export const FacebookPostPreviewDialog: React.FC<Props> = ({
  post,
  pageInfo,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { isSmallMobile } = useResolution();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!post) return null;

  const badge = STATUS_BADGE[post.status] ?? { label: post.statusName, color: "gray" as const };

  return (
    <>
      <Dialog.Root open={!!post} onOpenChange={(v) => { if (!v) onClose(); }}>
        <Dialog.Content
          style={{
            ...(isSmallMobile
              ? mobileDialogStyle
              : { maxWidth: 500, borderRadius: "var(--radius-5)", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }),
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
            <Flex align="center" gap="3">
              <Avatar
                size="3"
                src={pageInfo?.pictureUrl ?? undefined}
                fallback={pageInfo?.name?.[0] ?? "F"}
                style={{ border: "1px solid var(--gray-a4)" }}
              />
              <Box>
                <Text size="2" weight="bold" as="div">
                  {pageInfo?.name ?? "Facebook Page"}
                </Text>
                <Flex align="center" gap="2">
                  <Text size="1" color="gray">
                    {relativeTime(post.createdAt)}
                  </Text>
                  <Text size="1" color="gray">·</Text>
                  <Badge color={badge.color} size="1" variant="soft">
                    {badge.label}
                  </Badge>
                </Flex>
              </Box>
            </Flex>
            <Button
              variant="ghost"
              color="gray"
              size="2"
              style={{ borderRadius: "50%", padding: 6 }}
              onClick={onClose}
            >
              <Cross2Icon />
            </Button>
          </Flex>

          {/* Scrollable body */}
          <Box
            style={{
              ...(isSmallMobile
                ? mobileContentStyle
                : { maxHeight: "60vh", overflowY: "auto" }),
            }}
          >
            {/* Message */}
            <Box px="4" pt="3" pb="2">
              <Text
                size="3"
                as="div"
                style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}
              >
                {renderWithHashtags(post.message)}
              </Text>
            </Box>

            {/* Image gallery */}
            {post.imageUrls.length > 0 && (
              <Box px="4" pb="3">
                <ImageGallery urls={post.imageUrls} />
              </Box>
            )}

            <Separator size="4" />

            {/* Metadata table */}
            <Box px="4" py="3">
              <Text size="1" weight="bold" color="gray" as="div" mb="2">
                POST DETAILS
              </Text>

              <InfoRow label="Status" value={
                <Badge color={badge.color} size="1">{badge.label}</Badge>
              } />

              <InfoRow
                label="Posted at"
                value={post.postedAt ? formatDate(post.postedAt) : <Text size="1" color="gray">Not yet published</Text>}
              />

              {post.status === FacebookPostStatus.Scheduled && post.scheduledAt && (
                <InfoRow label="Scheduled for" value={formatDate(post.scheduledAt)} />
              )}

              <InfoRow
                label="Facebook Post ID"
                value={
                  post.facebookGraphPostId
                    ? <Text size="1" style={{ fontFamily: "monospace", fontSize: 11 }}>{post.facebookGraphPostId}</Text>
                    : <Text size="1" color="gray">—</Text>
                }
              />

              <InfoRow label="Images" value={`${post.imageUrls.length} ${post.imageUrls.length === 1 ? "photo" : "photos"}`} />
              <InfoRow label="Created" value={formatDate(post.createdAt)} />
              <InfoRow
                label="Last updated"
                value={post.updatedAt && post.updatedAt !== post.createdAt ? formatDate(post.updatedAt) : <Text size="1" color="gray">—</Text>}
              />
            </Box>
          </Box>

          {/* Action footer */}
          <Flex
            align="center"
            justify="between"
            px="4"
            py="3"
            style={{
              borderTop: "1px solid var(--gray-a4)",
              background: "var(--gray-a1)",
              ...(isSmallMobile ? mobileFooterStyle : {}),
            }}
          >
            <Flex gap="2">
              <Button
                variant="soft"
                size="2"
                onClick={() => {
                  onEdit(post);
                  onClose();
                }}
                style={{ gap: 6 }}
              >
                <Pencil1Icon />
                Edit Post
              </Button>
              <Button
                variant="soft"
                color="red"
                size="2"
                onClick={() => setConfirmDelete(true)}
                style={{ gap: 6 }}
              >
                <TrashIcon />
                Delete Post
              </Button>
            </Flex>
            <Button variant="soft" color="gray" size="2" onClick={onClose}>
              Close
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete confirm — outside Dialog to avoid z-index conflicts */}
      <AlertDialog.Root
        open={confirmDelete}
        onOpenChange={(v) => { if (!v) setConfirmDelete(false); }}
      >
        <AlertDialog.Content
          style={isSmallMobile ? mobileDialogStyle : { maxWidth: 440 }}
        >
          <AlertDialog.Title>Delete this post?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            This will permanently delete the post from Facebook and your records.
            This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              color="red"
              onClick={() => {
                setConfirmDelete(false);
                onDelete(post.facebookPostID);
                onClose();
              }}
            >
              Delete
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
