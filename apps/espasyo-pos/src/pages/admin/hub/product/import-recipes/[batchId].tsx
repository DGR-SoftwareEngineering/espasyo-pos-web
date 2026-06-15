import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SSRWithContentSecurityPolicy } from "core-lib";
import { ImportBatchDetailBlock } from "../../../../../components/contents/products/recipe-import/ImportBatchDetailBlock";
import { LoadingState } from "core-lib/components/radix/LoadingState";

export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();

export default function ImportBatchDetailPage() {
  const router = useRouter();
  const { batchId } = router.query;

  if (!batchId || typeof batchId !== "string") return <LoadingState />;

  return <ImportBatchDetailBlock batchId={batchId} />;
}
