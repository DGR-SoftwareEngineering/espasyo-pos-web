import { config } from "../config";
import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { ServerResponse } from "http";
import { nonce } from "./nonce";

type CSPDirective = {
  [key: string]: string[];
};

const baseCSP: CSPDirective = {
  "default-src": ["'self'", "*.test.com"],
  "script-src": [
    "'self'",
    "https://www.gstatic.com",
    "http://cdnjs.cloudflare.com",
  ],
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "connect-src": [
    "'self'",
    "*.test.com",
    "blob:",
    "https://rum.browser-intake-datadoghq.eu",
    config.value.APIURL,
  ],
  "img-src": ["'self'"],
  "font-src": ["'self'", "data:"],
  "frame-src": ["'self'", "*.test.com"],
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
  if (res != null && !isDevelopment && !res.headersSent) {
    res.setHeader("Content-Security-Policy", csp);
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
      return {
        props: { error: { message: error.message || "An error occured." } },
      };
    }
  };
};
