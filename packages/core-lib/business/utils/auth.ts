import { GetServerSidePropsContext } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/authentication-api/api/authentication/validate-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    // Rate-limited ≠ invalid token; assume token is still valid
    if (response.status === 429) return true;
    if (!response.ok) return false;

    const data = await response.json();
    return data?.success === true;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
}

export async function validateAndCleanCookies(context: GetServerSidePropsContext): Promise<boolean> {
  const token = context.req.cookies.ac;
  
  if (!token) {
    return false;
  }

  const isValid = await validateToken(token);
  
  if (!isValid) {
    // Clear all auth cookies
    context.res.setHeader("Set-Cookie", [
      "ac=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
      "session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
      "sso_token=; Max-Age=0; Path=/; SameSite=Strict",
      "uid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    ]);
  }
  
  return isValid;
}