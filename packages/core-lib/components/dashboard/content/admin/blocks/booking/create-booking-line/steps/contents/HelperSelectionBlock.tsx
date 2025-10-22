import React from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton, BackButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import { useApi } from "../../../../../../../../../core/hooks";
import { dataStyle, divStyle, infoStyle } from "./styles";

interface BackBtnProps {
  previousStep({}): void;
  nextStep({}): void;
  next(): void;
  previous(): void;
}

export const HelperSelectionBlock: React.FC<BackBtnProps> = ({ previousStep, previous, nextStep, next }) => {
  const { form, isDirty } = useCreateBookingFormContext();
  const helperOptions = useApi((api) => api.commons.getAllHelpers());

  const [selectedHelperInfo, setselectedHelperInfo] = React.useState<{
    email: string;
    contactNumber: string;
  } | null>(null);

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
    nextStep("HelperSelection");
  };
  const handlePrevious = () => {
    previous();
    previousStep("DriverSelection");
  }

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
              <Divider
                sx={divStyle}
              />
              <SelectField
                name="helperId"
                control={form.control}
                options={helperSelectOptions}
                label="Select Helpers"
                onSelectOption={(option) => {
                  if (option.helper) {
                    setselectedHelperInfo(option.helper);
                  }
                }}
              />
              <Divider
                sx={divStyle}
              />
              <Box className="w-full flex items-center justify-between mt-4">
                <Typography sx={infoStyle}>Email&#58; </Typography>
                <Typography sx={infoStyle}>Contact Number&#58; </Typography>
              </Box>
              <Box className="flex items-center justify-between">
                <Typography sx={dataStyle}>
                  {selectedHelperInfo?.email}{" "}
                </Typography>
                <Typography sx={dataStyle}>
                  {selectedHelperInfo?.contactNumber}
                </Typography>
              </Box>
            </Box>
          </Card>
          <BackButton onClick={handlePrevious} disabled={!isDirty}  />
          <ProceedButton onClick={handleNext} disabled={!isDirty} />
        </Box>
      </div>
    </Box>
  );
};
