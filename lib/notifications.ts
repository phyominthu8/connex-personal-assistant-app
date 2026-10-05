import { Platform } from "react-native";
import { loadNotifications } from "@/lib/notification-runtime";

export async function requestReminderPermission() {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminder(title: string, fireAt: Date, options: { sound?: boolean; vibration?: boolean } = {}) {
  if (Platform.OS === "web" || fireAt.getTime() <= Date.now()) return null;
  const Notifications = await loadNotifications();
  if (!Notifications) return null;
  const allowed = await requestReminderPermission();
  if (!allowed) return null;
  return Notifications.scheduleNotificationAsync({ content: { title: "Connex reminder", body: title, sound: options.sound === false ? false : "default", data: { vibration: options.vibration !== false } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt } });
}

export async function cancelReminder(notificationId: string) {
  const Notifications = await loadNotifications();
  if (Notifications) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
