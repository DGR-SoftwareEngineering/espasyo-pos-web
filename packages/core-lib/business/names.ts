import { toTitleCase as capitalize } from "./strings";

export const formatFirstName = (forenames?: string | null): string => {
  if (!forenames) return "";

  const [firstName = ""] = forenames.trim().split(/\s+/);
  return firstName ? capitalize(firstName).trim() : "";
};
