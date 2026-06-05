import { AuthProvider, Layout } from "core-lib";
import {
  AccessProvider,
  MpinStatusProvider,
  PublicSettingsProvider,
} from "core-lib/core/contexts";
import { ErrorBoundary } from "core-lib/components/ErrorBoundary";
import { BrandingHead } from "core-lib/components/radix/BrandingHead";
import { ThemeColorVars } from "core-lib/components/radix/ThemeColorVars";
import type { SystemSettingDto } from "core-lib/api/commons/types";

interface Props {
  initialPublicSettings?: SystemSettingDto[];
}

const Page: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  initialPublicSettings,
}) => {
  return (
    <ErrorBoundary errorMessage="Authentication Error">
      <PublicSettingsProvider initialSettings={initialPublicSettings}>
        <BrandingHead />
        <ThemeColorVars />
        <AuthProvider authMethod="STANDARD_AUTH">
          <AccessProvider>
            <MpinStatusProvider>
              <Layout>{children}</Layout>
            </MpinStatusProvider>
          </AccessProvider>
        </AuthProvider>
      </PublicSettingsProvider>
    </ErrorBoundary>
  );
};

export default Page;
