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

export function propertyToLabel(key: string): string {
  return key
    .replace(/\./g, " ") // replace periods with spaces
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // insert space before capital letters
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // handle consecutive capitals
    .replace(/\b\d+\b/g, (num) => `${parseInt(num) + 1}`) // increment array indices
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
}
