import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelReminder, scheduleReminder } from "@/lib/notifications";
import { projectDeadlineDate } from "@/lib/project-deadline";
export { projectDeadlineDate } from "@/lib/project-deadline";

const KEY = "personal-assistant.project-deadline-reminders.v1";
type ReminderMap = Record<string, string>;

async function readMap(): Promise<ReminderMap> {
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) as ReminderMap : {}; } catch { return {}; }
}
async function writeMap(value: ReminderMap) { await AsyncStorage.setItem(KEY, JSON.stringify(value)); }

export async function syncProjectDeadlineReminder(projectId: string, title: string, endDate: string | undefined, enabled: boolean, preferences: { sound: boolean; vibration: boolean; notifications: boolean; notificationTime?: string }, notificationTime = preferences.notificationTime || "09:00") {
  const map = await readMap();
  const previous = map[projectId];
  if (previous) await cancelReminder(previous);
  delete map[projectId];
  const fireAt = projectDeadlineDate(endDate, notificationTime);
  if (enabled && preferences.notifications && fireAt && fireAt.getTime() > Date.now()) {
    const notificationId = await scheduleReminder(`${title} deadline`, fireAt, { sound: preferences.sound, vibration: preferences.vibration });
    if (notificationId) map[projectId] = notificationId;
  }
  await writeMap(map);
}

export async function cancelProjectDeadlineReminder(projectId: string) {
  const map = await readMap();
  const notificationId = map[projectId];
  if (notificationId) await cancelReminder(notificationId);
  delete map[projectId];
  await writeMap(map);
}
