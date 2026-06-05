import {
  ContentBlockDto,
  SystemSettingDto,
} from "../../api/commons/types";
import { config } from "../../config";

const API_BASE = () =>
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_URL ||
  config.value.APIURL ||
  "";

interface ApiEnvelope<T> {
  statusCode?: number;
  success?: boolean;
  response?: T | null;
  errors?: string[] | null;
  message?: string | null;
}

const fetchJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiEnvelope<T>;
    if (body.success === false) return null;
    return body.response ?? null;
  } catch {
    return null;
  }
};

export async function fetchPublicSettingsSSR(): Promise<SystemSettingDto[]> {
  const base = API_BASE();
  if (!base) return [];
  const list = await fetchJson<SystemSettingDto[]>(
    `${base}/api/v1/settings-api/Settings/public`,
  );
  return list ?? [];
}

export async function fetchContentBlocksByPageSSR(
  pageKey: string,
): Promise<ContentBlockDto[]> {
  const base = API_BASE();
  if (!base) return [];
  const list = await fetchJson<ContentBlockDto[]>(
    `${base}/api/v1/settings-api/ContentBlock/by-page/${encodeURIComponent(pageKey)}`,
  );
  return list ?? [];
}
