import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelReminder, scheduleReminder } from "@/lib/notifications";
import { dateAtNotificationTime } from "@/lib/reminder-time";

const KEY = "personal-assistant.task-reminders.v1";
type ReminderMap = Record<string, string>;
async function readMap(): Promise<ReminderMap> { try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) as ReminderMap : {}; } catch { return {}; } }
async function writeMap(value: ReminderMap) { await AsyncStorage.setItem(KEY, JSON.stringify(value)); }

export async function syncTaskReminder(taskId: string, title: string, dueDate: string | undefined, enabled: boolean, time: string, preferences: { notifications: boolean; sound: boolean; vibration: boolean }) {
  const map = await readMap();
  if (map[taskId]) await cancelReminder(map[taskId]);
  delete map[taskId];
  const fireAt = dateAtNotificationTime(dueDate, time);
  if (enabled && preferences.notifications && fireAt && fireAt.getTime() > Date.now()) {
    const id = await scheduleReminder(`${title} due`, fireAt, { sound: preferences.sound, vibration: preferences.vibration });
    if (id) map[taskId] = id;
  }
  await writeMap(map);
}

export async function cancelTaskReminder(taskId: string) {
  const map = await readMap();
  if (map[taskId]) await cancelReminder(map[taskId]);
  delete map[taskId];
  await writeMap(map);
}
