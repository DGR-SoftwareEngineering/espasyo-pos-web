
export interface Props {
  previousStep({}): void;
  nextStep({}): void;
  next(): void;
  previous(): void;
}

export interface GenericSelectionDetailProps<T> {
  data: T;
}
