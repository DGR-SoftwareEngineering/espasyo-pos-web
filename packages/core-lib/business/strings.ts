export function toTitleCase(text: string) {
  return text?.toLowerCase().replace(/\b(\w)/g, (m) => m.toUpperCase()) ?? "";
}

export function parseDelimitedList(
  value: string | undefined,
  delimiter = ";"
): string[] {
  if (!value) return [];
  return value
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}
