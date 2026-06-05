import React, { useEffect, useRef, useState } from "react";
import { useAuthContext, useToastContext } from "core-lib";
import { usePublicSettings } from "core-lib/core/contexts";
import { useRouter } from "next/router";
import { LoginForm } from "./LoginForm";
import { LoginFormType } from "./validation";

const THROTTLE_COOLDOWN_SECONDS = 60;

const isThrottleError = (error: unknown): boolean => {
  if (!Array.isArray(error)) return false;
  const status = (error as string[] & { status?: number }).status;
  if (status === 429) return true;
  const first = typeof error[0] === "string" ? error[0].toLowerCase() : "";
  return first.includes("too many");
};

export const LoginFormBlock: React.FC = () => {
  const router = useRouter();
  const { login, completeAuthentication } = useAuthContext();
  const publicSettings = usePublicSettings();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // useEffect(() => {
  //   if (cooldownSeconds <= 0) {
  //     if (cooldownRef.current) {
  //       clearInterval(cooldownRef.current);
  //       cooldownRef.current = null;
  //     }
  //     return;
  //   }
  //   if (cooldownRef.current) return;
  //   cooldownRef.current = setInterval(() => {
  //     setCooldownSeconds((prev) => Math.max(0, prev - 1));
  //   }, 1000);
  //   return () => {
  //     if (cooldownRef.current) {
  //       clearInterval(cooldownRef.current);
  //       cooldownRef.current = null;
  //     }
  //   };
  // }, [cooldownSeconds]);

  const handleSubmit = async ({ userName, password }: LoginFormType) => {
    if (cooldownSeconds > 0) return;
    try {
      setLoading(true);
      await login({ userName, password });
      await publicSettings.refresh();

      const handleRouteChangeComplete = () => {
        router.events.off("routeChangeComplete", handleRouteChangeComplete);
        completeAuthentication();
        showToast("Successfully logged in!", "success");
      };
      router.events.on("routeChangeComplete", handleRouteChangeComplete);
      await router.push("/customer/hub");
    } catch (error) {
      const messages = Array.isArray(error) ? (error as string[]) : [];
      const firstMessage = messages[0];
      const throttled = isThrottleError(error);
      if (throttled) {
        showToast(
          firstMessage ?? "Too many failed attempts. Try again shortly.",
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
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      submitLoading={loading || cooldownSeconds > 0}
      cooldownSeconds={cooldownSeconds}
    />
  );
};
