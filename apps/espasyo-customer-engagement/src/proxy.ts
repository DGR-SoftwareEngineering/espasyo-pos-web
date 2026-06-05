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

// Public routes - only accessible by UNAUTHENTICATED users
const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/customer-engagement-registration",
  "/customer-engagement-registration/account-setup",
];

// Authenticated customer area - only accessible by AUTHENTICATED users
const PROTECTED_PREFIXES = ["/customer"];

const CUSTOMER_HOME = "/customer/hub";
const NOT_FOUND = "/404";

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

function isPathUnderAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isRoleValid(role: string | null): boolean {
  return role === "customer";
}

function safeRedirect(
  request: NextRequest,
  targetPath: string,
): NextResponse {
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

    const response = await handleRouteProtection(request, authState);
    if (response) return response;

    const finalResponse = applyFinalSecurityHeaders(NextResponse.next());

    if (authState.userId) {
      finalResponse.cookies.set("uid", authState.userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: ENV === "production",
        path: "/",
      });
    }

    return finalResponse;
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
    pathname.startsWith("/api/") ||
    pathname === "/404"
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

  const sensitiveRedirect = handleSensitiveParams(request);
  if (sensitiveRedirect) return sensitiveRedirect;

  // Check if user has valid customer role
  const hasValidRole = authState.isAuthenticated && isRoleValid(authState.role);
  const isAuthenticated = authState.isAuthenticated;

  // Check if current path is public (should only be accessed by unauthenticated users)
  const isPublicPath = isPathUnderAny(pathname, PUBLIC_PREFIXES);
  
  // Check if current path is protected (customer area)
  const isProtectedPath = isPathUnderAny(pathname, PROTECTED_PREFIXES);

  // CASE 1: Authenticated user trying to access public pages (/, /login, /customer-engagement-registration/*)
  if (isAuthenticated && isPublicPath) {
    // Redirect to 404 page
    return NextResponse.redirect(new URL(NOT_FOUND, request.url));
  }

  // CASE 2: Unauthenticated user trying to access protected pages (/customer/*)
  if (!isAuthenticated && isProtectedPath) {
    // Redirect to 404 page
    return NextResponse.redirect(new URL(NOT_FOUND, request.url));
  }

  // CASE 3: Authenticated but wrong role (should not happen, but handle gracefully)
  if (isAuthenticated && !hasValidRole && isProtectedPath) {
    // Redirect to 404
    return NextResponse.redirect(new URL(NOT_FOUND, request.url));
  }

  // CASE 4: Special handling for login page - redirect authenticated users to hub
  if (pathname === "/login" && isAuthenticated && hasValidRole) {
    return safeRedirect(request, CUSTOMER_HOME);
  }

  // CASE 5: Root path - if authenticated, redirect to customer hub, otherwise allow access
  if (pathname === "/" && isAuthenticated && hasValidRole) {
    return safeRedirect(request, CUSTOMER_HOME);
  }

  // Allow all other requests to proceed
  return null;
}

async function getAuthState(request: NextRequest): Promise<AuthState> {
  const token = request.cookies.get("ac")?.value;
  const cachedAuth = request.cookies.get("auth_valid")?.value;
  const role = extractRoleFromJwt(token);
  const userId = extractUserIdFromJwt(token);

  if (cachedAuth === "true") {
    return { isAuthenticated: true, role, userId };
  }

  const isAuthenticated = token ? await validateToken(token) : false;

  return { isAuthenticated, role, userId };
}

async function validateToken(token: string): Promise<boolean> {
  if (!token) {
    console.log("No token provided");
    return false;
  }

  try {
    const url = `${API_URL}/authentication-api/api/authentication/validate-token`;

    const controller = new AbortController();

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
  } catch {
    return false;
  }
}