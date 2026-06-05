import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { StickyNote2Outlined } from "@mui/icons-material";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { DIALOG_TITLES } from "../constants";

interface AddNoteDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}

const MIN = 3;
const MAX = 1000;

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  const trimmed = text.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title={DIALOG_TITLES.addNote}
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
                background: "var(--yellow-a3)",
                color: "var(--yellow-11)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StickyNote2Outlined style={{ fontSize: 18 }} />
            </Box>
            <Text size="3" weight="bold">
              Add a note
            </Text>
          </Flex>

          <TextArea
            placeholder="Write something the next cashier or admin should know about this customer."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={5}
            size="2"
            disabled={loading}
          />

          <Flex justify="between" align="center">
            <Text size="1" color={trimmed.length < MIN ? "red" : "gray"}>
              {trimmed.length < MIN
                ? `${MIN - trimmed.length} more character(s) needed`
                : `${trimmed.length}/${MAX}`}
            </Text>
            <Flex gap="2">
              <Button variant="soft" color="gray" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                color="indigo"
                onClick={() => onSubmit(trimmed)}
                loading={loading}
                disabled={!valid}
              >
                Add Note
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </DialogBox>
  );
};
