export interface Props {
  previousStep({ }): void;
  nextStep({ }): void;
  next(): void;
  previous(): void;
}

export interface Stop {
  address: string;
  latitude: string;
  longitude: string;
  stopId: string;
  mapUrl: string;
  coordinatesId: string;
  sequenceId: string;
}
