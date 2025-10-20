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
        req.body
      );
      res.setHeader("Set-Cookie", [
        serialize("ac", result.data.response.accessToken, {
          secure: isProd,
          sameSite: "strict",
          path: "/",
          httpOnly: true,
        }),
      ]);
      res.status(result.status).json(result.data);
    } catch (error) {
      errorResponse(error, res);
    }
  }
);

export default handler;
