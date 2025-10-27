export interface ContactInfo {
email: string;
contactNumber: string;
}

export interface HelperSelectionOptions extends ContactInfo {}

export interface DriverSelectionOptions extends ContactInfo {
licenseNumber: string;
}

export interface CarSelectionOptions {
    model: string;
    plateNumber: string;
    type: string;
    serialNumber: string;
}

