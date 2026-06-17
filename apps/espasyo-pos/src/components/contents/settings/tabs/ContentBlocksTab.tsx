import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Select,
  Separator,
  Text,
  TextArea,
  TextField as RxTextField,
} from "@radix-ui/themes";
import {
  AddCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  Restore,
} from "@mui/icons-material";
import { useApi, useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  BulkUpdateContentBlockParams,
  ContentBlockDto,
  CreateContentBlockParams,
} from "core-lib/api/commons/types";
import { PAGE_KEYS } from "core-lib/business/settings";
import { Button } from "core-lib/components/radix/buttons/Button";
import { MessageBlock } from "core-lib/components/radix/blocks/messages";
import { MessageType } from "core-lib/components/topAlertMessages/types";
import { mobileDialogStyle, mobileContentStyle, mobileHeaderStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

const PAGE_OPTIONS = Object.entries(PAGE_KEYS).map(([label, value]) => ({
  label,
  value,
}));

const CONTENT_TYPES = ["text", "html", "markdown"] as const;

export const ContentBlocksTab: React.FC = () => {
  const { showToast } = useToastContext();
  const [activePage, setActivePage] = useState<string>(PAGE_KEYS.Login);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);

  const data = useApi(
    (api) => api.commons.contentBlockByPage(activePage),
    [activePage],
  );
  const bulkCb = useApiCallback(
    async (api, args: BulkUpdateContentBlockParams) =>
      await api.commons.bulkUpdateContentBlocks(args),
  );
  const deleteCb = useApiCallback(
    async (api, id: string) => await api.commons.deleteContentBlock(id),
  );

  const blocks = useMemo<ContentBlockDto[]>(
    () => data.result?.data.response ?? [],
    [data.result?.data.response],
  );

  useEffect(() => {
    setDrafts({});
  }, [activePage]);

  const dirtyCount = Object.keys(drafts).length;

  const handleDraft = (block: ContentBlockDto, next: string) => {
    setDrafts((prev) => {
      const updated = { ...prev };
      if (next === block.value) delete updated[block.contentBlockID];
      else updated[block.contentBlockID] = next;
      return updated;
    });
  };

  const handleSave = async () => {
    if (dirtyCount === 0) {
      showToast("No changes to save", "info");
      return;
    }
    try {
      const payload: BulkUpdateContentBlockParams = {
        blocks: Object.entries(drafts).map(([contentBlockID, value]) => ({
          contentBlockID,
          value,
        })),
      };
      const result = await bulkCb.execute(payload);
      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast(`${dirtyCount} content block(s) saved`, "success");
        setDrafts({});
        data.execute();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to save content";
      showToast(message, "error");
    } catch (error) {
      console.error("Error saving content blocks:", error);
      showToast("Failed to save content", "error");
    }
  };

  const handleDelete = async (block: ContentBlockDto) => {
    if (
      !confirm(`Delete content block "${block.contentKey}"? This is a soft delete.`)
    ) {
      return;
    }
    try {
      const result = await deleteCb.execute(block.contentBlockID);
      if (result.status >= 200 && result.status < 300 && result.data.success) {
        showToast("Content block deleted", "success");
        data.execute();
        return;
      }
      showToast(result.data.message ?? "Failed to delete", "error");
    } catch (error) {
      console.error("Error deleting block:", error);
      showToast("Failed to delete", "error");
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Card variant="surface" size="2">
        <Flex
          align={{ initial: "stretch", md: "center" }}
          justify="between"
          gap="3"
          direction={{ initial: "column", md: "row" }}
        >
          <Box>
            <Heading size="4">Content Blocks</Heading>
            <Text size="2" color="gray">
              Inline-editable copy keyed by{" "}
              <Text size="2" weight="medium" color="gray">
                pageKey + contentKey
              </Text>
              . The login page is the canonical example.
            </Text>
          </Box>
          <Flex align="center" gap="2" wrap="wrap">
            <Select.Root value={activePage} onValueChange={setActivePage}>
              <Select.Trigger />
              <Select.Content>
                {PAGE_OPTIONS.map((p) => (
                  <Select.Item key={p.value} value={p.value}>
                    {p.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {dirtyCount > 0 && (
              <Badge color="amber" variant="soft" radius="full">
                {dirtyCount} unsaved
              </Badge>
            )}
            <Button
              type="Secondary"
              onClick={() => setDrafts({})}
              disabled={dirtyCount === 0 || bulkCb.loading}
            >
              <Flex align="center" gap="2">
                <Restore fontSize="small" />
                Discard
              </Flex>
            </Button>
            <Button
              type="Primary"
              onClick={handleSave}
              loading={bulkCb.loading}
              disabled={dirtyCount === 0 || bulkCb.loading}
            >
              <Flex align="center" gap="2">
                <CheckCircleOutlined fontSize="small" />
                Save
              </Flex>
            </Button>
            <Button type="Secondary" onClick={() => setShowCreate(true)}>
              <Flex align="center" gap="2">
                <AddCircleOutlined fontSize="small" />
                New block
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      {data.loading && blocks.length === 0 ? (
        <Flex align="center" justify="center" py="9">
          <Text color="gray">Loading content…</Text>
        </Flex>
      ) : blocks.length === 0 ? (
        <MessageBlock
          type={MessageType.Info}
          header={`No content for "${activePage}"`}
          text="Use 'New block' to add the first piece of admin-editable copy for this page."
        />
      ) : (
        <Card variant="surface" size="3">
          <Flex direction="column" gap="0">
            {blocks
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((b, idx) => (
                <React.Fragment key={b.contentBlockID}>
                  {idx > 0 && <Separator size="4" my="3" />}
                  <BlockRow
                    block={b}
                    draftValue={drafts[b.contentBlockID]}
                    onChange={handleDraft}
                    onDelete={handleDelete}
                  />
                </React.Fragment>
              ))}
          </Flex>
        </Card>
      )}

      <CreateContentBlockDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        defaultPageKey={activePage}
        onCreated={() => {
          setShowCreate(false);
          data.execute();
        }}
      />
    </Flex>
  );
};

interface BlockRowProps {
  block: ContentBlockDto;
  draftValue?: string;
  onChange: (b: ContentBlockDto, next: string) => void;
  onDelete: (b: ContentBlockDto) => void;
}

const BlockRow: React.FC<BlockRowProps> = ({
  block,
  draftValue,
  onChange,
  onDelete,
}) => {
  const isDirty = draftValue !== undefined;
  const value = draftValue ?? block.value ?? "";

  return (
    <Flex
      direction={{ initial: "column", md: "row" }}
      gap="4"
      align={{ initial: "stretch", md: "start" }}
    >
      <Box style={{ flex: "0 0 280px" }}>
        <Flex align="center" gap="2" wrap="wrap">
          <Text size="2" weight="bold">
            {block.contentKey}
          </Text>
          {isDirty && (
            <Badge color="amber" variant="soft" radius="full" size="1">
              Dirty
            </Badge>
          )}
          <Badge color="gray" variant="soft" radius="full" size="1">
            {block.contentType}
          </Badge>
        </Flex>
        {block.description && (
          <Text size="1" color="gray" as="div" mt="1">
            {block.description}
          </Text>
        )}
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        {value.length > 80 || block.contentType !== "text" ? (
          <TextArea
            value={value}
            rows={4}
            onChange={(e) => onChange(block, e.target.value)}
          />
        ) : (
          <RxTextField.Root
            value={value}
            onChange={(e) => onChange(block, e.target.value)}
          />
        )}
      </Box>
      <Box>
        <IconButton
          variant="ghost"
          color="red"
          onClick={() => onDelete(block)}
          aria-label={`Delete ${block.contentKey}`}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Box>
    </Flex>
  );
};

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPageKey: string;
  onCreated: () => void;
}

const CreateContentBlockDialog: React.FC<CreateDialogProps> = ({
  open,
  onOpenChange,
  defaultPageKey,
  onCreated,
}) => {
  const { isSmallMobile } = useResolution();
  const { showToast } = useToastContext();
  const [pageKey, setPageKey] = useState(defaultPageKey);
  const [contentKey, setContentKey] = useState("");
  const [value, setValue] = useState("");
  const [contentType, setContentType] = useState<string>("text");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  const createCb = useApiCallback(
    async (api, args: CreateContentBlockParams) =>
      await api.commons.createContentBlock(args),
  );

  useEffect(() => {
    if (open) {
      setPageKey(defaultPageKey);
      setContentKey("");
      setValue("");
      setContentType("text");
      setDescription("");
      setDisplayOrder(0);
    }
  }, [open, defaultPageKey]);

  const handleSubmit = async () => {
    if (!pageKey.trim() || !contentKey.trim()) {
      showToast("Page key and content key are required", "error");
      return;
    }
    try {
      const result = await createCb.execute({
        pageKey: pageKey.trim(),
        contentKey: contentKey.trim(),
        value,
        contentType,
        description: description.trim() || undefined,
        displayOrder,
      });
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast("Content block created", "success");
        onCreated();
        return;
      }
      const message =
        (Array.isArray(result.data.errors)
          ? (result.data.errors as string[])[0]
          : null) ??
        result.data.message ??
        "Failed to create content block";
      showToast(message, "error");
    } catch (error) {
      console.error("Error creating content block:", error);
      showToast("Failed to create content block", "error");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 520 }}>
        <Flex direction="column" style={{ height: "100%" }}>
        <Box style={isSmallMobile ? mobileHeaderStyle : undefined}>
          <Dialog.Title>New content block</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            Add a fresh string keyed by pageKey + contentKey.
          </Dialog.Description>
        </Box>
        <Box style={isSmallMobile ? mobileContentStyle : undefined}>
        <Flex direction="column" gap="3" mt="4">
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Page key
            </Text>
            <Select.Root value={pageKey} onValueChange={setPageKey}>
              <Select.Trigger style={{ width: "100%" }} />
              <Select.Content>
                {PAGE_OPTIONS.map((p) => (
                  <Select.Item key={p.value} value={p.value}>
                    {p.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Content key
            </Text>
            <RxTextField.Root
              value={contentKey}
              placeholder="e.g. welcome.title"
              onChange={(e) => setContentKey(e.target.value)}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Content type
            </Text>
            <Select.Root value={contentType} onValueChange={setContentType}>
              <Select.Trigger style={{ width: "100%" }} />
              <Select.Content>
                {CONTENT_TYPES.map((t) => (
                  <Select.Item key={t} value={t}>
                    {t}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Value
            </Text>
            <TextArea
              value={value}
              rows={4}
              onChange={(e) => setValue(e.target.value)}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Description (optional)
            </Text>
            <RxTextField.Root
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" as="div" mb="1">
              Display order
            </Text>
            <RxTextField.Root
              type="number"
              value={String(displayOrder)}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            />
          </Box>
        </Flex>
        </Box>
        <Flex justify="end" gap="3" mt="4" style={isSmallMobile ? mobileFooterStyle : undefined}>
          <Button
            type="Secondary"
            disabled={createCb.loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="Primary"
            onClick={handleSubmit}
            loading={createCb.loading}
            disabled={createCb.loading}
          >
            Create
          </Button>
        </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
