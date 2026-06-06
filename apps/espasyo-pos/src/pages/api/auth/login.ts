import { NextApiHandler } from "next";
import { errorResponse, withSsrHttpClient } from "core-lib";
import { LoginResponse } from "core-lib/api/authentication/types";
import { serialize } from "cookie";

const isProd = process.env.NODE_ENV === "production";

const handler: NextApiHandler = withSsrHttpClient(
  (client) => async (req, res) => {
    try {
      const result = await client.post<LoginResponse>(
        `/authentication-api/api/authentication/login`,
        req.body,
        {
          headers: {
            "Content-Type": "application/json",
            ...(process.env.NEXT_PRIVATE_PLATFORM_KEY && {
              "X-Platform-Key": process.env.NEXT_PRIVATE_PLATFORM_KEY,
            }),
          }
        }
      );
      req.session.accessToken = result.data.response.accessToken;
      req.session.refreshToken = result.data.response.refreshToken;

      const accessToken = result.data.response.accessToken;
      let maxAge = 3600; // default 1 hour
      try {
        const [, payloadB64] = accessToken.split(".");
        if (payloadB64) {
          const b64 = payloadB64
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payloadB64.length / 4) * 4, "=");
          const json = Buffer.from(b64, "base64").toString("utf-8");
          const payload = JSON.parse(json) as Record<string, unknown>;
          const exp = payload.exp;
          if (typeof exp === "number") {
            maxAge = Math.max(1, exp - Math.floor(Date.now() / 1000));
          }
        }
      } catch {
        // Fallback to default maxAge on decode error
      }

      res.setHeader("Set-Cookie", [
        serialize("ac", accessToken, {
          secure: isProd,
          sameSite: "lax",
          path: "/",
          httpOnly: true,
          maxAge,
        }),
      ]);
      await req.session.save();
      res.status(result.status).json(result.data);
    } catch (error) {
      errorResponse(error, res);
    }
  },
);

export default handler;
