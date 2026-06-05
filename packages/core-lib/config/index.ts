import { parseDelimitedList } from "../business/strings";

export const config = {
  get value() {
    return {
      NODE_ENV: process.env.NODE_ENV ?? "development",
      WHITELISTED_COOKIES: parseDelimitedList(
        process.env.NEXT_PUBLIC_WHITELISTED_COOKIES,
        ";"
      ),
      SSO_COOKIE: process.env.NEXT_PUBLIC_SSO_COOKIE!,
      APIURL: process.env.NEXT_PUBLIC_API_URL!,
      PLATFORMKEY: process.env.NEXT_PRIVATE_PLATFORM_KEY!,
    };
  },
};
