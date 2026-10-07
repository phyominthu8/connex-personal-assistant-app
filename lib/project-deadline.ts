import { dateAtNotificationTime } from "./reminder-time";

export function projectDeadlineDate(endDate?: string, notificationTime = "09:00") {
  return dateAtNotificationTime(endDate, notificationTime);
}
