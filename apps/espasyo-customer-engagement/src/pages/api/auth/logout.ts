import type { NextApiHandler } from "next";
import { serialize } from "cookie";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "core-lib";

const isProd = process.env.NODE_ENV === "production";

function clearCookie(
  name: string,
  opts?: Partial<Parameters<typeof serialize>[2]>,
) {
  return serialize(name, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    ...opts,
  });
}

const handler: NextApiHandler = async (req, res) => {
  try {
    res.setHeader("Set-Cookie", [
      clearCookie("ac"),
      clearCookie("uid"),
      clearCookie("refreshToken"),
      clearCookie("session"),
    ]);

    if (req.session) {
      req.session.destroy();
    }

    return res
      .status(200)
      .json({ ok: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ ok: false, message: "Logout failed" });
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);
