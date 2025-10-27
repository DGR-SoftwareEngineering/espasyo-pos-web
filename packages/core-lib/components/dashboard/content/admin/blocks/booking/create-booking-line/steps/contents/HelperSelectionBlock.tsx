import React, { useMemo } from "react";
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
import { divStyle } from "./styles";
import { useWatch } from "react-hook-form";
import { Props } from "./types";
import { SelectionDetail } from "./SelectionDetail";
import { CreateBookingType } from "../../validation";
import { SelectionBlock } from "./SelectionBlock";
import { HelperSelectionOptions } from "../../../../../../../../form/selection-types";

type Helper = HelperSelectionOptions | null;

export const HelperSelectionBlock: React.FC<Props> = ({
  previousStep,
  previous,
  nextStep,
  next,
}) => {
  const { form } = useCreateBookingFormContext();
  const helperOptions = useApi((api) => api.commons.getAllHelpers());

  const helperField = fieldsOf<CreateBookingType>()("helperId");

  const { isValid } = useFieldsValidation<CreateBookingType>(
    form,
    helperField,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: true,
      shouldFocus: true,
    }
  );

  const helperSelectOptions: SelectOption[] =
    helperOptions.result?.data.response?.map((e) => ({
      value: e.userID,
      label: e.fullName,
      helper: {
        email: e.email,
        contactNumber: e.contactNumber,
      },
    })) ?? [];

  const handleNext = () => {
    next();
    nextStep("VehicleSelection");
  };

  const handlePrevious = () => {
    previous();
    previousStep("DriverSelection");
  };

  const selectedHelperId = useWatch({
    control: form.control,
    name: "helperId",
    defaultValue: "",
  });

  const selectedHelperInfo: Helper = useMemo(
    () =>
      helperSelectOptions.find((opt) => opt.value === selectedHelperId)
        ?.helper ?? null,
    [selectedHelperId, helperSelectOptions]
  );

  return (
    <>
      <SelectionBlock>
        <BackButton onClick={handlePrevious} loading={false} />
        <Box sx={{ width: "100%" }}>
          <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
            Helper Selection (Optional)
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
                Kindly select a Helper
              </Typography>
              <Divider sx={divStyle} />
              <SelectField
                name="helperId"
                control={form.control}
                options={helperSelectOptions}
                label="Select a Helper"
              />
              {selectedHelperInfo && (
                <SelectionDetail data={selectedHelperInfo} />
              )}
            </Box>
          </Card>
          <ProceedButton onClick={handleNext} disabled={!isValid} />
        </Box>
      </SelectionBlock>
    </>
  );
};
