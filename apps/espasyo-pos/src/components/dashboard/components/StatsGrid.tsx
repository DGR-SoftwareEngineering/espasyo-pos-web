import { Grid } from "@mui/material";
import { STATS_CARDS } from "../constants/stats";
import { AnimatedStatsCard } from "./animation/AnimatedStatsCard";

export const StatsGrid = () => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {STATS_CARDS.map((stat, index) => (
        <AnimatedStatsCard key={stat.id} stat={stat} index={index} />
      ))}
    </Grid>
  );
};
