import { InfoOutlined } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

interface Props {
  bolded?: boolean;
  message: string;
}

export const FieldError: React.FC<Props> = ({ message, bolded = false }) => (
  <Typography color="error" fontWeight={bolded ? "bold" : "normal"}>
    <Box sx={{ mt: "10px" }} display="flex" alignItems="center" gap={2}>
      <InfoOutlined sx={{ color: "error" }} />
      {message}
    </Box>
  </Typography>
);
