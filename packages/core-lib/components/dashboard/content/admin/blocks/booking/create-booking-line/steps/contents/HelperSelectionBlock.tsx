import React, { useEffect } from "react";
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
import { Props } from "./types";


export const HelperSelectionBlock: React.FC<Props> = ({
  previousStep,
  previous,
  nextStep,
  next,
}) => {
  const { form, isDirty } = useCreateBookingFormContext();
  const helperOptions = useApi((api) => api.commons.getAllHelpers());
  const helperFields = fieldsOf<CreateBookingType>()("helperId");
  const { isValid } = useFieldsValidation<CreateBookingType>(
    form,
    helperFields,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: false,
      shouldFocus: false,
    }
  );

  const [selectedHelperInfo, setselectedHelperInfo] = React.useState<{
    email: string;
    contactNumber: string;
  } | null>(null);

  const helperSelectOptions: SelectOption[] =
    helperOptions.result?.data.response?.map((e) => ({
      value: e.userID,
      label: e.fullName,
      selected: false,
      helper: {
        email: e.email,
        contactNumber: e.contactNumber,
      },
    })) ?? [];

  const handleNext = () => {
    next();
    nextStep("HelperSelection");
  };
  const handlePrevious = () => {
    previous();
    previousStep("DriverSelection");
  };
  
  useEffect(() => {
    const selectedOption = helperSelectOptions?.find(
      (opt) => opt.value === selectedHelperId
    );

    if (selectedOption?.helper) {
      setselectedHelperInfo(selectedOption.helper);
    }
  }, [form, form.watch("helperId"), helperSelectOptions]);

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
            Helper Selection
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
                Kindly select helper
              </Typography>
              <Divider sx={divStyle} />
              <SelectField
                name="helperId"
                control={form.control}
                options={helperSelectOptions}
                label="Select Helpers"
                onSelectOption={(option) => {
                  if (option.helper) {
                    option.selected = true;
                    setselectedHelperInfo(option.helper);
                  }
                }}
              />
              <Divider sx={divStyle} />
              <Box className="w-full flex items-center mt-4">
                <Box className="flex-1 flex justify-start">
                  <Typography sx={infoStyle}>Email:</Typography>
                </Box>
                <Box className="flex-1 flex justify-start">
                  <Typography sx={infoStyle}>Contact Number:</Typography>
                </Box>
              </Box>
              <Box className="w-full flex items-start">
                <Box className="flex-1 flex justify-start">
                  <Typography sx={dataStyle}>
                    {selectedHelperInfo?.email}{" "}
                  </Typography>
                </Box>
                <Box className="flex-1 flex justify-center">
                  <Typography sx={dataStyle}>
                    {selectedHelperInfo?.contactNumber}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
          <ProceedButton onClick={handleNext} disabled={!isValid} />
        </Box>
      </div>
    </Box>
  );
};
