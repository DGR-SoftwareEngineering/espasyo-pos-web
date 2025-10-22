import { CreateBookingForm } from "./CreateBookingForm";
import { CreateBookingFormContextProvider } from "./CreateBookingContext";

export const CreateBookingFormBlock = () => (
  <CreateBookingFormContextProvider>
    <CreateBookingForm />
  </CreateBookingFormContextProvider>
);
