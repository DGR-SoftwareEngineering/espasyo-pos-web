import { Grid, Card, CardContent, Avatar, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { QUICK_ACTIONS } from "../../constants/actions";

const MotionCard = motion(Card);

type QuickAction = (typeof QUICK_ACTIONS)[number];

interface Props {
  action: QuickAction;
  index: number;
}

export const AnimatedQuickAction = ({ action, index }: Props) => {
  const Icon = action.icon;

  return (
    <Grid size={{ xs: 6 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MotionCard sx={{ cursor: "pointer" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: `${action.color}20`,
                color: action.color,
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1,
              }}
            >
              <Icon />
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {action.label}
            </Typography>
          </CardContent>
        </MotionCard>
      </motion.div>
    </Grid>
  );
};
