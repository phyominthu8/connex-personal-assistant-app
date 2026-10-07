import { isValidTime } from "./task-date";

export const DEFAULT_NOTIFICATION_TIME = "09:00";

export function normalizeNotificationTime(value: unknown, fallback = DEFAULT_NOTIFICATION_TIME) {
  return typeof value === "string" && isValidTime(value) ? value : fallback;
}

export function dateAtNotificationTime(dateKey: string | undefined, time = DEFAULT_NOTIFICATION_TIME) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const fireAt = new Date(`${dateKey}T${normalizeNotificationTime(time)}:00`);
  return Number.isNaN(fireAt.getTime()) ? null : fireAt;
}
