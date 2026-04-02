import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { TIME_OF_DAY } from "../constants/timeOfDay";
import { Star } from "@mui/icons-material";
import { Card } from "../../../../../../packages/core-lib/components/Card";

const MotionBox = motion(Box);

interface Props {
  name: string;
  role: string;
  timeOfDay: keyof typeof TIME_OF_DAY;
  transactions?: number;
  progress?: number;
}

export const WelcomeHeader = ({
  name,
  role,
  timeOfDay,
  transactions = 156,
  progress = 75,
}: Props) => {
  const config = TIME_OF_DAY[timeOfDay];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          p: 0, // inner padding will be handled by the Box inside
          mb: 4,
          background: config.gradient,
          color: "white",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* inner padding */}
        <Box sx={{ p: 4 }}>
          <MotionBox
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            sx={{
              position: "absolute",
              top: "10%",
              right: "5%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            {/* Left */}
            <Stack direction="row" spacing={2} alignItems="center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 60,
                    height: 60,
                  }}
                >
                  <Icon />
                </Avatar>
              </motion.div>

              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {new Date().getHours() < 12
                    ? "Good Morning"
                    : new Date().getHours() < 17
                      ? "Good Afternoon"
                      : "Good Evening"}
                  , {name}! 👋
                </Typography>

                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            </Stack>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Box sx={{ minWidth: 200 }}>
                <Chip
                  icon={<Star />}
                  label={`${role} of the Month`}
                  color="warning"
                  sx={{ mb: 1 }}
                />

                <Typography variant="h3" fontWeight={700}>
                  {transactions}
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Transactions today
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              </Box>
            </motion.div>
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
};
