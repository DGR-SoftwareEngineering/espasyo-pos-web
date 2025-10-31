import { CreateBookingForm } from "./CreateBookingForm";
import { CreateBookingFormContextProvider } from "./CreateBookingContext";
import { CreateBookingType } from "./validation";

export const CreateBookingFormBlock = () => {
  return (
    <CreateBookingFormContextProvider>
      <CreateBookingForm
        onConfirmSave={handleSubmission}
        modalIsLoading={false}
      />
    </CreateBookingFormContextProvider>
  );
  async function handleSubmission(values: CreateBookingType) {}
};
