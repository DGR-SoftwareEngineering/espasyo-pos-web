import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { HeaderLogoNavigation } from './HeaderLogoNavigation';
import { useRouter } from '../../core/router';
import { useResolution } from '../../core/hooks';

interface Props {
    useRawLogoUrl?: boolean;
    onLogout(): void;
    pageKey?: string;
    hideNavigation?: boolean;
}

export const Header: React.FC<Props> = ({
    useRawLogoUrl,
    onLogout,
    pageKey,
    hideNavigation = false
}) => {
    /* some states not being used as of the moment. */
    const router = useRouter();
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [navigationMenuOpen, setNavigationMenuOpen] = useState(false);
    const accountMenuButtonRef = useRef<HTMLButtonElement>(null);
    const navigationMenuButtonRef = useRef<HTMLButtonElement>(null);
    const { isMobile } = useResolution();

    useEffect(() => {
        setAccountMenuOpen(false);
    }, [router.asPath]);

    return (
        <>
            <Box
                role='banner'
                component='header'
                width='100%'
                display='flex'
                justifyContent='center'
                zIndex={999}
                sx={{
                    backgroundColor: 'background.default',
                    borderBottomWidth: 1,
                    borderBottomStyle: 'solid',
                    borderBottomColor: 'divider',
                    ...(isMobile ? { position: 'fixed', top: 0, left: 0, right: 0 } : {})
                }}
            >
                <Grid
                    container
                    px={8}
                    width='100%'
                    position='relative'
                    display='flex'
                    alignItems='flex-end'
                    justifyContent='flex-end'
                ></Grid>
            </Box>
        </>
    )
}