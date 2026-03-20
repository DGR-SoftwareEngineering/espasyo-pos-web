import { alpha, Chip, Tooltip, useTheme } from "@mui/material";
import { truncateId } from "../business/strings";

export const IDChip: React.FC<{
  id: string;
  label: string;
  color?: string;
}> = ({ id, label, color = "text.secondary" }) => {
  const theme = useTheme();
  return (
    <Tooltip title={`${label} ID: ${id}`} arrow>
      <Chip
        label={`${label}: ${truncateId(id)}`}
        size="small"
        sx={{
          height: 20,
          fontSize: "0.625rem",
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          color,
          cursor: "help",
        }}
      />
    </Tooltip>
  );
};
