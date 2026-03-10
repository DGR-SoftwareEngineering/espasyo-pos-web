import { Grid, Paper, Typography } from "@mui/material";
import { QUICK_ACTIONS } from "../constants/actions";
import { AnimatedQuickAction } from "./animation/AnimatedQuickActions";

export const QuickActions = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {QUICK_ACTIONS.map((action, index) => (
          <AnimatedQuickAction key={action.id} action={action} index={index} />
        ))}
      </Grid>
    </Paper>
  );
};
