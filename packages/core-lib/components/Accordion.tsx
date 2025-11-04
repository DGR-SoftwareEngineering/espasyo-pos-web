import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  AccordionDetails,
  AccordionSummary,
  Box,
  Accordion as MuiAccordion,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { ParsedHtml } from "./ParseHtml";

interface Props extends React.PropsWithChildren<{}> {
  id?: string;
  header?: string;
  html?: string;
  opened?: boolean;
  colored?: boolean;
  children?: React.ReactNode;
  ["data-testid"]?: string;
}

export const Accordion: React.FC<Props> = ({
  id,
  header,
  html,
  opened,
  colored,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(opened);

  return (
    <MuiAccordion
      id={id}
      disableGutters
      elevation={0}
      expanded={open}
      onChange={handleChange}
      className="accordion-root"
      sx={{
        boxShadow: 0,
        minHeight: 50,
        ...(colored && {
          "&::before": { bgcolor: "transparent" },
        }),
      }}
      {...props}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon
            sx={{ color: (theme) => theme.palette.common.black }}
            fontSize="large"
          />
        }
        aria-controls="accordion-content"
        sx={{
          backgroundColor: colored
            ? "appColors.support80.transparentLight"
            : "grey.A100",
          pl: 4,
          m: 0,
          boxSizing: "border-box",
          outline: "2px solid transparent",
          border: "2px solid transparent",
          "&:focus": {
            "& .stripe": { display: "none" },
            border: (theme) =>
              `2px solid ${theme.palette.appColors.essential["1000"]}`,
            outline: (theme) =>
              `2px solid ${theme.palette.appColors.ui_rag["Amber.400"]}`,
            backgroundColor: (theme) =>
              theme.palette.appColors.incidental["000"],
          },
        }}
      >
        {colored && (
          <Box
            className="stripe"
            position="absolute"
            left={-2}
            top={-2}
            bottom={-2}
            width={4}
            bgcolor="appColors.primary"
          >
            <Typography variant="h4" component="h3" fontWeight="bold">
              {header}
            </Typography>
          </Box>
        )}
      </AccordionSummary>

      <AccordionDetails
        sx={{
          py: 4,
          pl: 4,
          pr: { xs: 4, md: colored ? 8 : 14 },
          overflowX: "auto",
        }}
      >
        {children ? children : html && <ParsedHtml html={html} />}
      </AccordionDetails>
    </MuiAccordion>
  );

  function handleChange() {
    setOpen(!open);
  }
};
