export const PAYMENT_TERMS_OPTIONS = [
  "Net 30",
  "Net 60",
  "COD",
  "Prepaid",
  "2/10 Net 30",
] as const;

export type PaymentTermsOption = (typeof PAYMENT_TERMS_OPTIONS)[number];
