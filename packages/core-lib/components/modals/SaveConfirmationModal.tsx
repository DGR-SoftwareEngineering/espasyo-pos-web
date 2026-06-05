import { Grid, Typography } from "@mui/material";
import { PrimaryButton, SecondaryButton } from "../buttons";
import { Modal } from "../Modal";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const SaveConfirmationModal: React.FC<Props> = ({
  isOpen,
  onCancel,
  onSave,
  onClose,
  isLoading,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      topCloseButton
      maxWidth="sm"
      aria-label="summ-save-modal"
    >
      <Typography mb={8} align="center" variant="h4" fontWeight="bold">
        Save Confirmation
      </Typography>
      <Typography mb={8} align="center" variant="body1" component="div">
        Do you wish to save it now ?
      </Typography>
      <Grid container>
        <Grid size={{ xs: 12 }} mb={4}>
          <PrimaryButton onClick={handleSave} loading={isLoading} fullWidth>
            Save
          </PrimaryButton>
        </Grid>
        <Grid size={{ xs: 12 }} mb={8}>
          <SecondaryButton onClick={onCancel} fullWidth>
            Cancel
          </SecondaryButton>
        </Grid>
      </Grid>
    </Modal>
  );

  function handleSave() {
    onSave();
  }
};
