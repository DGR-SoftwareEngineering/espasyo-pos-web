import React, { useCallback, useState } from "react";
import {
  AlertDialog,
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { StickyNote2Outlined, AddCircleOutline } from "@mui/icons-material";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { useToastContext } from "core-lib";
import { CustomerDetailDto, CustomerNoteDto } from "core-lib/api/crm";
import { AddNoteDialog } from "../forms/AddNoteDialog";
import { formatDateTime } from "../format";

interface NotesTabProps {
  customer: CustomerDetailDto;
  onCustomerRefresh: (c: CustomerDetailDto) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  customer,
  onCustomerRefresh,
}) => {
  const { showToast } = useToastContext();
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerNoteDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isSmallMobile } = useResolution();

  const addNoteCb = useApiCallback(
    async (api, args: { id: string; note: string }) =>
      api.crm.addNote(args.id, { note: args.note }),
  );

  const deleteNoteCb = useApiCallback(
    async (api, args: { id: string; noteId: string }) =>
      api.crm.deleteNote(args.id, args.noteId),
  );

  const reload = useApiCallback(async (api, id: string) => api.crm.getById(id));

  const handleAdd = useCallback(
    async (text: string) => {
      setAddLoading(true);
      try {
        const result = await addNoteCb.execute({
          id: customer.customerID,
          note: text,
        });
        const refreshed = result?.data?.response;
        if (result?.data?.success && refreshed) {
          showToast("Note added", "success");
          setAddOpen(false);
          onCustomerRefresh(refreshed);
          return;
        }
        const msg =
          Array.isArray(result?.data?.errors) && result.data.errors.length > 0
            ? (result.data.errors as string[])[0]
            : result?.data?.message ?? "Failed to add note";
        showToast(msg, "error");
      } catch {
        showToast("Failed to add note", "error");
      } finally {
        setAddLoading(false);
      }
    },
    [customer.customerID, addNoteCb, onCustomerRefresh, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const result = await deleteNoteCb.execute({
        id: customer.customerID,
        noteId: deleteTarget.customerNoteID,
      });
      if (result?.data?.success) {
        // The delete endpoint returns a message — reload the customer for fresh notes.
        const fresh = await reload.execute(customer.customerID);
        const updated = fresh?.data?.response;
        showToast("Note removed", "success");
        setDeleteTarget(null);
        if (updated) onCustomerRefresh(updated);
        return;
      }
      const msg =
        Array.isArray(result?.data?.errors) && result.data.errors.length > 0
          ? (result.data.errors as string[])[0]
          : result?.data?.message ?? "Failed to remove note";
      showToast(msg, "error");
    } catch {
      showToast("Failed to remove note", "error");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, deleteNoteCb, reload, customer.customerID, onCustomerRefresh, showToast]);

  const notes = customer.notes ?? [];

  return (
    <>
      <Card variant="surface" size="3">
        <Flex justify="between" align="center" mb="3">
          <Flex align="center" gap="2">
            <StickyNote2Outlined style={{ fontSize: 18, color: "var(--yellow-11)" }} />
            <Text size="3" weight="bold">
              Notes
            </Text>
          </Flex>
          <Button variant="soft" color="indigo" size="2" onClick={() => setAddOpen(true)}>
            <AddCircleOutline style={{ fontSize: 16 }} />
            Add Note
          </Button>
        </Flex>

        {notes.length === 0 ? (
          <Box style={{ padding: 24, textAlign: "center" }}>
            <Text size="2" color="gray">
              No notes yet. Add quick reminders, preferences, or context for the team.
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="2">
            {notes.map((n) => (
              <Card
                key={n.customerNoteID}
                variant="surface"
                style={{
                  background: "var(--yellow-a2)",
                  borderColor: "var(--yellow-a5)",
                }}
              >
                <Flex justify="between" align="start" gap="3">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="2" style={{ whiteSpace: "pre-wrap" }}>
                      {n.note}
                    </Text>
                    <Flex gap="2" mt="2" align="center">
                      <Text size="1" color="gray">
                        {formatDateTime(n.createdAt)}
                      </Text>
                      {n.createdBy && (
                        <Text size="1" color="gray">
                          · by {n.createdBy}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                  <Tooltip content="Delete note">
                    <IconButton
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={() => setDeleteTarget(n)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Card>

      <AddNoteDialog
        open={addOpen}
        loading={addLoading}
        onClose={() => (addLoading ? null : setAddOpen(false))}
        onSubmit={handleAdd}
      />

      <AlertDialog.Root
        open={!!deleteTarget}
        onOpenChange={(o) => (!o && !deleteLoading ? setDeleteTarget(null) : undefined)}
      >
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : { maxWidth: 400 }}>
          <AlertDialog.Title>Remove this note?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            The note will be soft-deleted and hidden from the customer&apos;s profile.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={deleteLoading}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={handleDelete} loading={deleteLoading}>
              Remove
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
