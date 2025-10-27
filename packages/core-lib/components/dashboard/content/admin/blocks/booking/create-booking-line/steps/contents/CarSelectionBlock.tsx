import React, { useEffect, useRef } from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton, BackButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import {
  fieldsOf,
  useApi,
  useFieldsValidation,
} from "../../../../../../../../../core/hooks";
import { dataStyle, divStyle, infoStyle } from "./styles";
import { CreateBookingType } from "../../validation";
import { useWatch } from "react-hook-form";

interface Props {
  previousStep({ }): void;
  nextStep({ }): void;
  next(): void;
  previous(): void;
}

export const CarSelectionBlock: React.FC<Props> = ({
  previousStep,
  previous,
  nextStep,
  next,
}) => {
  const { form, isDirty } = useCreateBookingFormContext();
  const carOptions = useApi((api) => api.commons.getAllCars());
  const helperFields = fieldsOf<CreateBookingType>()("vehicleId");
  const { isValid, validateNow, setIsValid } = useFieldsValidation<CreateBookingType>(
    form,
    helperFields,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: false,
      shouldFocus: false,
    }
  );

  const [selectedCarInfo, setSelectedCarInfo] = React.useState<{
    model: string;
    plateNumber: string;
    serialNumber: string;
    type: string;
  } | null>(null);

  const carSelectOptions: SelectOption[] =
    carOptions.result?.data.response?.map((e) => ({
      value: e.vehicleID,
      label: `${e.plateNumber} | ${e.model}`,
      vehicle: {
        model: e.model,
        plateNumber: e.plateNumber,
        serialNumber: e.chassis.serialNumber,
        type: e.chassis.type
      },
    })) ?? [];

  console.log(carSelectOptions)
  const handleNext = () => {
    next();
    nextStep("AddingLocation");
  };

  const handlePrevious = () => {
    previous();
    previousStep("HelperSelection");
  };

  const selectedCarId = useWatch({
    control: form.control,
    name: "vehicleId",
    defaultValue: ""
  });


  useEffect(() => {
    const selectedOption = carSelectOptions?.find(
      (opt) => opt.value === selectedCarId
    );

    if (selectedOption?.vehicle) {
      setSelectedCarInfo(selectedOption.vehicle);
      validateNow();
    }
  }, [validateNow, selectedCarId, carSelectOptions]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
      }}
    >
      <div className="w-full lg:w-[800px]">
        <BackButton
          onClick={handlePrevious}
          disabled={!isDirty}
          loading={false}
        />
        <Box sx={{ width: "100%" }}>
          <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
            Vehicle Selection
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
              >Kindly select vehicle</Typography>
              <Divider sx={divStyle} />
              <SelectField
                name="vehicleId"
                control={form.control}
                options={carSelectOptions}
                label="Select Vehicle"
                onSelectOption={(option) => {
                  if (option.vehicle) {
                    setSelectedCarInfo(option.vehicle);
                    validateNow();

                  }
                }}
              />
              {
                selectedCarInfo && (<>
                  <Divider sx={divStyle} />
                  {/* Plate Number & Vehicle Model */}
                  <Box className="w-full flex flex-col gap-1">
                    <Box className="flex w-full">
                      <Box className="flex-1">
                        <Typography sx={infoStyle}>Plate Number:</Typography>
                      </Box>
                      <Box className="flex-1">
                        <Typography sx={infoStyle}>Vehicle Model:</Typography>
                      </Box>
                    </Box>
                    <Box className="flex w-full">
                      <Box className="flex-1">
                        <Typography sx={dataStyle}>{selectedCarInfo?.plateNumber}</Typography>
                      </Box>
                      <Box className="flex-1 text-left">
                        <Typography sx={dataStyle}>{selectedCarInfo?.model}</Typography>
                      </Box>
                    </Box>
                    {/* Serial Number & Vehicle Type */}
                    <Box className="flex w-full mt-2">
                      <Box className="flex-1">
                        <Typography sx={infoStyle}>Serial Number:</Typography>
                      </Box>
                      <Box className="flex-1">
                        <Typography sx={infoStyle}>Vehicle Type:</Typography>
                      </Box>
                    </Box>
                    <Box className="flex w-full">
                      <Box className="flex-1">
                        <Typography sx={dataStyle}>{selectedCarInfo?.serialNumber}</Typography>
                      </Box>
                      <Box className="flex-1 text-left">
                        <Typography sx={dataStyle}>{selectedCarInfo?.type}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </>)
              }
            </Box>
          </Card>
          <ProceedButton onClick={handleNext} disabled={!isValid} />
        </Box>
      </div>
    </Box>
  );
};
