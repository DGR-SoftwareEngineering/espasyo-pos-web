import { Close, InfoOutlined } from "@mui/icons-material";
import {
  Box,
  Grid,
  PopperProps,
  Theme,
  Typography,
  ClickAwayListener,
} from "@mui/material";
import MuiTooltip, {
  TooltipProps,
  tooltipClasses,
} from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { SxProps } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { useResolution } from "../core/hooks";
import { ParsedHtml } from "./ParseHtml";

interface Props {
  title?: TooltipProps["title"];
  children?: TooltipProps["children"] | string;
  header?: string;
  html?: string;
  underlinedText?: boolean;
  iconColor?: string;
  inheritFontSize?: boolean;
  hideIcon?: boolean;
  forDisabledReason?: boolean;
  disabledReasonId?: string;
  disabledClick?: boolean;
  plainText?: string;
  className?: string;
}

const POPPER_CONFIG: Partial<PopperProps> = {
  disablePortal: false,
  modifiers: [
    { name: "flip", enabled: true },
    { name: "offset", options: { offset: [0, 10] } },
    { name: "preventOverflow", options: { padding: 24 } },
  ],
};

export const Tooltip: React.FC<Props> = ({
  header,
  html,
  underlinedText,
  children,
  title,
  iconColor,
  inheritFontSize,
  forDisabledReason,
  disabledReasonId = "disabledReason",
  hideIcon,
  disabledClick,
  plainText,
  className,
}) => {
  const { isMobile } = useResolution();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      const modalElement = dialogRef.current;

      if (!modalElement) return;

      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Tab") {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      const handleEscapeKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      modalElement.addEventListener("keydown", handleTabKeyPress);
      modalElement.addEventListener("keydown", handleEscapeKeyPress);

      return () => {
        modalElement.removeEventListener("keydown", handleTabKeyPress);
        modalElement.removeEventListener("keydown", handleEscapeKeyPress);
      };
    }
  }, [open, setOpen]);

  return (
    <CustomWidthTooltip
      id={forDisabledReason ? disabledReasonId : undefined}
      open={open}
      enterDelay={750}
      enterNextDelay={750}
      enterTouchDelay={750}
      leaveTouchDelay={50000}
      leaveDelay={200}
      onKeyDown={handleKeyDown}
      onTouchStart={() => {
        setOpen(true);
      }}
      onClick={(e) => {
        setOpen(true);

        if (disabledClick) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      title={
        title ?? (
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={() => {
              setOpen(false);
            }}
          >
            <Grid container border="unset" ref={dialogRef}>
              <Close
                aria-hidden="true"
                sx={{
                  float: "right",
                  position: "absolute",
                  right: { xs: "29px", md: "15px" },
                  top: { xs: "24px", md: "20px" },
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => setOpen(false)}
              ></Close>
              <Grid size={{ xs: 12 }} p={8}>
                {header && (
                  <Typography
                    color="inherit"
                    variant="h4"
                    fontWeight={"accessibleText.fontWeight"}
                    sx={{ pb: 4 }}
                  >
                    {header}
                  </Typography>
                )}

                {html && (
                  <ParsedHtml
                    html={html}
                    disableOverrideLinkColors
                    fontSize={isMobile ? "16px" : "accessibleText.fontSize"}
                    fontWeight={"accessibleText.fontWeight"}
                    sx={{
                      wordBreak: "break-word",
                      a: {
                        textDecoration: "underline",
                        textDecorationColor: "inherit!important",
                      },
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </ClickAwayListener>
        )
      }
      arrow
      PopperProps={POPPER_CONFIG}
      placement="bottom-start"
    >
      {forDisabledReason ? (
        <Box
          display="flex"
          width="fit-content"
          onTouchStart={() => setOpen((prev) => !prev)}
        >
          {children}
        </Box>
      ) : (
        <Box
          className={className}
          display="inline-flex"
          flexWrap="nowrap"
          sx={{
            width: "fit-content",
            cursor: "pointer",
            "&:hover": { color: "primary.dark" },
            "&::focus-visible": {
              outline: "2px solid #000!important",
              outlineStyle: "double!important",
              color: "common.black",
              span: { textDecorationStyle: "solid", color: "common.black" },
              svg: { color: "common.black" },
            },
          }}
          component="a"
          tabIndex={0}
          aria-label={children ? textFromChildren(children) : undefined}
          role="dialog"
          onTouchStart={() => setOpen((prev) => !prev)}
        >
          <Typography
            className="tooltip-link"
            sx={{
              fontSize: {
                xs: "body2.fontSize",
                md: "accessibleText.fontSize",
              },
              fontWeight: 400,
              ...underlineStyles(underlinedText),
            }}
            color="primary"
            component="span"
            fontSize={inheritFontSize ? "inherit!important" : "body1"}
          >
            {children}
          </Typography>
          {hideIcon ? (
            <div>{plainText}</div>
          ) : (
            <InfoOutlined
              sx={{
                ml: children ? 1 : 0,
                mt: children ? "2px" : 0,
                cursor: "pointer",
                color: iconColor,
              }}
            />
          )}
        </Box>
      )}
    </CustomWidthTooltip>
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.code === "Enter") {
      setOpen(true);
    }

    if (e.code === "Escape") {
      setOpen(false);
    }
  }
};

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: theme.sizes.fieldTooltip,
  },
  "& .MuiTooltip-arrow": {
    width: 24,
    fontSize: "26px",
  },
}));

const textFromChildren = (
  children: TooltipProps["children"] | string,
): string =>
  React.Children.toArray(children).reduce<string>(
    (prev, curr) => (typeof curr === "string" ? prev + curr : prev),
    "",
  );

const underlineStyles = (underlinedText?: boolean): SxProps<Theme> =>
  underlinedText
    ? {
        textDecoration: "underline",
        textUnderlineOffset: 6,
        textDecorationStyle: "dotted",
        "&:hover": { color: "primary.dark", textDecorationStyle: "solid" },
      }
    : {};
