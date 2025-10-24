export interface Props {
    previousStep({}): void;
    nextStep({}): void;
    next(): void;
    previous(): void;
}

export interface ICar {
    vehicleId: string;
    serialNumber: string;
    plateNumber: string;
    model: string;
    type: string;
}

export type ICarSelected = ICar | null;