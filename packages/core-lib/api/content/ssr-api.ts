import qs from "query-string";
import { config } from "../../config";
import { TenantResponse } from "./types/tenant";

export async function getTenant(tenantUrl: string) {
  // add validation if api url is not defined in config -> throw error.

  const response = await fetch(
    `http://example.com/content-api/api/v1/content/tenant-content?${qs.stringify({ tenantUrl }, { encode: false })}`,
    { headers: { ENV: config.value.NODE_ENV } } //change to ENVIRONMENT.
  );

  return ((await response.json()) as TenantResponse).elements ?? null;
}
