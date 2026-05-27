import React, { useEffect, useState, KeyboardEvent } from "react";
import { Badge, Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { AddRounded, CloseRounded, LocalOfferOutlined } from "@mui/icons-material";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { DIALOG_TITLES, SUGGESTED_TAGS } from "../constants";

interface EditTagsDialogProps {
  open: boolean;
  initialTags?: string[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (tags: string[]) => void;
}

const MAX = 10;

export const EditTagsDialog: React.FC<EditTagsDialogProps> = ({
  open,
  initialTags = [],
  loading,
  onClose,
  onSubmit,
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) {
      setTags(initialTags);
      setDraft("");
    }
  }, [open, initialTags]);

  const add = (raw: string) => {
    const trimmed = raw.trim().slice(0, 50);
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= MAX) return;
    setTags([...tags, trimmed]);
    setDraft("");
  };

  const remove = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (draft.trim()) {
        e.preventDefault();
        add(draft);
      }
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      remove(tags[tags.length - 1]);
    }
  };

  const unused = SUGGESTED_TAGS.filter((s) => !tags.includes(s));

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title={DIALOG_TITLES.editTags}
      maxWidth="xs"
      disableDismiss={loading}
    >
      <Box p="4">
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--orange-a3)",
                color: "var(--orange-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalOfferOutlined style={{ fontSize: 18 }} />
            </Box>
            <Text size="3" weight="bold">
              Manage tags
            </Text>
          </Flex>

          <Box
            style={{
              border: "1px solid var(--gray-a6)",
              borderRadius: 8,
              padding: "8px 10px",
              minHeight: 48,
            }}
          >
            <Flex gap="2" align="center" wrap="wrap">
              {tags.length === 0 && (
                <Text size="1" color="gray">
                  No tags yet — pick one below or type your own.
                </Text>
              )}
              {tags.map((t) => (
                <Badge key={t} color="orange" variant="soft" size="2" style={{ gap: 4 }}>
                  {t}
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex" }}
                    aria-label={`Remove ${t}`}
                  >
                    <CloseRounded style={{ fontSize: 14 }} />
                  </button>
                </Badge>
              ))}
              <TextField.Root
                size="1"
                variant="soft"
                placeholder={tags.length >= MAX ? `Max ${MAX} tags` : "Add tag…"}
                value={draft}
                disabled={tags.length >= MAX || loading}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                style={{ flex: 1, minWidth: 100, background: "transparent" }}
              />
            </Flex>
          </Box>

          {unused.length > 0 && tags.length < MAX && (
            <Box>
              <Text size="1" color="gray" as="div" mb="1">
                Suggestions:
              </Text>
              <Flex gap="1" wrap="wrap">
                {unused.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => add(s)}
                    style={{
                      border: "1px dashed var(--gray-a6)",
                      background: "transparent",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--gray-11)",
                    }}
                  >
                    <AddRounded style={{ fontSize: 11 }} />
                    {s}
                  </button>
                ))}
              </Flex>
            </Box>
          )}

          <Flex gap="2" justify="end" mt="2">
            <Button variant="soft" color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button color="orange" onClick={() => onSubmit(tags)} loading={loading}>
              Save Tags
            </Button>
          </Flex>
        </Flex>
      </Box>
    </DialogBox>
  );
};
