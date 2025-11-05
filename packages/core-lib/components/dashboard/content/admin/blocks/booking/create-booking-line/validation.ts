import * as yup from "yup";

const latLngSchema = yup.object({
  lat: yup.number().min(-90).max(90).required(),
  lng: yup.number().min(-180).max(180).required(),
});

export const mapOptionSchema = yup
  .object({
    id: yup.mixed().nullable().optional(),
    label: yup
      .string()
      .trim()
      .min(1, "Label is required")
      .required("Label is required"),
    position: latLngSchema.nullable().optional(),
    placeResult: yup.mixed().nullable().optional(),
  })
  .test("has-coordinates", "Option must have coordinates", function (value) {
    if (!value) return false;
    if (value.position && latLngSchema.isValidSync(value.position)) return true;
    const pr = value.placeResult as any;
    if (
      pr?.geometry?.location &&
      typeof pr.geometry.location.lat === "function" &&
      typeof pr.geometry.location.lng === "function"
    ) {
      return true;
    }
    return false;
  });

export const routeSchema = yup.object({
  from: mapOptionSchema.required("From is required").nullable(),
  to: mapOptionSchema.required("To is required").nullable(),
  stops: yup
    .array()
    .of(mapOptionSchema.nullable())
    .transform((curr, orig) =>
      Array.isArray(orig) ? orig.filter((x) => x != null) : curr
    )
    .optional(),
});

export const createBookingSchema = yup.object({
  driverId: yup.string().required("Kindly select driver"),
  helperId: yup.string().nullable().optional(),
  vehicleId: yup.string().required("Kindly select vehicle"),
  route: routeSchema.required(),
  location: yup
    .object({
      start: yup.string().notRequired(),
      stop: yup.string().notRequired(),
    })
    .optional(),
});

export type CreateBookingType = yup.InferType<typeof createBookingSchema>;
