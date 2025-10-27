import React, { useEffect } from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Link, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import { fieldsOf, useApi, useFieldsValidation } from "../../../../../../../../../core/hooks";
import { dataStyle, divStyle, infoStyle } from "./styles";
import { useWatch } from "react-hook-form";
import { CreateBookingType } from "../../validation";
import { Props } from "./types";

export const DriverSelectionBlock: React.FC<Props> = ({ nextStep, next }) => {
  const { form, isDirty } = useCreateBookingFormContext();
  const driverOptions = useApi((api) => api.commons.getAllDrivers());

  const [selectedDriverInfo, setSelectedDriverInfo] = React.useState<{
    email: string;
    contactNumber: string;
    licenseNumber: string;
  } | null>(null);

  const driverSelectOptions: SelectOption[] = //[];
    driverOptions.result?.data.response?.map((driver) => ({
      value: driver.userID,
      label: driver.fullName,
      driver: {
        email: driver.email,
        contactNumber: driver.contactNumber,
        licenseNumber: driver.licenseNumber,
      },
    })) ?? [];
  const driverFields = fieldsOf<CreateBookingType>()("driverId");
  const { isValid, validateNow } = useFieldsValidation<CreateBookingType>(
    form,
    driverFields,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: false,
      shouldFocus: false,
    }
  );

  const handleNext = () => {
    next();
    nextStep("HelperSelection");
  };

  const selectedDriverId = useWatch({
    control: form.control,
    name: "driverId",
  });

  useEffect(() => {
    const selectedOption = driverSelectOptions?.find(
      (opt) => opt.value === selectedDriverId
    );

    if (selectedOption?.driver) {
      setSelectedDriverInfo(selectedOption.driver);
      validateNow();
    }
  }, [validateNow, selectedDriverId, driverSelectOptions]);

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
      {
        !(driverSelectOptions.length > 0) ? (
          <>  <div className="w-full p-2 lg:w-[800px] lg:p-0 mt-[40px]">
            <Box sx={{ width: "100%" }}>
              <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
                No Driver Available in Selection
              </h1>
              <Link>
                { /*** TO COMPLETE THIS SECTION UAC ADMIN LEVEL */}
                To navigate to user management under construction
              </Link>
            </Box>
          </div>
          </>
        ) :
          (<>
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
                    >Kindly select driver</Typography>
                    <Divider sx={divStyle} />
                    <SelectField
                      name="driverId"
                      control={form.control}
                      options={driverSelectOptions}
                      label="Select Drivers"
                      onSelectOption={(option) => {
                        if (option.driver) {
                          setSelectedDriverInfo(option.driver);
                          form.setValue("driverId", option.value);
                          validateNow();
                        }
                      }} />
                    {
                      selectedDriverInfo && (<>
                        <Divider sx={divStyle} />
                        <Box className="w-full flex items-center justify-between mt-4">
                          <Typography sx={infoStyle}>Email&#58;</Typography>
                          <Typography sx={infoStyle}>Contact Number&#58;</Typography>
                          <Typography sx={infoStyle}>License Number&#58;</Typography>
                        </Box>
                        <Box className="flex items-center justify-between">
                          <Typography sx={dataStyle}>{selectedDriverInfo?.email}</Typography>
                          <Typography sx={dataStyle}>{selectedDriverInfo?.contactNumber}</Typography>
                          <Typography sx={dataStyle}>{selectedDriverInfo?.licenseNumber}</Typography>
                        </Box>
                      </>)
                    }
                  </Box>
                </Card>
                <ProceedButton onClick={handleNext} disabled={!isValid} />
              </Box>
            </div>
          </>)
      }
    </Box>
  );
};
