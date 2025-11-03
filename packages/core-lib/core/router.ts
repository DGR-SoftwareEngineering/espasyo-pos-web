import DOMPurify from "isomorphic-dompurify";
import { NextRouter, useRouter as useNextRouter } from "next/router";
import qs, { ParsedQuery } from "query-string";
import { useEffect, useMemo, useState } from "react";
import { resolveTitle } from "./route-titles";

type StaticRoutes = Record<
  "home" | "hub" | "page_not_found" | "second_tab_redirect",
  string
>;
type TransitionOptions = ArgumentTypes<NextRouter["push"]>[2];
type PathFromRoutes = (routes: StaticRoutes) => string;

type PathParameters = {
  url: string | PathFromRoutes;
  query?: ParsedQuery<any>;
};

type NavigateFn = ReturnType<typeof navigate>;

export const STATIC_ROUTES: StaticRoutes = {
  home: "/",
  hub: "/hub",
  page_not_found: "/404",
  second_tab_redirect: "/duplicate-session",
};

export interface CustomRouterReturn {
  events: NextRouter["events"];
  loading: boolean;
  staticRoutes: StaticRoutes;
  pathname: NextRouter["pathname"];
  route: NextRouter["route"];
  query: NextRouter["query"];
  asPath: NextRouter["asPath"];
  basePath: NextRouter["basePath"];
  locale?: NextRouter["locale"];
  locales?: NextRouter["locales"];
  defaultLocale?: NextRouter["defaultLocale"];
  isReady: NextRouter["isReady"];
  isFallback: NextRouter["isFallback"];
  isPreview: NextRouter["isPreview"];
  back: NextRouter["back"];
  reload: NextRouter["reload"];
  push: NavigateFn;
  replace: NavigateFn;
  parsedQuery: ParsedQuery;
  title: string;
}

export const useRouter = (): CustomRouterReturn => {
  const router = useNextRouter();
  const [loading, setLoading] = useState(false);
  const staticRoutes = STATIC_ROUTES;

  const title = useMemo(
    () => resolveTitle(router.pathname, router.query),
    [router.pathname, router.query]
  );

  useEffect(() => {
    const start = () => setLoading(true);
    const end = () => setLoading(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router]);

  return {
    loading,
    staticRoutes,
    title: title,
    ...useMemo(
      () => ({
        ...router,
        push: navigate(push, () => staticRoutes),
        replace: navigate(replace, () => staticRoutes),
        parsedQuery: sanitizeQuery(),
      }),
      [router, staticRoutes]
    ),
  };

  async function push(
    path: string | PathFromRoutes,
    options?: TransitionOptions
  ) {
    const resolvedPath = typeof path === "string" ? path : path(staticRoutes);
    return router.push(
      resolvedPath,
      resolvedPath,
      configuredRouteOptions(options)
    );
  }

  async function replace(
    path: string | PathFromRoutes,
    options?: TransitionOptions
  ) {
    const resolvedPath = typeof path === "string" ? path : path(staticRoutes);
    return router.replace(
      resolvedPath,
      resolvedPath,
      configuredRouteOptions(options)
    );
  }

  function sanitizeQuery(): ParsedQuery {
    const query = qs.parseUrl(router?.asPath ?? "q").query;

    Object.entries(query).forEach(([queryKey, value]) => {
      query[queryKey] = value ? DOMPurify.sanitize(value.toString()) : value;
    });

    return query;
  }

  function routeUrl(path: string) {
    const knownRoutes = Object.values(STATIC_ROUTES);
    if (knownRoutes.includes(path) || path.startsWith("http")) {
      return path;
    }

    return `/${path}`;
  }
};

function navigate(
  fn: (
    path: string | PathFromRoutes,
    options?: TransitionOptions
  ) => Promise<boolean>,
  getStaticRoutes: () => StaticRoutes
) {
  return async (
    path: string | PathFromRoutes | PathParameters,
    options?: TransitionOptions
  ) => {
    if (typeof path === "string") {
      return await fn(path, options);
    }

    if (typeof path === "function") {
      return await fn(path, options);
    }

    try {
      const routes = getStaticRoutes();

      const resolvedUrl =
        typeof path.url === "string" ? path.url : path.url?.(routes);

      if (!resolvedUrl) {
        console.error("navigate(): path.url is undefined", path);
        return false;
      }

      const stringifiedPath = qs.stringifyUrl({
        url: resolvedUrl,
        query: path.query,
      });

      return await fn(stringifiedPath, options);
    } catch (error) {
      console.error(error);
      return false;
    }
  };
}

const configuredRouteOptions = (options?: TransitionOptions) =>
  options ? { scroll: false, ...options } : { scroll: false };
