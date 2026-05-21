import { useEffect } from "react";
import { useRouter } from "next/router";
import { useApiCallback } from "core-lib/core/hooks";
import { PosRegisterBlock } from "../../components/contents/pos";

const PosPage = () => {
  const router = useRouter();
  const shiftCb = useApiCallback(async (api) => api.commons.getActiveShift());

  useEffect(() => {
    shiftCb.execute().then((res) => {
      if (!res?.data?.response) {
        router.replace("/cashier/shift/open");
      }
    });
  }, []);

  return <PosRegisterBlock />;
};

export default PosPage;
