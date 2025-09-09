import DOMPurify from 'isomorphic-dompurify';
import { NextRouter, useRouter as useNextRouter } from 'next/router';
import qs, { ParsedQuery } from 'query-string'
import { useEffect, useMemo, useState } from 'react';

type StaticRoutes = Record<
| 'home'
| 'hub'
| 'logout'
| 'page_not_found',
string>;
type TransitionOptions = ArgumentTypes<NextRouter['push']>[2];
type PathFromRoutes = (routes: StaticRoutes) => string;

type PathParameters = {
    url: string | PathFromRoutes;
    query?: ParsedQuery<any>;
}

export const useRouter = () => {
    const router = useNextRouter();
    const [loading, setLoading] = useState(false);
    const staticRoutes = {} as StaticRoutes;

    useEffect(() => {
        const start = () => setLoading(true);
        const end = () => setLoading(false);
        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', end);
        router.events.on('routeChangeError', end);
        return () => {
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', end);
            router.events.off('routeChangeError', end);
        }
    }, [router]);

    return {
        loading,
        staticRoutes,
        ...useMemo(
            () => ({
                router,
                push: navigate(push),
                replace: navigate(replace),
                parsedQuery: sanitizeQuery(),
            }),
            [router, staticRoutes],
            ),
    }

    async function push(path: string | PathFromRoutes, options?: TransitionOptions) {
        return typeof path === 'string'
            ? router.push(routeUrl(path), path, configuredRouteOptions(options))
            : router.push(routeUrl(path(staticRoutes)), path(staticRoutes), configuredRouteOptions(options))
    }

    async function replace(path: string | PathFromRoutes, options?: TransitionOptions) {
        return typeof path === 'string'
            ? router.replace(routeUrl(path), path, configuredRouteOptions(options))
            : router.replace(routeUrl(path(staticRoutes)), path(staticRoutes), configuredRouteOptions(options))
    }

    function navigate(fn: (path: string | PathFromRoutes, options?: TransitionOptions) => Promise<boolean>) {
        return async (path: string | PathFromRoutes | PathParameters, options?: TransitionOptions) => {
            setLoading(true);
            if (typeof path === 'string') {
                return await fn(path, options);
            }

            if (typeof path === 'function') {
                return await fn(path, options);
            }

            try {
                const stringifiedPath = qs.stringifyUrl({
                    url: typeof path.url === 'string' ? path.url : path.url(staticRoutes),
                    query: path.query
                });

                return await fn(stringifiedPath, options);
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    }

    function sanitizeQuery(): ParsedQuery {
        const query = qs.parseUrl(router?.asPath ?? 'q').query;

        Object.entries(query).forEach(([queryKey, value]) => {
            query[queryKey] = value ? DOMPurify.sanitize(value.toString()) : value;
        });

        return query;
    }

    function routeUrl(path: string) {
        return path === staticRoutes.home || path.includes('http://') || path.includes('https://') ? path : '/[...slug]'
    }
}

const configuredRouteOptions = (options?: TransitionOptions) =>
    options ? { scroll: false, ...options } : { scroll: false }