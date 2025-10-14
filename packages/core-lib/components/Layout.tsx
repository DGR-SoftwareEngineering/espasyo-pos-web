import { LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDateFns";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "../core/theme/theme";
import { ErrorBoundary } from "./ErrorBoundary";
import { PageContainer } from "./page/PageContainer";
import { LoadablePageContent } from "./page/LoadablePageContent";
import {
  NotificationsContextProvider,
  PageLoaderContextProvider,
} from "../core/contexts";
import { PageContent } from "./page/PageContent";

interface Props {} //pass props from top-level to lower-level components.

/**
 * Remove `React.PropsWithChildren` if the application needs to be purely dynamic
 * Create PageContainer & PageContent for dynamic switching of components blocks.
 */
export const Layout: React.FC<React.PropsWithChildren<Props>> = ({
  children,
}) => {
  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <ThemeProvider theme={theme()}>
        <CssBaseline />
        <PageLoaderContextProvider>
          <ErrorBoundary errorMessage="Application Error">
            <NotificationsContextProvider>
              <Box minHeight="100vh" display="flex" flexDirection="column">
                <PageContainer>
                  {/* set loading to false by default for now. */}
                  <LoadablePageContent loading={false}>
                    <PageContent children={children} />
                  </LoadablePageContent>
                </PageContainer>
              </Box>
            </NotificationsContextProvider>
          </ErrorBoundary>
        </PageLoaderContextProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};
