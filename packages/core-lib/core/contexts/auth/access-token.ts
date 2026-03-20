import jwt_decode, { JwtPayload } from "jwt-decode";

type AccessToken = JwtPayload & { jti: string };

export function isValid(token: string) {
  if (!token) return false;

  const obj = safeDecode<AccessToken>(token);
  if (!obj) return false;

  return obj.exp ? obj.exp * 1000 >= Date.now() : false;
}

export function parseTokenId(token: string) {
  if (!token) return null;

  const obj = safeDecode<AccessToken>(token);
  return obj?.jti || null;
}

export function safeDecode<T = any>(token: string): T | null {
  if (!token) return null;

  try {
    return jwt_decode<T>(token);
  } catch (error) {
    return null;
  }
}
