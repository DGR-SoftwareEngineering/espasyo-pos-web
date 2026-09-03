// ============================================================
// Radix UI Proxy Barrel
// ============================================================
// App-level code imports wrapped Radix primitives from here
// instead of directly from `@radix-ui/themes`. The wrappers
// inject app-appropriate defaults (accentColor, size, etc.)
// from `useDesignTokens`.
//
// For components NOT listed here, keep importing from
// `@radix-ui/themes` directly (e.g., Grid, Table, Dialog).
// ============================================================

export { Box } from "./Box";
export { Flex } from "./Flex";
export { Text } from "./Text";
export { Heading } from "./Heading";
export { IconButton } from "./IconButton";
export { Badge } from "./Badge";
export { Separator } from "./Separator";
