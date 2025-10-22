import * as yup from "yup";

export const createBookingSchema = yup.object({
  driverId: yup.string().required("Kindly select driver").default(""),
  helperId: yup.string().required("Kindly select helper").default(""),
  vehicleId: yup.string().required("Kindly select vehicle").default(""),
  chassisId: yup.string().required("Kindly select chassis").default(""),
  location: yup.object({
    start: yup.string().required("Kindly fill start route").default(""),
    stop: yup.string().required("Kindly fill stop route").default(""),
  }),
});

export type CreateBookingType = yup.InferType<typeof createBookingSchema>;
