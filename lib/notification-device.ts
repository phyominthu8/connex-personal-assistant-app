import { Platform } from "react-native";
import { loadNotifications } from "@/lib/notification-runtime";

export const REMINDER_CHANNEL_ID = "connex-reminders";

export type NotificationDeviceStatus = {
  platform: "ios" | "android" | "web" | "other";
  permission: string;
  granted: boolean;
  channelReady: boolean;
  canSchedule: boolean;
};

function platformName(): NotificationDeviceStatus["platform"] {
  return Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : Platform.OS === "web" ? "web" : "other";
}

export async function ensureReminderChannel(sound = true, vibration = true) {
  if (Platform.OS !== "android") return false;
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Connex reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: sound ? "default" : undefined,
    vibrationPattern: vibration ? [0, 250, 250, 250] : undefined,
    enableVibrate: vibration,
    enableLights: true,
    lightColor: "#4F46E5",
  });
  return true;
}

export async function getNotificationDeviceStatus(sound = true, vibration = true): Promise<NotificationDeviceStatus> {
  const platform = platformName();
  if (Platform.OS === "web") return { platform, permission: "unsupported", granted: false, channelReady: false, canSchedule: false };
  const Notifications = await loadNotifications();
  if (!Notifications) return { platform, permission: "development-build-required", granted: false, channelReady: false, canSchedule: false };
  const permission = (await Notifications.getPermissionsAsync()).status;
  const channelReady = Platform.OS === "android" ? await ensureReminderChannel(sound, vibration) : true;
  return { platform, permission, granted: permission === Notifications.PermissionStatus.GRANTED, channelReady, canSchedule: permission === Notifications.PermissionStatus.GRANTED && channelReady };
}

export async function requestNotificationDevicePermission(sound = true, vibration = true) {
  const platform = platformName();
  if (Platform.OS === "web") return getNotificationDeviceStatus(sound, vibration);
  const Notifications = await loadNotifications();
  if (!Notifications) return { platform, permission: "development-build-required", granted: false, channelReady: false, canSchedule: false };
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (permission.granted) await ensureReminderChannel(sound, vibration);
  return getNotificationDeviceStatus(sound, vibration);
}

export async function scheduleNotificationDeviceTest(sound = true, vibration = true) {
  const status = await requestNotificationDevicePermission(sound, vibration);
  if (!status.canSchedule) return { status, notificationId: null as string | null };
  const Notifications = await loadNotifications();
  if (!Notifications) return { status, notificationId: null as string | null };
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: "Connex test notification", body: "Your reminder notifications are ready.", sound: sound ? "default" : false, data: { kind: "device-verification", vibration } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false, channelId: REMINDER_CHANNEL_ID },
  });
  return { status, notificationId };
}
