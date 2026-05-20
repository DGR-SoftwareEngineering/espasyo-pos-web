import { useRouter } from "next/router";
import { Flex, Text } from "@radix-ui/themes";
import { PurchaseOrderDetailBlock } from "../../../../../components/contents/procurement";

const PurchaseOrderDetailPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  if (!id) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text size="2" color="gray">
          Loading…
        </Text>
      </Flex>
    );
  }

  return <PurchaseOrderDetailBlock purchaseOrderID={id} />;
};

export default PurchaseOrderDetailPage;
