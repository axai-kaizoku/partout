/**
 * Browser Notification Utilities
 */

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return { granted: false, denied: true, default: false };
  }

  return {
    granted: Notification.permission === "granted",
    denied: Notification.permission === "denied",
    default: Notification.permission === "default",
  };
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export interface ChatNotificationOptions {
  senderName: string;
  message: string;
  partTitle?: string;
  senderImage?: string | null;
  conversationId: string;
}

/**
 * Show a browser notification for a new chat message
 */
export async function showChatNotification(
  options: ChatNotificationOptions,
): Promise<void> {
  const permission = getNotificationPermission();

  if (!permission.granted) {
    return;
  }

  const { senderName, message, partTitle, senderImage, conversationId } =
    options;

  const notificationTitle = `${senderName} sent you a message`;
  const notificationBody = partTitle ? `Re: ${partTitle}\n${message}` : message;

  const notification = new Notification(notificationTitle, {
    body: notificationBody,
    icon: senderImage || "/favicon.ico",
    badge: "/favicon.ico",
    tag: conversationId, // Prevents duplicate notifications for same conversation
    requireInteraction: false,
    silent: false,
    data: {
      conversationId,
      url: "/messages",
    },
  });

  // Handle notification click - navigate to messages
  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();

    // Navigate to messages page
    if (typeof window !== "undefined") {
      window.location.href = "/messages";
    }

    notification.close();
  };

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  try {
    // You can add a custom notification sound file
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch((error) => {
      // Silently fail if audio playback is blocked
      console.debug("Audio playback blocked:", error);
    });
  } catch (error) {
    console.debug("Failed to play notification sound:", error);
  }
}
