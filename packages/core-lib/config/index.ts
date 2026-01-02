import { getRuntimeConfig } from "./runtime";
import { parseDelimitedList } from "../business/strings";

export const config = {
  get value() {
    const { processEnv } = getRuntimeConfig();

    return {
      NODE_ENV: process.env.NODE_ENV ?? "development",
      WHITELISTED_COOKIES: parseDelimitedList(
        processEnv.NEXT_PRIVATE_WHITELISTED_COOKIES,
        ";"
      ),
      SSO_COOKIE: processEnv.NEXT_PRIVATE_SSO_COOKIE,
      APIURL: processEnv.NEXT_PRIVATE_API_URL,
    };
  },
};
