import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertDialog, Box, Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useApi, useApiCallback, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { useToastContext } from "core-lib";
import {
  FacebookPageInfoDto,
  FacebookPostDto,
} from "core-lib/api/commons/types";
import { FacebookPageInfoBanner } from "./FacebookPageInfoBanner";
import { FacebookPostCard } from "./FacebookPostCard";
import { FacebookPostComposer } from "./FacebookPostComposer";
import { FacebookPostPreviewDialog } from "./FacebookPostPreviewDialog";
import { FacebookReconnectDialog } from "./FacebookReconnectDialog";

export const FacebookBlock: React.FC = () => {
  const { showToast } = useToastContext();
  const [composerOpen, setComposerOpen] = useState(false);
  const [editPost, setEditPost] = useState<FacebookPostDto | null>(null);
  const [previewPost, setPreviewPost] = useState<FacebookPostDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [posts, setPosts] = useState<FacebookPostDto[]>([]);
  const [pageInfo, setPageInfo] = useState<FacebookPageInfoDto | null>(null);
  const [reconnectOpen, setReconnectOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const { isSmallMobile } = useResolution();

  const postsData = useApi((api) => api.commons.facebookPostList(), []);
  const pageInfoData = useApi((api) => api.commons.facebookPageInfo(), []);
  const deleteCb = useApiCallback(
    async (api, id: string) => api.commons.deleteFacebookPost(id),
  );
  const disconnectCb = useApiCallback(async (api) => api.commons.disconnectFacebook());

  useEffect(() => {
    setPosts((postsData.result?.data?.response as FacebookPostDto[] | null) ?? []);
  }, [postsData.result]);

  useEffect(() => {
    setPageInfo(
      (pageInfoData.result?.data?.response as FacebookPageInfoDto | null) ?? null,
    );
  }, [pageInfoData.result]);

  const tokenExpired = useMemo(() => {
    if (pageInfoData.loading || pageInfo) return false;
    const errs = pageInfoData.result?.data?.errors as string[] | null;
    return (
      errs?.some(
        (e) =>
          e.toLowerCase().includes("access token") ||
          e.toLowerCase().includes("session has expired") ||
          e.toLowerCase().includes("oauth"),
      ) ?? false
    );
  }, [pageInfoData.loading, pageInfoData.result, pageInfo]);

  const notConfigured = useMemo(() => {
    if (pageInfoData.loading || pageInfo || tokenExpired) return false;
    const err = pageInfoData.error as (string[] & { status?: number }) | undefined;
    if (!err) return false;
    if (err.status === 503) return true;
    return err.some?.((e) => typeof e === "string" && e.toLowerCase().includes("not configured")) ?? false;
  }, [pageInfoData.loading, pageInfoData.error, pageInfoData.result, pageInfo, tokenExpired]);

  const handleNewPost = useCallback(() => {
    setEditPost(null);
    setComposerOpen(true);
  }, []);

  const handleEdit = useCallback((post: FacebookPostDto) => {
    setEditPost(post);
    setComposerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        const result = await deleteCb.execute(id);
        if (result?.data?.success) {
          showToast("Post deleted.", "success");
          postsData.execute();
        } else {
          const msg =
            Array.isArray(result?.data?.errors) && result.data.errors.length > 0
              ? (result.data.errors as string[])[0]
              : result?.data?.message ?? "Failed to delete post.";
          showToast(msg, "error");
        }
      } catch {
        showToast("An error occurred while deleting.", "error");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteCb, postsData, showToast],
  );

  const handleSuccess = useCallback(() => {
    setComposerOpen(false);
    postsData.execute();
  }, [postsData]);

  const handleDisconnect = useCallback(async () => {
    const result = await disconnectCb.execute();
    if (result?.data?.success) {
      showToast("Facebook page disconnected.", "success");
      setPageInfo(null);
      pageInfoData.execute();
    } else {
      const msg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to disconnect.";
      showToast(msg, "error");
    }
    setDisconnectOpen(false);
  }, [disconnectCb, pageInfoData, showToast]);

  return (
    <Box p="4">
      <FacebookPageInfoBanner
        pageInfo={pageInfo}
        loading={pageInfoData.loading}
        postCount={posts.length}
        onNewPost={handleNewPost}
        tokenExpired={tokenExpired}
        onReconnect={() => setReconnectOpen(true)}
        onUpdateToken={() => setReconnectOpen(true)}
        onDisconnect={() => setDisconnectOpen(true)}
        notConfigured={notConfigured}
        onConnect={() => setReconnectOpen(true)}
      />

      <Box mt="5">
        {postsData.loading && (
          <Flex align="center" justify="center" py="8" gap="2">
            <Spinner loading />
            <Text color="gray">Loading posts…</Text>
          </Flex>
        )}

        {!postsData.loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Flex direction="column" align="center" justify="center" py="10" gap="2">
              <Text size="6" style={{ userSelect: "none" }}>📭</Text>
              <Text size="3" color="gray" weight="medium">
                No posts yet
              </Text>
              <Text size="2" color="gray">
                Hit "Create Post" to publish your first Facebook post.
              </Text>
            </Flex>
          </motion.div>
        )}

        {!postsData.loading && posts.length > 0 && (
          <Flex direction="column" gap="3">
            {posts.map((post, i) => (
              <FacebookPostCard
                key={post.facebookPostID}
                post={post}
                index={i}
                deleting={deletingId === post.facebookPostID}
                pageInfo={pageInfo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPreview={(p) => setPreviewPost(p)}
              />
            ))}
          </Flex>
        )}
      </Box>

      <FacebookPostComposer
        open={composerOpen}
        editPost={editPost}
        pageInfo={pageInfo}
        onClose={() => setComposerOpen(false)}
        onSuccess={handleSuccess}
      />

      <FacebookPostPreviewDialog
        post={previewPost}
        pageInfo={pageInfo}
        onClose={() => setPreviewPost(null)}
        onEdit={(p) => {
          setPreviewPost(null);
          handleEdit(p);
        }}
        onDelete={(id) => {
          setPreviewPost(null);
          handleDelete(id);
        }}
      />

      <FacebookReconnectDialog
        open={reconnectOpen}
        onClose={() => setReconnectOpen(false)}
        onSuccess={() => {
          setReconnectOpen(false);
          pageInfoData.execute();
          postsData.execute();
        }}
      />

      <AlertDialog.Root open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: "420px" }}>
          <AlertDialog.Title>Disconnect Facebook Page?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            This will remove the stored access token. You will need to reconnect to publish new posts.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                color="red"
                onClick={handleDisconnect}
                disabled={disconnectCb.loading}
              >
                {disconnectCb.loading ? "Disconnecting…" : "Disconnect"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};
