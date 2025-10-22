export type HelperSelectionOptions = {
  email: string;
  contactNumber: string;
};

export type DriverSelectionOptions = HelperSelectionOptions & {  
  licenseNumber: string;
}