"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showChatNotification,
  type ChatNotificationOptions,
} from "@/lib/notifications";

export function useNotifications() {
  const [permission, setPermission] = useState(() => getNotificationPermission());

  // Update permission state when it changes
  useEffect(() => {
    const updatePermission = () => {
      setPermission(getNotificationPermission());
    };

    // Check permission on mount and when tab becomes visible
    updatePermission();
    document.addEventListener("visibilitychange", updatePermission);

    return () => {
      document.removeEventListener("visibilitychange", updatePermission);
    };
  }, []);

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    return granted;
  };

  const showNotification = async (options: ChatNotificationOptions) => {
    // Don't show notification if tab is visible and user is on messages page
    if (
      !document.hidden &&
      typeof window !== "undefined" &&
      window.location.pathname === "/messages"
    ) {
      return;
    }

    await showChatNotification(options);
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
}
