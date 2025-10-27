import {
  CheckboxProps,
  Checkbox as MuiCheckbox,
  useTheme,
} from "@mui/material";
import { ForwardedRef, forwardRef } from "react";
import { CheckedIcon, UncheckedIcon } from "./icons";

export const Checkbox = forwardRef(
  (props: Omit<CheckboxProps, "ref">, ref: ForwardedRef<HTMLButtonElement>) => {
    const theme = useTheme();

    return (
      <MuiCheckbox
        {...props}
        ref={ref}
        disableFocusRipple
        inputProps={
          {
            id: props.name,
            "data-testid": props.name,
            "aria-checked": props.checked,
          } as React.InputHTMLAttributes<HTMLInputElement>
        }
        icon={
          <UncheckedIcon
            color={props.disabled ? theme.palette.grey[400] : undefined}
          />
        }
        checkedIcon={<CheckedIcon color={theme.palette.primary.main} />}
        onFocus={(evt) =>
          updateCheckboxStyle({
            evt,
            outline: `2px solid ${theme.palette.appColors.ui_rag["Amber.400"]}`,
            stroke: theme.palette.common.black,
            strokeWidth: "4px",
          })
        }
        onBlur={(evt) =>
          updateCheckboxStyle({
            evt,
            outline: "none",
            stroke: theme.palette.appColors.essential[500],
            strokeWidth: "2px",
          })
        }
      />
    );
  }
);

function updateCheckboxStyle({
  evt,
  outline,
  stroke,
  strokeWidth,
}: {
  evt: React.FocusEvent<HTMLButtonElement, Element>;
  outline: string;
  stroke: string;
  strokeWidth: string;
}) {
  const svg = evt.currentTarget.children.item(1) as SVGSVGElement | null;
  if (!svg) return;
  const rect = svg.children.item(0) as SVGRectElement | null;
  if (!rect) return;
  rect.style.stroke = stroke;
  rect.style.strokeWidth = strokeWidth;
}
