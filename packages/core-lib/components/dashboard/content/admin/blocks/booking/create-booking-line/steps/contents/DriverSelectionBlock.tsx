import React, { useMemo } from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import {
  fieldsOf,
  useApi,
  useFieldsValidation,
} from "../../../../../../../../../core/hooks";
import { divStyle } from "./styles";
import { useWatch } from "react-hook-form";
import { CreateBookingType } from "../../validation";
import { Props } from "./types";
import { SelectionDetail } from "./SelectionDetail";
import { DriverSelectionOptions } from "../../../../../../../../form/selection-types";
import { SelectionBlock } from "./SelectionBlock";

type DriverProps = DriverSelectionOptions | null;

export const DriverSelectionBlock: React.FC<Props> = ({ nextStep, next }) => {
  const { form } = useCreateBookingFormContext();
  const driverOptions = useApi((api) => api.commons.getAllDrivers());

  const driverSelectOptions: SelectOption[] = useMemo(() => {
    return (
      driverOptions.result?.data.response?.map((driver) => ({
        value: driver.userID,
        label: driver.fullName,
        driver: {
          email: driver.email,
          contactNumber: driver.contactNumber,
          licenseNumber: driver.licenseNumber,
        },
      })) ?? []
    );
  }, [driverOptions.result?.data.response]);
   

  const handleNext = () => {
    next();
    nextStep("HelperSelection");
  };

  const selectedDriverId = useWatch({
    control: form.control,
    name: "driverId",
    defaultValue: "",
  });

  const driverField = fieldsOf<CreateBookingType>()("driverId");

  const { isValid } = useFieldsValidation<CreateBookingType>(
    form,
    driverField,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: true,
      shouldFocus: true,
    }
  );

  const selectedDriverInfo: DriverProps = useMemo(
    () =>
      driverSelectOptions.find((opt) => opt.value === selectedDriverId)
        ?.driver ?? null,
    [selectedDriverId, driverSelectOptions]
  );

  return (
    <>
      <SelectionBlock>
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
                Kindly select a Driver
              </Typography>
              <Divider sx={divStyle} />
              <SelectField
                name="driverId"
                control={form.control}
                options={driverSelectOptions}
                label="Select a Driver"
              />
              {selectedDriverInfo && <SelectionDetail data={selectedDriverInfo} />}
            </Box>
          </Card>
          <ProceedButton onClick={handleNext} disabled={!isValid} />
        </Box>
      </SelectionBlock>
    </>
  );
};
