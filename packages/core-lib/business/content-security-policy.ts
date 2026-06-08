import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { ServerResponse } from "http";
import { nonce } from "./nonce";
import { validateAuth, clearAuthCookies } from "./lib/auth-utils";

type CSPDirective = {
  [key: string]: string[];
};

const baseCSP: CSPDirective = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "https://www.gstatic.com",
    "http://cdnjs.cloudflare.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "*.herokuapp.com"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "connect-src": ["'self'", "https://*", "*.herokuapp.com"],
  "object-src": ["'none'"],
  "frame-src": ["'self'"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

export function generateCSP(_nonce: string): string {
  const csp = {
    ...baseCSP,
    "script-src": [...(baseCSP["script-src"] ?? []), "'unsafe-inline'"],
  };

  return Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export const setCSPHeader = (res: ServerResponse, csp: string): void => {
  const isDevelopment = process.env.NODE_ENV === "development";
  if (res != null && !isDevelopment && !res.headersSent) {
    res.setHeader("Content-Security-Policy", csp);
  }
};

export const SSRWithContentSecurityPolicy = (
  getServerSidePropsFn?: GetServerSideProps,
  options?: { requireAuth?: boolean; redirectTo?: string }
) => {
  return async (context: GetServerSidePropsContext) => {
    try {
      if (options?.requireAuth) {
        const { isValid, shouldClearCookies } = await validateAuth(context);
        
        if (shouldClearCookies) {
          clearAuthCookies(context);
        }
        
        if (!isValid) {
          const redirectUrl = options.redirectTo || "/";
          return {
            redirect: {
              destination: redirectUrl,
              permanent: false,
            },
          };
        }
      }
      
      const generatedNonce = nonce();
      const csp = generateCSP(generatedNonce);
      
      setCSPHeader(context.res as ServerResponse, csp);
      
      if (getServerSidePropsFn) {
        const result = await getServerSidePropsFn(context);
        if ("props" in result) {
          return {
            ...result,
            props: {
              ...result.props,
              generatedNonce,
              data: {},
            },
          };
        }
        return result;
      }
      
      return {
        props: {
          generatedNonce,
          data: {},
        },
      };
    } catch (error: any) {
      console.error("SSR Error:", error);
      return {
        props: { error: { message: error.message || "An error occurred." } },
      };
    }
  };
};