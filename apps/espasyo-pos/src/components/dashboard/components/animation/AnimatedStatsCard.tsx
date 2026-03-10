import { Grid, Paper, Typography, Avatar, Stack, Box } from "@mui/material";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { STATS_CARDS } from "../../constants/stats";

const MotionPaper = motion(Paper);

type StatCard = (typeof STATS_CARDS)[number];

interface Props {
  stat: StatCard;
  index: number;
}

export const AnimatedStatsCard = ({ stat, index }: Props) => {
  const Icon = stat.icon;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <MotionPaper
          whileHover={{ boxShadow: 10 }}
          sx={{
            p: 3,
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `${stat.color}20`,
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography color="text.secondary" variant="body2">
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight={700} my={1}>
                {stat.value}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {stat.trend === "up" ? (
                  <TrendingUp sx={{ color: "success.main", fontSize: 16 }} />
                ) : (
                  <TrendingDown sx={{ color: "error.main", fontSize: 16 }} />
                )}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={stat.trend === "up" ? "success.main" : "error.main"}
                >
                  {stat.change}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs yesterday
                </Typography>
              </Stack>
            </Box>
            <Avatar
              sx={{
                bgcolor: `${stat.color}20`,
                color: stat.color,
                width: 56,
                height: 56,
              }}
            >
              <Icon />
            </Avatar>
          </Stack>
        </MotionPaper>
      </motion.div>
    </Grid>
  );
};
