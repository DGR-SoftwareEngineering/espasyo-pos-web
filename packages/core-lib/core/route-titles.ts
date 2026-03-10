import { match } from "path-to-regexp";
import type { ParsedUrlQuery } from "querystring";

type TitleResolver = (
  params: Record<string, string>,
  query: ParsedUrlQuery
) => string;

type RouteTitleEntry = {
  pattern: string;
  title: string | TitleResolver;
};

export const ROUTE_TITLES: RouteTitleEntry[] = [
  { pattern: "/", title: "Welcome to Espasyo POS" },
  { pattern: "/hub", title: "Hub Dashboard" },
];

export function resolveTitle(pathname: string, query: ParsedUrlQuery): string {
  for (const entry of ROUTE_TITLES) {
    const matcher = match(entry.pattern, {
      decode: decodeURIComponent,
      end: true,
    });
    const result = matcher(pathname);
    if (result) {
      if (typeof entry.title === "function") {
        return entry.title(
          (result.params ?? {}) as Record<string, string>,
          query
        );
      }
      return entry.title;
    }
  }
  return "Escreen";
}
