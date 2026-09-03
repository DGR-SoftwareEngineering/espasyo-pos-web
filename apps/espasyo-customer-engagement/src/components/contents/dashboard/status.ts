import {
  Badge,
} from "core-lib/components/radix/proxies";;
import { CustomerOrderStatus } from "core-lib/api/commons/types";

type BadgeColor = React.ComponentProps<typeof Badge>["color"];

/** Map an order status to a Radix Badge color. */
export const orderStatusColor = (status: CustomerOrderStatus): BadgeColor => {
  switch (status) {
    case CustomerOrderStatus.ReadyForPickup:
      return "green";
    case CustomerOrderStatus.Cancelled:
    case CustomerOrderStatus.Remake:
      return "red";
    case CustomerOrderStatus.PickedUp:
    case CustomerOrderStatus.OrderCompleted:
      return "gray";
    case CustomerOrderStatus.PaymentReceived:
      return "blue";
    default:
      return "amber";
  }
};

/** "ReadyForPickup" → "Ready For Pickup". Falls back to the raw label. */
export const humanizeStatusLabel = (label: string): string =>
  (label ?? "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
