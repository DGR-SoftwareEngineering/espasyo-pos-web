import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { ServerResponse } from "http";
import { nonce } from "./nonce";
import { validateAndCleanCookies } from "./utils/auth";

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
  requireAuth: boolean = false
) => {
  return async (context: GetServerSidePropsContext) => {
    try {

      if (requireAuth) {
        const isValid = await validateAndCleanCookies(context);
        
        if (!isValid) {
          return {
            redirect: {
              destination: "/",
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
      if (requireAuth) {
        context.res.setHeader("Set-Cookie", [
          "ac=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
          "session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
          "sso_token=; Max-Age=0; Path=/; SameSite=Strict",
          "uid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
        ]);
        
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }

      return {
        props: { error: { message: error.message || "An error occured." } },
      };
    }
  };
};