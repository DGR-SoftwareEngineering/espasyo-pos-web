import { Box } from "@mui/material";
import { STATS_CARDS } from "../constants/stats";
import { AnimatedStatsCard } from "./animation/AnimatedStatsCard";

export const StatsGrid = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3, // spacing
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)", // mobile
          sm: "repeat(2, 1fr)", // tablet
          md: "repeat(4, 1fr)", // desktop
        },
        mb: 4,
      }}
    >
      {STATS_CARDS.map((stat, index) => (
        <AnimatedStatsCard key={stat.id} stat={stat} index={index} />
      ))}
    </Box>
  );
};
