import { config } from "../config";

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

function ensureHttps(url: string) {
  if (!url.startsWith("https://")) {
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    } else {
      url = "https://" + url;
    }
  }
  return url;
}

function formatUrlWithDomain(url: string, domain: string): URL {
  const finalDomain = ensureHttps(domain);

  if (isValidUrl(url)) {
    return new URL(url);
  } else {
    return new URL(`${finalDomain}${url.startsWith("/") ? "" : "/"}${url}`);
  }
}

export function formatUrl(url: string) {
  const apiDomain = config.value.APIURL;

  if (!apiDomain) {
    throw new Error("Environment variable API_URL is not set.");
  }

  return formatUrlWithDomain(url, apiDomain);
}

export function formatUrlParameters(
  inputUrl: string
): Record<string, string | string[]> {
  const url = formatUrl(inputUrl);
  const params = new URLSearchParams(url.search);

  return Array.from(params.entries()).reduce(
    (formattedParams, [key, value]) => {
      const existingValue = formattedParams[key];

      if (existingValue !== undefined) {
        if (Array.isArray(existingValue)) {
          return { ...formattedParams, [key]: [...existingValue, value] };
        } else {
          return { ...formattedParams, [key]: [existingValue, value] };
        }
      } else {
        return { ...formattedParams, [key]: value };
      }
    },
    {} as Record<string, string | string[]>
  );
}
