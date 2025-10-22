import { ValidateAccessTokenResponse } from "core-lib/api/authentication/types";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ENV = process.env.NODE_ENV;
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_URL ||
  "http://localhost:3000"; // fallback

const SECURITY_HEADERS = {
  "Content-Type": "application/json",
} as const;

const PUBLIC_ROUTES = ["/login"]; //add more if needed.

const BLOCKED_USER_AGENTS = [
  "curl",
  "PostmanRuntime",
  "BadBot",
  "wget",
  "python-requests",
  "HTTPie",
  "Go-http-client",
  "Java/",
  "libwww-perl",
  "WinHTTP",
  "RestSharp",
  "node-fetch",
];

const SECURITY_CONFIG = {
  hsts: "max-age=63072000; includeSubDomains; preload",
  permissionsPolicy: [
    "geolocation=()",
    "microphone=()",
    "camera=()",
    "fullscreen=(self)",
    "payment=()",
  ].join(", "),
};

const SENSITIVE_QUERY_PARAMS = [
  "redirect_status",
  "token",
  "auth",
  "api_key",
  "secret",
  "password",
];

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  try {
    if (shouldSkipMiddleware(request)) {
      return applyBasicSecurityHeaders(NextResponse.next());
    }

    const [security, authState] = await Promise.all([
      applySecurityHeaders(request),
      getAuthState(request),
    ]);

    if (security) return security;

    const redirection = await handleRouteProtection(
      request,
      authState.isAuthenticated
    );
    if (redirection) return redirection;
    const response = applyFinalSecurityHeaders(NextResponse.next());
    return response;
  } catch (error) {
    console.error(
      `Middleware failed after ${Date.now() - startTime}ms:`,
      error
    );
    return fallbackResponse(request);
  }
}

function shouldSkipMiddleware(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/api/")
  );
}

function applyBasicSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

async function applySecurityHeaders(request: NextRequest) {
  const url = request.nextUrl;

  if (url.protocol === "http:" && ENV === "production") {
    return NextResponse.redirect(`https://${url.host}${url.pathname}`, 301);
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (BLOCKED_USER_AGENTS.some((agent) => userAgent.includes(agent))) {
    return new NextResponse("Access Denied", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
        "X-Blocked-Reason": "Disallowed User-Agent",
      },
    });
  }

  return null;
}

function fallbackResponse(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return new NextResponse(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  return applyBasicSecurityHeaders(NextResponse.next());
}

function applyFinalSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Strict-Transport-Security", SECURITY_CONFIG.hsts);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", SECURITY_CONFIG.permissionsPolicy);
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}

function handleSensitiveParams(request: NextRequest): NextResponse | null {
  const { searchParams } = request.nextUrl;
  if (SENSITIVE_QUERY_PARAMS.some((param) => searchParams.has(param))) {
    const cleanUrl = request.nextUrl.clone();
    SENSITIVE_QUERY_PARAMS.forEach((param) =>
      cleanUrl.searchParams.delete(param)
    );
    return NextResponse.redirect(cleanUrl);
  }
  return null;
}

async function handleRouteProtection(
  request: NextRequest,
  isAuthenticated: boolean
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const sensitiveRedirect = handleSensitiveParams(request);
  if (sensitiveRedirect) return sensitiveRedirect;

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      const response = NextResponse.redirect(new URL("/hub", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache");
      return response;
    }
    return null;
  }

  if (pathname.startsWith("/hub")) {
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("ac");
      return response;
    }
    return NextResponse.next();
  }

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/hub", request.url));
  }

  return null;
}

async function getAuthState(request: NextRequest) {
  const token = request.cookies.get("ac")?.value;
  const cachedAuth = request.cookies.get("auth_valid")?.value;

  if (cachedAuth === "true") {
    return { isAuthenticated: true };
  }

  const isAuthenticated = token ? await validateToken(token) : false;

  if (isAuthenticated) {
    const response = NextResponse.next();
    response.cookies.set("auth_valid", "true", {
      maxAge: 300, // 5 minutes
      path: "/",
      httpOnly: true,
      secure: ENV === "production",
    });
    return { isAuthenticated };
  }

  return { isAuthenticated };
}

async function validateToken(token: string): Promise<boolean> {
  if (!token) {
    console.log("No token provided");
    return false;
  }

  try {
    const url = `${API_URL}/authentication-api/api/authentication/validate-access-token`;

    const response = await fetch(url, {
      headers: {
        ...SECURITY_HEADERS,
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
      keepalive: true,
    });

    if (!response.ok) return false;

    const data = (await response.json()) as ValidateAccessTokenResponse;

    if (typeof data?.success === "boolean") {
      if (!data.success) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export const config = {
  matcher: ["/hub/:path*", "/"],
  runtime: "experimental-edge",
};
