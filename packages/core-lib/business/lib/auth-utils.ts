import { GetServerSidePropsContext } from "next";

export async function validateAuth(context: GetServerSidePropsContext) {
    const token = context.req.cookies.ac;
    const sessionCookie = context.req.cookies.session;

    if (!token || !sessionCookie) {
        return { isValid: false, shouldClearCookies: false };
    }

    const isExpired = isTokenExpired(token);
    if (isExpired) {
        return { isValid: false, shouldClearCookies: true };
    }

    try {
        const isValid = await validateToken(token);
        return { isValid, shouldClearCookies: !isValid };
    } catch (error) {
        console.error("Auth validation error:", error);
        return { isValid: false, shouldClearCookies: true };
    }
}

function isTokenExpired(token?: string): boolean {
  if (!token) return true;
  
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    
    const payloadPart = parts[1] ?? '';
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
    const exp = payload.exp;
    
    if (exp && typeof exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    }
    
    return false;
  } catch {
    return true;
  }
}

async function validateToken(token: string): Promise<boolean> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    try {
    const response = await fetch(
      `${API_URL}/authentication-api/api/authentication/validate-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 429) return true;
    if (!response.ok) return false;
    
    const data = await response.json();
    return data?.success === true;
  } catch (error) {
    return false;
  }
}

export function clearAuthCookies(context: GetServerSidePropsContext) {
  context.res.setHeader(
    "Set-Cookie",
    [
      "ac=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      "uid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      "sso_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      "auth_valid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
    ].join(", ")
  );
}