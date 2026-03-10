import { NextApiHandler } from "next";
import { errorResponse, withSsrHttpClient } from "core-lib";
import { UserInfoResponse } from "core-lib/api/commons/types";
import { parse } from "cookie";

const handler: NextApiHandler = withSsrHttpClient(
  (client) => async (req, res) => {
    try {
      const cookies = parse(req.headers.cookie ?? "");

      const uid = cookies.uid;

      if (!uid) {
        return res.status(401).json({
          message: "Unauthorized: UID cookie not found",
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
  }
);

export default handler;
