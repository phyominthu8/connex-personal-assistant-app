import type { NotificationDeviceStatus } from "./notification-device";

export function notificationDeviceStatusLabel(status: NotificationDeviceStatus | null) {
  if (!status) return "Not checked";
  if (status.platform === "web") return "Native device required";
  if (!status.granted) return "Permission needed";
  if (!status.channelReady) return "Android channel not ready";
  return "Ready for notifications";
}
