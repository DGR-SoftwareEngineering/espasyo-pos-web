import { GetServerSideProps } from "next";
import { OrdersBlock } from "../../components/contents/pos/orders/OrdersBlock";
import { SSRWithContentSecurityPolicy } from "core-lib/business/content-security-policy";

const OrdersPage = () => <OrdersBlock />;

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default OrdersPage;
