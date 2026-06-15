import { ApiResponse } from "core-lib/api/types";

export function extractApiError(
  result: { data?: ApiResponse } | undefined | null,
  fallback: string,
): string {
  if (!result?.data) return fallback;
  const { errors, message } = result.data;
  if (Array.isArray(errors) && errors.length > 0) {
    return (errors as string[])[0] ?? fallback;
  }
  return message ?? fallback;
}
