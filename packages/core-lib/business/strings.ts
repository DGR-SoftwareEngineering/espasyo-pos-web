export function toTitleCase(text: string) {
  return text?.toLowerCase().replace(/\b(\w)/g, (m) => m.toUpperCase()) ?? "";
}
