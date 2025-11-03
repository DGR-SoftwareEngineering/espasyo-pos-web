import * as yup from "yup";

export const createBookingSchema = yup.object({
  driverId: yup.string().required("Kindly select driver"),
  helperId: yup.string().notRequired(),
  vehicleId: yup.string().required("Kindly select vehicle"),
  location: yup.object({
    start: yup.string().required("Kindly fill start route"),
    stop: yup.string().required("Kindly fill stop route"),
  }),
});

export type CreateBookingType = yup.InferType<typeof createBookingSchema>;
