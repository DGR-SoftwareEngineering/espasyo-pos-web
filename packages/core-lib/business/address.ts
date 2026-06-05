import { UserAddress } from "../api/internal/types";

export function formatUserAddress(address: UserAddress, separator = "\r\n") {
  return [
    address?.streetAddress1,
    address?.streetAddress2,
    address?.streetAddress3,
    address?.streetAddress4,
    address?.streetAddress5,
    address?.postCode,
    address?.country,
  ]
    .filter((t) => !!t)
    .join(separator);
}
