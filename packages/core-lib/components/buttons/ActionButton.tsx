import { alpha, IconButton, Tooltip, useTheme } from "@mui/material";

export const ActionButton: React.FC<{
  tooltip: string;
  icon: React.ReactNode;
  color: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({ tooltip, icon, color, onClick }) => {
  const theme = useTheme();
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color,
          bgcolor: alpha(color, 0.08),
          width: 36,
          height: 36,
          "&:hover": { bgcolor: alpha(color, 0.2) },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};
