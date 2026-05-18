import { Suspense } from "react";
import { useAuthContext, usePublicSettings } from "../core/contexts";
import {
  useRefreshTokenHandler,
  useLogout,
  usePreventDuplicateSession,
} from "../core/hooks";
import { hexToRadixAccent } from "../business/colors";
import { DuplicationSessionBlock } from "./blocks";
import { MuiThemeFramework } from "./design/MuiThemeFramework";
import {
  RadixThemeFramework,
  RadixThemeFrameworkProps,
} from "./design/RadixThemeFramework";
import { ErrorBoundary } from "./ErrorBoundary";

export type Framework = "Radix" | "MUI";

interface Props {
  framework?: Framework;
  radixTheme?: Pick<
    RadixThemeFrameworkProps,
    | "appearance"
    | "accentColor"
    | "grayColor"
    | "radius"
    | "scaling"
    | "panelBackground"
  >;
}

const renderFallback = () => (
  <div
    style={{
      display: "flex",
      flex: "1 1 auto",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 320,
        height: 4,
        borderRadius: 2,
        background: "rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.5), transparent)",
          animation: "layout-fallback-shimmer 1.2s infinite linear",
        }}
      />
    </div>
    <style>{`
      @keyframes layout-fallback-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export const Layout: React.FC<React.PropsWithChildren<Props>> = ({
  framework = "Radix",
  radixTheme,
  children,
}) => {
  const { logout } = useLogout();
  const { isAuthenticated, loading, email, role, initials } = useAuthContext();
  const { hasDuplicateSession } = usePreventDuplicateSession();
  const { theme: publicTheme } = usePublicSettings();
  useRefreshTokenHandler(logout);

  if (hasDuplicateSession) {
    return <DuplicationSessionBlock />;
  }

  const resolvedAccent =
    radixTheme?.accentColor ??
    hexToRadixAccent(publicTheme.primaryColor, "indigo");

  const renderRadix = () => (
    <Suspense fallback={renderFallback()}>
      <ErrorBoundary errorMessage="Radix Framework Error">
        <RadixThemeFramework
          isAuthenticated={isAuthenticated}
          loading={loading}
          logout={logout}
          email={email}
          role={role}
          initials={initials}
          appearance={radixTheme?.appearance ?? "light"}
          accentColor={resolvedAccent}
          grayColor={radixTheme?.grayColor ?? "slate"}
          radius={radixTheme?.radius ?? "medium"}
          scaling={radixTheme?.scaling ?? "100%"}
          panelBackground={radixTheme?.panelBackground ?? "solid"}
        >
          {children}
        </RadixThemeFramework>
      </ErrorBoundary>
    </Suspense>
  );

  const renderMui = () => (
    <Suspense fallback={renderFallback()}>
      <ErrorBoundary errorMessage="MUI Framework Error">
        <MuiThemeFramework
          isAuthenticated={isAuthenticated}
          loading={loading}
          logout={logout}
          email={email}
          role={role}
          initials={initials}
        >
          {children}
        </MuiThemeFramework>
      </ErrorBoundary>
    </Suspense>
  );

  return (
    <ErrorBoundary errorMessage="Layout Error">
      {framework === "MUI" ? renderMui() : renderRadix()}
    </ErrorBoundary>
  );
};
