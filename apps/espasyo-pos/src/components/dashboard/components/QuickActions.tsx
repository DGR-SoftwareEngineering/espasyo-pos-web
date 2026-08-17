import {
  Heading,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Grid,
} from "@radix-ui/themes";;
import { QUICK_ACTIONS } from "../constants/actions";
import { AnimatedQuickAction } from "./animation/AnimatedQuickActions";

/**
 * Quick-action grid card. Radix `<Card>` surface holding a 2-column grid of
 * tappable action tiles.
 */
export const QuickActions = () => (
  <Card size="3" variant="surface" style={{ height: "100%" }}>
    <Heading size="4" weight="bold" mb="3">
      Quick Actions
    </Heading>
    <Grid columns="2" gap="3">
      {QUICK_ACTIONS.map((action, index) => (
        <AnimatedQuickAction key={action.id} action={action} index={index} />
      ))}
    </Grid>
  </Card>
);
