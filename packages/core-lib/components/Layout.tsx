import { LocalizationProvider } from '@mui/lab'
import DateAdapter from '@mui/lab/AdapterDateFns'
import { CssBaseline, ThemeProvider, useTheme } from '@mui/material';

interface Props {} //pass props from top-level to lower-level components.

/**
 * Remove `React.PropsWithChildren` if the application needs to be purely dynamic
 * Create PageContainer & PageContent for dynamic switching of components blocks.
 */
export const Layout: React.FC<React.PropsWithChildren<Props>> = ({ children }) => {
    const theme = useTheme();

    return (
        <LocalizationProvider dateAdapter={DateAdapter}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </LocalizationProvider>
    )   
}