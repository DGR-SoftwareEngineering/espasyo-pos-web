import React, { useState } from "react";
import {
  AlertDialog,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Popover,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { DotsHorizontalIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { FacebookPostDto, FacebookPostStatus } from "core-lib/api/commons/types";

interface Props {
  post: FacebookPostDto;
  index: number;
  deleting: boolean;
  pageInfo?: { name: string; pictureUrl: string | null } | null;
  onEdit: (post: FacebookPostDto) => void;
  onDelete: (id: string) => void;
  onPreview: (post: FacebookPostDto) => void;
}

const STATUS_BADGE: Record<FacebookPostStatus, { label: string; color: "green" | "gray" | "amber" }> = {
  [FacebookPostStatus.Published]: { label: "Published", color: "green" },
  [FacebookPostStatus.Draft]: { label: "Draft", color: "gray" },
  [FacebookPostStatus.Scheduled]: { label: "Scheduled", color: "amber" },
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
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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
        <img src={urls[0]} alt="" style={imgStyle} />
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

export const FacebookPostCard: React.FC<Props> = ({
  post,
  index,
  deleting,
  pageInfo,
  onEdit,
  onDelete,
  onPreview,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const badge = STATUS_BADGE[post.status] ?? { label: post.statusName, color: "gray" as const };
  const message = post.message;
  const isLong = message.length > 280;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.07, ease: "easeOut" }}
        whileHover={!deleting ? ({ y: -2, boxShadow: "0 10px 28px rgba(0,0,0,0.10)" } as any) : {}}
        style={{
          borderRadius: "var(--radius-4)",
          background: "var(--color-panel-solid)",
          border: "1px solid var(--gray-a4)",
          overflow: "hidden",
          opacity: deleting ? 0.5 : 1,
          transition: "opacity 200ms ease",
          cursor: deleting ? "default" : "pointer",
        }}
        onClick={() => {
          if (!deleting) onPreview(post);
        }}
      >
        {/* Card header */}
        <Flex align="center" justify="between" px="4" pt="4" pb="2">
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
                <Text size="1" color="gray" as="div">
                  {relativeTime(post.createdAt)}
                </Text>
                <Text size="1" color="gray">·</Text>
                <Badge color={badge.color} size="1" variant="soft">
                  {badge.label}
                </Badge>
              </Flex>
            </Box>
          </Flex>

          <Flex align="center" gap="1">
            {deleting && <Spinner loading size="2" />}
            {/* Stop propagation so "..." menu doesn't fire onPreview */}
            <div onClick={(e) => e.stopPropagation()}>
              <Popover.Root>
                <Popover.Trigger>
                  <Button size="1" variant="ghost" color="gray" style={{ borderRadius: "50%", padding: 6 }}>
                    <DotsHorizontalIcon />
                  </Button>
                </Popover.Trigger>
                <Popover.Content align="end" style={{ padding: 4, minWidth: 120 }}>
                  <Flex direction="column" gap="1">
                    <Button
                      variant="ghost"
                      color="gray"
                      size="1"
                      onClick={() => onEdit(post)}
                      style={{ justifyContent: "flex-start", gap: 8 }}
                    >
                      <Pencil1Icon />
                      Edit post
                    </Button>
                    <Button
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={() => setConfirmOpen(true)}
                      style={{ justifyContent: "flex-start", gap: 8 }}
                    >
                      <TrashIcon />
                      Delete post
                    </Button>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            </div>
          </Flex>
        </Flex>

        {/* Message */}
        <Box px="4" pb="2">
          <Text
            size="3"
            as="div"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.55,
              overflow: expanded ? "visible" : "hidden",
              display: expanded ? "block" : "-webkit-box",
              WebkitLineClamp: expanded ? undefined : 4,
              WebkitBoxOrient: "vertical" as any,
            }}
          >
            {renderWithHashtags(message)}
          </Text>
          {isLong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent-11)",
                fontWeight: 600,
                fontSize: "var(--font-size-2)",
                padding: 0,
                marginTop: 2,
              }}
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}
        </Box>

        {/* Image gallery */}
        {post.imageUrls.length > 0 && (
          <Box px="4" pb="3">
            <ImageGallery urls={post.imageUrls} />
          </Box>
        )}

        {/* Footer */}
        <Flex
          align="center"
          justify="between"
          px="4"
          py="2"
          style={{
            borderTop: "1px solid var(--gray-a3)",
            background: "var(--gray-a1)",
          }}
        >
          <Text size="1" color="gray">
            {post.postedAt
              ? `Posted ${formatDate(post.postedAt)}`
              : post.status === FacebookPostStatus.Scheduled && post.scheduledAt
              ? `Scheduled for ${formatDate(post.scheduledAt)}`
              : `Created ${formatDate(post.createdAt)}`}
          </Text>
          <Text size="1" color="gray" style={{ opacity: 0.6 }}>
            Click to view details
          </Text>
        </Flex>
      </motion.div>

      <AlertDialog.Root open={confirmOpen} onOpenChange={(open) => { if (!open) setConfirmOpen(false); }}>
        <AlertDialog.Content style={{ maxWidth: 440 }}>
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
                setConfirmOpen(false);
                onDelete(post.facebookPostID);
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
