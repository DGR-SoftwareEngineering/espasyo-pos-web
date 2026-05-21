import { ShiftSummaryDto } from "core-lib/api/commons/types";
import { CloseShiftForm } from "./validation";

export interface CloseShiftFormProps {
  onSubmit: (values: CloseShiftForm) => void;
  submitLoading: boolean;
  initialValues?: Partial<CloseShiftForm>;
  isInDialog: boolean;
  shiftSummary?: ShiftSummaryDto;
}
