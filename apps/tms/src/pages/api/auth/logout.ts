import type { NextApiHandler } from "next";
import { serialize } from "cookie";

const isProd = process.env.NODE_ENV === "production";

function clearCookie(
  name: string,
  opts?: Partial<Parameters<typeof serialize>[2]>
) {
  return serialize(name, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
    ...opts,
  });
}

const handler: NextApiHandler = async (_req, res) => {
  res.setHeader("Set-Cookie", [clearCookie("ac")]);
  res.status(200).json({ ok: true });
};

export default handler;
