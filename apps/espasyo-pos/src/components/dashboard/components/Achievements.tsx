import { Paper, Typography, Stack } from "@mui/material";
import { ACHIEVEMENTS } from "../constants/actions";
import { AnimatedAchievement } from "./animation/AnimatedAchievement";

export const Achievements = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} mb={3}>
        Today's Achievements
      </Typography>
      <Stack spacing={2}>
        {ACHIEVEMENTS.map((item, index) => (
          <AnimatedAchievement key={item.id} item={item} index={index} />
        ))}
      </Stack>
    </Paper>
  );
};
