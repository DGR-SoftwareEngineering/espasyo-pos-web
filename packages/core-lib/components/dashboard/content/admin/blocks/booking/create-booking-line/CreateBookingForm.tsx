import React from "react";
import { useCreateBookingWizardSteps } from "./steps/useSteps";
import { useCreateBookingFormContext } from "./CreateBookingContext";
import { CreateBookingType } from "./validation";
import { useBeforeUnload, useModal } from "../../../../../../../core/hooks";
import { SaveConfirmationModal } from "../../../../../../modals/SaveConfirmationModal";

interface Props {
  id?: string;
  onConfirmSave(values: CreateBookingType): Promise<void>;
  modalIsLoading: boolean;
}

export const CreateBookingForm: React.FC<Props> = ({
  id,
  onConfirmSave,
  modalIsLoading,
}) => {
  const { form, isDirty, setIsDirty } = useCreateBookingFormContext();
  const saveConfirmationModal = useModal<unknown>();
  const { continueRoute } = useBeforeUnload(
    isDirty,
    saveConfirmationModal.open
  );
  const { render, reset } = useCreateBookingWizardSteps(
    form.handleSubmit((data) => handleSave(data))
  );
  return (
    <>
      {render}
      <SaveConfirmationModal
        isLoading={modalIsLoading}
        onSave={saveConfirmationModal.close}
        onClose={saveConfirmationModal.close}
        onCancel={handleConfirmationCancel}
        {...saveConfirmationModal.props}
      />
    </>
  );

  async function handleConfirmationCancel() {
    saveConfirmationModal.close();
    await continueRoute();
  }

  async function handleSave(values: CreateBookingType) {
    try {
      setIsDirty(false);
      await onConfirmSave(values);
      saveConfirmationModal.close();
    } catch (error) {
      console.error(`Something went wrong during saving: ${error}`);
    }
    reset();
  }
};
