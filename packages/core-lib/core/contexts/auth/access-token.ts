import jwt_decode, { JwtPayload } from "jwt-decode";

type AccessToken = JwtPayload & { jti: string };

export function isValid(token: string) {
  const obj: AccessToken = jwt_decode(token);
  return obj.exp! * 100 >= Date.now();
}

export function parseTokenId(token: string) {
  const obj: AccessToken = jwt_decode(token);
  return obj.jti;
}
