export type CreationManagementSteps =
  | "DriverSelection"
  | "HelperSelection"
  | "VehicleAndChassisSelection"
  | "AddingLocation"
  | "SummaryView";

export interface CreationManagementProps {
  isLoading: boolean;
  next: () => void;
  previous: () => void;
  reset: () => void;
  resetStep: () => void;
}
