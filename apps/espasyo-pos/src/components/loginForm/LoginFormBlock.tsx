import React, { useEffect, useRef, useState } from "react";
import { useAuthContext, useToastContext } from "core-lib";
import { useRouter } from "core-lib/core/router";
import { ContentBlockDto } from "core-lib/api/commons/types";
import { LoginForm } from "./LoginForm";
import { LoginForm as LoginFormType } from "./validation";

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
  const router = useRouter();
  const { login } = useAuthContext();
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
      await router.push((router) => router.hub);
      showToast("Successfully Logged in", "success");
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
