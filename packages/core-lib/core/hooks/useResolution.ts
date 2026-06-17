import { useMediaQuery, useTheme } from '@mui/material'
import { useMemo } from 'react'

export const useResolution = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return useMemo(() => ({ isMobile, isSmallMobile, isTablet, isDesktop }), [isMobile, isSmallMobile, isTablet, isDesktop])
}