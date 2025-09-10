import dynamic from 'next/dynamic';
import { Layout as LayoutComponent } from './Layout';
import { ErrorBox } from './ErrorBox';
import React from 'react';

export interface ServerProps {} //pass data from server-side

interface Props {
    error?: Error;
}

export const Page: React.FC<React.PropsWithChildren<Props>> = ({ error, children }) => { //Use NextPage when implementing dynamic page.
    if (error) {
        return <ErrorBox label={error.message} />
    }

    const Layout = dynamic<React.ComponentProps<typeof LayoutComponent>>(() => import('./Layout').then(c => c.Layout), {
        ssr: false,
    });

    return <Layout>{children}</Layout>
}