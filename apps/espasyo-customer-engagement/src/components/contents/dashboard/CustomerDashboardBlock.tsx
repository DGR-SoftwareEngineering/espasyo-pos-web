import React, { useEffect, useState } from "react";
import { useApi } from "core-lib/core/hooks";
import { CustomerDashboard } from "./CustomerDashboard";

const ORDERS_POLL_MS = 30_000;

/**
 * Data orchestration for the customer hub. Each section is fed independently and
 * fails soft — a failed/empty response degrades to that section's empty state
 * rather than taking down the page.
 */
export const CustomerDashboardBlock: React.FC = () => {
  // Orders are polled so a "Ready for pickup" status flip (driven by the cashier)
  // surfaces without a manual refresh. No SSE is available yet.
  const [ordersTick, setOrdersTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setOrdersTick((t) => t + 1), ORDERS_POLL_MS);
    return () => clearInterval(id);
  }, []);

  const promosApi = useApi((api) => api.commons.customerDashboardPromos(), []);
  const menuApi = useApi(
    (api) => api.commons.customerDashboardMenu({ pageSize: 50 }),
    [],
  );
  const loyaltyApi = useApi((api) => api.commons.customerDashboardLoyalty(), []);
  const ordersApi = useApi(
    (api) => api.commons.customerDashboardOrders({ pageNumber: 1, pageSize: 20 }),
    [ordersTick],
  );

  return (
    <CustomerDashboard
      promos={promosApi.result?.data?.response ?? []}
      promosLoading={promosApi.loading}
      menu={menuApi.result?.data?.response.items ?? []}
      menuLoading={menuApi.loading}
      loyalty={loyaltyApi.result?.data?.response ?? null}
      loyaltyLoading={loyaltyApi.loading}
      orders={ordersApi.result?.data?.response ?? []}
      ordersLoading={ordersApi.loading}
    />
  );
};
