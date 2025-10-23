import React, { useEffect } from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import { useApi } from "../../../../../../../../../core/hooks";
import { dataStyle, divStyle, infoStyle } from "./styles";

interface Props {
  nextStep({}): void;
  next(): void;
}

export const DriverSelectionBlock: React.FC<Props> = ({ nextStep, next }) => {
  const { form, isDirty } = useCreateBookingFormContext();
  const driverOptions = useApi((api) => api.commons.getAllDrivers());

  const [selectedDriverInfo, setSelectedDriverInfo] = React.useState<{
    email: string;
    contactNumber: string;
    licenseNumber: string;
  } | null>(null);

  const driverSelectOptions: SelectOption[] =
    driverOptions.result?.data.response?.map((driver) => ({
      value: driver.userID,
      label: driver.fullName,
      driver: {
        email: driver.email,
        contactNumber: driver.contactNumber,
        licenseNumber: driver.licenseNumber,
      },
    })) ?? [];

  const handleNext = () => {
    next();
    nextStep("HelperSelection");
  };


  useEffect(() => {
    const selectedDriverId = form.watch("driverId");
    const selectedOption = driverSelectOptions?.find(
    (opt) => opt.value === selectedDriverId
    );

    if (selectedOption?.driver) {
    setSelectedDriverInfo(selectedOption.driver);
    }
  }, [form.watch("helperId"), driverSelectOptions]);
  

  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div className="w-full p-2 lg:w-[800px] lg:p-0 mt-[40px]">
        <Box sx={{ width: "100%" }}>
          <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
            Driver Selection
          </h1>
          <Card sx={{ padding: 5, width: "100%" }} elevation={4}>
            <Box sx={{ width: "100%" }}>
              <Typography
                sx={{
                  fontFamily: "PT Sans",
                  fontWeight: "bold",
                  color: "#0F2A71",
                  marginBottom: 4,
                  fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                }}
              >
                Kindly select driver
              </Typography>
              <Divider
                sx={divStyle}
              />
              <SelectField
                name="driverId"
                control={form.control}
                options={driverSelectOptions}
                label="Select Drivers"
                onSelectOption={(option) => {
                  if (option.driver) {
                    setSelectedDriverInfo(option.driver);
                  }
                }}
              />
              <Divider
                sx={divStyle}
              />
              <Box className="w-full flex items-center justify-between mt-4">
                <Typography sx={infoStyle}>Email&#58; </Typography>
                <Typography sx={infoStyle}>Contact Number&#58; </Typography>
                <Typography sx={infoStyle}>License Number&#58; </Typography>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography sx={dataStyle}>
                  {selectedDriverInfo?.email}{" "}
                </Typography>
                <Typography sx={dataStyle}>
                  {selectedDriverInfo?.contactNumber}
                </Typography>
                <Typography sx={dataStyle}>
                  {selectedDriverInfo?.licenseNumber}
                </Typography>
              </Box>
            </Box>
          </Card>
          <ProceedButton onClick={handleNext} disabled={!isDirty} />
        </Box>
      </div>
    </Box>
  );
};
