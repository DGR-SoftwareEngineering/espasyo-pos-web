import { GetServerSideProps } from "next";
import { PlatformManagementBlock } from "../../../../components";
import { SSRWithContentSecurityPolicy } from "core-lib/business/content-security-policy";

export default function PlatformManagementPage() {
  return <PlatformManagementBlock />;
}
export const getServerSideProps: GetServerSideProps =
  SSRWithContentSecurityPolicy();
