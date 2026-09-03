import React from "react";
import { PublicSettingsProvider, AuthProvider } from "core-lib/core/contexts";
import { ThemePreferenceProvider } from "core-lib/core/contexts/theme/ThemePreferenceContext";
import { ErrorBoundary } from "core-lib/components/ErrorBoundary";
import { BrandingHead } from "core-lib/components/radix/BrandingHead";
import { ThemeColorVars } from "core-lib/components/radix/ThemeColorVars";
import type { SystemSettingDto } from "core-lib/api/commons/types";
import { Layout } from 'core-lib'

interface Props {
  initialPublicSettings?: SystemSettingDto[];
}

const Page: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  initialPublicSettings,
}) => {
  return (
    <ErrorBoundary errorMessage="Something went wrong">
      <PublicSettingsProvider initialSettings={initialPublicSettings}>
        <BrandingHead />
        <ThemeColorVars />
        <ThemePreferenceProvider>
          <AuthProvider authMethod="STANDARD_AUTH">
            <Layout platform="CustomerEngagement">
              {children}
            </Layout>
          </AuthProvider>
        </ThemePreferenceProvider>
      </PublicSettingsProvider>
    </ErrorBoundary>
  );
};

export default Page;