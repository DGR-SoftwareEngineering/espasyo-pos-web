import { CmsTenant } from "../api/content/types/tenant";
import { config } from "../config";

export const parseTenantUrl = (tenantUrl: string | undefined) =>
  config.value.NODE_ENV === "development" && tenantUrl?.includes("localhost")
    ? "config-tenant-url-here"
    : tenantUrl;

export const formattedSlug = (tenant: CmsTenant, slugs?: string[]) => {
  const withTenantSlug =
    !!slugs?.length &&
    tenant.tenantUrl.value.split("/").length > 1 &&
    slugs[0] === tenant.tenantUrl.value.split("/")[1];
  return slugs
    ? `/${slugs.slice(withTenantSlug ? 1 : 0).join("/")}`
    : undefined;
};
