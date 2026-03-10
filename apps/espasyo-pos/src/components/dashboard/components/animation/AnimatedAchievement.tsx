import { Paper, Stack, Avatar, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Bolt, Star, Psychology } from "@mui/icons-material";

const iconMap = { Bolt, Star, Psychology };

export const AnimatedAchievement = ({
  item,
  index,
}: {
  item: any;
  index: number;
}) => {
  const Icon = iconMap[item.icon as keyof typeof iconMap];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ x: 5 }}
    >
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {item.value}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};
