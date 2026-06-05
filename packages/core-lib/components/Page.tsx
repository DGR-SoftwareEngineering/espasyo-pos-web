import { NextPage } from 'next';
import { Layout as LayoutComponent } from './Layout';
import { TenantContextProvider } from '../core/contexts';
import { CmsTenant } from '../api/content/types/tenant';
import { ErrorBox } from './ErrorBox';
import dynamic from 'next/dynamic';
import { IronSession } from 'iron-session'
import { withSsrSession } from '../core/ssr/withSsrSession';
import { formattedSlug, parseTenantUrl } from '../business/tenant';
import { getTenant } from '../api/content/ssr-api';

export interface ServerProps {
    tenant: CmsTenant;
    slug: string;
    bgroup: string;
    referrer: string | null;
}

interface Props {
    data?: ServerProps;
    error?: Error;
}

export const Page: NextPage<Props> = ({ data, error }) => {
    if (error) {
        return <ErrorBox label={error.message} />
    }

    if (!data?.tenant) {
        return <ErrorBox label={'failed_to_retrieve_tenant'} />
    }

    const Layout = dynamic<React.ComponentProps<typeof LayoutComponent>>(() => import('./Layout').then(c => c.Layout), {
        ssr: false
    });

    return (
        <TenantContextProvider tenant={data.tenant}>
            <Layout />
        </TenantContextProvider>
    )
}

export interface NextIronSessionWithBgroup extends IronSession {
    bgroup?: string;
}

export const getServerSideProps = withSsrSession(async ({ req, resolvedUrl, query }) => {
    const host = req.headers.host;
    const referrer = req.headers.referer || null;
    const querySlugs = query['slug'];
    const tenantUrl = parseTenantUrl(host);

    if (!tenantUrl) {
        console.error('Tenant not found for host:', host);
        return { props: { error: { message: 'Tenant not found.' } } };
    }

    try {
        const tenant = await getTenant(tenantUrl);
        const session = req.session as NextIronSessionWithBgroup;
        session.bgroup = tenant.businessGroup.values.join(',');

        await session.save();

        const bgroup = session.bgroup || '';
        const slug = formattedSlug(tenant, querySlugs as string[]) || resolvedUrl;

        return { props: { data: { tenant, slug, bgroup, referrer }}}
        
    } catch (error: any) {
        console.error(`Error on getTenant response: ${error.message || error}`);
        return { props: { error: { message: error.message || 'An error occurred.' } } };
    }
})