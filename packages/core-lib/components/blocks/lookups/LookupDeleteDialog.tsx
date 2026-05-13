import {
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { DialogBox } from "../../dialog/DialogBox";
import { useToastContext } from "../../../core/contexts";
import { useApiCallback } from "../../../core/hooks";
import { LookupAdminConfig, LookupDtoBase } from "./types";

interface Props<TDto extends LookupDtoBase> {
  open: boolean;
  config: LookupAdminConfig<TDto>;
  row?: TDto;
  onClose: () => void;
  onSuccess: () => void;
}

export function LookupDeleteDialog<TDto extends LookupDtoBase>({
  open,
  config,
  row,
  onClose,
  onSuccess,
}: Props<TDto>) {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const deleteCb = useApiCallback(
    async (api, ids: string[]) => await config.selectors.delete(api, ids),
  );

  const handleDelete = async () => {
    if (!row) return;
    try {
      const id = row[config.idField] as unknown as string;
      const result = await deleteCb.execute([id]);
      if (
        result.status >= 200 &&
        result.status < 300 &&
        result.data.success
      ) {
        showToast(`${config.entityName} deleted successfully`, "success");
        onSuccess();
        onClose();
        return;
      }
      showToast(
        result.data.message ?? `Failed to delete ${config.entityName.toLowerCase()}`,
        "error",
      );
    } catch (error) {
      console.error(`Error deleting ${config.entityName}:`, error);
      showToast(`Failed to delete ${config.entityName.toLowerCase()}`, "error");
    }
  };

  return (
    <DialogBox
      open={open}
      onClose={() => onClose()}
      title={`Delete ${config.entityName}`}
      maxWidth="xs"
      loading={deleteCb.loading}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this {config.entityName.toLowerCase()}
          ?
        </Typography>

        {row && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {row.name}
            </Typography>
            {row.description && (
              <Typography variant="caption" color="text.secondary">
                {row.description}
              </Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <InfoOutlined color="info" sx={{ fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            This is a <strong>soft delete</strong>. The row will be marked
            inactive but historical references stay intact.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={deleteCb.loading}
            sx={{
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </DialogBox>
  );
}
