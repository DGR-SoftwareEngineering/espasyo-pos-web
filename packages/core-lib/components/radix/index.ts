/**
 * Radix component layer for core-lib.
 *
 * Drop-in replacements for the MUI-based components in `core-lib/components/`,
 * built on Radix Themes + Radix Primitives. Same prop API where practical so
 * consumers can swap imports incrementally:
 *
 *   // before (MUI)
 *   import { Card, Button, TextField } from "core-lib";
 *
 *   // after (Radix)
 *   import { Card, Button, TextField } from "core-lib/components/radix";
 *
 * See `MIGRATION.md` next to this file for the per-component migration notes
 * and gaps that still need closing.
 */
export * from "./_utils";

// Foundational surfaces
export * from "./Card";
export * from "./CardAlert";
export * from "./StatsCard";
export * from "./StatusChip";
export * from "./IDChip";
export * from "./InfoBox";
export * from "./InfoRow";
export * from "./ErrorBox";
export * from "./Link";
export * from "./Tooltip";
export * from "./Checkbox";
export * from "./CostDistributionBar";

// Form
export * from "./form/FieldError";
export * from "./form/TextField";
export * from "./form/SelectField";
export * from "./form/AutoCompleteField";
export * from "./FormHeader";
export * from "./FormSection";
export * from "./FormActions";
export * from "./FormErrorSummary";
export * from "./toggle/ToggleField";
export * from "./LookupPicker";
export * from "./FilterBar";

// Buttons
export * from "./buttons/Button";
export * from "./buttons/PrimaryButton";
export * from "./buttons/SecondaryButton";
export * from "./buttons/TextButton";
export * from "./buttons/ProceedButton";
export * from "./buttons/BackButton";
export * from "./buttons/BackButtonV2";
export * from "./buttons/LinkButton";
export * from "./buttons/MenuButton";
export * from "./buttons/ActionButtons";
export * from "./buttons/TabButton";

// Headers
export * from "./header/HeaderV2";
export * from "./header/SectionHeader";

// Banners
export * from "./banner/PreviewBanner";

// Overlays
export * from "./dialog/DialogBox";
export * from "./Modal";
export * from "./modals/SaveConfirmationModal";
export * from "./Accordion";

// Tabs / Stepper
export * from "./tabs";
export * from "./Stepper";

// Alerts / Labels
export * from "./alerts/Alert";
export * from "./label/Label";

// Data
export * from "./table/DataTableV2";
export * from "./table/BaseTableRow";

// Loaders / Animations
export * from "./loaders/InputLoader";
export * from "./loaders/ComponentLoader";
export * from "./loaders/ListLoader";
export * from "./animations/AnimatedBoxSkeleton";
export * from "./animations/AnimatedArrowIcon";
export * from "./PageLoader";

// Metric
export * from "./metric/MetricDisplay";
export * from "./metric/MetricBadge";

// App shell (Mission 8)
export * from "./SideMenu";
export * from "./Header";
export * from "./Dashboard";
export * from "./menu/RadixMenuContent";
export * from "./menu/RadixOptionsMenu";

// ── Framework-agnostic re-exports ─────────────────────────────────────────
// Work identically under MUI and Radix; re-exposing them here means
// `from "core-lib/components/radix"` is a complete drop-in for code that
// previously did `from "core-lib"`.
export * from "../form/FormRenderer";
export { ErrorBoundary } from "../ErrorBoundary";
