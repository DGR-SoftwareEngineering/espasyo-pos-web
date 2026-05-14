import { NextApiHandler } from "next";
import { errorResponse, withSsrHttpClient } from "core-lib";
import { safeDecode } from "core-lib/core/contexts/auth/access-token";
import { UserInfoResponse } from "core-lib/api/commons/types";

const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

const handler: NextApiHandler = withSsrHttpClient(
  (client) => async (req, res) => {
    try {
      const accessToken = req.session.accessToken;

      if (!accessToken) {
        return res.status(401).json({
          message: "Unauthorized: no active session",
        });
      }

      const claims = safeDecode<Record<string, string>>(accessToken);
      const uid = claims?.[NAME_IDENTIFIER_CLAIM];

      if (!uid) {
        return res.status(401).json({
          message: "Unauthorized: user identifier missing from token",
        });
      }

      const result = await client.get<UserInfoResponse>(`/api/v1/user/${uid}`, {
        params: {
          includes: ["UserInfo"],
        },
      });

      res.status(result.status).json(result.data);
    } catch (error) {
      errorResponse(error, res);
    }
  },
);

export default handler;
