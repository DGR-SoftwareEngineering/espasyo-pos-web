import { Avatar, Card, Flex, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { QUICK_ACTIONS } from "../../constants/actions";

const MotionDiv = motion.div;

type QuickAction = (typeof QUICK_ACTIONS)[number];

interface Props {
  action: QuickAction;
  index: number;
}

/**
 * Single quick-action tile inside the Quick Actions card. Radix `<Card>`
 * with hover-scale micro-interaction; the MUI `Card`+`CardContent` pair is
 * collapsed into one Radix surface.
 */
export const AnimatedQuickAction = ({ action, index }: Props) => {
  const Icon = action.icon;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card
        size="2"
        variant="surface"
        style={{
          cursor: "pointer",
          transition: "border-color 150ms ease, background 150ms ease",
        }}
      >
        <Flex direction="column" align="center" gap="2" py="2">
          <Avatar
            size="3"
            radius="full"
            fallback={<Icon />}
            style={{ background: `${action.color}22`, color: action.color }}
          />
          <Text size="2" weight="medium">
            {action.label}
          </Text>
        </Flex>
      </Card>
    </MotionDiv>
  );
};
