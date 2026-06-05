import { config } from "../config";
import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { ServerResponse } from "http";
import { nonce } from "./nonce";

type CSPDirective = {
  [key: string]: string[];
};

const baseCSP: CSPDirective = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.gstatic.com",
    "http://cdnjs.cloudflare.com",
  ],
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],  // Better security
  "style-src": ["'self'", "'unsafe-inline'"],
  "connect-src": [
    "'self'",
    "blob:",
    "https://rum.browser-intake-datadoghq.eu",
    config.value.APIURL,
    "https://espasyo-pos-api-bec38eeac3a3.herokuapp.com",
    "*.herokuapp.com",
  ],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "data:"],
  "frame-src": ["'self'"],
  "frame-ancestors": ["'self'"],
};

export function generateCSP(nonce: string): string {
  const cspWithNonce = {
    ...baseCSP,
    "script-src": [...(baseCSP["script-src"] ?? []), `'nonce-${nonce}'`],
  };

  return Object.entries(cspWithNonce)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export const setCSPHeader = (res: ServerResponse, csp: string): void => {
  const isDevelopment = process.env.NODE_ENV === "development";
  // Also set in development if you want to test CSP
  if (res != null && !res.headersSent) {
    res.setHeader("Content-Security-Policy", csp);
    // Add report-only mode for testing
    if (isDevelopment) {
      res.setHeader("Content-Security-Policy-Report-Only", csp);
    }
  }
};

export const SSRWithContentSecurityPolicy = (
  getServerSidePropsFn?: GetServerSideProps
) => {
  return async (context: GetServerSidePropsContext) => {
    try {
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
      console.error("CSP Error:", error);
      return {
        props: { error: { message: error.message || "An error occured." } },
      };
    }
  };
};