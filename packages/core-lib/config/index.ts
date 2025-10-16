import getConfig from "next/config";
import { parseDelimitedList } from "../business/strings";

const {
  publicRuntimeConfig: { processEnv },
  serverRuntimeConfig,
} = getConfig();

export const config = {
  get value() {
    return {
      NODE_ENV: process.env.NODE_ENV!,
      WHITELISTED_COOKIES: parseDelimitedList(
        processEnv.NEXT_PRIVATE_WHITELISTED_COOKIES,
        ";"
      ),
      SSO_COOKIE: processEnv.NEXT_PRIVATE_SSO_COOKIE!,
      APIURL: processEnv.NEXT_PRIVATE_API_URL!,
    };
  },
};
