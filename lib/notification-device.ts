import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const REMINDER_CHANNEL_ID = "connex-reminders";

export type NotificationDeviceStatus = {
  platform: "ios" | "android" | "web" | "other";
  permission: string;
  granted: boolean;
  channelReady: boolean;
  canSchedule: boolean;
};

export async function ensureReminderChannel(sound = true, vibration = true) {
  if (Platform.OS !== "android") return false;
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
  if (Platform.OS === "web") return { platform: "web", permission: "unsupported", granted: false, channelReady: false, canSchedule: false };
  const permission = (await Notifications.getPermissionsAsync()).status;
  const channelReady = Platform.OS === "android" ? await ensureReminderChannel(sound, vibration) : true;
  const platform = Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "other";
  return { platform, permission, granted: permission === Notifications.PermissionStatus.GRANTED, channelReady, canSchedule: permission === Notifications.PermissionStatus.GRANTED && channelReady };
}

export async function requestNotificationDevicePermission(sound = true, vibration = true) {
  if (Platform.OS === "web") return getNotificationDeviceStatus(sound, vibration);
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (permission.granted) await ensureReminderChannel(sound, vibration);
  return getNotificationDeviceStatus(sound, vibration);
}

export async function scheduleNotificationDeviceTest(sound = true, vibration = true) {
  const status = await requestNotificationDevicePermission(sound, vibration);
  if (!status.canSchedule) return { status, notificationId: null as string | null };
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: "Connex test notification", body: "Your reminder notifications are ready.", sound: sound ? "default" : false, data: { kind: "device-verification", vibration } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false, channelId: REMINDER_CHANNEL_ID },
  });
  return { status, notificationId };
}
