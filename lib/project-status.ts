import { toDateKey } from "./task-date";

export type ProjectDomainStatus = "active" | "completed" | "on_hold" | "archived";

export function isProjectOverdue(status: string, endDate?: string, now = new Date()): boolean {
  return status !== "completed" && Boolean(endDate && endDate < toDateKey(now));
}

export function getProjectStatusLabel(status: string, endDate?: string, now = new Date()): string {
  if (isProjectOverdue(status, endDate, now)) return "Overdue";
  if (status === "on_hold") return "On hold";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
