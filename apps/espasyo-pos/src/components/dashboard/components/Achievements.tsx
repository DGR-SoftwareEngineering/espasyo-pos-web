import { Card, Flex, Heading } from "@radix-ui/themes";
import { ACHIEVEMENTS } from "../constants/actions";
import { AnimatedAchievement } from "./animation/AnimatedAchievement";

/**
 * "Today's Achievements" panel — Radix `<Card>` listing milestone rows.
 */
export const Achievements = () => (
  <Card size="3" variant="surface" style={{ height: "100%" }}>
    <Heading size="4" weight="bold" mb="3">
      Today&apos;s Achievements
    </Heading>
    <Flex direction="column" gap="3">
      {ACHIEVEMENTS.map((item, index) => (
        <AnimatedAchievement key={item.id} item={item} index={index} />
      ))}
    </Flex>
  </Card>
);
