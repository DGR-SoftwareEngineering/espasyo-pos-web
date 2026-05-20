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

type AuthState = {
  isAuthenticated: boolean;
  role: string | null;
  userId: string | null;
};

function extractRoleFromJwt(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    const json = base64UrlDecode(payloadB64);
    const payload = JSON.parse(json) as Record<string, unknown>;

    const ROLE_CLAIM =
      process.env.NEXT_PUBLIC_CLAIMS_IDENTITY_URL +
      "/ws/2008/06/identity/claims/role";

    const raw = payload[ROLE_CLAIM];
    if (typeof raw !== "string") return null;

    return raw.trim().toLowerCase();
  } catch {
    return null;
  }
}

function extractUserIdFromJwt(token: string | null | undefined): string | null {
  if (!token) return null;

  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;

    const json = base64UrlDecode(payloadB64);
    const payload = JSON.parse(json) as Record<string, unknown>;

    const CLAIM =
      process.env.NEXT_PUBLIC_CLAIMS_NAME_IDENTIFIER +
      "/ws/2005/05/identity/claims/nameidentifier";

    const raw = payload[CLAIM];
    if (typeof raw !== "string") return null;
    return raw.trim().toLowerCase();
  } catch {
    return null;
  }
}

function base64UrlDecode(b64url: string): string {
  const b64 = b64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(b64url.length / 4) * 4, "=");

  if (typeof atob === "function") {
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }

  return Buffer.from(b64, "base64").toString("utf-8");
}

function getAllowedPrefixesByRole(role: string | null): string[] {
  switch (role ?? "") {
    case "cashier":
      return ["/cashier"];
    case "admin":
      return ["/admin/hub"];
    default:
      return [];
  }
}

function getHomePathByRole(role: string | null): string {
  switch (role ?? "") {
    case "cashier":
      return "/cashier/pos";
    case "admin":
      return "/admin/hub";
    default:
      return "/";
  }
}

function isPathUnderAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname.startsWith(p));
}

function isRoleValid(role: string | null): boolean {
  return ["cashier", "admin"].includes(role ?? "");
}

function safeRedirect(
  request: NextRequest,
  targetPath: string,
): NextResponse | null {
  const currentPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const target = targetPath.replace(/\/+$/, "") || "/";
  if (currentPath === target) return NextResponse.next();
  return NextResponse.redirect(new URL(targetPath, request.url));
}

export async function proxy(request: NextRequest) {
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

    const redirection = await handleRouteProtection(request, authState);

    if (redirection) return redirection;

    const response = applyFinalSecurityHeaders(NextResponse.next());

    if (authState.userId) {
      response.cookies.set("uid", authState.userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: ENV === "production",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error(
      `Middleware failed after ${Date.now() - startTime}ms:`,
      error,
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
      cleanUrl.searchParams.delete(param),
    );
    return NextResponse.redirect(cleanUrl);
  }
  return null;
}

async function handleRouteProtection(
  request: NextRequest,
  authState: AuthState,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const PROTECTED_PREFIXES = ["/cashier", "/admin/hub"];

  const sensitiveRedirect = handleSensitiveParams(request);
  if (sensitiveRedirect) return sensitiveRedirect;

  if (authState.isAuthenticated && !isRoleValid(authState.role)) {
    const res = safeRedirect(request, "/") ?? NextResponse.next();
    res.cookies.delete("ac");
    return res;
  }

  if (pathname === "/") {
    if (authState.isAuthenticated && isRoleValid(authState.role)) {
      const home = getHomePathByRole(authState.role);
      return safeRedirect(request, home);
    }
    return null;
  }

  const isProtected = isPathUnderAny(pathname, PROTECTED_PREFIXES);

  if (isProtected) {
    if (!authState.isAuthenticated) {
      const res = safeRedirect(request, "/404") ?? NextResponse.next();
      res.cookies.delete("ac");
      return res;
    }

    const allowed = getAllowedPrefixesByRole(authState.role);
    if (!isPathUnderAny(pathname, allowed)) {
      const home = getHomePathByRole(authState.role);
      return NextResponse.redirect(new URL(home, request.url));
    }

    return null;
  }

  return null;
}

async function getAuthState(request: NextRequest) {
  const token = request.cookies.get("ac")?.value;
  const cachedAuth = request.cookies.get("auth_valid")?.value;
  const role = extractRoleFromJwt(token);
  const userId = extractUserIdFromJwt(token);

  if (cachedAuth === "true") {
    return { isAuthenticated: true, role, userId };
  }

  const isAuthenticated = token ? await validateToken(token) : false;

  if (isAuthenticated) {
    return { isAuthenticated, role, userId };
  }

  return { isAuthenticated, role: null, userId: null };
}

async function validateToken(token: string): Promise<boolean> {
  if (!token) {
    console.log("No token provided");
    return false;
  }

  try {
    const url = `${API_URL}/authentication-api/api/authentication/validate-token`;

    var controller = new AbortController();

    const response = await fetch(url, {
      headers: {
        ...SECURITY_HEADERS,
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
      keepalive: true,
      signal: controller.signal,
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
