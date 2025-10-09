import { useSessionStorage } from "../../hooks/useSessionStorage";

export const useAccessToken = () =>
  useSessionStorage<string | undefined>("accessToken", undefined);

export const useRefreshToken = () =>
  useSessionStorage<string | undefined>("refreshToken", undefined);
