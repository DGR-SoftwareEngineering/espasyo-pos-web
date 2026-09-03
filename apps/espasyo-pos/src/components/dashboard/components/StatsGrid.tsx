import {
  Grid,
} from "@radix-ui/themes";;
import { STATS_CARDS } from "../constants/stats";
import { AnimatedStatsCard } from "./animation/AnimatedStatsCard";

/**
 * Responsive grid of dashboard stat cards. Radix `<Grid>` with `columns`
 * breakpoints replaces the MUI Grid container; each cell renders one
 * `<AnimatedStatsCard>`.
 */
export const StatsGrid = () => (
  <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4" mb="5">
    {STATS_CARDS.map((stat, index) => (
      <AnimatedStatsCard key={stat.id} stat={stat} index={index} />
    ))}
  </Grid>
);
