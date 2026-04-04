import { Box, Typography, Grid, Paper } from "@mui/material";
import { Assessment, Inventory2, People, Settings } from "@mui/icons-material";
import { Card } from "../../../../../../packages/core-lib/components/Card";

const actions = [
  {
    label: "Reports",
    icon: <Assessment />,
    color: "#4caf50",
    bg: "rgba(76, 175, 80, 0.1)",
  },
  {
    label: "Inventory",
    icon: <Inventory2 />,
    color: "#2196f3",
    bg: "rgba(33, 150, 243, 0.1)",
  },
  {
    label: "Users",
    icon: <People />,
    color: "#ff9800",
    bg: "rgba(255, 152, 0, 0.1)",
  },
  {
    label: "Settings",
    icon: <Settings />,
    color: "#9c27b0",
    bg: "rgba(156, 39, 176, 0.1)",
  },
];

export const QuickActions = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Admin Actions
        </Typography>

        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid size={6} key={index}>
              <Card
                hoverEffect
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 120,
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: action.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ color: action.color }}>{action.icon}</Box>
                </Box>

                <Typography variant="body2" fontWeight={500}>
                  {action.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};
