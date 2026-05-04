import { useEffect } from "react";
import { toast } from "sonner";
import { requestFcmToken, onForegroundMessage } from "../firebase-config";
import api from "../services/api";

function safeGet(key: string) {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function hasAuthTokens() {
  return Boolean(safeGet("accessToken") && safeGet("refreshToken"));
}

function getStoredFcmToken() {
  return safeGet("fcmToken");
}

function getErrorStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }

  return undefined;
}

export function useFcmNotifications() {
  useEffect(() => {
    let cancelled = false;
    let unsubscribeForeground: (() => void) | undefined;

    async function registerFcmToken() {
      if (!hasAuthTokens() || typeof Notification === "undefined") {
        return;
      }

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          return;
        }
      }

      if (cancelled || !hasAuthTokens()) {
        return;
      }

      const token = await requestFcmToken();

      if (!token || cancelled || !hasAuthTokens()) {
        return;
      }

      if (getStoredFcmToken() === token) {
        return;
      }

      try {
        await api.post("/api/settings/token", {
          token,
          deviceType: "MOBILE",
        });

        if (!cancelled && hasAuthTokens()) {
          localStorage.setItem("fcmToken", token);
        }
      } catch (error) {
        if (getErrorStatus(error) === 403) {
          return;
        }

        if (import.meta.env.DEV) {
          console.warn("FCM 토큰 저장 실패");
        }
      }
    }

    async function registerForegroundListener() {
      if (!hasAuthTokens() || typeof Notification === "undefined") {
        return;
      }

      const unsubscribe = await onForegroundMessage((payload) => {
        if (!hasAuthTokens()) {
          return;
        }

        const title = payload.notification?.title;
        const body = payload.notification?.body;

        if (title && Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/icon.png",
          });
        }

        if (title) {
          toast.success(title);
        }
      });

      if (cancelled) {
        unsubscribe();
      } else {
        unsubscribeForeground = unsubscribe;
      }
    }

    registerFcmToken();
    registerForegroundListener();

    return () => {
      cancelled = true;
      unsubscribeForeground?.();
    };
  }, []);
}
