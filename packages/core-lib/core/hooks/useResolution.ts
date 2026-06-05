import { useMediaQuery, useTheme } from '@mui/material'
import { useMemo } from 'react'

export const useResolution = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return useMemo(() => ({ isMobile, isSmallMobile }), [isMobile, isSmallMobile])
}