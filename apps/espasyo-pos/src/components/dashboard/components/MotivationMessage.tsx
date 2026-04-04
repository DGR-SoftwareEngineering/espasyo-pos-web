import { Paper, Typography, Avatar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiEmotions, Whatshot, Star, Spa, Bolt } from "@mui/icons-material";

const iconMap = { EmojiEmotions, Whatshot, Star, Spa, Bolt };

interface Props {
  message: { id: string; text: string; icon: string };
  isVisible: boolean;
}

export const MotivationMessage = ({ message, isVisible }: Props) => {
  const Icon = iconMap[message.icon as keyof typeof iconMap];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: "transparent", color: "white" }}>
              <Icon />
            </Avatar>
            <Typography variant="h6">{message.text}</Typography>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
