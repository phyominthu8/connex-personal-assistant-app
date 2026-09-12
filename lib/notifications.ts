import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function requestReminderPermission() {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminder(title: string, fireAt: Date, options: { sound?: boolean; vibration?: boolean } = {}) {
  if (Platform.OS === "web" || fireAt.getTime() <= Date.now()) return null;
  const allowed = await requestReminderPermission();
  if (!allowed) return null;
  return Notifications.scheduleNotificationAsync({ content: { title: "Connex reminder", body: title, sound: options.sound === false ? false : "default", data: { vibration: options.vibration !== false } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt } });
}

export async function cancelReminder(notificationId: string) {
  if (Platform.OS !== "web") await Notifications.cancelScheduledNotificationAsync(notificationId);
}
