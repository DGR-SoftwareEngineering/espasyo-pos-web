import { Box, Divider, Typography } from "@mui/material";
import { GenericSelectionDetailProps } from "./types";
import { propertyToLabel } from "../../../../../../../../../business/strings";
import { dataStyle, divStyle, infoStyle } from "./styles";
import { flattenObject } from "es-toolkit";

export const SelectionDetail = <T extends Record<string, any>>({
  data,
}: GenericSelectionDetailProps<T>) => {
  const flatData = flattenObject(data);

  const entries = Object.entries(flatData).map(([key, value]) => ({
    label: propertyToLabel(key),
    value,
  }));

  const isCompact = entries.length < 3;

  return (
    <>
      <Divider sx={divStyle} />
      <Box className="flex flex-col gap-4 mt-3">
        <Box
          className={`grid ${
            isCompact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          } gap-4 mt-3`}
        >
          {entries.map(({ label, value }, key) => (
            <Box key={key} className="text-left sm:text-left">
              <Typography key={`label-${key}`} sx={infoStyle}>
                {label}
              </Typography>
              <Typography key={`value-${key}`} sx={dataStyle}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};
