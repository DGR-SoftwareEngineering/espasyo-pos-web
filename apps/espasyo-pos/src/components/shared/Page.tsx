import { AuthProvider, Layout } from "core-lib";
import {
  AccessProvider,
  MpinStatusProvider,
  OfflineModeProvider,
  PublicSettingsProvider,
} from "core-lib/core/contexts";
import { ErrorBoundary } from "core-lib/components/ErrorBoundary";
import { BrandingHead } from "core-lib/components/radix/BrandingHead";
import { ThemeColorVars } from "core-lib/components/radix/ThemeColorVars";
import { ThemePreferenceProvider } from "core-lib/core/contexts/theme/ThemePreferenceContext";
import type { SystemSettingDto } from "core-lib/api/commons/types";
import ContentSecurityPolicyHeader from "core-lib/components/ContentSecurityPolicyHeader";

interface Props {
  initialPublicSettings?: SystemSettingDto[];
  generatedNonce?: string;
}

const Page: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  initialPublicSettings,
  generatedNonce,
}) => {
  return (
    <ErrorBoundary errorMessage="Authentication Error">
      <ContentSecurityPolicyHeader nonce={generatedNonce ?? ""} />
      <PublicSettingsProvider initialSettings={initialPublicSettings}>
        <OfflineModeProvider>
        <BrandingHead />
        <ThemeColorVars />
        <ThemePreferenceProvider>
          <AuthProvider authMethod="STANDARD_AUTH">
            <AccessProvider>
              <MpinStatusProvider>
                <Layout>{children}</Layout>
              </MpinStatusProvider>
            </AccessProvider>
          </AuthProvider>
        </ThemePreferenceProvider>
        </OfflineModeProvider>
      </PublicSettingsProvider>
    </ErrorBoundary>
  );
};

export default Page;
