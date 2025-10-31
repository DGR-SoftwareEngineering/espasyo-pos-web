import { Box } from "@mui/material";

export const SelectionBlock: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => (
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
    <Box className="w-full p-2 lg:w-[800px] lg:p-0 mt-[40px]">{children}</Box>
  </Box>
);
