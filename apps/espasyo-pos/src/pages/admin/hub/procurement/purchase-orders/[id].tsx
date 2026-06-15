import { PurchaseOrderDetailBlock } from "../../../../../components/contents/procurement";
import { GetServerSideProps } from "next";
import { SSRWithContentSecurityPolicy } from "core-lib";
import { useRouter } from "core-lib/core/router";
import { LoadingState } from "core-lib/components/radix/LoadingState";

const PurchaseOrderDetailPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  if (!id) return <LoadingState />;

  return <PurchaseOrderDetailBlock purchaseOrderID={id} />;
};
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
export default PurchaseOrderDetailPage;
