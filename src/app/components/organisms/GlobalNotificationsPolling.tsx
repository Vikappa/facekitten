"use client";

import { NotificationData } from "@/lib/interfaces/CommonInterfaces";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUnreadNotifications } from "@/lib/redux/notificationsSlice";
import { useCallback, useEffect, useRef } from "react";

const AUTO_FETCH_INTERVAL_MS = 60_000;

const isNotificationData = (payload: unknown): payload is NotificationData => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<NotificationData>;
  const activityFrom = candidate.activityFrom as Partial<NotificationData["activityFrom"]> | undefined;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof activityFrom === "object" &&
    activityFrom !== null &&
    typeof activityFrom.name === "string" &&
    (activityFrom.avatarUrl === null || typeof activityFrom.avatarUrl === "string") &&
    (candidate.previewText === null || typeof candidate.previewText === "string")
  );
};

export default function GlobalNotificationsPolling() {
  const dispatch = useAppDispatch();
  const isFetchingRef = useRef(false);

  const loadUnreadNotifications = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    try {
      const response = await fetch("/api/v1/notifications/get/unread", {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        console.error("Errore fetch notifiche unread:", response.status, errorPayload);
        return;
      }

      const data = (await response.json()) as unknown;
      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as { unreadNotifications?: unknown[] }).unreadNotifications)
      ) {
        console.error("Payload unread notifications non valido:", data);
        return;
      }

      const unreadNotifications = (data as { unreadNotifications: unknown[] }).unreadNotifications
        .filter((notification) => isNotificationData(notification));

      dispatch(setUnreadNotifications(unreadNotifications));
    } catch (error) {
      console.error("Errore di rete durante polling notifiche:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    void loadUnreadNotifications();

    const intervalId = window.setInterval(() => {
      void loadUnreadNotifications();
    }, AUTO_FETCH_INTERVAL_MS);

    const onWindowFocus = () => {
      void loadUnreadNotifications();
    };
    window.addEventListener("focus", onWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [loadUnreadNotifications]);

  return null;
}
