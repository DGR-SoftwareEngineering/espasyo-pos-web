import React, { useEffect, useRef, useState } from "react";
import { useAuthContext, useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { useApiCallback } from "core-lib/core/hooks";
import { useRouter as useNextRouter } from "next/router";
import { ContentBlockDto } from "core-lib/api/commons/types";
import { LoginForm } from "./LoginForm";
import { LoginForm as LoginFormType } from "./validation";

const resolveHomeByRole = (roleName: string | null | undefined): string => {
  const r = (roleName ?? "").trim().toLowerCase();
  if (r === "cashier") return "/cashier/pos";
  if (r === "admin") return "/admin/hub";
  return "/";
};

interface Props {
  id?: string;
  backgroundColor?: string | null;
  contentBlocks?: ContentBlockDto[];
}

const THROTTLE_COOLDOWN_SECONDS = 60;

const isThrottleError = (error: unknown): boolean => {
  if (!Array.isArray(error)) return false;
  const status = (error as string[] & { status?: number }).status;
  if (status === 429) return true;
  const first = typeof error[0] === "string" ? error[0].toLowerCase() : "";
  return first.includes("too many");
};

export const LoginFormBlock: React.FC<Props> = ({ contentBlocks = [] }) => {
  const nextRouter = useNextRouter();
  const { login, completeAuthentication } = useAuthContext();
  const publicSettings = usePublicSettings();
  const accessMeCb = useApiCallback(async (api) => api.access.me());
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const { showToast } = useToastContext();
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      return;
    }
    if (cooldownTimerRef.current) return;
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [cooldownSeconds]);

  return (
    <LoginForm
      submitLoading={loading || cooldownSeconds > 0}
      onSubmit={handleSubmit}
      contentBlocks={contentBlocks}
      cooldownSeconds={cooldownSeconds}
    />
  );

  async function handleSubmit({ userName, password }: LoginFormType) {
    if (cooldownSeconds > 0) return;
    try {
      setLoading(true);
      await login({ userName, password });
      await publicSettings.refresh();

      // Resolve the home path by role, sourced from /Access/me — the canonical
      // role for the authenticated user. Falls back to "/" if the call fails.
      let homePath = "/";
      try {
        const meResult = await accessMeCb.execute();
        const roleName = meResult?.data?.response?.role?.name;
        homePath = resolveHomeByRole(roleName);
      } catch (meError) {
        console.error("Failed to resolve role after login", meError);
      }
      // Wait for navigation to complete before marking as authenticated.
      // This prevents the Dashboard from flashing during the page transition.
      const handleRouteChangeComplete = () => {
        nextRouter.events.off("routeChangeComplete", handleRouteChangeComplete);
        completeAuthentication();
        showToast("Successfully Logged in", "success");
      };
      nextRouter.events.on("routeChangeComplete", handleRouteChangeComplete);
      await nextRouter.push(homePath);
    } catch (error) {
      console.error("Problem during login", error);
      const messages = Array.isArray(error) ? (error as string[]) : [];
      const firstMessage = messages[0];
      const throttled = isThrottleError(error);
      if (throttled) {
        showToast(
          firstMessage ||
            "Too many failed login attempts. Try again in a few minutes.",
          "error",
        );
        setCooldownSeconds(THROTTLE_COOLDOWN_SECONDS);
        return;
      }
      const looksDescriptive =
        firstMessage &&
        firstMessage !== "something_went_wrong" &&
        firstMessage.length > 2;
      showToast(
        looksDescriptive ? firstMessage : "Invalid username or password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }
};
